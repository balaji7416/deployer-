import { DeploymentResponse, DeploymentRow } from "../types/deployment.js";

export const toDeploymentResponse = (
  deployment: DeploymentRow,
): DeploymentResponse => {
  return {
    id: deployment.id,
    repoUrl: deployment.repo_url,
    repoName: deployment.repo_name,
    status: deployment.status,
    port: deployment.port,
    containerName: deployment.container_name,
    imageName: deployment.image_name,
    runtimeType: deployment.runtime_type,
    buildLogs: deployment.build_logs,
    runLogs: deployment.run_logs,
    errorMessage: deployment.error_message,
    createdAt: deployment.created_at.toISOString(),
    updatedAt: deployment.updated_at.toISOString(),
  };
};
