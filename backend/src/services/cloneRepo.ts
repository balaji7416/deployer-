import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { runCommand } from "../utils/runCommand.js";

export const cloneRepo = async (repoUrl: string) => {
  if (!repoUrl) {
    throw new Error("repoUrl is required");
  }

  const repoName = repoUrl.split("/").pop()?.replace(".git", "");
  if (!repoName) {
    throw new Error("invalid repoUrl");
  }

  const deploymentId = crypto.randomBytes(3).toString("hex");
  const deploymentPath = path.join(process.cwd(), "deployments", deploymentId);

  await fs.mkdir(deploymentPath);
  await runCommand("git", ["clone", repoUrl, "."], deploymentPath);

  return {
    success: true,
    deploymentId,
    repoUrl,
    repoName,
  };
};
