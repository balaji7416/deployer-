import axios from "axios";
import api from "../utils/api";
import { useState } from "react";

interface DeployResponse {
  deploymentId: string | null;
  deploy: ({
    repoUrl,
    rootDir,
    deplId,
  }: {
    repoUrl: string;
    rootDir?: string;
    deplId?: string;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
  isDeploying: boolean;
  updateIsDeploying: (state: boolean) => void;
}

export const useDeploy = (): DeployResponse => {
  const [loading, setLoading] = useState(false);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deploy = async ({
    repoUrl,
    rootDir,
    deplId,
    envVars,
  }: {
    repoUrl: string;
    rootDir?: string;
    deplId?: string;
    envVars?: Record<string, string>;
  }) => {
    try {
      setLoading(true);
      setIsDeploying(true);
      // Reset deploymentId so that even if the API returns the same ID
      // (as in redeploy), the state change null → id triggers useLogStream
      setDeploymentId(null);
      let res;
      if (deplId)
        res = await api.post(`/deployments/${deplId}/redeploy`, {
          repoUrl,
          rootDir,
          envVars,
        });
      else res = await api.post("/deployments", { repoUrl, rootDir, envVars });
      setDeploymentId(res.data.data.id); //  nested in data.data
    } catch (e) {
      console.error("Failed to deploy:", e);

      const errMsg =
        e instanceof Error ? e.message : "depoyment failed for unknown reason";
      setError(errMsg);
      setIsDeploying(false); // on error deployment stops
    } finally {
      setLoading(false);
    }
  };

  const updateIsDeploying = (state: boolean) => {
    setIsDeploying(state);
  };

  return {
    deploymentId,
    deploy,
    loading,
    error,
    updateIsDeploying,
    isDeploying,
  };
};

export const useRedeploy = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reDeploy = async (deploymentId: string) => {
    try {
      setError(null);
      setIsDeploying(true);
      await api.post(`/deployments/${deploymentId}/redeploy`);
    } catch (e) {
      console.error("Failed to deploy:", e);
      const errMsg =
        e instanceof Error ? e.message : "depoyment failed for unknown reason";
      setError(errMsg);
      setIsDeploying(false); // on error deployment stops
    }
  };

  return {
    reDeploy,
    isDeploying,
    error,
  };
};

export const useDeleteDeployment = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDeployment = async (deploymentId: string): Promise<void> => {
    try {
      setDeleting(true);
      setError(null);
      await api.delete(`/deployments/${deploymentId}`);
    } catch (e: unknown) {
      console.error("Failed to delete deployment: ", e);
      let errMsg: string = "";
      if (axios.isAxiosError(e) && e.response) {
        errMsg = e.response.data.message;
      }
      errMsg = errMsg || (e instanceof Error ? e.message : "unknown error");
      setError(errMsg);
    } finally {
      setDeleting(false);
    }
  };

  return {
    deleteDeployment,
    deleting,
    error,
  };
};
