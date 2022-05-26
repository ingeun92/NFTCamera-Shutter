import Router from "express";
import axios from "axios";
import crypto from "crypto";
import secp256k1 from "secp256k1";
import { ethers } from "ethers";
import bsquareAbi from "./../contracts/BsquareAbi.json" assert { type: "json" };
import bsquareBytecode from "./../contracts/BsquareBytecode.json" assert { type: "json" };
import "dotenv/config";

const router = Router();

const pk = process.env.PRIVATE_KEY;
const address = "0x6C021FD5220d5f835715A3c8ff27f2cD7748e9f1";

const provider = new ethers.providers.JsonRpcProvider("http://3.39.16.90:8545");
const nodeWallet = new ethers.Wallet(pk, provider);

// Define a route handler for the default home page of besu
router.get("/", async (req: any, res: any) => {
  res.send("Hello world from Besu!");
});

// Post method to mint a nft
router.post("/mintNFT", async (req: any, res: any) => {
  const contractAddress = req.body.contractAddress;
  const userPk = req.body.userPk;
  const uri = req.body.uri;

  try {
    const userWallet = new ethers.Wallet(userPk, provider);
    const userContract = new ethers.Contract(
      contractAddress,
      bsquareAbi,
      userWallet,
    );

    let result = await userContract.safeMint(userWallet.address, uri);

    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

// Get method to get the tokenURI
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

// Gets a contract name from contract address
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
