import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDeployments } from "@/hooks/useDeployments";
import { useDeploy, useDeleteDeployment } from "@/hooks/useDeploy";
import useStopDeployment from "@/hooks/useStopDeployment";
import useLogStream from "@/hooks/useLogStream";
import type { DeploymentResponse } from "@/lib/types";
import { formatTime, getDeploymentUrl } from "@/lib/utils";
import DeploymentStatusBadge from "@/components/deployment/DeploymentStatusBadge";
import LogTerminal from "@/components/LogTerminal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ErrorBanner from "@/components/shared/ErrorBanner";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  GitBranch,
  RefreshCw,
  Square,
  Trash2,
  ArrowLeft,
  Calendar,
  Terminal as TerminalIcon,
  Folder,
} from "lucide-react";

export function DeploymentDetailPage() {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();

  const { fetchDeployment } = useDeployments();
  const { deploy, loading: deployLoading } = useDeploy();
  const { deleteDeployment, deleting } = useDeleteDeployment();
  const { stopDeployment, stopping } = useStopDeployment();

  const [deployment, setDeployment] = useState<DeploymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDeployment(id);
      setDeployment(data);
      if (
        data.status === "cloning" ||
        data.status === "building" ||
        data.status === "starting" ||
        data.status === "restarting"
      ) {
        setActiveStreamId(id);
      }
    } catch (e: unknown) {
      setError("Failed to load deployment details.");
      console.error("Failed to load deployment details: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const {
    logs: liveLogs,
    done: liveDone,
    failed: liveFailed,
  } = useLogStream(activeStreamId);

  // When live stream finishes, refresh deployment status
  useEffect(() => {
    if (liveDone && activeStreamId) {
      fetchDeployment(id).then((updated) => {
        if (updated) setDeployment(updated);
      });
    }
  }, [liveDone, activeStreamId, fetchDeployment, id]);

  const handleRedeploy = async () => {
    if (!deployment) return;
    try {
      setActiveStreamId(id);
      await deploy({
        repoUrl: deployment.repoUrl,
        rootDir: deployment.rootDir || undefined,
        deplId: deployment.id,
      });
      // Refresh status after queue
      const updated = await fetchDeployment(id);
      if (updated) setDeployment(updated);
    } catch (e) {
      console.error("Redeploy error:", e);
    }
  };

  const handleStop = async () => {
    if (!deployment) return;
    const success = await stopDeployment(deployment.id);
    if (success) {
      setShowStopDialog(false);
      const updated = await fetchDeployment(id);
      if (updated) setDeployment(updated);
    }
  };

  const handleDelete = async () => {
    if (!deployment) return;
    try {
      await deleteDeployment(deployment.id);
      setShowDeleteDialog(false);
      navigate("/deployments");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-500" />
          <p className="text-xs font-mono">Loading deployment details...</p>
        </div>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/deployments")}
          className="border-neutral-800 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Back to Deployments
        </Button>
        <ErrorBanner
          message={error || "Deployment not found"}
          onRetry={loadData}
        />
      </div>
    );
  }

  const liveUrl = getDeploymentUrl(deployment.route);
  const staticLogs = deployment.logs ? deployment.logs.split("\n") : [];
  const displayLogs =
    activeStreamId && liveLogs.length > 0 ? liveLogs : staticLogs;

  return (
    <div className="space-y-6 pb-8">
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/deployments")}
          className="border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 cursor-pointer"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Deployments
        </Button>

        <DeploymentStatusBadge status={deployment.status} />
      </div>

      {/* Main Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-100 truncate">
              {deployment.repoName || "Untitled Project"}
            </h1>
          </div>

          {liveUrl && deployment.status === "running" ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline"
            >
              <span>{liveUrl}</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <p className="text-xs font-mono text-neutral-400 truncate">
              {deployment.repoUrl}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {liveUrl && deployment.status === "running" && (
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
            >
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} className="mr-1.5" />
                Visit Application
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRedeploy}
            disabled={deployLoading || !!activeStreamId}
            className="border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 text-xs cursor-pointer"
          >
            <RefreshCw
              size={14}
              className={`mr-1.5 ${deployLoading ? "animate-spin" : ""}`}
            />
            {deployLoading ? "Queuing..." : "Redeploy"}
          </Button>

          {deployment.status === "running" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStopDialog(true)}
              disabled={stopping}
              className="border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs cursor-pointer"
            >
              <Square size={14} className="mr-1.5" />
              Stop
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs cursor-pointer"
          >
            <Trash2 size={14} className="mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Metadata Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <p className="text-[10px] font-semibold uppercase text-neutral-400 mb-1 flex items-center gap-1">
            <GitBranch size={12} /> Repository
          </p>
          <a
            href={deployment.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-blue-400 hover:underline truncate block"
          >
            {deployment.repoName || "GitHub Repo"}
          </a>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <p className="text-[10px] font-semibold uppercase text-neutral-400 mb-1 flex items-center gap-1">
            <TerminalIcon size={12} /> Runtime
          </p>
          <p className="text-xs font-mono text-neutral-200 capitalize">
            {deployment.runtimeType || "Detected"}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <p className="text-[10px] font-semibold uppercase text-neutral-400 mb-1 flex items-center gap-1">
            <Folder size={12} /> Root Dir
          </p>
          <p className="text-xs font-mono text-neutral-200">
            {deployment.rootDir || "/"}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <p className="text-[10px] font-semibold uppercase text-neutral-400 mb-1 flex items-center gap-1">
            <Calendar size={12} /> Deployed
          </p>
          <p className="text-xs text-neutral-200">
            {formatTime(deployment.createdAt)}
          </p>
        </div>
      </div>

      {/* Terminal Log Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            <TerminalIcon size={16} className="text-neutral-400" />
            <span>Build & Runtime Logs</span>
            {activeStreamId && (
              <span className="text-xs text-blue-400 animate-pulse font-normal">
                ● Live Streaming
              </span>
            )}
          </h2>

          <span className="text-xs text-neutral-400 font-mono">
            {displayLogs.length} lines
          </span>
        </div>

        <div className="h-[480px] rounded-xl overflow-hidden border border-neutral-800 shadow-xl">
          <LogTerminal
            logs={displayLogs}
            done={
              !activeStreamId || liveDone || deployment.status === "running"
            }
            failed={deployment.status === "failed" || liveFailed}
          />
        </div>
      </div>

      {/* Confirm Stop Modal */}
      <ConfirmDialog
        isOpen={showStopDialog}
        onClose={() => setShowStopDialog(false)}
        onConfirm={handleStop}
        title="Stop Deployment"
        description="Are you sure you want to stop this container? The application route will be offline until redeployed."
        confirmText="Stop Deployment"
        isDestructive={false}
        isLoading={stopping}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Deployment"
        description="Are you sure you want to delete this deployment? This action cannot be undone and will permanently stop and delete container assets."
        confirmText="Delete Deployment"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
}

export default DeploymentDetailPage;
