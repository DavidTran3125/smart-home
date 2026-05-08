from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import paho.mqtt.client as mqtt
import json
import asyncio
from fastapi.middleware.cors import CORSMiddleware # Thêm dòng này

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CẤU HÌNH ---
ADAFRUIT_IO_USERNAME = "baotrong"
ADAFRUIT_IO_KEY = "aio_JvkO706lwWx2JXFLOV4ojiEUMtD3" # Từ code MicroPython của bạn
TOPICS = [f"{ADAFRUIT_IO_USERNAME}/feeds/temp", f"{ADAFRUIT_IO_USERNAME}/feeds/humid"]

# Danh sách các trình duyệt đang kết nối để gửi dữ liệu real-time
active_connections = []

# --- LOGIC MQTT ---
def on_connect(client, userdata, flags, rc):
    print("Connected to Adafruit IO")
    for topic in TOPICS:
        client.subscribe(topic)

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    topic_name = msg.topic.split("/")[-1] # Lấy 'temp' hoặc 'humid'
    
    # Tạo gói tin gửi lên Frontend
    data = {"sensor": topic_name, "value": payload}
    
    # Gửi dữ liệu qua các WebSocket đang mở
    for connection in active_connections:
        asyncio.run_coroutine_threadsafe(connection.send_json(data), loop)

# Thiết lập Client MQTT
mqtt_client = mqtt.Client()
mqtt_client.username_pw_set(ADAFRUIT_IO_USERNAME, ADAFRUIT_IO_KEY)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# Chạy MQTT trong một luồng riêng để không làm treo API
loop = asyncio.get_event_loop()
mqtt_client.connect("io.adafruit.com", 1883, 60)
mqtt_client.loop_start()

# --- WEBSOCKET ENDPOINT ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text() # Giữ kết nối mở
    except WebSocketDisconnect:
        active_connections.remove(websocket)

# Thêm các hàm này vào main.py
@app.post("/control/light")
async def control_light(status: int):
    # status: 1 là bật, 0 là tắt
    topic = f"{ADAFRUIT_IO_USERNAME}/feeds/ledred" # Dựa trên code MicroPython của bạn
    mqtt_client.publish(topic, str(status))
    return {"message": "Đã gửi lệnh đèn"}

@app.post("/control/fan")
async def control_fan(speed: int):
    # speed: 0-100 (tương ứng với độ mạnh yếu)
    topic = f"{ADAFRUIT_IO_USERNAME}/feeds/fan"
    mqtt_client.publish(topic, str(speed))
    return {"message": "Đã gửi lệnh quạt"}