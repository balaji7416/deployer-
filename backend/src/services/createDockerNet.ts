import { runCommand } from "../utils/runCommand.js";

export const createDockerNet = async () => {
  try {
    await runCommand("docker", ["network", "inspect", "deploy-net"], {
      silent: true,
    });
    console.log("docker network already exists, skipping network creation...");
  } catch (e) {
    console.log("docker network not found, creating network...");
    await runCommand("docker", ["network", "create", "deploy-net"]);
  } finally {
    console.log("--- network exists ---");
  }
};
