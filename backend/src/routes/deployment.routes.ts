import { Router } from "express";

import {
  getAllDeployments,
  getDeploymentById,
  getDeploymentLogs,
  deploy,
  stopDeployment,
} from "../controllers/deployment.controller.js";

const router = Router();

router.get("/", getAllDeployments);
router.get("/:id", getDeploymentById);
router.get("/:id/logs", getDeploymentLogs);
router.post("/deploy", deploy);
router.post("/:id/stop", stopDeployment);
export default router;
