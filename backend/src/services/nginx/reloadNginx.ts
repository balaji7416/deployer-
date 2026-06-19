import { promises } from "node:dns";
import { runCommand } from "../../utils/runCommand.js";

export const reloadNginx = async (route: string | null): Promise<void> => {
  //wait until the bind mount propagates the written file to the container
  if (route !== null)
    for (let i = 0; i < 5; i++) {
      try {
        await runCommand("docker", [
          "exec",
          "deployer-nginx",
          "test",
          "-f",
          `/etc/nginx/conf.d/${route}.conf`,
        ]);
        console.log("ngix config present in container, reloading...");
        break;
      } catch (e) {
        console.log("nginx config not present in container, retrying...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

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
