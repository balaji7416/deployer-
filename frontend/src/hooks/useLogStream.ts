import { useState, useEffect } from "react";

function useLogStream(deploymentId: string | null): {
  logs: string[];
  done: boolean;
} {
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!deploymentId) return;

    setDone(false);

    //const connectionURL = `http://localhost:3000/api/deployments/${deploymentId}/logs/stream`; (if using from local server)
    const connectionURL = `http://localhost/api/deployments/${deploymentId}/logs/stream`;
    const es = new EventSource(
      connectionURL
    );

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setLogs((prev) => [...prev, data.message]);
      if (data.stage === "complete" || data.stage === "failed") {
        setDone(true);
        es.close();
      }
    };

    return () => es.close();
  }, [deploymentId]);

  return { logs, done };
}

export default useLogStream;
