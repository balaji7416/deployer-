import api from "../utils/api";
import { useState } from "react";

interface DeployResponse {
  deploymentId: string | null;
  deploy: (repoUrl: string) => Promise<void>;
  loading: boolean;
}

export const useDeploy = (): DeployResponse => {
  const [loading, setLoading] = useState(false);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);

  const deploy = async (repoUrl: string) => {
    setLoading(true);
    try {
      const res = await api.post("/deployments", { repoUrl });
      setDeploymentId(res.data.data.deploymentId); //  nested in data.data
    } catch (e) {
      console.error("Failed to deploy:", e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { deploymentId, deploy, loading };
};
