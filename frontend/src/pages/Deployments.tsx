import { useDeployments } from "@/hooks/useDeployments";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import clsx from "clsx";
import type { DeploymentResponse } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { Link } from "react-router-dom";

function Deployments() {
  const {
    deployments,
    loading,
    error,
  }: {
    deployments: DeploymentResponse[];
    loading: boolean;
    error: string | null;
  } = useDeployments();

  if (!loading && deployments.length === 0)
    return (
      <div className="flex items-center justify-center h-full">
        <p
          className={clsx(
            "bg-neutral-700 shadow-md p-4 md:text-xl rounded-md w-1/2",
            "flex items-center justify-center",
            error ? "text-red-500" : "text-neutral-200",
          )}
        >
          {error ? error : "No deployments"}
        </p>
      </div>
    );
  return (
    <div
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3",
        "text-neutral-200 mx-auto h-screen overflow-auto p-4",
      )}
    >
      {loading &&
        Array.from({ length: 5 }).map((_, i) => (
          <Card
            className={clsx(
              "h-[300px] bg-neutral-900 border border-neutral-700 shadow-neutral-600 shadow-sm",
              "flex flex-col p-1",
              "animate-pulse bg-neutral-700",
              "text-neutral-200 hover:scale-[1.01]",
            )}
            key={i}
          ></Card>
        ))}
      {!loading &&
        deployments &&
        deployments.map((depl) => {
          const logs = depl.buildLogs;
          let preview = logs?.split("\n").slice(0, 2).join("\n");
          preview = !preview ? "no logs" : preview;

          return (
            <Card
              className={clsx(
                "h-[300px] bg-neutral-900 border border-neutral-700 shadow-neutral-600 shadow-sm",
                "flex flex-col p-1",
                "text-neutral-200 hover:scale-[1.01]",
              )}
              key={depl.id}
            >
              <CardHeader className="shrink-0 bg-neutral-800 p-2 rounded-md">
                <CardTitle>{depl.repoName}</CardTitle>
                <CardDescription className="text-xs">
                  {depl.repoUrl}
                </CardDescription>
                <CardAction
                  className={clsx(
                    depl.status === "running" && "text-green-400",
                    depl.status === "failed" && "text-red-400",
                    depl.status === "stopped" && "text-yellow-400",
                  )}
                >
                  {depl.status}
                </CardAction>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-around ">
                <div className="flex justify-between">
                  <span>run time</span>
                  <span>{depl.runtimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span>URL</span>
                  <a
                    href={`http://localhost/${depl.route}`}
                    className="truncate text-blue-500 text-xs"
                    target="_blank"
                  >
                    {depl.route}
                  </a>
                </div>

                <div>
                  <span>Logs</span>
                  <p className="text-xs font-mono text-green-500 border border-neutral-800 p-2 rounded-md">
                    {preview}

                    {depl.buildLogs && (
                      <div>
                        <span>...</span>
                        <Link to="" className="text-xs text-blue-600 mx-2">
                          view more
                        </Link>
                      </div>
                    )}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="shrink-0 bg-neutral-900 h-10 text-xs">
                <p>deployed {formatTime(depl.createdAt)}</p>
              </CardFooter>
            </Card>
          );
        })}
    </div>
  );
}

export default Deployments;
