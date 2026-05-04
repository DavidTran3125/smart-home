/**
 * Log Controller
 * Xử lý truy vấn lịch sử hoạt động hệ thống (Activity Logs).
 */

import ActivityLog from "../models/ActivityLog.js";

/**
 * GET /api/v1/logs
 * Lấy danh sách Activity Logs (Admin only).
 *
 * Query params:
 *   - action    : Lọc theo loại hành động (optional)
 *   - user_id   : Lọc theo người thực hiện (optional)
 *   - device_id : Lọc theo thiết bị (optional)
 *   - from      : Thời gian bắt đầu ISO string (optional)
 *   - to        : Thời gian kết thúc ISO string (optional)
 *   - page      : Trang hiện tại (default: 1)
 *   - limit     : Số bản ghi mỗi trang (default: 20, max: 100)
 */
export const getLogs = async (req, res) => {
  try {
    const {
      action,
      user_id,
      device_id,
      from,
      to,
      page = 1,
      limit = 20,
    } = req.query;

    // Xây dựng bộ lọc
    const filter = {};

    if (action) filter.action = action;
    if (user_id) filter.user_id = user_id;
    if (device_id) filter.device_id = device_id;

    // Lọc theo khoảng thời gian
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    // Phân trang
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Query với populate user_id và device_id
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
