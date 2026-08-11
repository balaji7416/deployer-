import type { DeploymentStatus } from "./types";

export interface StatusConfig {
  label: string;
  variant: "default" | "success" | "destructive" | "warning" | "info" | "secondary";
  badgeClass: string;
  dotClass: string;
  isTransient?: boolean;
}

export const STATUS_CONFIG: Record<DeploymentStatus, StatusConfig> = {
  queued: {
    label: "Queued",
    variant: "secondary",
    badgeClass: "bg-neutral-800 text-neutral-400 border-neutral-700",
    dotClass: "bg-neutral-500",
  },
  cloning: {
    label: "Cloning",
    variant: "info",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-400 animate-pulse",
    isTransient: true,
  },
  building: {
    label: "Building",
    variant: "info",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-400 animate-pulse",
    isTransient: true,
  },
  starting: {
    label: "Starting",
    variant: "info",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    dotClass: "bg-cyan-400 animate-pulse",
    isTransient: true,
  },
  running: {
    label: "Running",
    variant: "success",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-400",
  },
  failed: {
    label: "Failed",
    variant: "destructive",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-400",
  },
  stopped: {
    label: "Stopped",
    variant: "warning",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-400",
  },
  restarting: {
    label: "Restarting",
    variant: "info",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-400 animate-pulse",
    isTransient: true,
  },
};
