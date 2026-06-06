import { promises } from "node:dns";
import { runCommand } from "../../utils/runCommand.js";

export const reloadNginx = async (): Promise<void> => {
  //test config syntax
  await runCommand("docker", ["exec", "deployer-nginx", "nginx", "-t"]);

  //reload
  await runCommand("docker", [
    "exec",
    "deployer-nginx",
    "nginx",
    "-s",
    "reload",
  ]);
};
