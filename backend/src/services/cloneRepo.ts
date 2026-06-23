import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { runCommand } from "../utils/runCommand.js";
import { CloneResult } from "../types/index.js";

export const cloneRepo = async (
  repoUrl: string,
  deploymentId: string,
  rootDir?: string,
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

  await fs.mkdir(deploymentPath, { recursive: true });
  await runCommand("git", ["clone", repoUrl, "."], deploymentPath);

  let projectRootDir;
  if (rootDir) projectRootDir = path.join(deploymentPath, rootDir);
  else projectRootDir = deploymentPath;
  return {
    deploymentPath,
    projectRootDir,
  };
};
