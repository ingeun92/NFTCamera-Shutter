import "dotenv/config";
import express from "express";
import axios from "axios";
import crypto from "crypto";
import secp256k1 from "secp256k1";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

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
  const hashed = crypto
    .createHash("sha256")
    .update(JSON.stringify(payloadObject))
    .digest();
  const privateKey = Buffer.from(secret, "hex");
  const signatureObject = secp256k1.ecdsaSign(hashed, privateKey);
  let buf = Buffer.from(signatureObject.signature);
  let signatureBuffer = Buffer.alloc(65);
  signatureBuffer[0] = signatureObject.recid + 27;
  buf.copy(signatureBuffer, 1, 0, buf.length);
  const signatureHex = signatureBuffer.toString("hex");
  return "0x" + signatureHex;
}

// Define a route handler for the default home page
app.get("/", (req: any, res: any) => {
  res.send("Hello world!");
});

// Get method to get a transaction given a transaction id
app.get("/getTransaction", async (req: any, res: any) => {
  const txid = req.body.txid;

  try {
    const body = await axios.get("http://3.39.217.2:7556/get_transaction", {
      params: {
        txid: txid,
      },
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
    console.log("Unable to fetch -", err);
    res.status(400);
  }
});

// Get method to get history for an user address
app.get("/getHistory", async (req: any, res: any) => {
  const address = req.body.address;

  try {
    const body = await axios.get("http://3.39.217.2:7556/get_history", {
      params: {
        address: address,
      },
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
    console.log("Unable to fetch -", err);
    res.status(400);
  }
});

// Get method to get list of TokenIDs for a user address
app.get("/getTokenIdList", async (req: any, res: any) => {
  const contractId = req.body.contractId;
  const userAddress = req.body.userAddress;

  console.log("ContractId: ", contractId);
  console.log("Address: ", userAddress);

  try {
    const body = await axios.get("http://3.39.217.2:7556/get_token_id", {
      params: {
        contract_id: contractId,
        address: userAddress,
      },
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
    console.log("Unable to fetch -", err);
    res.status(400);
  }
});

app.get("/getNFTList/:userAddress", (req: any, res: any) => {
  res.send("NFT List");
});

app.get("/getMediaURI/:tokenID", (req: any, res: any) => {
  res.send("Media URI");
});

app.get("/getMetadata/:tokenID", (req: any, res: any) => {
  res.send("Metadata");
});

// Get method to get a certain block from given parameter 'blockNumber'
app.get("/getBlock", async (req: any, res: any) => {
  const blockNumber = req.body.blockNumber;

  console.log("blocknumber: ", blockNumber);
  try {
    const body = await axios.get("http://3.39.217.2:7556/get_block", {
      params: {
        block_number: blockNumber,
      },
    });

    if (body.data.error) {
      return res.status(400).json({
        Error: body.data,
      });
    }

    console.log(body.data);

    res.send(body.data);
  } catch (err: any) {
    console.log("Unable to fetch -", err);
    res.status(400);
  }
});

// Post method to deploy a NFT contract with address from contractCreator with secret
app.post("/deployContract", async (req: any, res: any) => {
  const type = req.body.type;
  const contractName = req.body.contractName;
  const contractCreator = req.body.contractCreator;
  const secret = req.body.secret;

  const payload = {
    type: type,
    contract_name: contractName,
    contract_creator: contractCreator,
  };

  const signature = signTransaction(payload, secret);

  try {
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
    console.log("Unable to fetch -", err);
    res.status(400);
  }
});

// Post method to mint a nft given the contract id and data
app.post("/mintNFT", async (req: any, res: any) => {
  const contractId = req.body.contractId;
  const contractCreator = req.body.contractCreator;
  const from = req.body.from;
  const to = req.body.to;
  const data = Buffer.from(JSON.stringify(req.body.data));
  const uri = req.body.uri;
  const secret = req.body.secret;

  // When converting back to JSON object
  // const stringData = data.toString();
  // console.log("stringToJson: ", JSON.parse(stringData));

  const payload = {
    contract_id: contractId,
    contract_creator: contractCreator,
    from: from,
    to: to,
    data: data,
    uri: uri,
  };

  const signature = signTransaction(payload, secret);

  console.log("payload: ", payload);

  try {
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
    console.log("Unable to fetch -", err);
    res.status(400);
  }
});

// Start the Express server, default port is 3000 if not stated in env
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
