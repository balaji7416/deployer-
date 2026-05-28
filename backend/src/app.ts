import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { updateDeployment } from "./repositories/deployment.repository.js";
import { DeploymentUpdate } from "./types/deployment.js";
import { runCommand } from "./utils/runCommand.js";
import { pool } from "./db/pool.js";
import { cloneRepo } from "./services/cloneRepo.js";
import { detectRuntime } from "./services/detectRuntime.js";
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({ message: "backend working..." });
});

app.get("/deployments", async (req, res) => {
  const { rows } = await pool.query("select * from deployments");
  res.status(200).json({ data: rows });
});

app.post("/runcmd", async (req, res) => {
  const { cmd } = req.body;
  if (!cmd) return res.status(400).json({ err: "cmd is required" });
  const result = await runCommand(cmd, [], process.cwd());
  return res.status(200).json({ data: result });
});

app.post("/clone", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ err: "repoUrl is required" });

  const result = await cloneRepo(repoUrl);
  return res.status(200).json({ data: result });
});

app.post("/detect", async (req, res) => {
  const { repoUrl } = req.body;

  const clone = await cloneRepo(repoUrl);
  const result = await detectRuntime(clone.deploymentPath);
  return res.status(200).json({ data: result });
});

app.post("/update", async (req, res) => {
  const depl: DeploymentUpdate = {
    repo_name: null,
    status: "building",
    port: null,
    container_name: null,
    image_name: null,
    runtime_type: null,
    build_logs: null,
    run_logs: null,
  };
  const resp = await updateDeployment(
    "8d2df9b8-0dba-4d29-8be9-a6519f89b13c",
    depl,
  );
  return res.status(200).json({ data: resp });
});

await pool.query("SELECT 1");

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
