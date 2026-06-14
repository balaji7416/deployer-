import { useState, useEffect } from "react";
import api from "../utils/api";

export function useDeployments() {
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    const fetchDeployments = async () => {
      const res = await api.get("/deployments");
      setDeployments(res.data.data);
    };

    fetchDeployments();
  }, []);

  return { deployments };
}
