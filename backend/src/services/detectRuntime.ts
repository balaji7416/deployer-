import fs from "fs/promises";
import path from "path";
import type { RuntimeType, RuntimeInfo } from "../types/deployment.js";

const fileExists = async (
  filePath: string,
  filename: string,
): Promise<boolean> => {
  try {
    await fs.access(path.join(filePath, filename));
    return true;
  } catch {
    return false;
  }
};

const detectNode = async (workspacePath: string): Promise<RuntimeInfo> => {
  const packageJsonPath = path.join(workspacePath, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

  const startCommand = packageJson?.scripts?.start
    ? "npm start"
    : `node ${packageJson?.main || "index.js"}`;

  return {
    type: "node",
    installCommand: "npm install",
    startCommand,
    baseImage: "node:20-alpine",
    exposedPort: 3000,
  };
};

const detectPython = async (workspacePath: string): Promise<RuntimeInfo> => {
  const entryFiles = ["app.py", "main.py", "server.py"];
  let startCommand = "python main.py";

  for (const file of entryFiles) {
    if (await fileExists(workspacePath, file)) {
      startCommand = `python ${file}`;
      break;
    }
  }

  return {
    type: "python",
    installCommand: "pip install -r requirements.txt",
    startCommand,
    baseImage: "python:3.11-slim",
    exposedPort: 8000,
  };
};

const detectDockerfile = async (
  workspacePath: string,
): Promise<RuntimeInfo> => {
  let exposedPort = 80;
  const dockerfilePath = path.join(workspacePath, "Dockerfile");
  const dockerfile = await fs.readFile(dockerfilePath, "utf-8");
  const match = dockerfile.match(/EXPOSE\s+(\d+)/);
  if (match) exposedPort = parseInt(match[1]);
  return {
    type: "dockerfile",
    exposedPort,
  };
};

const detectStatic = async (workSpacePath: string): Promise<RuntimeInfo> => {
  return {
    type: "static",
    startCommand: "nginx -g 'daemon off;'",
    baseImage: "nginx:alpine",
    exposedPort: 80,
  };
};

const detectRuntime = async (workspacePath: string): Promise<RuntimeInfo> => {
  if (await fileExists(workspacePath, "Dockerfile")) {
    return detectDockerfile(workspacePath);
  }
  if (await fileExists(workspacePath, "package.json")) {
    return detectNode(workspacePath);
  }
  if (await fileExists(workspacePath, "requirements.txt")) {
    return detectPython(workspacePath);
  }
  if (await fileExists(workspacePath, "index.html")) {
    return detectStatic(workspacePath);
  }
  return {
    type: "unknown",
    exposedPort: 0,
  };
};

export { detectRuntime };
