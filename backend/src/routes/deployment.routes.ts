import { Router } from "express";

import {
  getAllDeployments,
  getDeploymentById,
  getDeploymentLogs,
  deploy,
  stopDeployment,
  streamLogs,
} from "../controllers/deployment.controller.js";

const router = Router();

router.get("/", getAllDeployments);
router.get("/:id", getDeploymentById);
router.get("/:id/logs", getDeploymentLogs);
router.post("/", deploy);
router.post("/:id/stop", stopDeployment);
router.get("/:id/logs/stream", streamLogs);

export default router;
