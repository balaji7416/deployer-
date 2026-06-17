import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

function LogTerminal({ logs, done }: { logs: string[]; done: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Card className="flex flex-1 bg-neutral-900 min-h-0">
      <CardContent className="flex-1 min-h-0">
        <div className="bg-black  text-green-400 font-mono text-sm p-4  h-full overflow-auto rounded-xl">
          {logs.length === 0 && !done && (
            <span className="animate-pulse"> Start Deploying ...</span>
          )}

          {logs.map((log, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              {log}
            </div>
          ))}

          {!done && logs.length > 0 && <span className="animate-pulse">▊</span>}

          {done && (
            <div className="text-yellow-400 mt-2 border-t border-gray-700 pt-2">
              ═══ Deployment finished ═══
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}

export default LogTerminal;
