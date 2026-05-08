import express from "express";
import {
  createHome,
  handleInvite,
  handleRegister,
  handleRemoveMember,
} from "../controllers/HomeController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { isAdmin } from "../middlewares/RoleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createHome);
router.post("/invite", authMiddleware, isAdmin, handleInvite);
router.post("/register", handleRegister);
router.delete("/:homeId/members/:memberId", authMiddleware, isAdmin, handleRemoveMember);

export default router;
