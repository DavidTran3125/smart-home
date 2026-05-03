import express from "express";
import * as controller from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/login", controller.login);
router.post("/register", controller.register);
router.get("/me", authMiddleware, controller.me);

export default router;
