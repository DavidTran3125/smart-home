/**
 * ============================================================
 *  DESIGN PATTERN: Factory Method Pattern — DeviceFactory
 * ============================================================
 *
 * Tách biệt logic khởi tạo đối tượng xử lý thiết bị ra khỏi Controller.
 * Khi cần thêm loại cảm biến/thiết bị mới trong tương lai,
 * chỉ cần tạo thêm class kế thừa từ DeviceHandler và đăng ký vào Factory.
 * → Tuân thủ nguyên lý OCP (Open-Closed Principle).
 */

// ========================
// Base Class (Interface)
// ========================
class DeviceHandler {
  /**
   * Parse giá trị thô từ MQTT thành số.
   * @param {string} rawValue
   * @returns {number}
   */
  parseValue(rawValue) {
    return Number(rawValue);
  }

  /**
   * Đơn vị đo lường.
   * @returns {string}
   */
  getUnit() {
    return "";
  }

  /**
   * Loại dữ liệu (temperature, humidity, light, ...).
   * @returns {string}
   */
  getType() {
    return "unknown";
  }

  /**
   * Thiết bị này có phải là cảm biến (sensor) không?
   * Sensor = đọc dữ liệu → ghi DB.
   * Actuator = nhận lệnh điều khiển.
   * @returns {boolean}
   */
  isSensor() {
    return false;
  }

  /**
   * Thiết bị này có hỗ trợ nhận lệnh điều khiển không?
   * @returns {boolean}
   */
  isControllable() {
    return false;
  }

  /**
   * Format lệnh điều khiển trước khi gửi qua MQTT.
   * @param {*} value
   * @returns {string}
   */
  formatControlCommand(value) {
    return String(value);
  }
}

const clampNumber = (value, min, max) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return min;
  return Math.max(min, Math.min(max, Math.round(numericValue)));
};

const SERVO_OPEN_VALUE = 1;

// ========================
// Concrete Handlers — Sensors
// ========================
class TemperatureHandler extends DeviceHandler {
  getType() {
    return "temperature";
  }
  getUnit() {
    return "°C";
  }
  isSensor() {
    return true;
  }
}

class HumidityHandler extends DeviceHandler {
  getType() {
    return "humidity";
  }
  getUnit() {
    return "%";
  }
  isSensor() {
    return true;
  }
}

class LightHandler extends DeviceHandler {
  getType() {
    return "light";
  }
  getUnit() {
    return "lux";
  }
  isSensor() {
    return true;
  }
}

// ========================
// Concrete Handlers — Actuators
// ========================
class FanHandler extends DeviceHandler {
  getType() {
    return "fan";
  }
  isSensor() {
    return false;
  }
  isControllable() {
    return true;
  }
  formatControlCommand(value) {
    // Fan: 0 = tắt, 1-100 = tốc độ quạt
    return String(clampNumber(value, 0, 100));
  }
}

class ServoHandler extends DeviceHandler {
  getType() {
    return "servo";
  }
  isSensor() {
    return false;
  }
  isControllable() {
    return true;
  }
  formatControlCommand(value) {
    return String(SERVO_OPEN_VALUE);
  }
}

class LEDHandler extends DeviceHandler {
  getType() {
    return "led";
  }
  isSensor() {
    return false;
  }
  isControllable() {
    return true;
  }
  formatControlCommand(value) {
    // LED đơn sắc: "0" = tắt, "1" = bật
    return Number(value) === 0 ? "0" : "1";
  }
}

class LEDRGBHandler extends DeviceHandler {
  getType() {
    return "ledrgb";
  }
  isSensor() {
    return false;
  }
  isControllable() {
    return true;
  }
  formatControlCommand(value) {
    // LED RGB trong hệ thống hiện tại nhận brightness 0-255.
    return String(clampNumber(value, 0, 255));
  }
}

// ========================
// Factory Method
// ========================
class DeviceFactory {
  /**
   * Registry lưu mapping: feedName → Handler class.
   * Có thể mở rộng bằng DeviceFactory.register() mà không sửa code Factory.
   */
  static #registry = new Map([
    ["temp", TemperatureHandler],
    ["humid", HumidityHandler],
    ["light", LightHandler],
    ["fan", FanHandler],
    ["servo", ServoHandler],
    ["ledred", LEDHandler],
    ["ledrgb", LEDRGBHandler],
  ]);

  /**
   * Factory Method: Tạo handler phù hợp dựa trên feedName.
   *
   * @param {string} feedName - Tên feed MQTT (vd: 'temp', 'fan', 'humid')
   * @returns {DeviceHandler} Handler tương ứng
   */
  static createHandler(feedName) {
    const HandlerClass = DeviceFactory.#registry.get(feedName);
    if (HandlerClass) {
      return new HandlerClass();
    }
    // Fallback: trả về base handler cho thiết bị chưa đăng ký
    console.warn(
      `[DeviceFactory] Không tìm thấy handler cho feed "${feedName}", dùng handler mặc định.`
    );
    return new DeviceHandler();
  }

  /**
   * Đăng ký thêm loại thiết bị mới vào Factory (OCP — Open for extension).
   * Ví dụ: DeviceFactory.register('gas', GasSensorHandler);
   *
   * @param {string} feedName
   * @param {typeof DeviceHandler} HandlerClass
   */
  static register(feedName, HandlerClass) {
    DeviceFactory.#registry.set(feedName, HandlerClass);
    console.log(`[DeviceFactory] Đã đăng ký handler mới: ${feedName}`);
  }
}

export { DeviceHandler, DeviceFactory as default };
