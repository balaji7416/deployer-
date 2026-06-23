import { runCommand } from "../utils/runCommand.js";

export const stopContainer = async (deploymentId: string): Promise<string> => {
  const containerName = `container-${deploymentId}`;
  let result = "";
  for (let i = 0; i < 10; i++) {
    try {
      result = await runCommand("docker", ["rm", "-f", containerName]);
      break;
    } catch (e) {
      console.log("Error stopping container: ", e);
      console.log("Retrying...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return result;
};
