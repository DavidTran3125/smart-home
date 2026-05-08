import { inviteMember, processRegistration, removeMember } from "../services/HomeService.js";
import Home from "../models/Home.js";

export const createHome = async (req, res) => {
  try {
    const { name } = req.body;
    const adminId = req.user.id;

    const newHome = new Home({
      name,
      admin: adminId,
    });

    await newHome.save();
    res.status(201).json({ success: true, data: newHome });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleInvite = async (req, res) => {
  try {
    const { homeId, email } = req.body;
    const adminId = req.user.id;

    const home = await Home.findOne({ _id: homeId, admin: adminId });
    if (!home) return res.status(403).json({ error: "Bạn không phải admin của nhà này" });

    const invitation = await inviteMember(adminId, homeId, email);
    res.json({ success: true, message: "Đã gửi thư mời", data: invitation });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
