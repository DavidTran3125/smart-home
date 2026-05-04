/**
 * ============================================================
 *  DESIGN PATTERN: Observer Pattern — SensorEventBus (Subject)
 * ============================================================
 *
 * Vai trò: Subject trong Observer Pattern.
 * Khi dữ liệu cảm biến mới đến từ MQTT, SensorEventBus phát sự kiện
 * "newSensorData" tới tất cả các Observer đang lắng nghe:
 *   - DatabaseLogger  : Ghi dữ liệu vào MongoDB (SensorData collection)
 *   - AlertSystem     : Kiểm tra ngưỡng, tạo Alert, gửi email cảnh báo
 *   - LatestDataCache : Cập nhật bộ nhớ RAM cho API /api/iot-data
 *
 * Sử dụng EventEmitter của Node.js làm nền tảng.
 */

import { EventEmitter } from "events";

class SensorEventBus extends EventEmitter {
  /**
   * Singleton instance — đảm bảo toàn bộ app chỉ có 1 event bus duy nhất.
   * (Kết hợp Observer + Singleton)
   */
  static #instance = null;

  constructor() {
    super();
    // Tăng max listeners vì có nhiều observer
    this.setMaxListeners(20);
  }

  static getInstance() {
    if (!SensorEventBus.#instance) {
      SensorEventBus.#instance = new SensorEventBus();
    }
    return SensorEventBus.#instance;
  }

  /**
   * Phát sự kiện khi có dữ liệu cảm biến mới.
   * @param {object} data - { feedName, value, timestamp }
   */
  publishSensorData(data) {
    this.emit("newSensorData", data);
  }

  /**
   * Phát sự kiện khi thiết bị được điều khiển.
   * @param {object} data - { deviceId, feedName, value, userId }
   */
  publishDeviceControl(data) {
    this.emit("deviceControlled", data);
  }

  /**
   * Đăng ký observer mới.
   * @param {string} event - Tên sự kiện
   * @param {Function} handler - Hàm xử lý
   */
  subscribe(event, handler) {
    this.on(event, handler);
    console.log(`  [Observer] Đã đăng ký observer cho sự kiện: ${event}`);
  }
}

export default SensorEventBus;
