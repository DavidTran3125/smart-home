import Device from "../models/Device.js";
import User from "../models/User.js";

/**
 * Lấy danh sách ID các thiết bị thuộc Home mà User là thành viên hoặc admin
 */
export const getUserDeviceIds = async (userId) => {
  const user = await User.findById(userId).select("homeId");
  if (!user?.homeId) return [];

  const devices = await Device.find({ homeId: user.homeId }).select("_id");
  return devices.map((d) => d._id);
};

export const verifyDeviceAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deviceId = req.params.deviceId || req.body.deviceId || req.params.id;

    if (!deviceId) return res.status(400).json({ error: "Thiếu deviceId" });

    const device = await Device.findById(deviceId);
    if (!device) return res.status(404).json({ error: "Thiết bị không tồn tại" });

    const user = await User.findById(userId).select("homeId");
    if (!user?.homeId || user.homeId.toString() !== device.homeId.toString()) {
      return res.status(403).json({ error: "Bạn không có quyền truy cập thiết bị này!" });
    }

    req.device = device;

    next();
  } catch (error) {
    res.status(500).json({ error: "Lỗi hệ thống khi xác thực quyền truy cập" });
  }
};
