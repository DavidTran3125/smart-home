import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";
import Home from "../src/models/Home.js";
import Device from "../src/models/Device.js";
import connectDB from "../src/db/connect.js";
import dotenv from "dotenv";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    const systemAdminPassword = await bcrypt.hash("systemadmin123", 10);
    const adminPassword = await bcrypt.hash("admin123", 10);
    const member1Password = await bcrypt.hash("member123", 10);
    const member2Password = await bcrypt.hash("member456", 10);

    const systemAdmin = await User.create({
      username: "system_admin",
      email: "systemadmin@example.com",
      password: systemAdminPassword,
      full_name: "System Admin Demo",
      role: "SystemAdmin",
      status: "active",
      homeId: undefined,
    });
    console.log("✅ Đã tạo SystemAdmin demo: systemadmin@example.com / systemadmin123");

    const homeId = new mongoose.Types.ObjectId();
    const admin = await User.create({
      username: "admin_demo",
      email: "admin@example.com",
      password: adminPassword,
      full_name: "Admin Demo",
      role: "Admin",
      status: "active",
      homeId,
    });
    console.log("✅ Đã tạo user Admin demo: admin@example.com / admin123");

    const member1 = await User.create({
      username: "family_member_1",
      email: "member1@example.com",
      password: member1Password,
      full_name: "Family Member 1",
      role: "Gia đình",
      status: "active",
      homeId,
    });

    const member2 = await User.create({
      username: "family_member_2",
      email: "member2@example.com",
      password: member2Password,
      full_name: "Family Member 2",
      role: "Gia đình",
      status: "active",
      homeId,
    });

    console.log("✅ Đã tạo 2 user Gia đình demo: member1@example.com / member123, member2@example.com / member456");

    const home = await Home.create({
      _id: homeId,
      name: "Căn hộ Demo",
      admin: admin._id,
      members: [member1._id, member2._id],
    });
    console.log("✅ Đã tạo Home demo: Căn hộ Demo");

    const devices = [
      {
        name: "Cảm biến Nhiệt độ",
        type: "Sensor",
        model: "DHT11",
        feed_name: "temp",
      },
      {
        name: "Cảm biến Độ ẩm",
        type: "Sensor",
        model: "DHT11",
        feed_name: "humid",
      },
      {
        name: "Cảm biến Ánh sáng",
        type: "Sensor",
        model: "LDR",
        feed_name: "light",
      },
      {
        name: "Quạt thông gió",
        type: "Actuator",
        model: "DC Motor",
        feed_name: "fan",
      },
      {
        name: "Đèn LED Đỏ",
        type: "Actuator",
        model: "LED",
        feed_name: "ledred",
      },
      {
        name: "Đèn LED RGB",
        type: "Actuator",
        model: "LED RGB",
        feed_name: "ledrgb",
      },
      {
        name: "Cửa tự động",
        type: "Actuator",
        model: "Servo SG90",
        feed_name: "servo",
      },
    ];

    console.log("⏳ Đang nạp thiết bị vào DB...");
    for (const dev of devices) {
      await Device.create({
        ...dev,
        homeId: home._id,
        owner_id: admin._id,
      });
    }

    console.log("✅ Đã nạp thành công 7 thiết bị vào Home của Admin!");
    process.exit();
  } catch (error) {
    console.error("❌ Lỗi Seeding:", error);
    process.exit(1);
  }
};

seedData();
