import mongoose from "mongoose";
import connectDB from "./src/db/connect.js";
import User from "./src/models/User.js";
import Home from "./src/models/Home.js";

await connectDB();

const homeId = new mongoose.Types.ObjectId();
const user = await User.create({
  username: "test",
  password: "123456",
  full_name: "Test",
  email: "test@gmail.com",
  role: "Admin",
  homeId,
});

await Home.create({
  _id: homeId,
  name: "Home of Test",
  admin: user._id,
  members: [],
});

console.log("✅ Thêm người dùng thành công");
process.exit();
