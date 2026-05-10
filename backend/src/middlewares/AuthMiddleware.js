import jwt from "jsonwebtoken";
import config from "../config/index.js";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, config.jwt_secret);

    const user = await User.findById(decoded.id).select(
      "role status homeId username email full_name"
    );

    if (!user) {
      return res.status(401).json({ error: "Tài khoản không tồn tại" });
    }

    if (user.status === "invalid") {
      return res.status(403).json({ error: "Tài khoản đã bị vô hiệu hóa" });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      status: user.status,
      homeId: user.homeId,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
    };

    next();
  } catch {
    res.status(401).json({ error: "Token không hợp lệ" });
  }
};
