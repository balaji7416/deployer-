import { runCommand } from "../utils/runCommand.js";
import { deploymentRepo } from "../repositories/deployment.repository.js";
// import { logEmitter } from "../utils/logEmmiter.js";

const isContainerRunning = async (containerName: string) => {
  const runningContainers = (
    await runCommand("docker", ["ps", "--format", "{{.Names}}"], {
      silent: true,
    })
  )
    .split("\n")
    .map((name) => name.trim());
  return runningContainers.some((name) => name === containerName);
};

const performCheck = async () => {
  // 1. Fetch current Docker realities once per tick
  const runningContainers = (
    await runCommand("docker", ["ps", "--format", "{{.Names}}"], {
      silent: true,
    })
  )
    .split("\n")
    .map((name) => name.trim());

  const allContainers = (
    await runCommand("docker", ["ps", "-a", "--format", "{{.Names}}"], {
      silent: true,
    })
  )
    .split("\n")
    .map((name) => name.trim());

  const deployments = await deploymentRepo.getAllDeployments();

  // 2. Process all deployments concurrently instead of sequentially blocking
  const checkTasks = deployments.map(async (deployment) => {
    const containerName = deployment.container_name;

    // CRITICAL FIX: Skip deployments that are currently building, cloning, or intentionally stopped
    const activeStatuses = ["running", "restarting"];
    if (!activeStatuses.includes(deployment.status)) {
      return;
    }

    // Scenario A: Container went missing completely
    if (!allContainers.includes(containerName)) {
      if (deployment.status !== "stopped") {
        await deploymentRepo.updateDeployment(deployment.id, {
          status: "stopped",
          logs:
            deployment.logs +
            "\n[System]: Container not found in Docker. It may have been deleted manually.",
        });
      }
      return;
    }

    const isRunningInDocker = runningContainers.includes(containerName);

    // Scenario B: Expected to be running, but container is down
    if (!isRunningInDocker) {
      await deploymentRepo.updateDeployment(deployment.id, {
        status: "restarting",
      });

      //logEmitter.emit(`logs-${deployment.id}`, "[System]: Container crash detected. Attempting auto-restart...");

      let restarted = false;
      for (let i = 0; i < 5; i++) {
        try {
          console.log(
            `[Attempt ${i + 1}] Attempting to start ${containerName}...`,
          );
          await runCommand("docker", ["start", containerName], {
            silent: true,
          });

          // Wait 1 second to allow the container process to initialize and stabilize
          await new Promise((res) => setTimeout(res, 1000));

          // Inspect the state container engine directly using JSON format instead of scanning arrays again
          const inspectResult = await runCommand(
            "docker",
            ["inspect", "-f", "{{.State.Running}}", containerName],
            { silent: true },
          );
          const holdsStability = inspectResult.trim() === "true";

          if (!holdsStability) {
            throw new Error("Container process exited immediately post-boot.");
          }
          // Optional: logEmitter.emit(`logs-${deployment.id}`, "[System]: Container restarted successfully.");

          restarted = true;
          await deploymentRepo.updateDeployment(deployment.id, {
            status: "running",
            logs:
              deployment.logs +
              `\n[System]: Container restarted successfully. (Attempt ${i + 1})`,
          });
          break;
        } catch (err) {
          console.error(
            `Error restarting deployment ${deployment.id} (Attempt ${i + 1}):`,
            err,
          );
          await new Promise((res) => setTimeout(res, 1000));
        }
      }

      if (!restarted) {
        await deploymentRepo.updateDeployment(deployment.id, {
          status: "failed",
          logs:
            deployment.logs +
            `\n[System]: Failed to restart container after 5 attempts. Manual intervention required.`,
        });
      }
    }
    // Scenario C: Container is running fine
    else {
      // CRITICAL FIX: Only update DB if changing state to prevent DB write spam
      if (deployment.status !== "running") {
        await deploymentRepo.updateDeployment(deployment.id, {
          status: "running",
        });
      }
    }
  });

  await Promise.allSettled(checkTasks);
};

export const runSafeCheck = async () => {
  try {
    console.log("Starting health check loop...");
    await performCheck();
  } catch (e) {
    console.log("Health check failed: ", e);
  }
};

export const startHealthCheck = () => {
  // fire immediately once without delay
  runSafeCheck();

  //set up a interval to run health check for every 30s
  const id = setInterval(runSafeCheck, 1000 * 30);
  return id;
};
