export type DeploymentStatus =
  | "queued"
  | "cloning"
  | "building"
  | "starting"
  | "running"
  | "failed"
  | "stopped"
  | "restarting";

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
  logs: string | null;
  error_message: string | null;

  root_dir: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface DeploymentCreate {
  user_id: string;
  repo_url: string;
  repo_name: string;
  root_dir?: string;
}

export interface DeploymentUpdate {
  repo_name?: string | null;
  status?: DeploymentStatus;
  //port?: number | null;
  route?: string | null;
  container_name?: string | null;
  image_name?: string | null;
  runtime_type?: RuntimeType | null;
  logs?: string | null;
  error_message?: string | null;
  root_dir?: string | null;
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
  logs: string | null;
  errorMessage: string | null;

  rootDir: string | null;

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
  projectRootDir: string;
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

export interface EnvVarRow {
  id: string;
  deployment_id: string;
  key: string;
  value: string;
  created_at: Date;
  updated_at: Date;
}
