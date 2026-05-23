export type DeploymentStatus =
  | "queued"
  | "cloning"
  | "building"
  | "started"
  | "running"
  | "failed"
  | "stoped";

export type RuntimeType = "static" | "node" | "python" | "dockerfile";

export interface DeploymentRow {
  id: string;

  repo_url: string;
  repo_name: string | null;

  status: DeploymentStatus;
  port: number | null;
  container_name: string | null;
  image_name: string | null;

  runtime_type: RuntimeType | null;
  build_logs: string | null;
  run_logs: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface DeploymentCreate {
  repo_url: string;
}

export interface DeploymentUpdate {
  repo_name?: string | null;
  status?: DeploymentStatus;
  port?: number | null;
  container_name?: string | null;
  image_name?: string | null;
  runtime_type?: RuntimeType | null;
  build_logs?: string | null;
  run_logs?: string | null;
}

export interface DeploymentResponse {
  id: string;

  repoUrl: string;
  repoName: string | null;

  status: DeploymentStatus;
  port: number | null;
  containerName: string | null;
  imageName: string | null;

  runtimeType: RuntimeType | null;
  buildLogs: string | null;
  runLogs: string | null;

  createdAt: string;
  updatedAt: string;
}
