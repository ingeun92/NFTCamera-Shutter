import express from "express";
import axios from "axios";
import crypto from "crypto";
import secp256k1 from "secp256k1";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const secret =
  "0x68790c34823096aab2466a1c1c6b33b63780262b58d7ed36bf7be4646b661384";
const address = "0x29bd6132dDc81e4cF42F213084EF4406dF77a667";

function signTransaction(from: any, to: any, secret: any, data: any) {
  // let media_data = "/9j/4XefRXhpZgAATU0AKgAAAAgADAEAAAMAAAABEjAAAAEQAAI ...";
  // let from = "0x8E300110778B9f57dd8ABa35542c440B492428c9";
  // let to = "0x8E300110778B9f57dd8ABa35542c440B492428c9";

  // let secret =
  //   "676c126db7085b575f0cb986892de022c295716d8d1b4229d7e7bff45f970d87";
  const payloadObject = {
    from: from,
    to: to,
    data: data,
  };
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
  return signatureHex;
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

app.get("/getBlock", async (req: any, res: any) => {
  const blockNumber = req.body.blockNumber;

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

app.post("/mintNFT", (req: any, res: any) => {
  const body = req.body;
  console.log("Print: " + JSON.stringify(body));
  res.send(body);
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
