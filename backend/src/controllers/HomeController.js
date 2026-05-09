import {
  inviteMember,
  processRegistration,
  removeMember,
  listMembers,
} from "../services/HomeService.js";
import Home from "../models/Home.js";
import User from "../models/User.js";

export const createHome = async (req, res) => {
  try {
    const { name } = req.body;
    const adminId = req.user.id;

    const existingHome = await Home.findOne({ admin: adminId });
    if (existingHome) {
      return res
        .status(400)
        .json({ error: "Người dùng đã có home. Không thể tạo thêm." });
    }

    const adminUser = await User.findById(adminId).select("full_name username");
    const fallbackName = adminUser
      ? `Home of ${adminUser.full_name || adminUser.username || "user"}`
      : "Home";

    const newHome = new Home({
      name: name || fallbackName,
      admin: adminId,
      members: [],
    });

    await newHome.save();
    await User.findByIdAndUpdate(adminId, { homeId: newHome._id, role: "Admin" });
    res.status(201).json({ success: true, data: newHome });
  } catch (error) {
    const status = error.message.includes("Email đã tồn tại") ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
};

export const handleInvite = async (req, res) => {
  try {
    const { homeId } = req.params;
    const { email } = req.body;
    const adminId = req.user.id;

    const home = await Home.findOne({ _id: homeId, admin: adminId });
    if (!home) return res.status(403).json({ error: "Bạn không phải admin của nhà này" });

    const invitation = await inviteMember(adminId, homeId, email);
    res.json({ success: true, message: "Đã gửi thư mời", data: invitation });
  } catch (error) {
    let status = 500;

    if (error.message === "Email là bắt buộc") status = 400;
    else if (error.message === "Email đã tồn tại. Người dùng đã có home.") status = 409;

    res.status(status).json({ error: error.message });
  }
};

export const handleRegister = async (req, res) => {
  try {
    const { token, email, username, password, full_name } = req.body;
    const result = await processRegistration(token, email, { username, password, full_name });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const handleRemoveMember = async (req, res) => {
  try {
    const { homeId, memberId } = req.params;
    const adminId = req.user.id;

    const home = await Home.findOne({ _id: homeId, admin: adminId });
    if (!home) return res.status(403).json({ error: "Bạn không phải admin của nhà này" });

    const result = await removeMember(homeId, memberId);
    res.json({
      success: true,
      message: result.message,
      data: { newHomeId: result.newHomeId },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleListMembers = async (req, res) => {
  try {
    const { homeId } = req.params;
    const adminId = req.user.id;

    const home = await Home.findOne({ _id: homeId, admin: adminId });
    if (!home) return res.status(403).json({ error: "Bạn không phải admin của nhà này" });

    const users = await listMembers(homeId);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
