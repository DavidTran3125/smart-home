/**
 * ============================================
 *  OBSERVER: AlertSystem
 * ============================================
 *
 * Observer trong Observer Pattern.
 * Lắng nghe sự kiện "newSensorData" từ SensorEventBus,
 * kiểm tra ngưỡng (threshold) trên Device,
 * tạo Alert và gửi email cảnh báo tới TẤT CẢ users (Admin + Gia đình).
 */

import Device from "../../models/Device.js";
import Alert from "../../models/Alert.js";
import DeviceFactory from "../DeviceFactory.js";
import SensorEventBus from "../SensorEventBus.js";
import sendAlertMail from "../../utils/alertMailer.js";

class AlertSystem {
  constructor() {
    this.eventBus = SensorEventBus.getInstance();
    // Cooldown: tránh gửi mail liên tục (1 phút cho mỗi device)
    this._alertCooldowns = new Map();
    this.COOLDOWN_MS = 60 * 1000; // 60 giây
  }

  /**
   * Khởi tạo: đăng ký lắng nghe sự kiện từ Subject.
   */
  init() {
    this.eventBus.subscribe("newSensorData", this.checkThreshold.bind(this));
    console.log("  [AlertSystem] Observer đã sẵn sàng");
  }

  /**
   * Kiểm tra ngưỡng khi nhận dữ liệu cảm biến mới.
   * Nếu vượt ngưỡng → tạo Alert + gửi email cho tất cả users.
   */
  async checkThreshold({ feedName, value, timestamp }) {
    try {
      const device = await Device.findOne({ feed_name: feedName });
      if (!device) return;

      // Chỉ kiểm tra threshold nếu đã được bật
      if (!device.threshold_is_active) return;

      const handler = DeviceFactory.createHandler(feedName);
      if (!handler.isSensor()) return;

      const numericValue = handler.parseValue(value);
      if (Number.isNaN(numericValue)) return;

      // Kiểm tra vượt ngưỡng
      const exceedsMax =
        device.threshold_max_value != null &&
        numericValue > device.threshold_max_value;
      const belowMin =
        device.threshold_min_value != null &&
        numericValue < device.threshold_min_value;

      if (!exceedsMax && !belowMin) return;

      // Cooldown check: tránh spam alert
      const cooldownKey = `${device._id}_${exceedsMax ? "max" : "min"}`;
      const lastAlert = this._alertCooldowns.get(cooldownKey);
      if (lastAlert && Date.now() - lastAlert < this.COOLDOWN_MS) {
        return; // Đang trong cooldown, bỏ qua
      }
      this._alertCooldowns.set(cooldownKey, Date.now());

      // Xác định mức độ nghiêm trọng
      let severity = "Trung bình";
      if (exceedsMax && device.threshold_max_value != null) {
        const overPercent =
          ((numericValue - device.threshold_max_value) /
            device.threshold_max_value) *
          100;
        severity = overPercent > 50 ? "Cao" : "Trung bình";
      }
      if (belowMin) severity = "Thấp";

      // Tạo message mô tả
      const direction = exceedsMax ? "vượt trên" : "dưới";
      const thresholdVal = exceedsMax
        ? device.threshold_max_value
        : device.threshold_min_value;
      const message = `${device.name}: ${handler.getType()} = ${numericValue}${handler.getUnit()} (${direction} ngưỡng ${thresholdVal}${handler.getUnit()})`;

      // Ghi Alert vào DB
      const alert = await Alert.create({
        device_id: device._id,
        severity: severity,
        message: message,
        value_at_alert: numericValue,
        status: "Chưa xử lý",
        detected_at: timestamp,
      });

      console.log(`🚨 [AlertSystem] Tạo cảnh báo: ${message}`);

      // Gửi email cảnh báo tới TẤT CẢ users (Admin + Gia đình)
      await sendAlertMail({
        deviceName: device.name,
        type: handler.getType(),
        value: numericValue,
        unit: handler.getUnit(),
        severity: severity,
        message: message,
        threshold: thresholdVal,
        direction: direction,
      });
    } catch (error) {
      console.error("[AlertSystem] Lỗi kiểm tra ngưỡng:", error.message);
    }
  }
}

export default AlertSystem;
