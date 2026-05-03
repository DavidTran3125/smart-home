import express from "express";
import * as controller from "../controllers/UserController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { isAdmin } from "../middlewares/RoleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, controller.getUsers);
router.post("/", authMiddleware, isAdmin, controller.createUser);
router.put("/:id", authMiddleware, isAdmin, controller.updateUser);
router.delete("/:id", authMiddleware, isAdmin, controller.deleteUser);

export default router;
