/**
 * Sensor Controller
 * Xử lý truy vấn dữ liệu cảm biến: mới nhất (dashboard) và lịch sử (biểu đồ).
 */

import SensorData from "../models/SensorData.js";
import Device from "../models/Device.js";

/**
 * GET /api/v1/sensors/latest
 * Lấy dữ liệu cảm biến MỚI NHẤT cho mỗi loại cảm biến (group by type).
 * Dùng cho Dashboard hiển thị real-time.
 */
export const getLatestSensorData = async (req, res) => {
  try {
    // Aggregation: lấy bản ghi mới nhất cho mỗi type
    const latestData = await SensorData.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$type",
          device_id: { $first: "$device_id" },
          value: { $first: "$value" },
          unit: { $first: "$unit" },
          timestamp: { $first: "$timestamp" },
          doc_id: { $first: "$_id" },
        },
      },
      {
        $project: {
          _id: "$doc_id",
          type: "$_id",
          device_id: 1,
          value: 1,
          unit: 1,
          timestamp: 1,
        },
      },
    ]);

    // Populate device info
    const populated = await Device.populate(latestData, {
      path: "device_id",
      select: "name feed_name status",
    });

    res.json({
      success: true,
      count: populated.length,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/sensors/history
 * Lấy lịch sử dữ liệu cảm biến với phân trang và bộ lọc.
 *
 * Query params:
 *   - device_id  : ID thiết bị (optional)
 *   - type       : Loại cảm biến: temperature, humidity, light (optional)
 *   - from       : Thời gian bắt đầu ISO string (optional)
 *   - to         : Thời gian kết thúc ISO string (optional)
 *   - page       : Trang hiện tại (default: 1)
 *   - limit      : Số bản ghi mỗi trang (default: 50, max: 200)
 */
export const getSensorHistory = async (req, res) => {
  try {
    const {
      device_id,
      type,
      from,
      to,
      page = 1,
      limit = 50,
    } = req.query;

    // Xây dựng bộ lọc
    const filter = {};

    if (device_id) {
      filter.device_id = device_id;
    }

    if (type) {
      filter.type = type;
    }

    // Lọc theo khoảng thời gian
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    // Phân trang
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Query với sort desc theo timestamp
    const [data, total] = await Promise.all([
      SensorData.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("device_id", "name feed_name")
        .lean(),
      SensorData.countDocuments(filter),
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
