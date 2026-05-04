/**
 * User Controller
 * Xử lý CRUD người dùng (Admin only).
 */

import * as userService from "../services/UserService.js";

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    // Loại bỏ password khỏi response
    const { password, ...userData } = user.toObject();
    res.status(201).json({ success: true, data: userData });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy người dùng" });
    }
    const { password, ...userData } = user.toObject();
    res.json({ success: true, data: userData });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy người dùng" });
    }
    res.json({ success: true, message: "Đã xoá người dùng thành công" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
