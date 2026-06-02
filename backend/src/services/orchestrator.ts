import { cloneRepo } from "./cloneRepo.js";
import { detectRuntime } from "./detectRuntime.js";
import { generateDockerfile } from "./generateDockerfile.js";
import { generateDockerignore } from "./genereateDockerignore.js";
import { buildImage } from "./buildImage.js";
import { getPort, freePort } from "../utils/portAllocator.js";
import { runContainer } from "./runContainer.js";
import type { DeploymentRow } from "../types/deployment.js";

import {
  updateDeployment,
  createDeployment,
} from "../repositories/deployment.repository.js";

export const orchestrateDeployment = async (
  repoUrl: string,
): Promise<DeploymentRow> => {
  let deployment: DeploymentRow | null = null;
  try {
    const repoName = repoUrl.split("/").pop()?.replace(".git", "") || null;
    deployment = await createDeployment(repoUrl, repoName);

    if (!deployment) throw new Error("Failed to create deployment");

    await updateDeployment(deployment.id, { status: "cloning" });

    console.log("cloning repository...");
    const clone = await cloneRepo(repoUrl, deployment.id);
    console.log("---------- cloned repository ----------");

    console.log("detecting runtime...");
    const runtime = await detectRuntime(clone.deploymentPath);
    if (runtime.type === "unknown") throw new Error("Unsupported runtime");
    console.log("detected runtime: ", runtime.type);

    await updateDeployment(deployment.id, { runtime_type: runtime.type });

    console.log("generating dockerfile...");
    await generateDockerfile(clone.deploymentPath, runtime);
    console.log("------ generated docker file ---------");

    console.log("generating dockerignore...");
    await generateDockerignore(clone.deploymentPath);
    console.log("------ generated dockerignore ---------");

    await updateDeployment(deployment.id, { status: "building" });

    console.log("building image...");
    const build = await buildImage(deployment.id, clone.deploymentPath);
    console.log("----------- build successful ---------");

    await updateDeployment(deployment.id, {
      status: "starting",
      image_name: build.imageName,
      build_logs: build.result,
    });
    const hostPort = await getPort();
    const containerPort = runtime.exposedPort || 3000;

    console.log("starting container...");
    const run = await runContainer(
      deployment.id,
      clone.deploymentPath,
      hostPort,
      containerPort,
    );
    console.log("----------- container started ---------");

    const result = await updateDeployment(deployment.id, {
      status: "running",
      port: hostPort,
      container_name: run.containerName,
      run_logs: run.result,
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
    console.log("deployement Error: ", err);
    return result;
  }
};
