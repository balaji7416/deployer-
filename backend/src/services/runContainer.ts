import { runCommand } from "../utils/runCommand.js";
import { RunResult } from "../types/deployment.js";

export const runContainer = async (
  deploymentId: string,
): Promise<RunResult> => {
  const containerName = `container-${deploymentId}`;
  const imageName = `deployer-${deploymentId}`;
  const result = await runCommand(
    "docker",
    [
      "run",
      "-d",
      "--network",
      "deploy-net",
      "--name",
      containerName,
      imageName,
    ],
    {
      stage: "run",
      deploymentId,
    },
  );
  console.log("Run container result: ", result);
  return {
    containerName,
    result,
  };
};
