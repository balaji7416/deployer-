import { useState, useEffect } from "react";

function useLogStream(deploymentId: string | null): {
  logs: string[];
  done: boolean;
  failed: boolean;
} {
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!deploymentId) return;

    setDone(false);

    const connectionURL = `/api/deployments/${deploymentId}/logs/stream`;
    const es = new EventSource(connectionURL);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setLogs((prev) => [...prev, data.message]);
      if (data.stage === "complete" || data.stage === "failed") {
        setDone(true);
        setFailed(data.stage === "failed");
        es.close();
      }
    };

    return () => es.close();
  }, [deploymentId]);

  return { logs, done, failed };
}

export default useLogStream;
