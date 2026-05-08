/**
 * Log Controller
 * Xử lý truy vấn lịch sử hoạt động hệ thống (Activity Logs).
 */

import ActivityLog from "../models/ActivityLog.js";
import { getUserDeviceIds } from "../middlewares/AccessControlMiddleware.js";

/**
 * GET /api/v1/logs
 * Lấy danh sách Activity Logs thuộc các thiết bị trong nhà của user.
 */
export const getLogs = async (req, res) => {
  try {
    const { action, user_id, device_id, from, to, page = 1, limit = 20 } = req.query;

    const userDeviceIds = await getUserDeviceIds(req.user.id);

    // Bắt buộc filter theo thiết bị thuộc Home của User
    const filter = { device_id: { $in: userDeviceIds } };

    if (action) filter.action = action;
    if (user_id) filter.user_id = user_id;
    if (device_id) {
      // Đảm bảo device_id truyền lên phải nằm trong list thiết bị được phép
      if (userDeviceIds.some((id) => id.equals(device_id) || id.toString() === device_id)) {
        filter.device_id = device_id;
      } else {
        return res.status(403).json({ success: false, error: "Không có quyền truy cập log của thiết bị này" });
      }
    }

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("user_id", "username full_name email role")
        .populate("device_id", "name feed_name type")
        .lean(),
      ActivityLog.countDocuments(filter),
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
 * PUT /api/v1/logs/mark-read
 * Đánh dấu log là đã xem.
 */
export const markLogsAsRead = async (req, res) => {
  try {
    const userDeviceIds = await getUserDeviceIds(req.user.id);
    const { logIds } = req.body;

    const filter = {
      device_id: { $in: userDeviceIds },
      is_read: false,
    };

    if (logIds && logIds.length > 0) {
      filter._id = { $in: logIds };
    }

    const result = await ActivityLog.updateMany(filter, { $set: { is_read: true } });

    res.json({
      success: true,
      message: `Đã đánh dấu ${result.modifiedCount} log là đã đọc`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
