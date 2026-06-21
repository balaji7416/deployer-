import api from "../utils/api";
import { useState } from "react";

interface DeployResponse {
  deploymentId: string | null;
  deploy: (repoUrl: string, deplId?: string) => Promise<void>;
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

  const deploy = async (repoUrl: string, deplId?: string) => {
    try {
      setLoading(true);
      setIsDeploying(true);
      // Reset deploymentId so that even if the API returns the same ID
      // (as in redeploy), the state change null → id triggers useLogStream
      setDeploymentId(null);
      let res;
      if (deplId) res = await api.post(`/deployments/${deplId}/redeploy`);
      else res = await api.post("/deployments", { repoUrl });
      setDeploymentId(res.data.data.deploymentId); //  nested in data.data
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
