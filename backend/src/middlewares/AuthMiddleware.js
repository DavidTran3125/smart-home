import jwt from "jsonwebtoken";
import config from "../config/index.js";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token không hợp lệ" });
  }
};
