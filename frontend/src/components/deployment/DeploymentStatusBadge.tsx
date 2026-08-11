import type { DeploymentStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DeploymentStatusBadgeProps {
  status: DeploymentStatus;
  className?: string;
  showDot?: boolean;
}

export function DeploymentStatusBadge({
  status,
  className,
  showDot = true,
}: DeploymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    badgeClass: "bg-neutral-800 text-neutral-400 border-neutral-700",
    dotClass: "bg-neutral-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        config.badgeClass,
        className,
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export default DeploymentStatusBadge;
