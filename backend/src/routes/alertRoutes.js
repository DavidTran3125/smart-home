/**
 * Alert + Threshold Routes
 * Base: /api/v1
 *
 * Gộp cả alerts và thresholds vào 1 router vì chúng liên quan chặt chẽ.
 */

import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { isAdmin } from "../middlewares/RoleMiddleware.js";
import {
  getActiveAlerts,
  getAllAlerts,
  resolveAlert,
  getThresholds,
  updateThreshold,
} from "../controllers/alertController.js";

const router = Router();

// ========================
// Alerts
// ========================

// GET /api/v1/alerts/active           — Cảnh báo đang Active
router.get("/alerts/active", authMiddleware, getActiveAlerts);

// GET /api/v1/alerts                  — Tất cả cảnh báo (phân trang)
router.get("/alerts", authMiddleware, getAllAlerts);

// PUT /api/v1/alerts/:id/resolve      — Đánh dấu đã xử lý (Admin)
router.put("/alerts/:id/resolve", authMiddleware, isAdmin, resolveAlert);

// ========================
// Thresholds
// ========================

// GET /api/v1/thresholds              — Xem cấu hình ngưỡng
router.get("/thresholds", authMiddleware, getThresholds);

// PUT /api/v1/thresholds/:deviceId    — Cập nhật ngưỡng (Admin)
router.put("/thresholds/:deviceId", authMiddleware, isAdmin, updateThreshold);

export default router;
