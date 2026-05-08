/**
 * Log Routes
 * Base: /api/v1/logs
 */

import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { isAdmin } from "../middlewares/RoleMiddleware.js";
import { getLogs, markLogsAsRead } from "../controllers/logController.js";

const router = Router();

// GET /api/v1/logs — Lấy lịch sử hoạt động hệ thống (Admin only)
router.get("/", authMiddleware, isAdmin, getLogs);

// PUT /api/v1/logs/mark-read - Đánh dấu log đã đọc (Admin only)
router.put("/mark-read", authMiddleware, isAdmin, markLogsAsRead);

export default router;
