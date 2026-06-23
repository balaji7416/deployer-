import { DeploymentResponse, DeploymentRow } from "../types/index.js";

export const toDeploymentResponse = (
  deployment: DeploymentRow,
): DeploymentResponse => {
  return {
    id: deployment.id,
    userId: deployment.user_id,
    repoUrl: deployment.repo_url,
    repoName: deployment.repo_name,
    status: deployment.status,
    // port: deployment.port,
    route: deployment.route,
    containerName: deployment.container_name,
    imageName: deployment.image_name,
    runtimeType: deployment.runtime_type,
    logs: deployment.logs,
    errorMessage: deployment.error_message,
    rootDir: deployment.root_dir,
    createdAt: deployment.created_at.toISOString(),
    updatedAt: deployment.updated_at.toISOString(),
  };
};
