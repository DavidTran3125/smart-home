/**
 * Device Controller
 * Xử lý CRUD thiết bị + điều khiển Bật/Tắt qua MQTT.
 */

import Device from "../models/Device.js";
import ActivityLog from "../models/ActivityLog.js";
import MQTTClient from "../services/MQTTClient.js";
import DeviceFactory from "../services/DeviceFactory.js";
import Home from "../models/Home.js";
import { getUserDeviceIds } from "../middlewares/AccessControlMiddleware.js";
import {
  getStatusFromControlValue,
  normalizeDeviceStatus,
} from "../utils/deviceStatus.js";

/**
 * GET /api/v1/devices
 * Lấy danh sách tất cả thiết bị.
 */
export const getAllDevices = async (req, res) => {
  try {
    const userDeviceIds = await getUserDeviceIds(req.user.id);
    const devices = await Device.find({ _id: { $in: userDeviceIds } }).sort({ name: 1 });
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
    // req.device đã được gắn bởi verifyDeviceAccess middleware
    res.json({ success: true, data: req.device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/devices
 * Thêm thiết bị mới (Admin).
 */
export const createDevice = async (req, res) => {
  let createdDevice = null;
  try {
    const { name, type, model, pin, pin_mode, feed_name, status,
            threshold_min_value, threshold_max_value, threshold_is_active, homeId } = req.body;

    if (!name || !homeId) {
      return res
        .status(400)
        .json({ success: false, error: "Tên thiết bị (name) và nhà (homeId) là bắt buộc" });
    }

    // Kiểm tra Home và quyền Admin
    const home = await Home.findOne({ _id: homeId, admin: req.user.id });
    if (!home) {
      return res.status(403).json({ success: false, error: "Bạn không có quyền thêm thiết bị vào nhà này" });
    }

    createdDevice = await Device.create({
      name,
      type,
      model,
      pin,
      pin_mode,
      feed_name,
      status: normalizeDeviceStatus(status),
      homeId,
      owner_id: home.admin,
      threshold_min_value,
      threshold_max_value,
      threshold_is_active,
    });

    try {
      // Ghi Activity Log
      await ActivityLog.create({
        user_id: req.user.id,
        device_id: createdDevice._id,
        action: "Thêm thiết bị",
        description: `Đã thêm thiết bị mới: ${createdDevice.name} (feed: ${createdDevice.feed_name || "N/A"})`,
      });
    } catch (logError) {
      // MANUAL ROLLBACK
      await Device.findByIdAndDelete(createdDevice._id);
      throw new Error("Lỗi khi ghi Log hệ thống. Đã rollback thao tác tạo thiết bị.");
    }

    res.status(201).json({ success: true, data: createdDevice });
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
    const updateData = { ...req.body };
    delete updateData.homeId;
    delete updateData.owner_id;

    if (updateData.status !== undefined) {
      updateData.status = normalizeDeviceStatus(updateData.status);
    }

    const device = await Device.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    // Lỗi Not Found đã được handle một phần ở middleware nhưng lỡ middleware chạy trước ghi đè thì vẫn cần return
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
  let oldStatus = null;
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res
        .status(400)
        .json({ success: false, error: "Thiếu giá trị điều khiển (value)" });
    }

    const device = req.device; // Lấy từ middleware

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

    oldStatus = device.status;
    const newStatus = getStatusFromControlValue(value);
    
    // BƯỚC 1: Cập nhật trạng thái trong DB
    device.status = newStatus;
    device.last_seen = new Date();
    await device.save();

    try {
      // BƯỚC 2: Ghi Activity Log
      await ActivityLog.create({
        user_id: req.user.id,
        device_id: device._id,
        action: "Điều khiển thiết bị",
        description: `Gửi lệnh ${command} tới ${device.name} → trạng thái ${newStatus}`,
      });
    } catch (logError) {
      // MANUAL ROLLBACK
      device.status = oldStatus;
      await device.save();
      throw new Error("Lỗi hệ thống khi ghi Log. Đã rollback thao tác điều khiển.");
    }

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
    const device = req.device;

    // Manual Rollback cho Delete (Ghi Log trước, Xóa sau để tránh mất dữ liệu device nếu ghi log thất bại)
    try {
      await ActivityLog.create({
        user_id: req.user.id,
        device_id: device._id,
        action: "Xóa thiết bị",
        description: `Đã xóa thiết bị: ${device.name} (feed: ${device.feed_name || "N/A"})`,
      });
    } catch (logError) {
      throw new Error("Lỗi khi ghi Log. Không thể xóa thiết bị.");
    }

    await Device.findByIdAndDelete(device._id);

    res.json({ success: true, message: "Đã xóa thiết bị thành công", data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


