import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

interface EnvVar {
  key: string;
  value: string;
  isVisible: boolean;
}

function DeployForm({
  onDeploy,
  loading,
  isDeploying,
  state,
}: {
  onDeploy: ({
    repoUrl,
    rootDir,
    deplId,
    envVars,
  }: {
    repoUrl: string;
    rootDir?: string;
    deplId?: string;
    envVars?: Record<string, string>;
  }) => Promise<void>;
  loading: boolean;
  isDeploying: boolean;
  state?: {
    repoUrl: string;
    rootDir?: string;
    id?: string;
    isRedeploy?: boolean;
  };
}) {
  const [repoUrl, setRepoUrl] = useState(() => {
    if (state?.repoUrl) return state.repoUrl;
    return "";
  });
  const [rootDir, setRootDir] = useState(() => {
    if (state?.rootDir) return state.rootDir;
    return "";
  });
  const [envVars, setEnvVars] = useState<EnvVar[]>([
    {
      key: "",
      value: "",
      isVisible: false,
    },
  ]);
  const [showEnvSection, setShowEnvSection] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state?.isRedeploy) btnRef.current?.click();
  }, [state?.isRedeploy]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    // Convert env vars to object, filtering out empty ones
    const envObject: Record<string, string> = {};
    envVars.forEach((env) => {
      if (env.key.trim() && env.value.trim()) {
        envObject[env.key.trim()] = env.value.trim();
      }
    });

    onDeploy({
      repoUrl,
      rootDir,
      deplId: state?.id,
      envVars: Object.keys(envObject).length > 0 ? envObject : undefined,
    });
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "", isVisible: false }]);
  };

  const removeEnvVar = (index: number) => {
    if (envVars.length > 1) {
      setEnvVars(envVars.filter((_, i) => i !== index));
    }
  };

  const updateEnvVar = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const toggleVisibility = (index: number) => {
    const updated = [...envVars];
    updated[index].isVisible = !updated[index].isVisible;
    setEnvVars(updated);
  };

  return (
    <div className="bg-neutral-900 p-5 my-4 border border-neutral-800 rounded-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Repository URL */}
        <div className="w-full">
          <label className="text-sm text-neutral-400 block mb-2">
            Repository URL *
          </label>
          <Input
            placeholder="https://github.com/user/repo.git"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="text-neutral-200 h-11 w-full"
            required
          />
        </div>

        {/* Root Directory */}
        <div className="w-full">
          <label className="text-sm text-neutral-400 block mb-2">
            Root Directory
          </label>
          <Input
            placeholder="/"
            value={rootDir}
            onChange={(e) => setRootDir(e.target.value)}
            className="text-neutral-200 h-11 w-full"
          />
        </div>

        {/* Environment Variables Toggle */}
        <div className="w-full">
          <button
            type="button"
            onClick={() => setShowEnvSection(!showEnvSection)}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showEnvSection ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {showEnvSection ? "Hide" : "Show"} Environment Variables
          </button>
        </div>

        {/* Environment Variables Section */}
        {showEnvSection && (
          <div className="w-full space-y-3 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-neutral-300">
                Environment Variables
              </h4>
              <Button
                type="button"
                onClick={addEnvVar}
                variant="outline"
                size="sm"
                className="border-neutral-600 text-neutral-300 bg-blue-500 hover:bg-blue-400"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Variable
              </Button>
            </div>

            {envVars.map((env, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="key"
                  value={env.key}
                  onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                  className="text-neutral-200 h-9 flex-1 bg-neutral-700/50 border-neutral-600 placeholder:text-sm"
                />
                <div className="relative flex-1">
                  <Input
                    placeholder="value"
                    type={env.isVisible ? "text" : "password"}
                    value={env.value}
                    onChange={(e) =>
                      updateEnvVar(index, "value", e.target.value)
                    }
                    className="text-neutral-200 h-9 w-full bg-neutral-700/50 border-neutral-600 pr-20 placeholder:text-sm"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => toggleVisibility(index)}
                      className="p-1 hover:bg-neutral-600 rounded transition-colors"
                    >
                      {env.isVisible ? (
                        <EyeOff className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-neutral-400" />
                      )}
                    </button>
                    {envVars.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEnvVar(index)}
                        className="p-1 hover:bg-neutral-600 rounded transition-colors"
                      >
                        <X className="h-4 w-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-neutral-500 mt-2">
              Environment variables are injected at build time
            </p>
          </div>
        )}

        {/* Deploy Button */}
        <Button
          type="submit"
          ref={btnRef}
          disabled={isDeploying || !repoUrl.trim()}
          className="cursor-pointer active:scale-[0.99] bg-blue-500 hover:bg-blue-600 h-11 px-6 w-full"
        >
          {loading
            ? "Deploying..."
            : isDeploying
              ? "Deployment in progress"
              : "Deploy Project"}
        </Button>
      </form>
    </div>
  );
}

export default DeployForm;
