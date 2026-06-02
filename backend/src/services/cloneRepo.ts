import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { runCommand } from "../utils/runCommand.js";
import { CloneResult } from "../types/deployment.js";

export const cloneRepo = async (
  repoUrl: string,
  deploymentId: string,
): Promise<CloneResult> => {
  if (!repoUrl) {
    throw new Error("repoUrl is required");
  }

  const repoName = repoUrl.split("/").pop()?.replace(".git", "");
  if (!repoName) {
    throw new Error("invalid repoUrl");
  }

  const deploymentPath = path.join(process.cwd(), "deployments", deploymentId);

  // for local testing: copy local project instead of cloning
  // const local_react_proj = path.resolve("..", "frameIt_frontend");
  // await fs.cp(local_react_proj, deploymentPath, { recursive: true });

  await fs.mkdir(deploymentPath);
  await runCommand("git", ["clone", repoUrl, "."], deploymentPath);

  return {
    deploymentPath,
  };
};
