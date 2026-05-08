/**
 * Device Routes
 * Base: /api/v1/devices
 */

import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { isAdmin } from "../middlewares/RoleMiddleware.js";
import {
  getAllDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  controlDevice,
  deleteDevice,
} from "../controllers/deviceController.js";

const router = Router();

// GET    /api/v1/devices          — Lấy danh sách thiết bị
router.get("/", authMiddleware, getAllDevices);

// GET    /api/v1/devices/:id      — Lấy chi tiết 1 thiết bị
router.get("/:id", authMiddleware, getDeviceById);

// POST   /api/v1/devices          — Thêm thiết bị mới (Admin)
router.post("/", authMiddleware, isAdmin, createDevice);

// PUT    /api/v1/devices/:id      — Cập nhật cấu hình thiết bị (Admin)
router.put("/:id", authMiddleware, isAdmin, updateDevice);

// POST   /api/v1/devices/:id/control — Điều khiển thiết bị (Bật/Tắt)
router.post("/:id/control", authMiddleware, controlDevice);

// DELETE /api/v1/devices/:id      — Xóa thiết bị khỏi hệ thống (Admin)
router.delete("/:id", authMiddleware, isAdmin, deleteDevice);



export default router;
