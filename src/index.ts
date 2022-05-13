import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

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

app.post("/mintNFT/:metadata", (req: any, res: any) => {
  res.send("Mint NFT");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
