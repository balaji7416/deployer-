import { useAuth } from "@/context/auth/useAuth";
import { useDeployments } from "@/hooks/useDeployment";
import DeploymentCard from "@/components/DeploymentCard";
import clsx from "clsx";

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
  const stoppedcnt = deployments.filter(
    (depl) => depl.status === "stopped",
  ).length;
  return (
    <div className="flex flex-col p-5 gap-1 h-full">
      <div
        className={clsx(
          "flex items-center justify-center p-3 gap-2 rounded-xl",
          "bg-neutral-800/50 backdrop-blur-sm",
          "border border-blue-500/20",
          "shadow-[0_0_30px_rgba(59,130,246,0.05)]",
          "shadow-[inset_0_0_30px_rgba(59,130,246,0.02)]",
        )}
      >
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          Hello {user?.username} 👋
        </h1>
      </div>

      {/*deployment stats*/}
      <div className="flex-1 p-3 rounded-md">
        <div
          className={clsx(
            "flex flex-col p-3 gap-2 rounded-xl max-w-md",
            "bg-neutral-800/50 backdrop-blur-sm",
            "border border-blue-500/20",
            "shadow-[0_0_30px_rgba(59,130,246,0.05)]",
            "shadow-[inset_0_0_30px_rgba(59,130,246,0.02)]",
          )}
        >
          <h1 className="text-lg md:text-xl font-mono text-neutral-400 font-semibold mt-4 p-3">
            Deployment Stats
          </h1>
          <div className="flex flex-col gap-2 p-3">
            <h1 className="font-semibold text-blue-300">
              Total Deployments:{" "}
              <span className="font-mono text-neutral-300">
                {totalDeployments}
              </span>
            </h1>
            <h1 className="font-semibold text-green-300">
              Running:{" "}
              <span className="font-mono text-neutral-300">{runningcnt}</span>
            </h1>
            <h1 className="font-semibold text-red-300">
              <span>Failed: </span>
              <span className="font-mono text-neutral-300">{failedcnt}</span>
            </h1>
            <h1 className="font-semibold text-gray-300">
              <span>Stopped: </span>
              <span className="font-mono text-neutral-300">{stoppedcnt}</span>
            </h1>
          </div>
        </div>
      </div>

      {/*Recent Deployments*/}
      <div
        className={clsx(
          "w-full flex-1 flex flex-col p-3 gap-2 rounded-xl",
          "bg-neutral-800/50 backdrop-blur-sm",
          "border border-blue-500/20",
          "shadow-[0_0_30px_rgba(59,130,246,0.05)]",
          "shadow-[inset_0_0_30px_rgba(59,130,246,0.02)]",
        )}
      >
        {deployments && deployments.length > 0 && (
          <h1 className="text-lg md:text-xl text-neutral-400 font-semibold mt-4">
            Recent Deployments
          </h1>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {deployments.slice(0, 3).map((depl) => (
            <DeploymentCard depl={depl} key={depl.id} />
          ))}
        </div>
        {deployments.length === 0 && (
          <div className="w-full h-full flex justify-center items-center text-neutral-400">
            you haven't deployed anlything yet
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
