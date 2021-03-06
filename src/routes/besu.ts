import Router from "express";
import axios from "axios";
import crypto from "crypto";
import secp256k1 from "secp256k1";
import { ethers } from "ethers";
import aws from "aws-sdk";
import { Request, Response } from "express";

import bsquareAbi from "./../contracts/BsquareAbi.json" assert { type: "json" };
import bsquareBytecode from "./../contracts/BsquareBytecode.json" assert { type: "json" };
import "dotenv/config";

const router = Router();

const aws3AccessKeyId = process.env.AWS3_ACCESS_KEY_ID;
const aws3SecretAccessKey = process.env.AWS3_SECRET_ACCESS_KEY;

const baseUri = "https://nftcamera.s3-ap-northeast-2.amazonaws.com/";

aws.config.update({
  secretAccessKey: aws3SecretAccessKey,
  accessKeyId: aws3AccessKeyId,
  region: "ap-northeast-2",
});

const s3 = new aws.S3();

const blockchainAddress = process.env.BLOCKCHAIN_ADDRESS;
const pk = process.env.PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(blockchainAddress);
// const provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:8545");
const nodeWallet = new ethers.Wallet(pk, provider);

// Function to upload to amazon s3
async function uploadToS3(
  filename: string,
  contractName: string,
  metadata: object,
): Promise<string> {
  const buf = Buffer.from(JSON.stringify(metadata));

  const data = {
    Bucket: "nftcamera",
    Key: contractName + "/" + filename + ".json",
    Body: buf,
    ContentEncoding: "base64",
    ContentType: "application/json",
    ACL: "public-read",
  };

  s3.upload(data, (err: Error, callbackData: {}) => {
    console.log("callbackData: ", callbackData);
    if (err) {
      console.log(err);
      console.log("Error uploading data: ", callbackData);
    } else {
      console.log("Succesfully uploaded!");
    }
  });
  return data.Key;
}

// Function to create metadata
async function createMetadata(
  name: string,
  description: string,
  image: string,
  attributes: Array<{ trait_type: string; value: string }>,
  contractName: string,
  data: {
    Width: string;
    Height: string;
    DPIWidth: string;
    DPIHeight: string;
    Model: string;
    Software: string;
    DateTime: string;
    LensModel: string;
  },
  verification: {
    service: string;
    hash: string;
    uuid: string;
    signature: string;
  },
) {
  const metadata = {
    name: name,
    description: description,
    image: image,
    attributes: attributes,
    data: data,
    verification: verification,
  };

  const metadataUri =
    baseUri + (await uploadToS3(name, contractName, metadata));

  return metadataUri;
}

// Define a route handler for the default home page of besu
router.get("/", async (req: Request, res: Response) => {
  res.send("Hello world from Besu!");
});

// Deploys a contract with given contract name and symbol
router.post("/deployContract", async (req: Request, res: Response) => {
  const contractName = req.body.contractName;
  const contractSymbol = req.body.contractSymbol;
  const userAddress = req.body.userAddress;

  try {
    const factory = new ethers.ContractFactory(
      bsquareAbi,
      bsquareBytecode,
      nodeWallet,
    );

    const contract = await factory.deploy(
      contractName,
      contractSymbol,
      userAddress,
    );

    res.send(contract.address);
  } catch (error) {
    res.send(error);
  }
});

// Post method to mint a nft
router.post("/mintNFT", async (req: Request, res: Response) => {
  console.log(req.body);
  const name = req.body.name;
  const description = req.body.description;
  const attributes = req.body.attributes;
  const image = req.body.image;
  const data = req.body.data;
  const verification = req.body.verification;
  const userPk = req.body.userPk;
  const contractAddress = req.body.contractAddress;

  try {
    const userWallet = new ethers.Wallet(userPk, provider);
    const userContract = new ethers.Contract(
      contractAddress,
      bsquareAbi,
      userWallet,
    );

    const metadataUri = await createMetadata(
      name,
      description,
      image,
      attributes,
      await userContract.name(),
      data,
      verification,
    );
    console.log("Metadata URI: ", metadataUri);

    if (userContract.deployed()) {
      let result = await userContract.safeMint(userWallet.address, metadataUri);

      res.send(result);
    } else {
      console.log("Contract has not been deployed");
      res.send("Contract has not been deployed");
    }
  } catch (error) {
    res.send(error);
  }
});

// Get method to get the tokenURI
router.get("/getTokenURI", async (req: Request, res: Response) => {
  const contractAddress = req.body.contractAddress;
  const tokenId = req.body.tokenId;

  try {
    const contract = new ethers.Contract(contractAddress, bsquareAbi, provider);

    const uri = await contract.tokenURI(tokenId);

    res.send(uri);
  } catch (error) {
    res.send(error);
  }
});

// Gets tokenCounter from contract address
router.get("/getTokenCounter", async (req: Request, res: Response) => {
  const contractAddress = req.body.contractAddress;

  try {
    const contract = new ethers.Contract(contractAddress, bsquareAbi, provider);

    const counter = await contract._tokenIdCounter();

    res.send(counter.toString());
  } catch (error) {
    res.send(error);
  }
});

// Gets a contract name from contract address
router.get("/getContractName", async (req: Request, res: Response) => {
  const contractAddress = req.body.contractAddress;

  try {
    const bsquareContract = new ethers.Contract(
      contractAddress,
      bsquareAbi,
      provider,
    );

    const name = await bsquareContract.name();

    res.send(name);
  } catch (error) {
    res.send(error);
  }
});

// Gets Balance from address
router.get("/getBalance", async (req: Request, res: Response) => {
  const address = req.body.address;

  try {
    const balance = await provider.getBalance(address);

    res.send(ethers.utils.formatEther(balance) + " BSL");
  } catch (error) {
    res.send(error);
  }
});

export default router;
