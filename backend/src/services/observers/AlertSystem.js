/**
 * ============================================
 *  OBSERVER: AlertSystem
 * ============================================
 *
 * Observer trong Observer Pattern.
 * Lắng nghe sự kiện "newSensorData" từ SensorEventBus,
 * kiểm tra ngưỡng (threshold) trên Device,
 * tạo Alert và gửi email cảnh báo tới users trong cùng Home.
 */

import Device from "../../models/Device.js";
import Alert from "../../models/Alert.js";
import DeviceFactory from "../DeviceFactory.js";
import SensorEventBus from "../SensorEventBus.js";
import sendAlertMail from "../../utils/alertMailer.js";

const SENSOR_LABELS = {
  temperature: "Nhiệt độ",
  humidity: "Độ ẩm",
  light: "Ánh sáng",
};

const getSeverity = (type, direction) => {
  if (type === "temperature" && direction === "above") return "Cao";
  return "Trung bình";
};

const getTriggeredThreshold = (device, type, value) => {
  if (!device.threshold_is_active) return null;

  if (device.threshold_max_value !== undefined && device.threshold_max_value !== null && value > device.threshold_max_value) {
    const label = SENSOR_LABELS[type] || "Chỉ số";
    return {
      direction: "above",
      directionText: "vượt trên",
      threshold: device.threshold_max_value,
      severity: getSeverity(type, "above"),
      messagePrefix: `${label} quá cao`,
    };
  }

  if (device.threshold_min_value !== undefined && device.threshold_min_value !== null && value < device.threshold_min_value) {
    const label = SENSOR_LABELS[type] || "Chỉ số";
    return {
      direction: "below",
      directionText: "dưới",
      threshold: device.threshold_min_value,
      severity: getSeverity(type, "below"),
      messagePrefix: `${label} quá thấp`,
    };
  }

  return null;
};

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
   * Nếu vượt ngưỡng → tạo Alert + gửi email cho users trong cùng Home.
   */
  async checkThreshold({ feedName, value, timestamp }) {
    try {
      const device = await Device.findOne({ feed_name: feedName });
      if (!device) return;

      const handler = DeviceFactory.createHandler(feedName);
      if (!handler.isSensor()) return;

      const numericValue = handler.parseValue(value);
      if (Number.isNaN(numericValue)) return;

      const sensorType = handler.getType();
      const triggeredRule = getTriggeredThreshold(device, sensorType, numericValue);
      if (!triggeredRule) return;

      // Cooldown check: tránh spam alert
      const cooldownKey = `${device._id}_${triggeredRule.direction}`;
      const lastAlert = this._alertCooldowns.get(cooldownKey);
      if (lastAlert && Date.now() - lastAlert < this.COOLDOWN_MS) {
        return; // Đang trong cooldown, bỏ qua
      }
      this._alertCooldowns.set(cooldownKey, Date.now());

      const existingActiveAlert = await Alert.findOne({
        device_id: device._id,
        status: "Chưa xử lý",
        type: sensorType,
        direction: triggeredRule.direction,
      });

      if (existingActiveAlert) return;

      const unit = handler.getUnit();
      const message = `${triggeredRule.messagePrefix}: ${numericValue}${unit} (${triggeredRule.directionText} ngưỡng ${triggeredRule.threshold}${unit})`;

      // Ghi Alert vào DB
      const alert = await Alert.create({
        device_id: device._id,
        severity: triggeredRule.severity,
        type: sensorType,
        unit: unit,
        threshold_value: triggeredRule.threshold,
        direction: triggeredRule.direction,
        message: message,
        value_at_alert: numericValue,
        status: "Chưa xử lý",
        detected_at: timestamp,
      });

      console.log(`🚨 [AlertSystem] Tạo cảnh báo: ${message}`);

      // Gửi email cảnh báo tới users trong cùng Home với thiết bị.
      await sendAlertMail({
        homeId: device.homeId,
        deviceName: device.name,
        type: sensorType,
        value: numericValue,
        unit: unit,
        severity: triggeredRule.severity,
        message: message,
        threshold: triggeredRule.threshold,
        direction: triggeredRule.directionText,
      });
    } catch (error) {
      console.error("[AlertSystem] Lỗi kiểm tra ngưỡng:", error.message);
    }
  }
}

export default AlertSystem;
