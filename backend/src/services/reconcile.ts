import path from "path";
import fs from "fs/promises";

import { DeploymentRow } from "../types/index.js";

import { runCommand } from "../utils/runCommand.js";
import {
  getAllDeployments,
  updateDeployment,
} from "../repositories/deployment.repository.js";

const ACTIVE_STATUSES = ["cloning", "building", "starting", "running"];

export const reconcile = async () => {
  console.log("starting recilation...");

  const deployments: DeploymentRow[] = await getAllDeployments();

  const activeDeployments = deployments.filter((dpl) =>
    ACTIVE_STATUSES.includes(dpl.status),
  );
  const runningDeployments = deployments.filter(
    (depl) => depl.status === "running",
  );

  const AllcontainerData: string = await runCommand(
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

  const allContainerNames: string[] = AllcontainerData.split("\n")
    .map((name) => name.trim())
    .filter((name) => name.startsWith("container-"));

  const runningContainerNames: string[] = runningContainerData
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.startsWith("container-"));

  /*logic: 
    1. if deployment is not in AllcontainerNames, stop & mark deployment as stopped
    2. if deployment is in containerNames, but not in deployments, remove container
  */

  for (const deployment of activeDeployments) {
    const ExistsInContainerNames = allContainerNames.includes(
      deployment.container_name || "",
    );
    const ExistsInRunningContainers = runningContainerNames.includes(
      deployment.container_name || "",
    );
    //1. db says running but container not found => mark as stopped in db
    if (deployment.status === "running" && !ExistsInRunningContainers) {
      console.log(
        `container ${deployment.container_name} not found in docker running containers, triggering health check take over`,
      );
      await updateDeployment(deployment.id, {
        status: "restarting",
        error_message: "container stopped(possible crash)",
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

  const validRoutes = new Set(deployments.map((depl) => depl.route?.trim()));

  for (const file of confFiles) {
    if (file === ".gitkeep" || file === "default.conf") continue;
    const route = file.replace(".conf", "");
    if (!validRoutes.has(route)) {
      await fs.unlink(path.join(confDir, file));
      console.log(`Removed stale nginx config: ${file}`);
    }
  }
  //5. remove containers that are not in db but are in containerNames
  const activeNames = activeDeployments.map((dpl) => dpl.container_name);
  for (const name of allContainerNames) {
    if (!activeNames.includes(name)) {
      console.log(`container ${name} record not found in db, removing it...`);
      await runCommand("docker", ["rm", "-f", name]);
    }
  }

  console.log("recilation complete");
};
