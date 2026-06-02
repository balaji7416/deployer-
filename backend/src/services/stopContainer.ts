import { runCommand } from "../utils/runCommand.js";

export const stopContainer = async (deploymentId: string): Promise<string> => {
  const containerName = `container-${deploymentId}`;
  const result = await runCommand("docker", ["stop", containerName]);
  await runCommand("docker", ["rm", containerName]);
  return result;
};
