import LogTerminal from "@/components/LogTerminal";
import { useParams, useNavigate } from "react-router-dom";
import { useDeployments } from "@/hooks/useDeployment";
import type { DeploymentResponse } from "@/lib/types";
import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";
import clsx from "clsx";
import { useDeleteDeployment } from "@/hooks/useDeploy";

function Deployment() {
  const { id } = useParams() as { id: string };
  const { fetchDeployment } = useDeployments();
  const [deployment, setDeployment] = useState<DeploymentResponse | null>(null);

  const { deleteDeployment, deleting } = useDeleteDeployment();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepl = async () => {
      const depl = await fetchDeployment(id);
      setDeployment(depl);
    };
    fetchDepl();
  }, [id, fetchDeployment]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDeployment(id);
      navigate("/deployments");
      alert("Deployment deleted successfully");
    } catch (e) {
      alert("Failed to delete deployment ");
      console.error(e);
    }
  };

  if (!deployment) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-neutral-400">Loading deployment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neutral-900">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4 bg-neutral-800 border-b border-neutral-700">
        <h1 className="text-2xl font-bold text-neutral-200">
          {deployment.repoName}
        </h1>

        <span
          className={clsx(
            "px-3 py-1 rounded-full text-sm font-medium",
            deployment.status === "running" && "bg-green-500/20 text-green-400",
            deployment.status === "failed" && "bg-red-500/20 text-red-400",
            deployment.status === "stopped" &&
              "bg-yellow-500/20 text-yellow-400",
          )}
        >
          {deployment.status}
        </span>
      </div>
      {/*Actions Grid*/}
      <div className="shrink-0 flex items-center justify-evenly gap-2 md:gap-5 bg-neutral-900 border-b border-neutral-700 p-4">
        <button
          className={clsx(
            "flex-1 bg-green-600/30 text-green-400 text-xs md:text-sm",
            "px-3 py-2 rounded-md",
            "hover:bg-green-600/50 active:scale-[0.98]",
          )}
          onClick={() => {
            navigate("/deploy", {
              state: {
                repoUrl: deployment?.repoUrl,
                isRedeploy: true,
                id: deployment?.id,
              },
            });
          }}
        >
          Re deploy
        </button>
        <button
          className={clsx(
            "flex-1 bg-amber-600/30 text-red-500 text-xs md:text-sm",
            "px-3 py-2 rounded-md",
            "hover:bg-amber-600/50 active:scale-[0.98]",
            deleting && "bg-amber-600/60 text-amber-600",
          )}
          disabled={deleting}
          onClick={() => handleDelete(deployment.id)}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
      {/* Info Grid */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-900 border-b border-neutral-700">
        <div className="bg-neutral-800 p-3 rounded-lg">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">
            Repository
          </p>
          <a
            href={deployment.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 truncate block"
          >
            {deployment.repoUrl}
          </a>
        </div>

        <div className="bg-neutral-800 p-3 rounded-lg">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">
            Route
          </p>
          <a
            href={`http://localhost/${deployment.route}/`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 truncate block"
          >
            {deployment.route}
          </a>
        </div>

        <div className="bg-neutral-800 p-3 rounded-lg">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">
            Runtime
          </p>
          <p className="text-sm text-neutral-200">{deployment.runtimeType}</p>
        </div>

        <div className="bg-neutral-800 p-3 rounded-lg">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">
            Deployed
          </p>
          <p className="text-sm text-neutral-200">
            {formatTime(deployment.createdAt)}
          </p>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 min-h-0 p-4">
        <LogTerminal
          logs={deployment?.logs?.split("\n") || []}
          done={deployment.status !== "running"}
        />
      </div>
    </div>
  );
}

export default Deployment;
