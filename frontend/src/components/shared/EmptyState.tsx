import type { LucideIcon } from "lucide-react";
import { FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export function EmptyState({
  title = "No deployments found",
  description = "Get started by deploying your first repository.",
  actionLabel = "New Deployment",
  actionPath = "/deploy",
  onAction,
  icon: Icon = FolderGit2,
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 my-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-400 mb-4 border border-neutral-700/50">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-neutral-200 mb-1">{title}</h3>
      <p className="text-sm text-neutral-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <Button
          onClick={handleAction}
          className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
