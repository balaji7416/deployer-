import { useEffect, useRef } from "react";

function LogTerminal({
  logs,
  done,
  failed,
}: {
  logs: string[];
  done: boolean;
  failed: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Format timestamp if logs contain them, or just clean display
  const formatLog = (log: string) => {
    // You can add custom formatting here if needed
    return log;
  };

  return (
    <div className="h-full bg-black rounded-lg overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 border-b border-neutral-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <span className="text-xs text-neutral-500 ml-2 font-mono">
          {done ? "✓ Deployment Complete" : "● Live Logs"}
        </span>
        <span className="text-xs text-neutral-600 ml-auto font-mono">
          {logs.length > 0 && `${logs.length} lines`}
        </span>
      </div>

      {/* Terminal Content */}
      <div
        ref={containerRef}
        className="h-[calc(100%-40px)] overflow-auto p-4 font-mono text-sm"
      >
        {logs.length === 0 && !done && (
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="animate-pulse">▸</span>
            <span>Waiting for deployment to start...</span>
          </div>
        )}

        {logs.map((log, i) => (
          <div
            key={i}
            className="whitespace-pre-wrap break-all leading-relaxed text-neutral-300 hover:bg-neutral-800/30 px-1 rounded transition-colors"
          >
            <span className="text-neutral-600 select-none mr-3 text-xs">
              {String(i + 1).padStart(3, " ")}
            </span>
            <span>{formatLog(log)}</span>
          </div>
        ))}

        {!done && logs.length > 0 && (
          <div className="flex items-center gap-2 text-green-400 mt-1">
            <span className="animate-pulse">▊</span>
            <span className="text-xs text-neutral-500">Deploying...</span>
          </div>
        )}

        {done && logs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-800">
            {!failed && (
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span className="text-sm">
                  Deployment completed successfully
                </span>
              </div>
            )}
            {failed && (
              <div className="flex items-center gap-2 text-red-400">
                <span>✗</span>
                <span className="text-sm">
                  Deployment failed, check the logs and try again
                </span>
              </div>
            )}
            <div className="text-xs text-neutral-500 mt-1">
              ─── Log stream ended ───
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default LogTerminal;
