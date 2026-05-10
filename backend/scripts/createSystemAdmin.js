import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../src/db/connect.js";
import User from "../src/models/User.js";

dotenv.config();

const SYSTEM_ADMIN_USERNAME = process.env.SYSTEM_ADMIN_USERNAME || "system_admin";
const SYSTEM_ADMIN_EMAIL = process.env.SYSTEM_ADMIN_EMAIL || "systemadmin@example.com";
const SYSTEM_ADMIN_PASSWORD = process.env.SYSTEM_ADMIN_PASSWORD || "systemadmin123";
const SYSTEM_ADMIN_FULL_NAME = process.env.SYSTEM_ADMIN_FULL_NAME || "System Admin";

const createSystemAdmin = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash(SYSTEM_ADMIN_PASSWORD, 10);

    let user = await User.findOne({ email: SYSTEM_ADMIN_EMAIL });

    if (!user) {
      user = new User({ email: SYSTEM_ADMIN_EMAIL });
    }

    user.username = SYSTEM_ADMIN_USERNAME;
    user.email = SYSTEM_ADMIN_EMAIL;
    user.password = hashedPassword;
    user.full_name = SYSTEM_ADMIN_FULL_NAME;
    user.role = "SystemAdmin";
    user.status = "active";
    user.homeId = undefined;
    await user.save();

    user.password = undefined;

    console.log("✅ SystemAdmin đã sẵn sàng:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Password: ${SYSTEM_ADMIN_PASSWORD}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi tạo SystemAdmin:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createSystemAdmin();
