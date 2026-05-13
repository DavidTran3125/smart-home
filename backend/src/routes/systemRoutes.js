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
  createUserController,
} from "../controllers/SystemController.js";

const router = Router();

router.use(authMiddleware, isSystemAdmin);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", (req, res) => {
  res.status(405).json({
    success: false,
    error: "SystemAdmin không thể cập nhật thông tin hồ sơ người dùng",
  });
});
router.patch("/users/:id/invalidate", invalidateUser);
router.patch("/users/:id/reactivate", reactivateUser);

router.get("/devices", getDevices);
router.get("/logs", getLogs);










router.post("/users/create", createUserController);        // Thêm mới hoàn toàn
export default router;
