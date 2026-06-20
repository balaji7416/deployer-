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

import {
  updateDeployment,
  createDeployment,
} from "../repositories/deployment.repository.js";

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
): Promise<DeploymentRow> => {
  const logBuffer: string[] = [];
  const id = deployment.id;

  try {
    // ── 1. Clone ────────────────────────────────────────────────────────────
    await updateDeployment(id, { status: "cloning" });

    emitLog(id, "CLONE", "Cloning repository...", logBuffer);
    const clone = await cloneRepo(deployment.repo_url, id);
    emitLog(id, "CLONE", "Repository cloned successfully.", logBuffer);

    // ── 2. Detect Runtime ───────────────────────────────────────────────────
    emitLog(id, "DETECT", "Detecting project runtime...", logBuffer);
    const runtime = await detectRuntime(clone.deploymentPath);
    if (runtime.type === "unknown") throw new Error("Unsupported runtime");
    emitLog(id, "DETECT", `Runtime detected: ${runtime.type}`, logBuffer);

    await updateDeployment(id, { runtime_type: runtime.type });

    // ── 3. Generate Dockerfile ──────────────────────────────────────────────
    emitLog(id, "DOCKERFILE", "Generating Dockerfile...", logBuffer);
    await generateDockerfile(clone.deploymentPath, runtime);
    emitLog(id, "DOCKERFILE", "Dockerfile generated.", logBuffer);

    // ── 4. Generate .dockerignore ───────────────────────────────────────────
    emitLog(id, "DOCKERIGNORE", "Generating .dockerignore...", logBuffer);
    await generateDockerignore(clone.deploymentPath);
    emitLog(id, "DOCKERIGNORE", ".dockerignore generated.", logBuffer);

    // ── 5. Build Image ──────────────────────────────────────────────────────
    await updateDeployment(id, { status: "building" });

    emitLog(id, "BUILD", "Building Docker image...", logBuffer);
    const build = await buildImage(id, clone.deploymentPath);

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
    const run = await runContainer(id);

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

    // ── 8. Finalise ─────────────────────────────────────────────────────────
    emitLog(id, "COMPLETE", `Deployment live at: /${nginx.route}`, logBuffer);

    logEmitter.emit("log", {
      deploymentId: id,
      stage: "complete",
      message: formatLog(
        "COMPLETE",
        `Deployment finished — route: /${nginx.route}`,
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

    console.error(`[deployer] Deployment ${id} failed:`, err);
    return result;
  }
};

export const startDeployment = async (repoUrl: string, userId: string) => {
  const repoName = repoUrl.split("/").pop()?.replace(".git", "") || null;
  const deployment: DeploymentRow = await createDeployment(
    repoUrl,
    repoName,
    userId,
  );

  if (!deployment) throw new Error("Failed to create deployment");
  orchestrateDeployment(deployment);

  return {
    deploymentId: deployment.id,
  };
};
