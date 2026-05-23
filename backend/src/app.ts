import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { updateDeployment } from "./repositories/deployment.repository.js";
import { DeploymentUpdate } from "./types/deployment.js";

import { pool } from "./db/pool.js";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ message: "backend working..." });
});

app.get("/deployments", async (req, res) => {
  const { rows } = await pool.query("select * from deployments");
  res.status(200).json({ data: rows });
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
