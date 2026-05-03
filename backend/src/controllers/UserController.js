import * as userService from "../services/UserService.js";

export const getUsers = async (req, res) => {
  const users = await userService.getUsers();
  res.json({ success: true, data: users });
};

export const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  res.json({ success: true, data: user });
};

export const updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({ success: true, data: user });
};

export const deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({ success: true });
};
