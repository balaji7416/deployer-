import { run } from "node:test";
import { runCommand } from "../../utils/runCommand.js";

export const startNginx = async () => {
  const nginxRunning = await runCommand(
    "docker",
    ["ps", "--filter", "name=deployer-nginx", "--format", "{{.Names}}"],
    { silent: true },
  );

  if (!nginxRunning.trim()) {
    console.log("nginx not running, starting nginx...");
    await runCommand("docker", [
      "run",
      "-d",
      "--name",
      "deployer-nginx",
      "--network",
      "deploy-net",
      "-p",
      "80:80",
      "-v",
      `${process.cwd()}/nginx/conf.d:etc/nginx/conf.d`,
      "nginx-alpine",
    ]);
  }
  console.log("---- nginx running ----");
};
