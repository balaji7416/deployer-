import { useState } from "react";
import { useDeployments } from "@/hooks/useDeployments";
import DeploymentCard from "@/components/deployment/DeploymentCard";
import EmptyState from "@/components/shared/EmptyState";
import ErrorBanner from "@/components/shared/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Layers } from "lucide-react";

export function DeploymentsPage() {
  const { deployments, loading, error } = useDeployments();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredDeployments = deployments.filter((depl) => {
    const matchesSearch =
      (depl.repoName &&
        depl.repoName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      depl.repoUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (depl.route &&
        depl.route.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" || depl.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const statuses: { label: string; value: string }[] = [
    { label: "All", value: "all" },
    { label: "Running", value: "running" },
    { label: "Failed", value: "failed" },
    { label: "Stopped", value: "stopped" },
    { label: "Building", value: "building" },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">Deployments</h1>
          <p className="text-xs text-neutral-400">
            Manage, monitor, and configure all your active and historic
            deployments.
          </p>
        </div>

        <Button
          onClick={() => navigate("/deploy")}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} className="mr-1.5" />
          New Deployment
        </Button>
      </div>

      {/* Error state */}
      {error && <ErrorBanner message={error} />}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <Input
            placeholder="Search by repo name, URL or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 bg-neutral-800/60 border-neutral-700/60 text-xs text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-blue-500/50"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedStatus === s.value
                  ? "bg-neutral-800 text-neutral-100 border border-neutral-700 font-semibold shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deployments List Grid */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-xl bg-neutral-900/60 border border-neutral-800 animate-pulse p-4 flex flex-col justify-between"
            />
          ))}
        </div>
      )}

      {!loading && filteredDeployments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeployments.map((depl) => (
            <DeploymentCard key={depl.id} depl={depl} />
          ))}
        </div>
      )}

      {!loading && filteredDeployments.length === 0 && (
        <EmptyState
          title={
            searchQuery || selectedStatus !== "all"
              ? "No matching deployments"
              : "No deployments found"
          }
          description={
            searchQuery || selectedStatus !== "all"
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : "You haven't deployed any projects yet. Create your first deployment now."
          }
          icon={searchQuery || selectedStatus !== "all" ? Search : Layers}
          actionLabel={
            searchQuery || selectedStatus !== "all"
              ? "Clear Filters"
              : "New Deployment"
          }
          actionPath={
            searchQuery || selectedStatus !== "all" ? undefined : "/deploy"
          }
          onAction={
            searchQuery || selectedStatus !== "all"
              ? () => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

export default DeploymentsPage;
