import express from "express";
import Router from "express";

const router = Router();

// Define a route handler for the default home page
router.get("/", (req: any, res: any) => {
  res.send("Hello world from Besu!");
});

export default router;
