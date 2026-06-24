import { useState, useRef } from "react";
import { useAuth } from "@/context/auth/useAuth";
import { useDeployments } from "@/hooks/useDeployment";
import DeploymentCard from "@/components/DeploymentCard";

function Dashboard() {
  const { user } = useAuth();
  const { deployments } = useDeployments();

  const totalDeployments = deployments.length;
  const runningcnt = deployments.filter(
    (depl) => depl.status === "running",
  ).length;
  const failedcnt = deployments.filter(
    (depl) => depl.status === "failed",
  ).length;

  return (
    <div className="flex flex-col p-5 gap-1 h-full">
      <div className="flex-1 bg-neutral-800 w-full p-3 rounded-md border border-gray-600">
        <h1 className="text-2xl font-bold text-center">
          Hello {user?.username}
        </h1>
      </div>

      {/*deployment stats*/}
      <div className="flex-1 p-3 rounded-md">
        <div className="flex flex-col p-3 gap-2 bg-neutral-800 rounded-md max-w-md text-neutral-400">
          <h1 className="text-lg md:text-xl text-neutral-400 font-semibold mt-4">
            Deployment Stats
          </h1>
          <div className="flex flex-col gap-2 p-3">
            <h1 className="font-semibold">
              Total Deployments: {totalDeployments}
            </h1>
            <h1>Running: {runningcnt}</h1>
            <h1>Failed: {failedcnt}</h1>
          </div>
        </div>
      </div>

      {/*Recent Deployments*/}
      <div className="flex-1 bg-neutral-800 w-full p-3 rounded-md border border-gray-600">
        <h1 className="text-lg md:text-xl text-neutral-400 font-semibold mt-4">
          Recent Deployments
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {deployments.slice(0, 3).map((depl) => (
            <DeploymentCard depl={depl} key={depl.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
