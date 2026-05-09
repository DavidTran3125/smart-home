/**
 * Smart Home Backend — Server Entry Point
 *
 * Kiến trúc MVC + 3 Design Patterns:
 *   - Observer Pattern  : SensorEventBus + Observers (xử lý dữ liệu thời gian thực)
 *   - Singleton Pattern : MQTTClient (kết nối MQTT duy nhất)
 *   - Factory Method    : DeviceFactory (tạo handler theo loại thiết bị)
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import connectDB from "./src/db/connect.js";
import mqttConfig from "./src/config/mqtt.js";
import config from "./src/config/index.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import openApiSpec from "./src/docs/openapi.js";

// Import Routes
import authRoutes from "./src/routes/AuthRoutes.js";
import deviceRoutes from "./src/routes/deviceRoutes.js";
import sensorRoutes from "./src/routes/sensorRoutes.js";
import alertRoutes from "./src/routes/alertRoutes.js";
import logRoutes from "./src/routes/logRoutes.js";
import homeRoutes from "./src/routes/homeRoutes.js";

// Kết nối MongoDB
connectDB();

const app = express();
const port = 3000;

// ========================
// Middleware cơ bản
// ========================
app.use(cors()); // Cho phép Cross-Origin requests (Frontend gọi API)
app.use(helmet()); // Bảo mật HTTP headers
app.use(morgan("dev")); // Log HTTP requests (method, url, status, time)
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get("/api-docs.json", (req, res) => res.json(openApiSpec));

// ========================
// Mount API Routes (RESTful /api/v1)
// ========================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/sensors", sensorRoutes);
app.use("/api/v1", alertRoutes); // Gộp /api/v1/alerts + /api/v1/thresholds
app.use("/api/v1/logs", logRoutes);
app.use("/api/v1/homes", homeRoutes);

// ========================
// Global Error Handler (phải đặt SAU tất cả routes)
// ========================
app.use(errorHandler);

// ========================
// Start Server
// ========================
app.listen(port, () => {
  console.log(`\n Server Express đang chạy tại http://localhost:${port}`);
  console.log(`\n API Endpoints:`);
  console.log(
    `   [Auth]       POST       http://localhost:${port}/api/v1/auth/login`,
  );
  console.log(
    `   [Auth]       POST       http://localhost:${port}/api/v1/auth/register`,
  );
  console.log(
    `   [Auth]       GET        http://localhost:${port}/api/v1/auth/me`,
  );
  console.log(
    `   [Devices]    CRUD       http://localhost:${port}/api/v1/devices`,
  );
  console.log(
    `   [Sensors]    GET        http://localhost:${port}/api/v1/sensors/latest`,
  );
  console.log(
    `   [Sensors]    GET        http://localhost:${port}/api/v1/sensors/history`,
  );
  console.log(
    `   [Alerts]     GET        http://localhost:${port}/api/v1/alerts/active`,
  );
  console.log(
    `   [Thresholds] GET/PUT    http://localhost:${port}/api/v1/thresholds`,
  );
  console.log(
    `   [Logs]       GET        http://localhost:${port}/api/v1/logs`,
  );
  console.log(
    `   [Homes]      Members    http://localhost:${port}/api/v1/homes/:homeId/members`,
  );
});
