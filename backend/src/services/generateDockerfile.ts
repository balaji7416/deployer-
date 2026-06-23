import fs from "fs/promises";
import path from "path";
import { RuntimeInfo } from "../types/index.js";

const TEMPLATES_DIR =
  path.resolve("dockerfiles") || path.join(process.cwd(), "src", "dockerfiles");

const fillTemplate = async (
  templateName: string,
  fields: Record<string, string>,
): Promise<string> => {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  let template = await fs.readFile(templatePath, "utf-8");

  for (const [key, val] of Object.entries(fields)) {
    template = template.replaceAll(`{{${key}}}`, val);
  }
  return template;
};

const generateDockerfile = async (
  workspacePath: string,
  runtime: RuntimeInfo,
  deploymentId: string,
): Promise<void> => {
  const runtimeType = runtime.type;

  let dockerfile: string;
  switch (runtimeType) {
    case "node":
      dockerfile = await fillTemplate("node.tpl", {
        BASE_IMAGE: runtime.baseImage || "node:20-alpine",
        INSTALL_COMMAND: runtime.installCommand || "npm install",
        EXPOSED_PORT: String(runtime.exposedPort) || "3000",
        START_COMMAND: runtime.startCommand || "node index.js",
      });
      break;
    case "python":
      dockerfile = await fillTemplate("python.tpl", {
        BASE_IMAGE: runtime.baseImage || "python:3.11-slim",
        INSTALL_COMMAND:
          runtime.installCommand || "pip install -r requirements.txt",
        EXPOSED_PORT: String(runtime.exposedPort) || "8000",
        START_COMMAND: runtime.startCommand || "python main.py",
      });
      break;
    case "static":
      dockerfile = await fillTemplate("static.tpl", {
        BASE_IMAGE: runtime.baseImage || "nginx:alpine",
        EXPOSED_PORT: String(runtime.exposedPort) || "80",
      });
      break;
    case "spa":
      dockerfile = await fillTemplate("spa.tpl", {
        INSTALL_COMMAND: runtime.installCommand || "npm install",
        BUILD_COMMAND: runtime.buildCommand || "npm run build",
        OUTPUT_DIR: runtime.outputDir || "dist",
        EXPOSED_PORT: String(runtime.exposedPort) || "80",
        DEPLOYMENT_ID: deploymentId,
      });
      break;
    case "dockerfile":
      console.log("using user provided dockerfile");
      return; // no need to generate dockerfile if user has provided dockerfile
    case "unknown":
      throw new Error("Unknown runtime type");
  }

  await fs.writeFile(path.join(workspacePath, "Dockerfile"), dockerfile);
};

export { generateDockerfile };
