import { useState } from "react";

function DeployForm({
  onDeploy,
  loading,
}: {
  onDeploy: (repoUrl: string) => void;
  loading: boolean;
}) {
  const [repoUrl, setRepoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    onDeploy(repoUrl);
  };

  return (
    <div className="flex items-center justify-center py-16 bg-indigo-900">
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <h2 className="text-gray-400 text-sm mb-2">Repository URL</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://github.com/user/repo.git"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 font-mono text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !repoUrl.trim()}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors"
          >
            {loading ? "Deploying..." : "Deploy"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeployForm;
