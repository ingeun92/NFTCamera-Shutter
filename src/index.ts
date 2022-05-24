import express from "express";
import axios from "axios";
import crypto from "crypto";
import secp256k1 from "secp256k1";
import { buffer } from "stream/consumers";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const secret =
  "63dfc6c59b0cbefcde541a5199732e4ae485266e683a1716cd778e8ed737d6f3";
const address = "0x6C021FD5220d5f835715A3c8ff27f2cD7748e9f1";

function createPayloadNFTContract(
  // from: any,
  // to: any,
  type: string,
  contractName: string,
  contractCreator: any,
) {
  const payloadObject = {
    type: type,
    contractName: contractName,
    contractCreator: contractCreator,
  };
  return payloadObject;
}

function signTransaction(payloadObject: any, secret: any) {
  // let media_data = "/9j/4XefRXhpZgAATU0AKgAAAAgADAEAAAMAAAABEjAAAAEQAAI ...";
  // let from = "0x8E300110778B9f57dd8ABa35542c440B492428c9";
  // let to = "0x8E300110778B9f57dd8ABa35542c440B492428c9";

  // let secret =
  //   "676c126db7085b575f0cb986892de022c295716d8d1b4229d7e7bff45f970d87";
  // const payloadObject = {
  //   from: from,
  //   to: to,
  //   data: data,
  // };

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

  // axios
  //   .get("http://3.39.217.2:7556/get_block", {
  //     params: {
  //       block_number: 0,
  //     },
  //   })
  //   .then((response: any) => {
  //     console.log(typeof response);
  //     console.log(response.data);
  //     res.send(response.data);
  //   })
  //   .catch(function (err: any) {
  //     console.log("Unable to fetch -", err);
  //   });
});

// Method to deploy a NFT contract with address from contractCreator with secret
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

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
