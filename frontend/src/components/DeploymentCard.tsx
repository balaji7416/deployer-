import { formatTime, getDeploymentUrl } from "@/lib/utils";
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
import { useNavigate, Link } from "react-router-dom";
import type { DeploymentResponse } from "@/lib/types";
function DeploymentCard({ depl }: { depl: DeploymentResponse }) {
  const navigate = useNavigate();
  const logs = depl.logs;
  let preview = logs?.split("\n").slice(0, 2).join("\n");
  preview = !preview ? "no logs" : preview;
  return (
    <Card
      className={clsx(
        "h-75 bg-neutral-900 border border-neutral-700 shadow-neutral-600 shadow-sm",
        "flex flex-col p-1",
        "text-neutral-200 hover:scale-[1.005]",
      )}
      key={depl.id}
      onClick={() => navigate(`/deployment/${depl.id}`)}
    >
      <CardHeader className="shrink-0 bg-neutral-800 p-2 rounded-md">
        <CardTitle>{depl.repoName}</CardTitle>
        <CardDescription className="text-xs">{depl.repoUrl}</CardDescription>
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
        <div className="flex items-center justify-between gap-3">
          <span>URL</span>
          <a
            href={getDeploymentUrl(depl.route)}
            className="truncate text-blue-500 text-xs"
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            {getDeploymentUrl(depl.route)}
          </a>
        </div>

        <div>
          <span>Logs</span>
          <div className="text-xs font-mono text-green-500 border border-neutral-800 p-2 rounded-md">
            {preview}

            {depl.logs && (
              <div>
                <span>...</span>
                <Link
                  to={`/deployment/${depl.id}`}
                  relative="path"
                  className="text-xs text-blue-600 mx-2"
                >
                  view more
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="shrink-0 bg-neutral-900 h-10 text-xs flex items-center justify-between">
        <p>deployed {formatTime(depl.createdAt)}</p>
      </CardFooter>
    </Card>
  );
}

export default DeploymentCard;
