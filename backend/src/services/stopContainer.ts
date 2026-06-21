import { runCommand } from "../utils/runCommand.js";

export const stopContainer = async (deploymentId: string): Promise<string> => {
  const containerName = `container-${deploymentId}`;
  let result = "";
  try {
    result = await runCommand("docker", ["rm", "-f", containerName]);
  } catch (e) {
    console.log("Error stopping container: ", e);
  }
  return result;
};
