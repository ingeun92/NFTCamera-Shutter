import Router from "express";
import axios from "axios";
import crypto from "crypto";
import secp256k1 from "secp256k1";
import { ethers } from "ethers";
import aws from "aws-sdk";

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

const pk = process.env.PRIVATE_KEY;
// const pk = "1b867ffe3bea49abb24971e4ba1a2bd5fdd204fafbc160b372154fe2e0d55f6f";
const address = "0x6C021FD5220d5f835715A3c8ff27f2cD7748e9f1";

const provider = new ethers.providers.JsonRpcProvider("http://3.39.16.90:8545");
// const provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:8545");
const nodeWallet = new ethers.Wallet(pk, provider);

// Function to upload to amazon s3
async function uploadToS3(
  filename: string,
  contractName: string,
  metadata: object,
) {
  const buf = Buffer.from(JSON.stringify(metadata));

  const data = {
    Bucket: "nftcamera",
    Key: contractName + "/" + filename + ".json",
    Body: buf,
    ContentEncoding: "base64",
    ContentType: "application/json",
    ACL: "public-read",
  };

  s3.upload(data, (err: any, data: any) => {
    if (err) {
      console.log(err);
      console.log("Error uploading data: ", data);
    } else {
      console.log("Succesfully uploaded!");
    }
  });
  return data.Key;
}

// Function to create metadata
async function createMetadata(name: string, contractName: string, data: any) {
  const metadata = {
    name: name,
    image: data.uri,
    data: data,
  };

  const metadataUri =
    baseUri + (await uploadToS3(name, contractName, metadata));

  console.log("Metadata uri in createMetadata: ", metadataUri);
  return metadataUri;
}

// Define a route handler for the default home page of besu
router.get("/", async (req: any, res: any) => {
  res.send("Hello world from Besu!");
});

// Deploys a contract with given contract name and symbol
router.post("/deployContract", async (req: any, res: any) => {
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
router.post("/mintNFT", async (req: any, res: any) => {
  const name = req.body.name;
  const data = req.body.data;
  const userPk = req.body.userPk;
  const contractAddress = req.body.contractAddress;

  console.log(data);

  try {
    const userWallet = new ethers.Wallet(userPk, provider);
    const userContract = new ethers.Contract(
      contractAddress,
      bsquareAbi,
      userWallet,
    );

    const metadataUri = await createMetadata(name, userContract.name, data);
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

// // Get method to get the tokenURI
router.get("/getTokenURI", async (req: any, res: any) => {
  const contractAddress = req.body.contractAddress;
  const tokenId = req.body.tokenId;

  try {
    const contract = new ethers.Contract(contractAddress, bsquareAbi, provider);

    let uri = await contract.tokenURI(tokenId);

    res.send(uri);
  } catch (error) {
    res.send(error);
  }
});

// // Gets a contract name from contract address
router.get("/getContractName", async (req: any, res: any) => {
  const contractAddress = req.body.contractAddress;

  try {
    const bsquareContract = new ethers.Contract(
      contractAddress,
      bsquareAbi,
      nodeWallet,
    );

    const name = await bsquareContract.name();

    res.send(name);
  } catch (error) {
    res.send(error);
  }
});

export default router;
