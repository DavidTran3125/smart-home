/**
 * ============================================
 *  OBSERVER: DatabaseLogger
 * ============================================
 *
 * Observer trong Observer Pattern.
 * Lắng nghe sự kiện "newSensorData" từ SensorEventBus,
 * ghi dữ liệu cảm biến vào MongoDB (SensorData collection)
 * và cập nhật last_seen trên Device.
 */

import SensorData from "../../models/SensorData.js";
import Device from "../../models/Device.js";
import DeviceFactory from "../DeviceFactory.js";
import SensorEventBus from "../SensorEventBus.js";

class DatabaseLogger {
  constructor() {
    this.eventBus = SensorEventBus.getInstance();
  }

  /**
   * Khởi tạo: đăng ký lắng nghe sự kiện từ Subject.
   */
  init() {
    this.eventBus.subscribe("newSensorData", this.handleNewData.bind(this));
    console.log("  [DatabaseLogger] Observer đã sẵn sàng");
  }

  /**
   * Xử lý khi nhận dữ liệu cảm biến mới.
   * - Tìm Device theo feed_name
   * - Dùng DeviceFactory để parse value và lấy unit
   * - Ghi SensorData vào DB
   * - Cập nhật Device.last_seen
   */
  async handleNewData({ feedName, value, timestamp }) {
    try {
      // Tìm thiết bị theo feed_name
      const device = await Device.findOne({ feed_name: feedName });
      if (!device) {
        // Không tìm thấy device → bỏ qua (thiết bị chưa đăng ký trong DB)
        return;
      }

      // Dùng Factory để tạo handler phù hợp
      const handler = DeviceFactory.createHandler(feedName);

      // Chỉ ghi DB cho thiết bị cảm biến (sensor)
      if (handler.isSensor()) {
        const numericValue = handler.parseValue(value);
        if (Number.isNaN(numericValue)) return;

        await SensorData.create({
          device_id: device._id,
          timestamp: timestamp,
          type: handler.getType(),
          value: numericValue,
          unit: handler.getUnit(),
        });
      }

      // Cập nhật last_seen cho mọi loại thiết bị
      device.last_seen = timestamp;
      await device.save();
    } catch (error) {
      console.error("[DatabaseLogger] Lỗi ghi dữ liệu:", error.message);
    }
  }
}

export default DatabaseLogger;
