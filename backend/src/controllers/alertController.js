/**
 * Alert Controller
 * Xử lý cảnh báo (alerts) và cấu hình ngưỡng (thresholds).
 */

import Alert from "../models/Alert.js";
import Device from "../models/Device.js";
import ActivityLog from "../models/ActivityLog.js";
import { getUserDeviceIds } from "../middlewares/AccessControlMiddleware.js";

/**
 * GET /api/v1/alerts/active
 * Lấy danh sách cảnh báo đang Active (chưa xử lý).
 */
export const getActiveAlerts = async (req, res) => {
  try {
    const userDeviceIds = await getUserDeviceIds(req.user.id);
    const alerts = await Alert.find({ 
      status: "Chưa xử lý",
      device_id: { $in: userDeviceIds }
    })
      .sort({ detected_at: -1 })
      .populate("device_id", "name feed_name type")
      .lean();

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/alerts
 * Lấy tất cả cảnh báo (có phân trang).
 */
export const getAllAlerts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const userDeviceIds = await getUserDeviceIds(req.user.id);
    const filter = { device_id: { $in: userDeviceIds } };

    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Alert.find(filter)
        .sort({ detected_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("device_id", "name feed_name type")
        .lean(),
      Alert.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: data.length,
      total: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/v1/alerts/:id/resolve
 * Đánh dấu cảnh báo đã xử lý (Admin).
 */
export const resolveAlert = async (req, res) => {
  let oldStatus = null;
  let oldResolvedAt = null;
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy cảnh báo" });
    }

    const userDeviceIds = await getUserDeviceIds(req.user.id);
    if (!userDeviceIds.some(id => id.equals(alert.device_id) || id.toString() === alert.device_id.toString())) {
      return res.status(403).json({ success: false, error: "Bạn không có quyền truy cập cảnh báo này" });
    }

    if (alert.status === "Đã xử lý") {
      return res
        .status(400)
        .json({ success: false, error: "Cảnh báo này đã được xử lý rồi" });
    }

    oldStatus = alert.status;
    oldResolvedAt = alert.resolved_at;

    alert.status = "Đã xử lý";
    alert.resolved_at = new Date();
    await alert.save();

    try {
      // Ghi Activity Log
      await ActivityLog.create({
        user_id: req.user.id,
        device_id: alert.device_id,
        action: "Xử lý cảnh báo",
        description: `Đã xử lý cảnh báo: ${alert.message}`,
      });
    } catch (logError) {
      // MANUAL ROLLBACK
      alert.status = oldStatus;
      alert.resolved_at = oldResolvedAt;
      await alert.save();
      throw new Error("Lỗi hệ thống khi ghi Log. Đã rollback thao tác xử lý Alert.");
    }

    res.json({
      success: true,
      message: "Đã đánh dấu cảnh báo là đã xử lý",
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/thresholds
 * Lấy cấu hình ngưỡng cảnh báo từ tất cả Device.
 */
export const getThresholds = async (req, res) => {
  try {
    const userDeviceIds = await getUserDeviceIds(req.user.id);
    const devices = await Device.find(
      { _id: { $in: userDeviceIds } },
      "name feed_name type threshold_min_value threshold_max_value threshold_is_active"
    )
      .sort({ name: 1 })
      .lean();

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
 * PUT /api/v1/thresholds/:deviceId
 * Cập nhật ngưỡng cảnh báo cho 1 thiết bị (Admin).
 */
export const updateThreshold = async (req, res) => {
  try {
    const { threshold_min_value, threshold_max_value, threshold_is_active } =
      req.body;

    // Lấy device từ verifyDeviceAccess middleware
    const device = req.device;

    const oldMin = device.threshold_min_value;
    const oldMax = device.threshold_max_value;
    const oldActive = device.threshold_is_active;

    // Cập nhật các field threshold
    if (threshold_min_value !== undefined)
      device.threshold_min_value = threshold_min_value;
    if (threshold_max_value !== undefined)
      device.threshold_max_value = threshold_max_value;
    if (threshold_is_active !== undefined)
      device.threshold_is_active = threshold_is_active;

    await device.save();

    try {
      // Ghi Activity Log
      await ActivityLog.create({
        user_id: req.user.id,
        device_id: device._id,
        action: "Cập nhật ngưỡng",
        description: `${device.name}: min=${device.threshold_min_value}, max=${device.threshold_max_value}, active=${device.threshold_is_active}`,
      });
    } catch (logError) {
      // MANUAL ROLLBACK
      device.threshold_min_value = oldMin;
      device.threshold_max_value = oldMax;
      device.threshold_is_active = oldActive;
      await device.save();
      throw new Error("Lỗi khi ghi Log. Đã rollback thao tác cập nhật ngưỡng.");
    }

    res.json({
      success: true,
      message: `Đã cập nhật ngưỡng cho ${device.name}`,
      data: {
        _id: device._id,
        name: device.name,
        feed_name: device.feed_name,
        threshold_min_value: device.threshold_min_value,
        threshold_max_value: device.threshold_max_value,
        threshold_is_active: device.threshold_is_active,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
