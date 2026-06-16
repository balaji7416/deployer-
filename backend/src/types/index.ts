export type DeploymentStatus =
  | "queued"
  | "cloning"
  | "building"
  | "starting"
  | "running"
  | "failed"
  | "stopped";

export type RuntimeType =
  | "static"
  | "node"
  | "python"
  | "dockerfile"
  | "spa"
  | "unknown";

export interface DeploymentRow {
  id: string;
  user_id: string;

  repo_url: string;
  repo_name: string | null;

  status: DeploymentStatus;
  route: string | null;
  container_name: string | null;
  image_name: string | null;

  runtime_type: RuntimeType | null;
  build_logs: string | null;
  run_logs: string | null;
  error_message: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface DeploymentCreate {
  user_id: string;
  repo_url: string;
  repo_name: string;
}

export interface DeploymentUpdate {
  repo_name?: string | null;
  status?: DeploymentStatus;
  //port?: number | null;
  route?: string | null;
  container_name?: string | null;
  image_name?: string | null;
  runtime_type?: RuntimeType | null;
  build_logs?: string | null;
  run_logs?: string | null;
  error_message?: string | null;
}

export interface DeploymentResponse {
  id: string;
  userId: string;

  repoUrl: string;
  repoName: string | null;

  status: DeploymentStatus;
  // port: number | null;
  route: string | null;
  containerName: string | null;
  imageName: string | null;

  runtimeType: RuntimeType | null;
  buildLogs: string | null;
  runLogs: string | null;
  errorMessage: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface RuntimeInfo {
  type: RuntimeType;
  startCommand?: string;
  installCommand?: string;
  buildCommand?: string;
  outputDir?: string;
  baseImage?: string;
  exposedPort: number; //container port
}

export interface CloneResult {
  deploymentPath: string;
}

export interface BuildResult {
  imageName: string;
  result: string;
}

export interface RunResult {
  containerName: string;
  result: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}
