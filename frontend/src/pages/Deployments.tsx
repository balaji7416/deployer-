import { useDeployments } from "@/hooks/useDeployment";
import { Card } from "@/components/ui/card";
import clsx from "clsx";
import type { DeploymentResponse } from "@/lib/types";
import DeploymentCard from "@/components/DeploymentCard";
function Deployments() {
  const {
    deployments,
    loading,
    error,
  }: {
    deployments: DeploymentResponse[];
    loading: boolean;
    error: string | null;
  } = useDeployments();

  if (!loading && deployments.length === 0)
    return (
      <div className="flex items-center justify-center h-full">
        <p
          className={clsx(
            "bg-neutral-700 shadow-md p-4 md:text-xl rounded-md w-1/2",
            "flex items-center justify-center",
            error ? "text-red-500" : "text-neutral-200",
          )}
        >
          {error ? error : "No deployments"}
        </p>
      </div>
    );
  return (
    <div
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3",
        "text-neutral-200 mx-auto h-screen overflow-auto p-4",
      )}
    >
      {loading &&
        Array.from({ length: 5 }).map((_, i) => (
          <Card
            className={clsx(
              "h-75 bg-neutral-900 border border-neutral-700 shadow-neutral-600 shadow-sm",
              "flex flex-col p-1",
              "animate-pulse bg-neutral-700",
              "text-neutral-200 hover:scale-[1.01]",
            )}
            key={i}
          ></Card>
        ))}
      {!loading &&
        deployments &&
        deployments.map((depl) => {
          return <DeploymentCard depl={depl} key={depl.id} />;
        })}
    </div>
  );
}

export default Deployments;
