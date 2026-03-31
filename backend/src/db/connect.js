import mongoose from "mongoose";
import config from "../config/index.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongo_uri);
    console.log("✅ Đã kết nối thành công tới MongoDB");
  } catch (error) {
    console.error("❌ Lỗi kết nối tới MongoDB: ", error);
  }
};

export default connectDB;
