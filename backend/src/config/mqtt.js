/**
 * MQTT Configuration & Pipeline
 *
 * Sử dụng 3 Design Patterns:
 *   1. Singleton  — MQTTClient (1 kết nối duy nhất)
 *   2. Observer   — SensorEventBus phát sự kiện, 3 Observers lắng nghe
 *   3. Factory    — DeviceFactory (được dùng bởi observers để parse data)
 *
 * Pipeline khi nhận dữ liệu MQTT:
 *   MQTT message → SensorEventBus.publishSensorData()
 *   MQTT message → SensorEventBus.publishSensorData()
 *     → [Observer] DatabaseLogger   : ghi SensorData vào MongoDB
 *     → [Observer] AlertSystem      : kiểm tra ngưỡng → tạo Alert + gửi email
 */

import MQTTClient from "../services/MQTTClient.js";
import SensorEventBus from "../services/SensorEventBus.js";
import DatabaseLogger from "../services/observers/DatabaseLogger.js";
import AlertSystem from "../services/observers/AlertSystem.js";

// ========================
// 1. Khởi tạo Singleton MQTT Client
// ========================
const mqttClient = MQTTClient.getInstance();
const client = mqttClient.getClient();

// ========================
// 2. Khởi tạo Observer Pattern
// ========================
const eventBus = SensorEventBus.getInstance();

// Tạo và đăng ký các Observers
const databaseLogger = new DatabaseLogger();
const alertSystem = new AlertSystem();

databaseLogger.init();  // Observer 2: Ghi vào MongoDB
alertSystem.init();     // Observer 3: Kiểm tra ngưỡng + gửi email

// ========================
// 3. MQTT Event Handlers
// ========================
client.on("connect", () => {
  console.log("✅ Đã kết nối thành công tới Adafruit MQTT broker");

  // Danh sách feeds cần lắng nghe
  const feedsToListen = [
    "fan",
    "humid",
    "ledred",
    "ledrgb",
    "light",
    "servo",
    "temp",
  ];

  feedsToListen.forEach((feed) => {
    mqttClient.subscribeFeed(feed);
  });
});

// Khi nhận message → phát sự kiện qua EventBus → tất cả Observers xử lý đồng thời
client.on("message", (topic, message) => {
  const feedName = topic.split("/").pop();
  const value = message.toString();
  console.log(`📥 Nhận được: [${feedName}] = ${value}`);

  // Phát sự kiện tới tất cả Observers (Observer Pattern)
  eventBus.publishSensorData({
    feedName,
    value,
    timestamp: new Date(),
  });
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err.message);
});

export default { client: mqttClient };
