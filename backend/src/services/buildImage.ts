import { runCommand } from "../utils/runCommand.js";
import { BuildResult } from "../types/deployment.js";
export const buildImage = async (
  deploymentId: string,
  deploymentPath: string,
): Promise<BuildResult> => {
  const imageName = `deployer-${deploymentId}`;
  const result = await runCommand("docker", ["build", "-t", imageName, "."], {
    cwd: deploymentPath,
    stage: "build",
    deploymentId,
  });
  console.log("build result: ", result);
  return {
    imageName,
    result,
  };
};
