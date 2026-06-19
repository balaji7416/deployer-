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
  const confDir = path.resolve(process.cwd(), "nginx", "conf.d");
  const staticDir = path.resolve(process.cwd(), "nginx", "static");

  //console.log("confDir: ", confDir);
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
      `${confDir}:/etc/nginx/conf.d`,
      "-v",
      `${staticDir}:/usr/share/nginx/custom-pages`,
      "nginx:alpine",
    ]);
  }
  console.log("---- nginx running ----");
};
