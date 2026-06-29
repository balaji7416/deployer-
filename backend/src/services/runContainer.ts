import { runCommand } from "../utils/runCommand.js";
import { RunResult } from "../types/index.js";

export const runContainer = async (
  deploymentId: string,
  envVars: Record<string, string>,
): Promise<RunResult> => {
  try {
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
        ...Object.entries(envVars).flatMap(([key, value]) => [
          "-e",
          `${key}=${value}`,
        ]),
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
  } catch (e) {
    console.log(
      "error in running container for deployment- ",
      deploymentId,
      ": ",
      e,
    );
    throw e;
  }
};
