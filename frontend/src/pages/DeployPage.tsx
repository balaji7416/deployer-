import { useEffect } from "react";
import DeployFrom from "../components/DeployForm";
import LogTerminal from "../components/LogTerminal";

import { useDeploy } from "../hooks/useDeploy";
import useLogStream from "../hooks/useLogStream";

function DeployPage() {
  const { deploy, deploymentId, loading, isDeploying, updateIsDeploying } =
    useDeploy();
  const { logs, done } = useLogStream(deploymentId);

  useEffect(() => {
    if (done && !loading) {
      updateIsDeploying(false);
    }
  }, [done, loading, updateIsDeploying]);

  return (
    <div className="flex flex-col h-screen">
      <DeployFrom
        onDeploy={deploy}
        loading={loading}
        isDeploying={isDeploying}
      />
      <LogTerminal logs={logs} done={done} />
    </div>
  );
}

export default DeployPage;
