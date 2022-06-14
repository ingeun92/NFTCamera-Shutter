import "dotenv/config";
import express from "express";
import cors from "cors";
import logchainRoutes from "./routes/logchain.js";
import besuRoutes from "./routes/besu.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cors());

app.use("/logchain", logchainRoutes);
app.use("/besu", besuRoutes);

// Define a route handler for the default home page
app.get("/", (req: any, res: any) => {
  res.send("Hello world!");
});

// Start the Express server, default port is 3000 if not stated in env
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
