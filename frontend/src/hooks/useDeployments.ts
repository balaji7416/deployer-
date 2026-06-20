import { useState, useEffect } from "react";
import api from "../utils/api";
import type { DeploymentResponse } from "@/lib/types";
import axios from "axios";

export function useDeployments() {
  const [loading, setLoading] = useState(false);
  const [deployments, setDeployments] = useState<DeploymentResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        setLoading(true);
        const res = await api.get("/deployments");
        setDeployments(res.data.data);
      } catch (error: unknown) {
        console.log("failed to fetch deployments: ", error);

        let errMsg;
        if (axios.isAxiosError(error) && error.response) {
          errMsg = error.response.data.message;
        }
        if (!errMsg)
          errMsg =
            error instanceof Error
              ? error.message
              : "Failed to fetch deployments";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, []);

  const fetchDeployment = async (
    deploymentId: string,
  ): Promise<DeploymentResponse> => {
    const res = await api.get(`/deployments/${deploymentId}`);
    return res.data.data;
  };

  return { deployments, loading, error, fetchDeployment };
}
