import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getAllDeployments,
  getDeploymentById,
  getDeploymentLogs,
  deploy,
  stopDeployment,
  streamLogs,
} from "../controllers/deployment.controller.js";

const router = Router();

router.get("/", authMiddleware, getAllDeployments);
router.get("/:id", authMiddleware, getDeploymentById);
router.get("/:id/logs", authMiddleware, getDeploymentLogs);
router.post("/", authMiddleware, deploy);
router.post("/:id/stop", authMiddleware, stopDeployment);
router.get("/:id/logs/stream", authMiddleware, streamLogs);

export default router;
