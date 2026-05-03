import * as authService from "../services/AuthService.js";

export const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const me = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, data: user });
};
