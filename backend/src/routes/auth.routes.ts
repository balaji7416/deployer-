import { register, login, checkAuth } from "../controllers/auth.controller.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check", authMiddleware, checkAuth);
export default router;
