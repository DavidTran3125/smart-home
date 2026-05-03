import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getUsers = async () => {
  return await User.find().select("-password");
};

export const createUser = async (data) => {
  const hashed = await bcrypt.hash(data.password, 10);

  return await User.create({
    ...data,
    password: hashed,
  });
};

export const updateUser = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return await User.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};
