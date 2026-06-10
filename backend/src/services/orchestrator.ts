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

import type { DeploymentRow } from "../types/deployment.js";

import {
  updateDeployment,
  createDeployment,
} from "../repositories/deployment.repository.js";

export const orchestrateDeployment = async (
  deployment: DeploymentRow,
): Promise<DeploymentRow> => {
  try {
    await updateDeployment(deployment.id, { status: "cloning" });

    // console.log("cloning repository...");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "cloning repository...",
    });

    const clone = await cloneRepo(deployment.repo_url, deployment.id);
    //console.log("---------- cloned repository ----------");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "---------- cloned repository ----------",
    });

    //console.log("detecting runtime...");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "detecting runtime...",
    });
    const runtime = await detectRuntime(clone.deploymentPath);
    if (runtime.type === "unknown") throw new Error("Unsupported runtime");
    //console.log("detected runtime: ", runtime.type);
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: `detected runtime: ${runtime.type}`,
    });

    await updateDeployment(deployment.id, { runtime_type: runtime.type });

    //console.log("generating dockerfile...");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "generating dockerfile...",
    });

    await generateDockerfile(clone.deploymentPath, runtime);
    //console.log("------ generated docker file ---------");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "------ generated docker file ---------",
    });

    //console.log("generating dockerignore...");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "generating dockerignore...",
    });
    await generateDockerignore(clone.deploymentPath);
    //console.log("------ generated dockerignore ---------");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "------ generated dockerignore ---------",
    });

    await updateDeployment(deployment.id, { status: "building" });

    //console.log("building image...");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "building image...",
    });
    const build = await buildImage(deployment.id, clone.deploymentPath);
    //console.log("----------- build successful ---------");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "----------- build successful ---------",
    });

    await updateDeployment(deployment.id, {
      status: "starting",
      image_name: build.imageName,
      build_logs: build.result,
    });
    const hostPort = await getPort();
    const containerPort = runtime.exposedPort || 3000;

    //console.log("starting container...");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "starting deployment...",
    });
    const run = await runContainer(deployment.id);
    //console.log("----------- container started ---------");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "----------- deployement running ---------",
    });

    await updateDeployment(deployment.id, {
      status: "running",
      // port: hostPort,
      container_name: run.containerName,
      run_logs: run.result,
    });

    //console.log("generating nginx config...");
    logEmitter.emit("log", {
      stage: "info",
      message: "generating nginx config...",
    });
    const nginx = await generateNginxConfig(
      deployment.id,
      deployment.container_name || run.containerName,
      containerPort,
    );
    //console.log("------- nginx config generated -------");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "------- nginx config generated -------",
    });

    const result = await updateDeployment(deployment.id, {
      route: nginx.route,
    });
    //console.log("reloading nginx...");
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "reloading nginx...",
    });
    await reloadNginx();
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: "------- nginx reloaded -------",
    });
    //console.log("----- nginx reloaded -----");

    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: `
        {
          "deploymentId": "${deployment.id}",
          "route": "${nginx.route}"
          "url": "http://localhost/${nginx.route}"
        }
      `,
    });
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "complete",
      message: "Deployment finished successfully",
    });
    return result;
  } catch (err) {
    let result;
    if (deployment)
      result = await updateDeployment(deployment.id, {
        status: "failed",
        error_message:
          err instanceof Error ? err.message : "Unknown Error occurred",
      });
    console.log("deployement Error for deployment: ", deployment?.id, err);

    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "failed",
      message: err instanceof Error ? err.message : "Deployment failed",
    });
    return result;
  }
};

export const startDeployment = async (repoUrl: string) => {
  const repoName = repoUrl.split("/").pop()?.replace(".git", "") || null;
  const deployment: DeploymentRow = await createDeployment(repoUrl, repoName);

  if (!deployment) throw new Error("Failed to create deployment");
  orchestrateDeployment(deployment);

  return {
    deploymentId: deployment.id,
  };
};
