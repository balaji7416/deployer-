import DeployFrom from "../components/DeployForm";
import LogTerminal from "../components/LogTerminal";

import { useDeploy } from "../hooks/useDeploy";
import useLogStream from "../hooks/useLogStream";

function DeployPage() {
  const { deploy, deploymentId, loading } = useDeploy();
  const { logs, done } = useLogStream(deploymentId);

  return (
    <div className="flex flex-col h-screen">
      <DeployFrom onDeploy={deploy} loading={loading} />
      <LogTerminal logs={logs} done={done} />
    </div>
  );
}

export default DeployPage;
