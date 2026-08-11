import { formatTime, getDeploymentUrl } from "@/lib/utils";
import type { DeploymentResponse } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import DeploymentStatusBadge from "./DeploymentStatusBadge";
import { ExternalLink, GitBranch, Terminal, Calendar } from "lucide-react";

interface DeploymentCardProps {
  depl: DeploymentResponse;
}

export function DeploymentCard({ depl }: DeploymentCardProps) {
  const navigate = useNavigate();
  const url = getDeploymentUrl(depl.route);

  return (
    <div
      onClick={() => navigate(`/deployments/${depl.id}`)}
      className="group relative flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900/90 hover:shadow-lg hover:shadow-black/40 cursor-pointer overflow-hidden"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700/50 text-neutral-300 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
              <GitBranch size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-neutral-100 truncate group-hover:text-blue-400 transition-colors">
                {depl.repoName || "Untitled Project"}
              </h3>
              <p className="text-[11px] font-mono text-neutral-400 truncate max-w-[200px]">
                {depl.repoUrl}
              </p>
            </div>
          </div>

          <DeploymentStatusBadge status={depl.status} />
        </div>

        {/* Info pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {depl.runtimeType && (
            <span className="inline-flex items-center gap-1 rounded-md bg-neutral-800/80 px-2 py-1 text-[11px] font-mono text-neutral-300 border border-neutral-800">
              <Terminal size={12} className="text-neutral-400" />
              {depl.runtimeType}
            </span>
          )}

          {depl.rootDir && depl.rootDir !== "/" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-neutral-800/50 px-2 py-1 text-[11px] font-mono text-neutral-400">
              root: {depl.rootDir}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Calendar size={12} />
          <span>{formatTime(depl.createdAt)}</span>
        </div>

        {depl.status === "running" && url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:underline"
          >
            <span>Visit App</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-[11px] font-mono text-neutral-400 group-hover:text-neutral-300">
            View logs &rarr;
          </span>
        )}
      </div>
    </div>
  );
}

export default DeploymentCard;
