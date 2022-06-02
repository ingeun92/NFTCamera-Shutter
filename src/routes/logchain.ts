import Router from "express";
import crypto from "crypto";
import secp256k1 from "secp256k1";
import axios from "axios";

const router = Router();

const secret =
  "63dfc6c59b0cbefcde541a5199732e4ae485266e683a1716cd778e8ed737d6f3";
const address = "0x6C021FD5220d5f835715A3c8ff27f2cD7748e9f1";

// Function to create a payload, currently not in use
// function createPayloadNFTContract(
//   // from: any,
//   // to: any,
//   type: string,
//   contractName: string,
//   contractCreator: any,
// ) {
//   const payloadObject = {
//     type: type,
//     contractName: contractName,
//     contractCreator: contractCreator,
//   };
//   return payloadObject;
// }

// Function to sign a transcation given a payload object and a secret, returns signature with '0x' prefix
function signTransaction(payloadObject: any, secret: any) {
  try {
    const hashed = crypto
      .createHash("sha256")
      .update(JSON.stringify(payloadObject))
      .digest();

    const privateKey = Buffer.from(secret, "hex");
    console.log("Private Key: ", privateKey);
    const signatureObject = secp256k1.ecdsaSign(hashed, privateKey);
    let buf = Buffer.from(signatureObject.signature);
    let signatureBuffer = Buffer.alloc(65);
    signatureBuffer[0] = signatureObject.recid + 27;
    buf.copy(signatureBuffer, 1, 0, buf.length);
    const signatureHex = signatureBuffer.toString("hex");
    return "0x" + signatureHex;
  } catch (error) {
    throw error;
  }
}

// Define a route handler for the default home page of logchain
router.get("/", (req: any, res: any) => {
  res.send("Hello world from Logchain!");
});

// Post method to get a transaction given a transaction id
router.post("/getTransaction", async (req: any, res: any) => {
  const txid = req.body.txid;

  try {
    const body = await axios.post("http://3.39.217.2:7556/get_transaction", {
      txid: txid,
    });

    if (body.data.error) {
      return res.status(400).json({
        Error: body.data,
      });
    }

    console.log(body.data);

    // let testing = body.data.transaction.payload.data;
    // const parsedData = JSON.parse(testing);
    // console.log("Data: ", testing);
    // console.log("image URI: ", parsedData.image);

    res.send(body.data);
  } catch (err: any) {
    console.log("Error: ", err);
    res.status(400).send(err.message);
  }
});

// Post method to get history for an user address
router.post("/getHistory", async (req: any, res: any) => {
  const userAddress = req.body.userAddress;
  const start = req.body.start;
  const stop = req.body.stop;

  try {
    const body = await axios.post("http://3.39.217.2:7556/get_history", {
      address: userAddress,
      start: start,
      stop: stop,
    });

    console.log("Body: ", body.data);

    if (body.data.error) {
      return res.status(400).json({
        Error: body.data,
      });
    }

    console.log(body.data);

    res.send(body.data);
  } catch (err: any) {
    console.log("Error: ", err);
    res.status(400).send(err.message);
  }
});

// Post method to get list of TokenIDs for a user address
router.post("/getTokenIds", async (req: any, res: any) => {
  const userAddress = req.body.userAddress;
  const start = req.body.start;
  const stop = req.body.stop;

  try {
    const body = await axios.post("http://3.39.217.2:7556/get_token_id", {
      address: userAddress,
      start: start,
      stop: stop,
    });

    console.log("Body: ", body.data);

    if (body.data.error) {
      return res.status(400).json({
        Error: body.data,
      });
    }

    console.log(body.data);

    res.send(body.data);
  } catch (err: any) {
    console.log("Error: ", err);
    res.status(400).send(err.message);
  }
});

// Post method to get list of ContractIDs for a user address
router.post("/getContractIds", async (req: any, res: any) => {
  const userAddress = req.body.userAddress;
  const start = req.body.start;
  const stop = req.body.stop;

  try {
    const body = await axios.post("http://3.39.217.2:7556/get_contract_id", {
      address: userAddress,
      start: start,
      stop: stop,
    });

    console.log("Body: ", body.data);

    if (body.data.error) {
      return res.status(400).json({
        Error: body.data,
      });
    }

    console.log(body.data);

    res.send(body.data);
  } catch (err: any) {
    console.log("Error: ", err);
    res.status(400).send(err.message);
  }
});

router.get("/getNFTList/:userAddress", (req: any, res: any) => {
  res.send("NFT List");
});

router.get("/getMediaURI/:tokenID", (req: any, res: any) => {
  res.send("Media URI");
});

router.get("/getMetadata/:tokenID", (req: any, res: any) => {
  res.send("Metadata");
});

// Post method to get a certain block from given parameter 'blockNumber'
router.post("/getBlock", async (req: any, res: any) => {
  const blockNumber = req.body.blockNumber;
  const includeTransactions = req.body.includeTransactions;

  console.log("blocknumber: ", blockNumber);
  try {
    const body = await axios.post("http://3.39.217.2:7556/get_block", {
      block_number: blockNumber,
      include_transactions: includeTransactions,
    });

    if (body.data.error) {
      return res.status(400).json({
        Error: body.data,
      });
    }

    console.log(body.data);

    res.send(body.data);
  } catch (err: any) {
    console.log("Error: ", err);
    res.status(400).send(err.message);
  }
});

// Post method to deploy a NFT contract with address from contractCreator with secret
router.post("/deployContract", async (req: any, res: any) => {
  const type = req.body.type;
  const contractName = req.body.contractName;
  const contractCreator = req.body.contractCreator;
  const userAddress = req.body.userAddress;
  const secret = req.body.secret;

  const payload = {
    type: type,
    contract_name: contractName,
    contract_creator: contractCreator,
    address: userAddress,
  };

  try {
    const signature = signTransaction(payload, secret);
    const body = await axios.post("http://3.39.217.2:7556/send", {
      payload: payload,
      signature: signature,
    });

    if (body.data.error) {
      return res.status(400).json({
        Error: body.data,
      });
    }

    console.log(body.data);

    res.send(body.data);
  } catch (err: any) {
    console.log("Error: ", err);
    res.status(400).send(err.message);
  }
});

// Post method to mint a nft given the contract id and data
router.post("/mintNFT", async (req: any, res: any) => {
  const contractId = req.body.contractId;
  const from = req.body.from;
  const to = req.body.to;
  const data = req.body.data;
  const uri = req.body.uri;
  const secret = req.body.secret;

  const payload = {
    contract_id: contractId,
    from: from,
    to: to,
    data: data,
    uri: uri,
  };

  //   console.log("payload: ", payload);

  try {
    const signature = signTransaction(payload, secret);
    console.log("signature/error", signature);
    const body = await axios.post("http://3.39.217.2:7556/send", {
      payload: payload,
      signature: signature,
    });

    if (body.data.error) {
      return res.status(400).json({
        Error: body.data,
      });
    }

    console.log(body.data);

    res.send(body.data);
  } catch (err: any) {
    console.log("Error: ", err);
    res.status(400).send(err.message);
  }
});

export default router;
