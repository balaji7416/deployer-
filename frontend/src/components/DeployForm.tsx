import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "./ui/card";

function DeployForm({
  onDeploy,
  loading,
  isDeploying,
  state,
}: {
  onDeploy: (repoUrl: string) => void;
  loading: boolean;
  isDeploying: boolean;
  state?: { repoUrl: string; isRedeploy: boolean };
}) {
  const [repoUrl, setRepoUrl] = useState(() => {
    if (state?.repoUrl) return state.repoUrl;
    return "";
  });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    //console.log(state);
    if (state?.isRedeploy) btnRef.current?.click();
  }, [state?.isRedeploy]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    onDeploy(repoUrl);
  };

  return (
    <Card className="bg-neutral-900 p-5 my-4 border border-neutral-800">
      <CardContent className="p-0">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center gap-4"
        >
          {/* Input field with label above */}
          <div className="w-full flex flex-col items-center justify-center">
            <label className="text-sm text-neutral-400 block mb-2">
              Repository URL
            </label>
            <Input
              placeholder="https://github.com/user/repo.git"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="text-neutral-200 h-11 w-full max-w-md"
            />
          </div>
          {/* Button at same level as input */}
          <Button
            type="submit"
            ref={btnRef}
            disabled={isDeploying || !repoUrl.trim()}
            className="cursor-pointer active:scale-[0.99] bg-blue-400 h-11 px-6 w-full max-w-md"
          >
            {loading
              ? "Deploying..."
              : isDeploying
                ? "Deployment in progress"
                : "Deploy Project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default DeployForm;
