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

void MQTT_connect();

void setup()
{
  // 1. Kết nối WiFi
  Serial.begin(115200);
  delay(2000);
  Wire.begin(21, 22);
  WiFi.begin(WLAN_SSID, WLAN_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());

  // 2. Đồng bộ NTP
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

  // 3. Chạy Tasks
  xTaskCreate(LCD, "LCD", 4096, NULL, 2, NULL);
  xTaskCreate(temp_humi_monitor, "Task Temp Humi Monitor", 4096, NULL, 1, NULL);
}

void loop(){
  MQTT_connect();
  Adafruit_MQTT_Subscribe *subscription;
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
