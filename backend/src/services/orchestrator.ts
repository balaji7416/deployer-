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
    const clone = await cloneRepo(repoUrl, deployment.id);
    const runtime = await detectRuntime(clone.deploymentPath);
    if (runtime.type === "unknown") throw new Error("Unsupported runtime");
    await updateDeployment(deployment.id, { runtime_type: runtime.type });

    await generateDockerfile(clone.deploymentPath, runtime);
    await generateDockerignore(clone.deploymentPath);

    await updateDeployment(deployment.id, { status: "building" });
    const build = await buildImage(deployment.id, clone.deploymentPath);

    await updateDeployment(deployment.id, {
      status: "starting",
      image_name: build.imageName,
      build_logs: build.result,
    });
    const hostPort = await getPort();
    const containerPort = runtime.exposedPort || 3000;

    const run = await runContainer(
      deployment.id,
      clone.deploymentPath,
      hostPort,
      containerPort,
    );

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
