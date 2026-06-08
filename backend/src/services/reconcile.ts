import path from "path";
import fs from "fs/promises";

import { DeploymentRow } from "../types/deployment.js";

import { runCommand } from "../utils/runCommand.js";
import {
  getAllDeployments,
  updateDeployment,
} from "../repositories/deployment.repository.js";
import { stopContainer } from "./stopContainer.js";
import { reloadNginx } from "./nginx/reloadNginx.js";

const ACTIVE_STATUSES = ["cloning", "building", "starting", "running"];

export const reconcile = async () => {
  console.log("starting recilation...");

  const deployments: DeploymentRow[] = await getAllDeployments();
  const activeDeployments = deployments.filter((dpl) =>
    ACTIVE_STATUSES.includes(dpl.status),
  );

  const containerData: string = await runCommand(
    "docker",
    ["ps", "-a", "--format", "{{.Names}}"],
    { silent: true },
  );

  const runningContainerData: string = await runCommand(
    "docker",
    ["ps", "--format", "{{.Names}}"],
    {
      silent: true,
    },
  );

  const containerNames: string[] = containerData
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.startsWith("container-"));

  const runningContainerNames: string[] = runningContainerData
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.startsWith("container-"));

  /*logic: 
    1. if deployment is not in containerNames, stop & mark deployment as stopped
    2. if deployment is in containerNames, but not in deployments, remove container
  */

  for (const deployment of activeDeployments) {
    const ExistsInContainerNames = containerNames.includes(
      deployment.container_name || "",
    );
    const ExistsInRunningContainers = runningContainerNames.includes(
      deployment.container_name || "",
    );
    //1. db says running but container not found => mark as stopped in db
    if (deployment.status === "running" && !ExistsInRunningContainers) {
      console.log(
        `container ${deployment.container_name} not found in docker, marking as stopped`,
      );
      await updateDeployment(deployment.id, {
        status: "stopped",
        error_message: "container not found (possible crash)",
      });

      //await stopContainer(deployment.id);
      //container shouldn't be reomved to support restart this specific deployment again
    }
    //2. db says cloning/building/starting but container not found => mark as failed
    else if (
      ["cloning", "building", "starting"].includes(deployment.status) &&
      !ExistsInContainerNames
    ) {
      console.log(
        `container ${deployment.container_name} not found in docker, marking as failed`,
      );
      await updateDeployment(deployment.id, {
        status: "failed",
        error_message: `server restart/crash during ${deployment.status} stage`,
      });
    }
    //3. db says running and container found => do nothing
  }

  //4. remove stale nginx configs (configs that don't have a matching deployment)
  const confDir = path.join(process.cwd(), "nginx", "conf.d");
  const confFiles = await fs.readdir(confDir);

  for (const file of confFiles) {
    if (file === ".gitkeep") continue;
    const route = file.replace(".conf", "");
    if (!deployments.some((dpl) => dpl.route === route)) {
      await fs.unlink(path.join(confDir, file));
      console.log(`Removed stale nginx config: ${file}`);
    }
  }

  //5. remove containers that are not in db but are in containerNames
  const activeNames = activeDeployments.map((dpl) => dpl.container_name);
  for (const name of containerNames) {
    if (!activeNames.includes(name)) {
      console.log(`container ${name} record not found in db, removing it...`);
      await runCommand("docker", ["rm", "-f", name]);
    }
  }

  //6. reload nginx
  await reloadNginx();

  console.log("recilation complete");
};
