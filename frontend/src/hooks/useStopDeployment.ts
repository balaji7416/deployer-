import { useState } from "react";
import api from "@/utils/api";
import axios from "axios";

export function useStopDeployment() {
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopDeployment = async (id: string): Promise<boolean> => {
    try {
      setStopping(true);
      setError(null);
      await api.post(`/deployments/${id}/stop`);
      return true;
    } catch (e: unknown) {
      console.error("Failed to stop deployment: ", e);
      let errMsg = "";
      if (axios.isAxiosError(e) && e.response) {
        errMsg = e.response.data.message;
      }
      errMsg = errMsg || (e instanceof Error ? e.message : "Failed to stop deployment");
      setError(errMsg);
      return false;
    } finally {
      setStopping(false);
    }
  };

  return { stopDeployment, stopping, error };
}

export default useStopDeployment;
