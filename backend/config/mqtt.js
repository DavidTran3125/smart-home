import config from './index.js'


const MQTT_URL = `mqtts://${config.aio_username}:${config.aio_key}@io.adafruit.com`;
const client = mqtt.connect(MQTT_URL);

let latestData = {};

client.on('connect', () => {
    console.log('✅ Đã kết nối thành công tới Adafruit MQTT broker');

    // Subscribe vào các feed (cảm biến, thiết bị)
    // Thay 'cambien1' bằng tên feed thực tế của bạn trên Adafruit
    // const feedsToListen = ['cambien1', 'nhietdo', 'doam', 'maybom1'];
    const feedsToListen = ['bbc-door', 'bbc-temp', 'bbc-moist', 'bbc-move', 'bbc-fan']

    feedsToListen.forEach((feed) => {
        client.subscribe(`${AIO_USERNAME}/feeds/${feed}`, (err) => {
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
