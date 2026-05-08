import Home from "../models/Home.js";
import Device from "../models/Device.js";

/**
 * Lấy danh sách ID các thiết bị thuộc Home mà User là thành viên hoặc admin
 */
export const getUserDeviceIds = async (userId) => {
  const homes = await Home.find({
    $or: [{ admin: userId }, { members: userId }],
  }).select("_id");
  
  const homeIds = homes.map((h) => h._id);
  const devices = await Device.find({ homeId: { $in: homeIds } }).select("_id");
  
  return devices.map((d) => d._id);
};

export const verifyDeviceAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deviceId = req.params.deviceId || req.body.deviceId || req.params.id;

    if (!deviceId) return res.status(400).json({ error: "Thiếu deviceId" });

    const device = await Device.findById(deviceId);
    if (!device) return res.status(404).json({ error: "Thiết bị không tồn tại" });

    const home = await Home.findOne({
      _id: device.homeId,
      $or: [{ admin: userId }, { members: userId }],
    });

    if (!home) {
      return res.status(403).json({ error: "Bạn không có quyền truy cập thiết bị này!" });
    }

    req.home = home;
    req.device = device;

    next();
  } catch (error) {
    res.status(500).json({ error: "Lỗi hệ thống khi xác thực quyền truy cập" });
  }
};
