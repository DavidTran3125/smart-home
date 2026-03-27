import config from './index.js';
import mqtt from 'mqtt';

const MQTT_URL = `mqtts://${config.aio_username}:${config.aio_key}@io.adafruit.com`;
const client = mqtt.connect(MQTT_URL);

let latestData = {};

client.on('connect', () => {
    console.log('✅ Đã kết nối thành công tới Adafruit MQTT broker');


    const feedsToListen = ['fan', 'humid', 'ledred', 'ledrgb', 'light', 'servo', 'temp']

    feedsToListen.forEach((feed) => {
        client.subscribe(`${config.aio_username}/feeds/${feed}`, (err) => {
            if (err) {
                console.error(`❌ Lỗi khi đăng ký feed ${feed}`, err);
            } else {
                console.log(`📡 Đang lắng nghe luồng dữ liệu của: ${feed}`);
            }
        });
    });
});

// Event nhận dữ liệu mỗi khi thiết bị gửi (push) lên IO
client.on('message', (topic, message) => {
    const feedName = topic.split('/').pop();
    const value = message.toString();
    console.log(`📩 Nhận được: [${feedName}] = ${value}`);
    
    // Cập nhật dữ liệu vào biến mới nhất
    latestData[feedName] = {
        value: value,
        updatedAt: new Date().toISOString()
    };
});
client.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
});

export default { client, latestData };
