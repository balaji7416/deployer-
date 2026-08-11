import { useEffect, useState } from "react";
import DeployForm from "../components/deployment/DeployForm";
import LogTerminal from "../components/LogTerminal";
import { useDeploy } from "../hooks/useDeploy";
import useLogStream from "../hooks/useLogStream";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, Terminal } from "lucide-react";

function DeployPage() {
  const navigate = useNavigate();
  const [showTerminal, setShowTerminal] = useState(false);
  const [isDeployingLocal, setIsDeployingLocal] = useState(false);

  const { deploy, deploymentId, loading, isDeploying, updateIsDeploying } =
    useDeploy();

  const { logs, done, failed } = useLogStream(deploymentId);
  const location = useLocation();

  useEffect(() => {
    if (done && !loading) {
      updateIsDeploying(false);
      setIsDeployingLocal(false);
      setTimeout(() => {
        if (deploymentId) {
          navigate(`/deployments/${deploymentId}`);
        } else {
          navigate("/deployments");
        }
      }, 1800);
    }
  }, [done, loading, deploymentId, updateIsDeploying, navigate]);

  // Auto-show terminal when deployment starts
  useEffect(() => {
    if (isDeploying || loading) {
      setShowTerminal(true);
      setIsDeployingLocal(true);
    }
  }, [isDeploying, loading]);

  return (
    <div className="space-y-6 pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-100">
            Deploy Your Project
          </h1>
          <p className="text-xs text-neutral-400">
            Import a public GitHub repository to build and deploy your service.
          </p>
        </div>

        <DeployForm
          onDeploy={deploy}
          loading={loading}
          isDeploying={isDeploying}
          state={location.state}
        />

        {/* Terminal Section - Collapsible */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-xl">
          {/* Terminal Toggle Button */}
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-300">
                {isDeployingLocal ? "Deployment Logs" : "Terminal Logs"}
              </span>
              {isDeployingLocal && (
                <span className="text-xs text-blue-400 animate-pulse ml-2">
                  ● Live Stream
                </span>
              )}
              {done && !loading && (
                <span className="text-xs text-emerald-400 ml-2">
                  ✓ Complete
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {logs.length > 0 && (
                <span className="text-xs text-neutral-500 font-mono">
                  {logs.length} lines
                </span>
              )}
              {showTerminal ? (
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              ) : (
                <ChevronUp className="h-4 w-4 text-neutral-400" />
              )}
            </div>
          </button>

          {/* Terminal Content */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showTerminal ? "max-h-[500px]" : "max-h-0"
            }`}
          >
            <div className="h-[400px] overflow-hidden border-t border-neutral-800">
              <LogTerminal logs={logs} done={done} failed={failed} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeployPage;
