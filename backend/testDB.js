import mongoose from "mongoose";
import connectDB from "./src/db/connect.js";
import User from "./src/models/User.js";

await connectDB();

await User.create({
  username: "test",
  password: "123456",
  full_name: "Test",
  email: "test@gmail.com",
});

console.log("✅ Thêm người dùng thành công");
process.exit();
