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

const buildAutoHomeName = (userData) => {
  const base = userData.full_name || userData.username || "user";
  return `Home of ${base}`;
};

export const inviteMember = async (adminId, homeId, email) => {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Email là bắt buộc");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("Email đã tồn tại. Người dùng đã có home.");
  }

  let invitation = await Invitation.findOne({
    email: normalizedEmail,
    homeId,
    status: "pending",
  });

  if (!invitation) {
    try {
      invitation = await Invitation.create({
        email: normalizedEmail,
        homeId,
        token: crypto.randomBytes(32).toString("hex"),
        status: "pending",
      });
    } catch (error) {
      if (error.code !== 11000) throw error;

      invitation = await Invitation.findOne({
        email: normalizedEmail,
        homeId,
        status: "pending",
      });
    }
  }

  if (!invitation) {
    throw new Error("Không thể tạo thư mời. Vui lòng thử lại.");
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const registerLink = `${frontendUrl}/register?token=${invitation.token}`;

  await transporter.sendMail({
    from: `"Smart Home" <${config.gmail || process.env.EMAIL_USER}>`,
    to: normalizedEmail,
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
  const normalizedEmail = email?.trim().toLowerCase();

  // BƯỚC 1: Kiểm tra email đăng ký có nằm trong danh sách Invitation (status: pending)
  const invitation = await Invitation.findOne({
    token,
    email: normalizedEmail,
    status: "pending",
  });

  if (!invitation) {
    throw new Error("Thư mời không tồn tại, đã hết hạn hoặc đã được sử dụng");
  }

  const existingUser = await User.findOne({
    $or: [{ username: userData.username }, { email: normalizedEmail }],
  });
  if (existingUser) {
    throw new Error("Username hoặc email đã tồn tại");
  }

  // BƯỚC 2: Tạo User mới (gắn vào Home đã mời)
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = new User({
    ...userData,
    email: normalizedEmail,
    password: hashedPassword,
    role: "Gia đình",
    homeId: invitation.homeId,
  });
  await newUser.save();

  try {
    // BƯỚC 3: Thêm User vào members của Home
    const home = await Home.findById(invitation.homeId);
    if (!home) throw new Error("Không tìm thấy nhà được mời");

    await Home.findByIdAndUpdate(invitation.homeId, {
      $addToSet: { members: newUser._id },
    });

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
    await Home.findByIdAndUpdate(invitation.homeId, {
      $pull: { members: newUser._id },
    });
    throw new Error("Lỗi hệ thống trong quá trình đăng ký. Vui lòng thử lại sau.");
  }
};

export const removeMember = async (homeId, memberId) => {
  const home = await Home.findById(homeId);
  if (!home) throw new Error("Không tìm thấy dữ liệu nhà");

  if (home.admin.toString() === memberId.toString()) {
    throw new Error("Không thể gỡ admin khỏi nhà");
  }

  const member = await User.findById(memberId);
  if (!member) throw new Error("Không tìm thấy người dùng");

  if (member.homeId?.toString() !== homeId.toString()) {
    throw new Error("Thành viên không thuộc nhà này");
  }

  const oldHomeId = member.homeId;
  const oldRole = member.role;

  const newHome = await Home.create({
    name: buildAutoHomeName(member),
    admin: memberId,
    members: [],
  });

  try {
    await User.findByIdAndUpdate(memberId, {
      homeId: newHome._id,
      role: "Admin",
    });

    await Home.findByIdAndUpdate(homeId, {
      $pull: { members: memberId },
    });

    return {
      message: "Đã gỡ quyền truy cập của thành viên này khỏi nhà",
      newHomeId: newHome._id,
    };
  } catch (error) {
    await Home.findByIdAndDelete(newHome._id);
    await User.findByIdAndUpdate(memberId, {
      homeId: oldHomeId,
      role: oldRole,
    });
    throw new Error("Lỗi hệ thống khi tách thành viên khỏi nhà. Vui lòng thử lại sau.");
  }
};

export const listMembers = async (homeId) => {
  // User.homeId is the access-control source of truth, so this includes the admin.
  return await User.find({ homeId }).select("-password");
};
