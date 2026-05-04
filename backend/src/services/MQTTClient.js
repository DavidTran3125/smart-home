/**
 * ============================================================
 *  DESIGN PATTERN: Singleton Pattern — MQTTClient
 * ============================================================
 *
 * Đảm bảo toàn bộ ứng dụng chỉ sử dụng DUY NHẤT một kết nối MQTT
 * tới Adafruit IO broker, tránh lãng phí tài nguyên và xung đột luồng dữ liệu.
 *
 * Khi bất kỳ module nào (DeviceController, MQTT handler, ...) cần kết nối MQTT,
 * đều gọi MQTTClient.getInstance() → trả về cùng 1 instance.
 */

import mqtt from "mqtt";
import config from "../config/index.js";

class MQTTClient {
  /** @type {MQTTClient|null} */
  static #instance = null;

  /** @type {import('mqtt').MqttClient|null} */
  #client = null;

  /** @type {boolean} */
  #isConnected = false;

  constructor() {
    if (MQTTClient.#instance) {
      throw new Error(
        "MQTTClient là Singleton! Hãy dùng MQTTClient.getInstance()"
      );
    }

    const MQTT_URL = `mqtts://${config.aio_username}:${config.aio_key}@io.adafruit.com`;
    this.#client = mqtt.connect(MQTT_URL);

    this.#client.on("connect", () => {
      this.#isConnected = true;
      console.log("✅ [MQTTClient Singleton] Đã kết nối tới Adafruit MQTT broker");
    });

    this.#client.on("error", (err) => {
      console.error("❌ [MQTTClient Singleton] MQTT Error:", err.message);
    });

    this.#client.on("close", () => {
      this.#isConnected = false;
    });
  }

  /**
   * Lấy instance duy nhất của MQTTClient (Singleton).
   * @returns {MQTTClient}
   */
  static getInstance() {
    if (!MQTTClient.#instance) {
      MQTTClient.#instance = new MQTTClient();
    }
    return MQTTClient.#instance;
  }

  /**
   * Lấy raw mqtt client để subscribe/on message.
   * @returns {import('mqtt').MqttClient}
   */
  getClient() {
    return this.#client;
  }

  /**
   * Subscribe vào một feed trên Adafruit IO.
   * @param {string} feedName - Tên feed (vd: 'temp', 'fan')
   */
  subscribeFeed(feedName) {
    const topic = `${config.aio_username}/feeds/${feedName}`;
    this.#client.subscribe(topic, (err) => {
      if (err) {
        console.error(`  ❌ Lỗi subscribe feed: ${feedName}`, err.message);
      } else {
        console.log(`  📡 Đang lắng nghe feed: ${feedName}`);
      }
    });
  }

  /**
   * Publish lệnh điều khiển tới một feed.
   * @param {string} feedName - Tên feed
   * @param {string|number} value - Giá trị gửi
   * @returns {Promise<void>}
   */
  publishToFeed(feedName, value) {
    return new Promise((resolve, reject) => {
      const topic = `${config.aio_username}/feeds/${feedName}`;
      this.#client.publish(topic, String(value), {}, (err) => {
        if (err) {
          console.error(`  ❌ Lỗi publish tới ${feedName}:`, err.message);
          reject(err);
        } else {
          console.log(`  📤 Đã gửi lệnh → [${feedName}] = ${value}`);
          resolve();
        }
      });
    });
  }

  /**
   * Đăng ký handler cho sự kiện nhận message.
   * @param {Function} handler - callback(topic, message)
   */
  onMessage(handler) {
    this.#client.on("message", handler);
  }

  /**
   * Kiểm tra trạng thái kết nối.
   */
  isConnected() {
    return this.#isConnected;
  }
}

export default MQTTClient;
