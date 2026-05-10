export const isAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

export const isSystemAdmin = (req, res, next) => {
  if (req.user.role !== "SystemAdmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};
