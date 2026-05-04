/**
 * Sensor Routes
 * Base: /api/v1/sensors
 */

import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import {
  getLatestSensorData,
  getSensorHistory,
} from "../controllers/sensorController.js";

const router = Router();

// GET /api/v1/sensors/latest  — Dữ liệu cảm biến mới nhất (Dashboard)
router.get("/latest", authMiddleware, getLatestSensorData);

// GET /api/v1/sensors/history — Lịch sử cảm biến (phân trang, bộ lọc)
router.get("/history", authMiddleware, getSensorHistory);

export default router;
