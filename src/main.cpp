#include "Tasks.h"

WiFiClient client;
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);

Adafruit_MQTT_Publish fan = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/fan");  
Adafruit_MQTT_Publish humid = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/humid"); 
Adafruit_MQTT_Publish ledred = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/ledred");  
Adafruit_MQTT_Publish ledrgb = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/ledrgb");  
Adafruit_MQTT_Publish light = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/light");  
Adafruit_MQTT_Publish servo = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/servo");  
Adafruit_MQTT_Publish temp = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/temp");  

Adafruit_MQTT_Subscribe controll_fan = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/fan");
Adafruit_MQTT_Subscribe controll_servo = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/feeds/servo");
void MQTT_connect();

void setup()
{
  // 1. Kết nối WiFi
  Serial.begin(115200);
  delay(2000);
  Wire.begin(21, 22);
  pinMode(SERVO_PIN, OUTPUT);
  WiFi.begin(WLAN_SSID, WLAN_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());

  // 2. Kết nối MQTT
  mqtt.subscribe(&controll_fan);
  mqtt.subscribe(&controll_servo);
  // 3. Đồng bộ NTP
  configTime(7 * 3600, 0, "pool.ntp.org");
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    global_year = timeinfo.tm_year + 1900;
    global_month = timeinfo.tm_mon + 1;
    global_day = timeinfo.tm_mday;
    global_hour = timeinfo.tm_hour;
    global_minute = timeinfo.tm_min;
    global_second = timeinfo.tm_sec;
  }

  // 4. Chạy Tasks
  setupDoorTask();
  xTaskCreate(LCD, "LCD", 4096, NULL, 2, NULL);
  xTaskCreate(temp_humi_monitor, "Task Temp Humi Monitor", 4096, NULL, 1, NULL);
  xTaskCreate(Light_Task, "Task Light Monitor", 4096, NULL, 1, NULL);
  xTaskCreate(Fan_Task, "Task Fan Control", 4096, NULL, 1, NULL);
}

void loop(){
  MQTT_connect();
  Adafruit_MQTT_Subscribe *subscription;
  // nếu subscribe thành công, hiển thị giá trị nhận được và cập nhật biến toàn cục glob_fan_speed
  while ((subscription = mqtt.readSubscription(1000))) {
     if (subscription == &controll_fan) {
        // Chuyển giá trị nhận được từ text sang số thực (float)
        Serial.print("Giá trị nhận được từ MQTT: ");
        Serial.println((char *)controll_fan.lastread);
        glob_fan_speed = atof((char *)controll_fan.lastread); 
        Serial.print("Tốc độ quạt mới: ");
        Serial.println(glob_fan_speed);
    }
    if (subscription == &controll_servo) {
        // Chuyển giá trị nhận được từ text sang số thực (float)
        Serial.print("Giá trị nhận được từ MQTT: ");
        Serial.println((char *)controll_servo.lastread);
        if (controll_servo.lastread[0] == 'A') glob_servo_angle = 90;
        Serial.print("Góc servo mới: ");
        Serial.println(glob_servo_angle);
        Servo_Task(glob_servo_angle);
    }
  }
}


void MQTT_connect() {
  int8_t ret;
  // Stop if already connected.
  if (mqtt.connected()) {
    return;
  }

  Serial.print("Connecting to MQTT... ");

  uint8_t retries = 3;
  while ((ret = mqtt.connect()) != 0) { // connect will return 0 for connected
    Serial.println(mqtt.connectErrorString(ret));
    Serial.println("Retrying MQTT connection in 5 seconds...");
    mqtt.disconnect();
    delay(5000);  // wait 5 seconds
    retries--;
    if (retries == 0) {
      // basically die and wait for WDT to reset me
      while (1);
    }
  }
  Serial.println("MQTT Connected!");
}
