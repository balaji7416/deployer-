import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { runCommand } from "./utils/runCommand.js";
import { pool } from "./db/pool.js";

import { orchestrateDeployment } from "./services/orchestrator.js";

const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({ message: "backend working..." });
});

app.get("/deployments", async (req, res) => {
  const { rows } = await pool.query("select * from deployments");
  res.status(200).json({ data: rows });
});

app.post("/deploy", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ err: "repo url is required" });
  const result = await orchestrateDeployment(repoUrl);
  return res.status(200).json({ data: result });
});

await pool.query("SELECT 1");

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
