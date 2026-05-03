// import dotenv from 'dotenv';
import express from "express";
import mqttConfig from "./src/config/mqtt.js";
import config from "./src/config/index.js";
import connectDB from "./src/db/connect.js";

import authRoutes from "./src/routes/AuthRoutes.js";
import userRoutes from "./src/routes/UserRoutes.js";

// dotenv.config();
connectDB();

const { client, latestData } = mqttConfig;

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.get("/api/iot-data", (req, res) => {
  res.json({
    success: true,
    message: "Dữ liệu mới nhất từ thiết bị IoT",
    data: latestData,
  });
});

app.post("/api/iot-control", (req, res) => {
  const { feedName, value } = req.body;

  if (!feedName || value === undefined) {
    return res
      .status(400)
      .json({ error: "Body cần phải truyền feedName và value" });
  }

  const topic = `${config.aio_username}/feeds/${feedName}`;

  client.publish(topic, String(value), {}, (err) => {
    if (err) {
      console.error(`❌ Lỗi khi gửi lệnh tới ${topic}`, err);
      return res.status(500).json({ error: "Không thể gửi lệnh cho thiết bị" });
    }
    console.log(` Đã gửi lệnh - Feed: [${feedName}], Giá trị lệnh: [${value}]`);
    res.json({
      success: true,
      message: `Đã gửi lệnh ${value} tới điều khiển ${feedName}`,
    });
  });
});

app.listen(port, () => {
  console.log(`\n Server Express đang chạy tại http://localhost:${port}`);
  console.log(`👉 API xem dữ liệu: GET http://localhost:${port}/api/iot-data`);
  console.log(
    `👉 API điều khiển: Lệnh POST tới http://localhost:${port}/api/iot-control\n`,
  );
});
