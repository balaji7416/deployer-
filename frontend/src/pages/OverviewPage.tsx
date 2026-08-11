import { useAuth } from "@/context/auth/useAuth";
import { useDeployments } from "@/hooks/useDeployments";
import DeploymentCard from "@/components/deployment/DeploymentCard";
import EmptyState from "@/components/shared/EmptyState";
import ErrorBanner from "@/components/shared/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export function OverviewPage() {
  const { user } = useAuth();
  const { deployments, loading, error } = useDeployments();

  const navigate = useNavigate();

  const totalCnt = deployments.length;
  const runningCnt = deployments.filter((d) => d.status === "running").length;
  const failedCnt = deployments.filter((d) => d.status === "failed").length;
  const stoppedCnt = deployments.filter((d) => d.status === "stopped").length;

  const recentDeployments = deployments.slice(0, 6);
  const deploymentMetrics = [
    {
      label: "TOTAL",
      value: totalCnt,
      icon: Layers,
      color: "blue",
    },
    {
      label: "RUNNING",
      value: runningCnt,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "FAILED",
      value: failedCnt,
      icon: XCircle,
      color: "red",
    },
    {
      label: "STOPPED",
      value: stoppedCnt,
      icon: AlertCircle,
      color: "amber",
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800/80 border border-neutral-800 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
            Welcome back, {user?.username || "Developer"} 👋
          </h1>
          <p className="text-xs text-neutral-400">
            Overview of your deployment metrics and current application status.
          </p>
        </div>

        <Button
          onClick={() => navigate("/deploy")}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-900/20 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} className="mr-1.5" />
          Deploy Project
        </Button>
      </div>

      {/* Error state */}
      {error && <ErrorBanner message={error} />}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {deploymentMetrics.map((metric, _) => (
          <div
            className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-3.5"
            key={_}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-${metric.color}-400 border border-blue-500/20 shrink-0`}
            >
              <metric.icon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {metric.label}
              </p>
              <p
                className={`text-xl font-bold font-mono text-${metric.color}-400`}
              >
                {loading ? "..." : metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Deployments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-200">
            Recent Deployments
          </h2>
          {deployments.length > 0 && (
            <Link
              to="/deployments"
              className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              <span>View all ({totalCnt})</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-xl bg-neutral-900/60 border border-neutral-800 animate-pulse p-4 flex flex-col justify-between"
              />
            ))}
          </div>
        )}

        {!loading && recentDeployments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDeployments.map((depl) => (
              <DeploymentCard key={depl.id} depl={depl} />
            ))}
          </div>
        )}

        {!loading && deployments.length === 0 && !error && (
          <EmptyState
            title="No deployments created yet"
            description="Deploy your static apps, Node.js services, or Docker repositories in seconds."
            actionLabel="Create First Deployment"
            actionPath="/deploy"
          />
        )}
      </div>
    </div>
  );
}

export default OverviewPage;
