import User from "../models/User.js";
import Device from "../models/Device.js";
import ActivityLog from "../models/ActivityLog.js";
import Alert from "../models/Alert.js";
import Home from "../models/Home.js";
import { normalizeDeviceStatus } from "../utils/deviceStatus.js";
import bcrypt from "bcrypt";

const SYSTEM_ADMIN_ROLE = "SystemAdmin";
const ACTIVE_STATUS = "active";
const INVALID_STATUS = "invalid";

const buildPagination = ({ page = 1, limit = 50 } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
};

const removeRestrictedUserFields = (data) => {
  const allowedFields = ["username", "email", "full_name", "phone"];
  return allowedFields.reduce((result, field) => {
    if (data[field] !== undefined) result[field] = data[field];
    return result;
  }, {});
};

const escapeRegExp = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const assertCanInvalidateUser = async (targetUser, actorId) => {
  if (!targetUser) throw new Error("Không tìm thấy người dùng");

  if (targetUser._id.toString() === actorId.toString()) {
    throw new Error("System admin không thể vô hiệu hóa chính mình");
  }

  if (targetUser.role === SYSTEM_ADMIN_ROLE) {
    const activeSystemAdmins = await User.countDocuments({
      role: SYSTEM_ADMIN_ROLE,
      status: ACTIVE_STATUS,
    });

    if (activeSystemAdmins <= 1) {
      throw new Error("Không thể vô hiệu hóa SystemAdmin hoạt động cuối cùng");
    }
  }
};

export const getUsers = async (query) => {
  const { status, role, search } = query;
  const { pageNum, limitNum, skip } = buildPagination(query);

  const filter = {};
  if (status) filter.status = status;
  if (role) filter.role = role;
  if (search) {
    const regex = new RegExp(escapeRegExp(search), "i");
    filter.$or = [
      { username: regex },
      { email: regex },
      { full_name: regex },
    ];
  }

  const [data, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("homeId", "name admin")
      .populate("invalidated_by", "username email full_name role")
      .populate("reactivated_by", "username email full_name role")
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    count: data.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data,
  };
};

export const getUserById = async (id) => {
  const user = await User.findById(id)
    .select("-password")
    .populate("homeId", "name admin")
    .populate("invalidated_by", "username email full_name role")
    .populate("reactivated_by", "username email full_name role")
    .lean();

  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
};

export const updateUser = async (id, data) => {
  const updateData = removeRestrictedUserFields(data);
  if (Object.keys(updateData).length === 0) {
    throw new Error("Không có trường hợp lệ để cập nhật");
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .populate("homeId", "name admin");

  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
};

export const invalidateUser = async (id, actorId, reason) => {
  const user = await User.findById(id);
  await assertCanInvalidateUser(user, actorId);

  user.status = INVALID_STATUS;
  user.invalidated_at = new Date();
  user.invalidated_by = actorId;
  user.invalid_reason = reason || "System admin revoked account access";
  await user.save();

  return await getUserById(user._id);
};

export const reactivateUser = async (id, actorId) => {
  const user = await User.findById(id);
  if (!user) throw new Error("Không tìm thấy người dùng");

  user.status = ACTIVE_STATUS;
  user.reactivated_at = new Date();
  user.reactivated_by = actorId;
  await user.save();

  return await getUserById(user._id);
};

export const getDevices = async (query) => {
  const { status, homeId, search } = query;
  const { pageNum, limitNum, skip } = buildPagination(query);

  const filter = {};
  if (status) filter.status = normalizeDeviceStatus(status);
  if (homeId) filter.homeId = homeId;
  if (search) {
    const regex = new RegExp(escapeRegExp(search), "i");
    filter.$or = [{ name: regex }, { feed_name: regex }, { type: regex }];
  }

  const [devices, total] = await Promise.all([
    Device.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate("homeId", "name admin")
      .populate("owner_id", "username email full_name role status")
      .lean(),
    Device.countDocuments(filter),
  ]);

  const deviceIds = devices.map((device) => device._id);
  const activeAlerts = await Alert.find({
    device_id: { $in: deviceIds },
    status: "Chưa xử lý",
  })
    .select("device_id")
    .lean();

  const alertDeviceIds = new Set(
    activeAlerts.map((alert) => alert.device_id.toString())
  );
  const onlineCutoff = Date.now() - 5 * 60 * 1000;

  const data = devices.map((device) => ({
    ...device,
    condition: {
      connectivity:
        device.last_seen && new Date(device.last_seen).getTime() >= onlineCutoff
          ? "online"
          : "offline",
      power: device.status === "Bật" ? "on" : "off",
      alert: alertDeviceIds.has(device._id.toString()) ? "alerting" : "normal",
    },
  }));

  return {
    count: data.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data,
  };
};

export const getLogs = async (query) => {
  const { action, user_id, device_id, homeId, from, to } = query;
  const { pageNum, limitNum, skip } = buildPagination(query);

  const filter = {};
  if (action) filter.action = action;
  if (user_id) filter.user_id = user_id;
  if (device_id) filter.device_id = device_id;

  if (homeId) {
    const devices = await Device.find({ homeId }).select("_id").lean();
    const deviceIds = devices.map((device) => device._id);

    if (filter.device_id) {
      const isInHome = deviceIds.some(
        (id) => id.toString() === filter.device_id.toString()
      );
      if (!isInHome) {
        return { count: 0, total: 0, page: pageNum, totalPages: 0, data: [] };
      }
    } else {
      filter.device_id = { $in: deviceIds };
    }
  }

  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("user_id", "username email full_name role status homeId")
      .populate("device_id", "name feed_name type status homeId")
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  const homeIds = [
    ...new Set(
      logs
        .map((log) => log.device_id?.homeId?.toString())
        .filter(Boolean)
    ),
  ];
  const homes = await Home.find({ _id: { $in: homeIds } }).select("name admin").lean();
  const homeById = new Map(homes.map((home) => [home._id.toString(), home]));

  const data = logs.map((log) => {
    const logHomeId = log.device_id?.homeId?.toString();
    return {
      ...log,
      home: logHomeId ? homeById.get(logHomeId) || null : null,
    };
  });

  return {
    count: data.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data,
  };
};












// HÀM MỚI 1: Tạo User (dành riêng cho Admin)
export const createAdminUser = async (userData) => {
  const { email, username, password } = userData;
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new Error("Email hoặc Username đã tồn tại");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ ...userData, password: hashedPassword, status: "active" });
  await newUser.save();
  return newUser;
};

// HÀM MỚI 2: Xóa vĩnh viễn khỏi Database (Hard Delete)
export const hardDeleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error("Không tìm thấy người dùng");
  await User.findByIdAndDelete(id);
  return { message: "Đã xóa vĩnh viễn người dùng khỏi hệ thống" };
};

// HÀM MỚI 3: Toggle Trạng thái (Bật/Tắt)
export const toggleStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error("Không tìm thấy người dùng");
  user.status = user.status === "active" ? "invalid" : "active";
  await user.save();
  return user;
};