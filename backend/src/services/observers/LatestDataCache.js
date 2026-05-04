/**
 * ============================================
 *  OBSERVER: LatestDataCache
 * ============================================
 *
 * Observer trong Observer Pattern.
 * Lắng nghe sự kiện "newSensorData" từ SensorEventBus,
 * cập nhật bộ nhớ đệm (RAM) để phục vụ API GET /api/iot-data
 * mà không cần truy vấn DB.
 */

import SensorEventBus from "../SensorEventBus.js";

class LatestDataCache {
  constructor() {
    this.eventBus = SensorEventBus.getInstance();
    this.cache = {};
  }

  /**
   * Khởi tạo: đăng ký lắng nghe sự kiện từ Subject.
   */
  init() {
    this.eventBus.subscribe("newSensorData", this.updateCache.bind(this));
    console.log("  [LatestDataCache] Observer đã sẵn sàng");
  }

  /**
   * Cập nhật cache khi có dữ liệu mới.
   */
  updateCache({ feedName, value, timestamp }) {
    this.cache[feedName] = {
      value: value,
      updatedAt: timestamp.toISOString(),
    };
  }

  /**
   * Trả về toàn bộ dữ liệu mới nhất trong cache.
   */
  getAll() {
    return this.cache;
  }
}

export default LatestDataCache;
