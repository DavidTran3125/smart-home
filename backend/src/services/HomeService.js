import mongoose from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Invitation from "../models/Invitation.js";
import User from "../models/User.js";
import Home from "../models/Home.js";
import config from "../config/index.js";
import bcrypt from "bcryptjs";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.gmail || process.env.EMAIL_USER,
    pass: config.gmail_app_pass || process.env.EMAIL_PASS,
  },
});

export const inviteMember = async (adminId, homeId, email) => {
  const token = crypto.randomBytes(32).toString("hex");

  const invitation = await Invitation.create({
    email,
    homeId,
    token,
    status: "pending",
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const registerLink = `${frontendUrl}/register?token=${token}`;

  await transporter.sendMail({
    from: `"Smart Home" <${config.gmail || process.env.EMAIL_USER}>`,
    to: email,
    subject: "Thư mời tham gia quản lý Smart Home",
    html: `
      <h2>Bạn được mời tham gia hệ thống Smart Home</h2>
      <p>Vui lòng click vào link sau để tạo tài khoản: <a href="${registerLink}">Đăng ký</a></p>
      <p>Lưu ý: Link có giá trị trong vòng 7 ngày.</p>
    `,
  });

  return invitation;
};

export const processRegistration = async (token, email, userData) => {
  // BƯỚC 1: Kiểm tra email đăng ký có nằm trong danh sách Invitation (status: pending)
  const invitation = await Invitation.findOne({
    token,
    email,
    status: "pending",
  });

  if (!invitation) {
    throw new Error("Thư mời không tồn tại, đã hết hạn hoặc đã được sử dụng");
  }

  // BƯỚC 2: Tạo User mới
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = new User({ ...userData, email, password: hashedPassword });
  await newUser.save();

  try {
    // BƯỚC 3: Thêm User vào members của Home
    await Home.findByIdAndUpdate(
      invitation.homeId,
      { $push: { members: newUser._id } }
    );

    // BƯỚC 4: Cập nhật Invitation thành accepted
    invitation.status = "accepted";
    await invitation.save();

    return {
      success: true,
      message: "Đăng ký thành công! Vui lòng quay lại màn hình đăng nhập để tiếp tục.",
    };
  } catch (error) {
    // MANUAL ROLLBACK: Xóa User vừa tạo để đảm bảo DB không bị rác
    await User.findByIdAndDelete(newUser._id);
    await Home.findByIdAndUpdate(
      invitation.homeId,
      { $pull: { members: newUser._id } }
    );
    throw new Error("Lỗi hệ thống trong quá trình đăng ký. Vui lòng thử lại sau.");
  }
};

export const removeMember = async (homeId, memberId) => {
  const result = await Home.findByIdAndUpdate(
    homeId,
    { $pull: { members: memberId } },
    { new: true }
  );

  if (!result) throw new Error("Không tìm thấy dữ liệu nhà");
  return { message: "Đã gỡ quyền truy cập của thành viên này khỏi nhà" };
};
