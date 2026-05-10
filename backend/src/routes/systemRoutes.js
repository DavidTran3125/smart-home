import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { isSystemAdmin } from "../middlewares/RoleMiddleware.js";
import {
  getDevices,
  getLogs,
  getUserById,
  getUsers,
  invalidateUser,
  reactivateUser,
  updateUser,
} from "../controllers/SystemController.js";

const router = Router();

router.use(authMiddleware, isSystemAdmin);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.patch("/users/:id/invalidate", invalidateUser);
router.patch("/users/:id/reactivate", reactivateUser);

router.get("/devices", getDevices);
router.get("/logs", getLogs);

export default router;
