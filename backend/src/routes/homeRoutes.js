import express from "express";
import {
  createHome,
  handleListMembers,
  handleInvite,
  handleRegister,
  handleRemoveMember,
} from "../controllers/HomeController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { isAdmin } from "../middlewares/RoleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createHome);
// Returns all users in the home, including the admin.
router.get("/:homeId/members", authMiddleware, isAdmin, handleListMembers);
router.post("/:homeId/members/invite", authMiddleware, isAdmin, handleInvite);
router.post("/register", handleRegister);
router.delete("/:homeId/members/:memberId", authMiddleware, isAdmin, handleRemoveMember);

export default router;
