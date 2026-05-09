/**
 * Alert Mailer — Gửi email cảnh báo tới users trong cùng Home
 *
 * Khi hệ thống phát hiện ngưỡng bị vượt, module này sẽ:
 * 1. Query User cùng Home với thiết bị để lấy danh sách email
 * 2. Gửi email cảnh báo tới từng người
 */

import nodemailer from "nodemailer";
import config from "../config/index.js";
import User from "../models/User.js";

/**
 * Tạo nội dung HTML cho email cảnh báo.
 */
function buildAlertHTML({ deviceName, type, value, unit, severity, message, threshold, direction }) {
  const severityColors = {
    "Cao": "#ff0000",
    "Trung bình": "#ff8c00",
    "Thấp": "#ffd700",
  };
  const color = severityColors[severity] || "#ff4d4f";

  return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
  <div style="max-width:500px;margin:auto;background:#fff;padding:24px;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    
    <h2 style="color:${color};">🚨 CẢNH BÁO HỆ THỐNG SMART HOME</h2>
    
    <div style="background:#fff3f3;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:4px 0;color:#333;"><strong>Thiết bị:</strong> ${deviceName}</p>
      <p style="margin:4px 0;color:#333;"><strong>Loại:</strong> ${type}</p>
      <p style="margin:4px 0;color:#333;"><strong>Mức độ:</strong> 
        <span style="color:${color};font-weight:bold;">${severity}</span>
      </p>
    </div>

    <p style="font-size:32px;font-weight:bold;color:${color};margin:16px 0;">
      ${value}${unit}
    </p>

    <p style="color:#555;font-size:14px;">
      Giá trị ${direction} ngưỡng cho phép <strong>${threshold}${unit}</strong>
    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

    <p style="color:#888;font-size:12px;">
      ${message}<br>
      Thời gian: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}<br>
      <em>Vui lòng kiểm tra hệ thống ngay lập tức!</em>
    </p>

  </div>
</body>
</html>
`;
}

/**
 * Gửi email cảnh báo tới users trong cùng Home với thiết bị.
 *
 * @param {object} alertData - Thông tin cảnh báo
 * @param {import('mongoose').Types.ObjectId|string} alertData.homeId - Home nhận cảnh báo
 * @param {string} alertData.deviceName - Tên thiết bị
 * @param {string} alertData.type - Loại cảm biến (temperature, humidity, ...)
 * @param {number} alertData.value - Giá trị đo được
 * @param {string} alertData.unit - Đơn vị (°C, %, lux)
 * @param {string} alertData.severity - Mức độ (Cao, Trung bình, Thấp)
 * @param {string} alertData.message - Mô tả cảnh báo
 * @param {number} alertData.threshold - Giá trị ngưỡng bị vượt
 * @param {string} alertData.direction - "vượt trên" hoặc "dưới"
 */
async function sendAlertMail(alertData) {
  try {
    if (!alertData.homeId) {
      console.warn("[AlertMailer] Thiếu homeId, không gửi email cảnh báo");
      return;
    }

    // 1. Lấy email của users trong cùng Home với thiết bị
    const users = await User.find({ homeId: alertData.homeId }, "email full_name").lean();
    if (!users || users.length === 0) {
      console.warn("[AlertMailer] Không tìm thấy user nào để gửi email");
      return;
    }

    const recipientEmails = users
      .map((u) => u.email)
      .filter((email) => email) // Lọc bỏ email rỗng
      .join(", ");

    if (!recipientEmails) {
      console.warn("[AlertMailer] Không có email hợp lệ");
      return;
    }

    // 2. Tạo transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.gmail,
        pass: config.gmail_app_pass,
      },
    });

    // 3. Tạo nội dung email
    const html = buildAlertHTML(alertData);

    // 4. Gửi email tới users trong cùng Home
    const info = await transporter.sendMail({
      from: `"Smart Home Alert" <${config.gmail}>`,
      to: recipientEmails,
      subject: `[🚨 ${alertData.severity}] Cảnh báo ${alertData.type} - ${alertData.deviceName}`,
      html: html,
    });

    console.log(
      `📧 [AlertMailer] Đã gửi email cảnh báo tới ${users.length} users trong Home ${alertData.homeId}: ${recipientEmails}`
    );
  } catch (error) {
    console.error("[AlertMailer] Lỗi gửi email:", error.message);
  }
}

export default sendAlertMail;
