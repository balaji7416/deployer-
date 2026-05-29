import { runCommand } from "../utils/runCommand.js";
import { RunResult } from "../types/deployment.js";

export const runContainer = async (
  deploymentId: string,
  deploymentPath: string,
  hostPort: number,
  containerPort: number,
): Promise<RunResult> => {
  const containerName = `container-${deploymentId}`;
  const imageName = `deployer-${deploymentId}`;
  const result = await runCommand(
    "docker",
    [
      "run",
      "-d",
      "-p",
      `${hostPort}:${containerPort}`,
      "--name",
      containerName,
      imageName,
    ],
    deploymentPath,
  );
  console.log("Run container result: ", result);
  return {
    containerName,
    result,
  };
};
