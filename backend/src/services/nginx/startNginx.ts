import { run } from "node:test";
import { runCommand } from "../../utils/runCommand.js";
import path from "node:path";

export const startNginx = async () => {
  const nginxRunning = await runCommand(
    "docker",
    ["ps", "--filter", "name=deployer-nginx", "--format", "{{.Names}}"],
    { silent: true },
  );

  const nginxStopped = await runCommand(
    "docker",
    ["ps", "-a", "--filter", "name=deployer-nginx", "--format", "{{.Names}}"],
    { silent: true },
  );

  if (!nginxRunning.trim() && nginxStopped.trim()) {
    console.log("nginx stopped, starting nginx...");
    await runCommand("docker", ["start", "deployer-nginx"]);
    return;
  }

  if (!nginxRunning.trim()) {
    throw new Error("deployer-nginx container not found. Please start it using docker-compose.");
  }
  console.log("---- nginx running ----");
};
