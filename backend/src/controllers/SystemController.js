import * as systemService from "../services/SystemService.js";

const sendError = (res, error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {}).join(", ") || "unique field";
    return res
      .status(400)
      .json({ success: false, error: `Giá trị đã tồn tại cho trường: ${field}` });
  }

  const notFound = error.message.includes("Không tìm thấy");
  const badRequest =
    error.message.includes("Không có trường") ||
    error.message.includes("không thể") ||
    error.message.includes("Không thể");

  const status = notFound ? 404 : badRequest ? 400 : 500;
  res.status(status).json({ success: false, error: error.message });
};

export const getUsers = async (req, res) => {
  try {
    const result = await systemService.getUsers(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    sendError(res, error);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await systemService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    sendError(res, error);
  }
};

export const invalidateUser = async (req, res) => {
  try {
    const user = await systemService.invalidateUser(
      req.params.id,
      req.user.id,
      req.body.reason
    );
    res.json({
      success: true,
      message: "Đã vô hiệu hóa tài khoản người dùng",
      data: user,
    });
  } catch (error) {
    sendError(res, error);
  }
};

export const reactivateUser = async (req, res) => {
  try {
    const user = await systemService.reactivateUser(req.params.id, req.user.id);
    res.json({
      success: true,
      message: "Đã khôi phục tài khoản người dùng",
      data: user,
    });
  } catch (error) {
    sendError(res, error);
  }
};

export const getDevices = async (req, res) => {
  try {
    const result = await systemService.getDevices(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    sendError(res, error);
  }
};

export const getLogs = async (req, res) => {
  try {
    const result = await systemService.getLogs(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    sendError(res, error);
  }
};












// Controller cho tạo mới
export const createUserController = async (req, res) => {
  try {
    const user = await systemService.createAdminUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
