import type { Request, Response } from "express";
import type { DeploymentResponse, DeploymentRow } from "../types/index.js";

import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { toDeploymentResponse } from "../utils/toDeploymentResponse.js";
import {
  deploymentRepo,
  updateDeployment,
} from "../repositories/deployment.repository.js";
import {
  orchestrateDeployment,
  startDeployment,
} from "../services/orchestrator.js";
import { stopContainer } from "../services/stopContainer.js";
import { logEmitter } from "../utils/logEmmiter.js";

export const getAllDeployments = asyncHandler(
  async (req: Request, res: Response) => {
    const deployments: DeploymentRow[] =
      await deploymentRepo.getUserDeployments(req.user?.id as string);
    const response: DeploymentResponse[] = deployments.map((depl) =>
      toDeploymentResponse(depl),
    );
    return res
      .status(200)
      .json(new ApiResponse(200, "fetch all deployments", response));
  },
);

export const getDeploymentById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) throw new ApiError(400, "id is required");

    const depl: DeploymentRow = await deploymentRepo.getDeploymentById(id);
    if (!depl) throw new ApiError(404, "deployment not found");

    const response: DeploymentResponse = toDeploymentResponse(depl);
    return res
      .status(200)
      .json(new ApiResponse(200, "fetch deployment", response));
  },
);

export const getDeploymentLogs = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const logs = await deploymentRepo.getDeploymentLogs(id);
    return res
      .status(200)
      .json(new ApiResponse(200, `fetch logs for deployment ${id}`, logs));
  },
);

export const deploy = asyncHandler(async (req: Request, res: Response) => {
  const repoUrl: string = req.body.repoUrl;

  const depl: { deploymentId: string } = await startDeployment(
    repoUrl,
    req.user?.id as string,
  );
  return res.status(200).json(new ApiResponse(200, "deployment started", depl));
});

export const stopDeployment = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const dpl: DeploymentRow = await deploymentRepo.getDeploymentById(id);
    if (!dpl) throw new ApiError(404, "deployment not found");

    await updateDeployment(id, { status: "stopped" });
    await stopContainer(id);

    return res.status(200).json(new ApiResponse(200, "stopped deployment", {}));
  },
);

export const deleteDeployment = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const dpl: DeploymentRow = await deploymentRepo.getDeploymentById(id);
    if (!dpl) throw new ApiError(404, "deployment not found");

    if (dpl.user_id !== req.user?.id)
      throw new ApiError(
        401,
        "unauthorized, you don't have permission to delete this deployment",
      );
    await deploymentRepo.deleteDeployment(id);

    return res.status(200).json(new ApiResponse(200, "deleted deployment", {}));
  },
);

export const reDeploy = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const deployment: DeploymentRow = await deploymentRepo.getDeploymentById(id);
  if (!deployment) throw new ApiError(404, "deployment not found");

  if (deployment.user_id !== req.user?.id)
    throw new ApiError(
      401,
      "unauthorized, you don't have permission to re-deploy this deployment",
    );

  await updateDeployment(id, { status: "stopped" });
  await stopContainer(id);

  const depl: { deploymentId: string } = await startDeployment(
    deployment.repo_url,
    req.user?.id as string,
    deployment,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "re-deployment started", depl));
});

export const streamLogs = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  res.write(": Connected\n\n");

  const onLog = (event: any) => {
    if (event.deploymentId !== id) return;
    res.write(`data: ${JSON.stringify(event)}\n\n`);

    if (event.stage == "complete" || event.stage == "failed") {
      res.write("data: [END]\n\n");
      res.end();
      logEmitter.off("log", onLog);
    }
  };

  logEmitter.on("log", onLog);

  req.on("close", () => {
    logEmitter.off("log", onLog);
  });
});
