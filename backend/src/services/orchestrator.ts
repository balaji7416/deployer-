import { cloneRepo } from "./cloneRepo.js";
import { detectRuntime } from "./detectRuntime.js";
import { generateDockerfile } from "./generateDockerfile.js";
import { generateDockerignore } from "./genereateDockerignore.js";
import { buildImage } from "./buildImage.js";
import { runContainer } from "./runContainer.js";
import { generateNginxConfig } from "./nginx/generateNginxConf.js";
import { reloadNginx } from "./nginx/reloadNginx.js";

import { getPort, freePort } from "../utils/portAllocator.js";
import { logEmitter } from "../utils/logEmmiter.js";

import type { DeploymentRow } from "../types/index.js";
import { deploymentRepo } from "../repositories/deployment.repository.js";
import type { EnvVarRow } from "../types/index.js";

import fs from "fs";
import fsp from "fs/promises";
import path from "path";

import {
  updateDeployment,
  createDeployment,
  getDeploymentById,
} from "../repositories/deployment.repository.js";
import { ApiError } from "../utils/apiError.js";

// ─── Logging Helpers ──────────────────────────────────────────────────────────

type LogStage =
  | "INIT"
  | "CLONE"
  | "DETECT"
  | "DOCKERFILE"
  | "DOCKERIGNORE"
  | "BUILD"
  | "DEPLOY"
  | "NETWORK"
  | "COMPLETE"
  | "ERROR";

const STAGE_ICONS: Record<LogStage, string> = {
  INIT: "🚀",
  CLONE: "📦",
  DETECT: "🔍",
  DOCKERFILE: "🐳",
  DOCKERIGNORE: "📄",
  BUILD: "🔨",
  DEPLOY: "▶️",
  NETWORK: "🌐",
  COMPLETE: "✅",
  ERROR: "❌",
};

/**
 * Create a timestamped, structured log line in the style of professional
 * deployment platforms (Vercel, Railway, Render, etc.).
 */
const formatLog = (stage: LogStage, message: string): string => {
  const ts = new Date().toISOString();
  return `[${ts}] ${STAGE_ICONS[stage]}  [${stage}]  ${message}`;
};

/**
 * Emit a log entry to the SSE stream and append it to the in-memory log buffer.
 */
const emitLog = (
  deploymentId: string,
  stage: LogStage,
  message: string,
  logBuffer: string[],
  emitStage: string = "info",
): void => {
  const line = formatLog(stage, message);
  logBuffer.push(line);
  logEmitter.emit("log", {
    deploymentId,
    stage: emitStage,
    message: line,
  });
};

// ─── Orchestration ────────────────────────────────────────────────────────────

export const orchestrateDeployment = async (
  deployment: DeploymentRow,
  rootDir?: string,
): Promise<DeploymentRow> => {
  const logBuffer: string[] = [];
  const id = deployment.id;
  let deploymentPath: string | null = null;
  let projectRootDir: string | null = null;

  try {
    // ── 1. Clone ────────────────────────────────────────────────────────────
    await updateDeployment(id, { status: "cloning" });

    emitLog(id, "CLONE", "Cloning repository...", logBuffer);
    const clone = await cloneRepo(deployment.repo_url, id, rootDir);
    emitLog(id, "CLONE", "Repository cloned successfully.", logBuffer);

    deploymentPath = clone.deploymentPath;
    projectRootDir = clone.projectRootDir;

    // ── 2. Detect Runtime ───────────────────────────────────────────────────
    emitLog(id, "DETECT", "Detecting project runtime...", logBuffer);
    const runtime = await detectRuntime(clone.projectRootDir);
    if (runtime.type === "unknown") throw new Error("Unsupported runtime");
    emitLog(id, "DETECT", `Runtime detected: ${runtime.type}`, logBuffer);

    await updateDeployment(id, { runtime_type: runtime.type });

    // ── 3. Generate Dockerfile ──────────────────────────────────────────────
    emitLog(id, "DOCKERFILE", "Generating Dockerfile...", logBuffer);
    await generateDockerfile(clone.projectRootDir, runtime, id);
    emitLog(id, "DOCKERFILE", "Dockerfile generated.", logBuffer);

    // ── 4. Generate .dockerignore ───────────────────────────────────────────
    emitLog(id, "DOCKERIGNORE", "Generating .dockerignore...", logBuffer);
    await generateDockerignore(clone.projectRootDir);
    emitLog(id, "DOCKERIGNORE", ".dockerignore generated.", logBuffer);

    // ── 5. Build Image ──────────────────────────────────────────────────────
    await updateDeployment(id, { status: "building" });

    emitLog(id, "BUILD", "Building Docker image...", logBuffer);
    const build = await buildImage(id, clone.projectRootDir);

    // Capture build output into the log buffer
    if (build.result) {
      const buildLines = build.result.split("\n").filter((l) => l.trim());
      for (const line of buildLines) {
        logBuffer.push(formatLog("BUILD", line.trim()));
      }
    }
    emitLog(id, "BUILD", "Docker image built successfully.", logBuffer);

    // ── 6. Start Container ──────────────────────────────────────────────────
    await updateDeployment(id, {
      status: "starting",
      image_name: build.imageName,
    });

    const hostPort = await getPort();
    const containerPort = runtime.exposedPort || 3000;

    emitLog(id, "DEPLOY", "Starting container...", logBuffer);
    const envVarRecords: EnvVarRow[] = await deploymentRepo.getEnvVariables(
      deployment.id,
    );
    const envVars = Object.fromEntries(
      envVarRecords.map(({ key, value }) => [key, value]),
    );
    const run = await runContainer(id, envVars);

    // Capture run output into the log buffer
    if (run.result) {
      const runLines = run.result.split("\n").filter((l) => l.trim());
      for (const line of runLines) {
        logBuffer.push(formatLog("DEPLOY", line.trim()));
      }
    }
    emitLog(id, "DEPLOY", "Container started successfully.", logBuffer);

    await updateDeployment(id, {
      status: "running",
      container_name: run.containerName,
    });

    // ── 7. Configure Nginx ──────────────────────────────────────────────────
    emitLog(id, "NETWORK", "Generating Nginx configuration...", logBuffer);
    const nginx = await generateNginxConfig(
      id,
      deployment.container_name || run.containerName,
      containerPort,
    );
    emitLog(id, "NETWORK", "Nginx configuration generated.", logBuffer);

    await updateDeployment(id, {
      route: nginx.route,
    });

    emitLog(id, "NETWORK", "Reloading Nginx...", logBuffer);
    await reloadNginx(nginx.route);
    emitLog(id, "NETWORK", "Nginx reloaded successfully.", logBuffer);

    // 8. Finalise
    const baseDomain = process.env.BASE_DOMAIN || "localhost";
    const deploymentUrl = `http://${nginx.route}.${baseDomain}/`;
    emitLog(id, "COMPLETE", `Deployment live at: ${deploymentUrl}`, logBuffer);

    logEmitter.emit("log", {
      deploymentId: id,
      stage: "complete",
      message: formatLog(
        "COMPLETE",
        `Deployment finished — route: ${deploymentUrl}`,
      ),
    });

    // Persist the full deployment log
    const result = await updateDeployment(id, {
      logs: logBuffer.join("\n"),
    });
    return result;
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Unknown error occurred";

    emitLog(id, "ERROR", `Deployment failed: ${errorMsg}`, logBuffer, "failed");

    // Persist logs even on failure
    const result = await updateDeployment(id, {
      status: "failed",
      error_message: errorMsg,
      logs: logBuffer.join("\n"),
    });

    return result;
  } finally {
    if (deploymentPath) {
      await fsp.rm(deploymentPath, { recursive: true, force: true });
    }
  }
};

export const startDeployment = async (deployment: DeploymentRow) => {
  orchestrateDeployment(deployment, deployment?.root_dir || "");
};
