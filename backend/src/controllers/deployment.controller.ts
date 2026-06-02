import type { Request, Response } from "express";
import type { DeploymentResponse, DeploymentRow } from "../types/deployment.js";

import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { toDeploymentResponse } from "../utils/toDeploymentResponse.js";
import {
  deploymentRepo,
  updateDeployment,
} from "../repositories/deployment.repository.js";
import { orchestrateDeployment } from "../services/orchestrator.js";
import { stopContainer } from "../services/stopContainer.js";

export const getAllDeployments = asyncHandler(
  async (req: Request, res: Response) => {
    const deployments: DeploymentRow[] =
      await deploymentRepo.getAllDeployments();
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
  const depl: DeploymentRow = await orchestrateDeployment(repoUrl);
  const response = toDeploymentResponse(depl);
  return res
    .status(200)
    .json(new ApiResponse(200, "deployed project", response));
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
