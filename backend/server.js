require('dotenv').config();
const express = require('express');
const mqtt = require('mqtt');

const app = express();
const port = 3000;

// Middleware phân giải JSON body cho các request POST/PUT
app.use(express.json());


app.get('/api/iot-data', (req, res) => {
    res.json({
        success: true,
        message: 'Dữ liệu mới nhất từ thiết bị IoT',
        data: latestData
    });
});

// API nhận lệnh từ FE/Mobile và gửi tín hiệu cho thiết bị (VD: Bật máy bơm)
app.post('/api/iot-control', (req, res) => {
    const { feedName, value } = req.body;
    
    if (!feedName || value === undefined) {
        return res.status(400).json({ error: 'Body cần phải truyền feedName và value' });
    }

    const topic = `${AIO_USERNAME}/feeds/${feedName}`;
    
    // Gửi lệnh lên Adafruit (thiết bị đã subscribe sẽ tự động kích hoạt)
    client.publish(topic, String(value), {}, (err) => {
        if (err) {
            console.error(`❌ Lỗi khi gửi lệnh tới ${topic}`, err);
            return res.status(500).json({ error: 'Không thể gửi lệnh cho thiết bị' });
        }
        console.log(`📤 Đã gửi lệnh - Feed: [${feedName}], Giá trị lệnh: [${value}]`);
        res.json({ success: true, message: `Đã gửi lệnh ${value} tới điều khiển ${feedName}` });
    });
});

// Lắng nghe server
app.listen(port, () => {
    console.log(`\n🚀 Server Express đang chạy tại http://localhost:${port}`);
    console.log(`👉 API xem dữ liệu: GET http://localhost:${port}/api/iot-data`);
    console.log(`👉 API điều khiển: Lệnh POST tới http://localhost:${port}/api/iot-control\n`);
});
