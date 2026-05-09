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

    // 1. Tạo Admin User Demo
    let admin = await User.findOne({ email: "admin@example.com" });
    let home = null;

    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const homeId = new mongoose.Types.ObjectId();

      admin = await User.create({
        username: "admin_demo",
        email: "admin@example.com",
        password: hashedPassword,
        full_name: "Admin Demo",
        role: "Admin",
        homeId,
      });
      console.log("✅ Đã tạo user Admin demo: admin@example.com / admin123");

      home = await Home.create({
        _id: homeId,
        name: "Căn hộ Demo",
        admin: admin._id,
        members: [],
      });
      console.log("✅ Đã tạo Home demo: Căn hộ Demo");
    } else {
      if (admin.homeId) {
        home = await Home.findById(admin.homeId);
      }

      if (!home) {
        home = await Home.findOne({ admin: admin._id });
      }

      if (!home) {
        home = await Home.create({
          name: "Căn hộ Demo",
          admin: admin._id,
          members: [],
        });
        console.log("✅ Đã tạo Home demo: Căn hộ Demo");
      }

      if (!admin.homeId || admin.homeId.toString() !== home._id.toString()) {
        admin.homeId = home._id;
        await admin.save();
      }
    }

    // 3. Hardcode danh sách thiết bị khớp với Adafruit Feeds
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
      // Dùng findOneAndUpdate với upsert để tránh tạo trùng khi chạy lại script
      await Device.findOneAndUpdate(
        { feed_name: dev.feed_name },
        { ...dev, homeId: home._id },
        { upsert: true, new: true },
      );
    }

    console.log("✅ Đã nạp thành công 7 thiết bị vào Home của Admin!");
    process.exit();
  } catch (error) {
    console.error("❌ Lỗi Seeding:", error);
    process.exit(1);
  }
};

seedData();
