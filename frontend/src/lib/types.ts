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

export interface DeploymentResponse {
  id: string;

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

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  token: string;
}
