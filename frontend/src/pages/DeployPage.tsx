import { useEffect, useState } from "react";
import DeployForm from "../components/DeployForm";
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

  const { logs, done } = useLogStream(deploymentId);
  const location = useLocation();

  useEffect(() => {
    if (done && !loading) {
      updateIsDeploying(false);
      setIsDeployingLocal(false);
      setTimeout(() => navigate("/deployments"), 2000);
    }
  }, [done, loading, updateIsDeploying, navigate]);

  // Auto-show terminal when deployment starts
  useEffect(() => {
    if (isDeploying || loading) {
      setShowTerminal(true);
      setIsDeployingLocal(true);
    }
  }, [isDeploying, loading]);

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 md:mb-6">Deploy Project</h1>

          <DeployForm
            onDeploy={deploy}
            loading={loading}
            isDeploying={isDeploying}
            state={location.state}
          />
        </div>
      </div>

      {/* Terminal Section - Collapsible */}
      <div className="border-t border-neutral-800 bg-neutral-900">
        {/* Terminal Toggle Button */}
        <button
          onClick={() => setShowTerminal(!showTerminal)}
          className="w-full flex items-center justify-between px-6 py-3 hover:bg-neutral-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-300">
              {isDeployingLocal ? "Deployment Logs" : "Terminal"}
            </span>
            {isDeployingLocal && (
              <span className="text-xs text-blue-400 animate-pulse ml-2">
                ● Live
              </span>
            )}
            {done && !loading && (
              <span className="text-xs text-green-400 ml-2">✓ Complete</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <span className="text-xs text-neutral-500">
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
            showTerminal ? "max-h-[60vh]" : "max-h-0"
          }`}
        >
          <div className="h-[50vh] overflow-hidden">
            <LogTerminal logs={logs} done={done} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeployPage;
