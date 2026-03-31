import nodemailer from 'nodemailer'
import config from '../config/index.js'

async function sendMail(body) {
    // Tạo transporter (kết nối SMTP)
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f4f4f4;padding:20px;">
  <div style="max-width:500px;margin:auto;background:#fff;padding:20px;border-radius:8px;text-align:center;">
    
    <h2 style="color:#ff4d4f;">🚨 TEMPERATURE ALERT</h2>
    
    <p>Nhiệt độ đã vượt ngưỡng an toàn!</p>

    <p style="font-size:28px;font-weight:bold;color:#ff0000;">
      ${body.value}°C
    </p>

    <p style="color:#555;">
      Nguy cơ cháy hoặc hỏng thiết bị.<br>
      Kiểm tra ngay lập tức!
    </p>

  </div>
</body>
</html>
`;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${config.gmail}`, 
      pass: `${config.gmail_app_pass}` // KHÔNG dùng password thường
    }
  });

  // Nội dung mail
  let info = await transporter.sendMail({
    from: '"Minh Dev" phanminhkaneki@gmail.com>',
    to: "hieu.tran3125@hcmut.edu.vn",
    subject: "[WARNINGS] Notifications from smart home",
    html: `${html}`
  });

//   console.log("Message sent:", info.messageId);
}

// sendMail().catch(console.error);

export default sendMail;