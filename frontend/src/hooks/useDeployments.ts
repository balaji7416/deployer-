import { useState, useEffect } from "react";
import api from "../utils/api";
import type { DeploymentResponse } from "@/lib/types";

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
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch deployments";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, []);

  return { deployments, loading, error };
}
