import mongoose from "mongoose";
import User from "../models/User.js";
import Home from "../models/Home.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/index.js";

const buildAutoHomeName = (userData) => {
  const base = userData.full_name || userData.username || "user";
  return `Home of ${base}`;
};

export const register = async (data) => {
  const { username, password, email, full_name } = data;

  const existing = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existing) throw new Error("Người dùng đã tồn tại");

  const hashed = await bcrypt.hash(password, 10);

  const homeId = new mongoose.Types.ObjectId();
  const user = await User.create({
    username,
    password: hashed,
    email,
    full_name,
    role: "Admin",
    homeId,
  });

  try {
    const home = await Home.create({
      _id: homeId,
      name: buildAutoHomeName(user),
      admin: user._id,
      members: [],
    });

    const { password: _, ...userData } = user.toObject();
    return { user: userData, home };
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw new Error("Lỗi hệ thống khi tạo nhà cho người dùng. Vui lòng thử lại.");
  }
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Sai email hoặc mật khẩu");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Sai email hoặc mật khẩu");

  const token = jwt.sign({ id: user._id, role: user.role }, config.jwt_secret, {
    expiresIn: "1d",
  });

  const { password: _, ...userData } = user.toObject();

  return { user: userData, token };
};

export const getMe = async (userId) => {
  return await User.findById(userId).select("-password");
};
