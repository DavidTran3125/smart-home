/**
 * Device Controller
 * Xử lý CRUD thiết bị + điều khiển Bật/Tắt qua MQTT.
 */

import Device from "../models/Device.js";
import ActivityLog from "../models/ActivityLog.js";
import MQTTClient from "../services/MQTTClient.js";
import DeviceFactory from "../services/DeviceFactory.js";

/**
 * GET /api/v1/devices
 * Lấy danh sách tất cả thiết bị.
 */
export const getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ name: 1 });
    res.json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/devices/:id
 * Lấy thông tin chi tiết 1 thiết bị.
 */
export const getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy thiết bị" });
    }
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/devices
 * Thêm thiết bị mới (Admin).
 */
export const createDevice = async (req, res) => {
  try {
    const { name, type, model, pin, pin_mode, feed_name,
            threshold_min_value, threshold_max_value, threshold_is_active } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Tên thiết bị (name) là bắt buộc" });
    }

    const device = await Device.create({
      name,
      type,
      model,
      pin,
      pin_mode,
      feed_name,
      threshold_min_value,
      threshold_max_value,
      threshold_is_active,
    });

    // Ghi Activity Log
    await ActivityLog.create({
      user_id: req.user.id,
      device_id: device._id,
      action: "Thêm thiết bị",
      description: `Đã thêm thiết bị mới: ${device.name} (feed: ${device.feed_name || "N/A"})`,
    });

    res.status(201).json({ success: true, data: device });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "feed_name đã tồn tại" });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/v1/devices/:id
 * Cập nhật thông tin cấu hình thiết bị (Admin).
 */
export const updateDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!device) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy thiết bị" });
    }
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/devices/:id/control
 * Điều khiển thiết bị Bật/Tắt → cập nhật DB + publish MQTT + ghi ActivityLog.
 */
export const controlDevice = async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res
        .status(400)
        .json({ success: false, error: "Thiếu giá trị điều khiển (value)" });
    }

    const device = await Device.findById(req.params.id);
    if (!device) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy thiết bị" });
    }

    if (!device.feed_name) {
      return res
        .status(400)
        .json({ success: false, error: "Thiết bị chưa có feed_name để điều khiển" });
    }

    // Dùng Factory để format lệnh điều khiển
    const handler = DeviceFactory.createHandler(device.feed_name);
    const command = handler.formatControlCommand(value);

    // Publish lệnh qua MQTT (Singleton)
    const mqttClient = MQTTClient.getInstance();
    await mqttClient.publishToFeed(device.feed_name, command);

    // Cập nhật trạng thái trong DB
    const newStatus = Number(value) === 0 ? "Tắt" : "Bật";
    device.status = newStatus;
    device.last_seen = new Date();
    await device.save();

    // Ghi Activity Log
    await ActivityLog.create({
      user_id: req.user.id,
      device_id: device._id,
      action: "Điều khiển thiết bị",
      description: `${device.name}: gửi lệnh ${command} → trạng thái ${newStatus}`,
    });

    res.json({
      success: true,
      message: `Đã gửi lệnh ${command} tới ${device.name}`,
      data: {
        device_id: device._id,
        feed_name: device.feed_name,
        command: command,
        status: newStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/v1/devices/:id
 * Xóa thiết bị khỏi hệ thống (Admin).
 */
export const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy thiết bị" });
    }

    // Ghi Activity Log
    await ActivityLog.create({
      user_id: req.user.id,
      device_id: device._id,
      action: "Xóa thiết bị",
      description: `Đã xóa thiết bị: ${device.name} (feed: ${device.feed_name || "N/A"})`,
    });

    res.json({ success: true, message: "Đã xóa thiết bị thành công", data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



