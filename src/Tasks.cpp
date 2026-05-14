#include "Tasks.h"
DHT20 dht20;
LiquidCrystal_I2C lcd(33,16,2);
uint8_t lcd_counter = 5;
uint16_t global_year = 2026;
uint8_t global_month = 3;
uint8_t global_day = 17; 
uint8_t global_hour = 9;
uint8_t global_minute = 9;
uint8_t global_second = 9;
float glob_temperature = 0.0;
float glob_humidity = 0.0;
float glob_light = 0.0;
float glob_fan_speed = 0.0;
int glob_servo_angle = 0;
int glob_ledrgb_state = 0;
int glob_system_mode = 0;

void temp_humi_monitor(void *pvParameters){
    dht20.begin();
    while (1){
        dht20.read();
        float temperature = dht20.getTemperature();
        float humidity = dht20.getHumidity();

        if (isnan(temperature) || isnan(humidity)) {
            Serial.println("Failed to read from DHT sensor!");
            temperature = humidity = -1;
        }

        glob_temperature = temperature;
        glob_humidity = humidity;
        humid.publish(glob_humidity);
        temp.publish(glob_temperature);
        Serial.printf("Humidity: %.1f%%  Temperature: %.1f°C\n", humidity, temperature);
        
        vTaskDelay(pdMS_TO_TICKS(10000)); 
    }
}

void LCD (void *pvParameters){
    Serial.println("Initializing LCD...");
    uint8_t dot = 1;
    lcd.init();
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WELCOME TO"); 
    lcd.setCursor(0, 1); 
    lcd.print("OUR SMART HOME");
    delay(3000);
    lcd.clear();
    while (1){
        struct tm timeinfo;
        if (getLocalTime(&timeinfo)) {
            global_year   = timeinfo.tm_year + 1900;
            global_month  = timeinfo.tm_mon + 1;
            global_day    = timeinfo.tm_mday;
            global_hour   = timeinfo.tm_hour;
            global_minute = timeinfo.tm_min;
            global_second = timeinfo.tm_sec;
        }
        //PRINT MAIN PAGE (TEMP, HUM, LIGHT)
        // ROW0: T25.0 H100 L100
        // ROW1: DD/MM/YYYY HH:MM
        lcd.setCursor(0, 0); lcd.print("T:"); lcd.print(glob_temperature);
        lcd.setCursor(6, 0); lcd.print(" H:"); lcd.print(glob_humidity);
        lcd.setCursor(11, 0); lcd.print(" L:"); lcd.print(glob_light);
        lcd.setCursor(0, 1); lcd.print(global_day); lcd.print("/"); lcd.print(global_month); lcd.print("/"); lcd.print(global_year);
        lcd.setCursor(11, 1); global_hour < 10 ? (lcd.print("0"), lcd.print(global_hour)) : lcd.print(global_hour);
        lcd.print(dot == 1 ? ":" : " ");  
        global_minute < 10 ? (lcd.print("0"), lcd.print(global_minute)) : lcd.print(global_minute);

        if(lcd_counter == 0){lcd_counter = 5; dot = !dot;}
        if (lcd_counter> 0) lcd_counter--;
        vTaskDelay(200);
    }
}

void Light_Task (void* pvParameter){
   //Setup Light sensor
   pinMode(LIGHT_SENSOR_PIN, INPUT); // Set the pin as input

   while(1){
      glob_light = (analogRead(LIGHT_SENSOR_PIN) * 100.0) / 4095; // Read the light sensor value
      light.publish(glob_light);
      #if SERIAL_PRINT_DATA == 1
         Serial.print(F("Light: "));
         Serial.print(glob_light);
         Serial.print(F("%\n"));
      #endif
      vTaskDelay(pdMS_TO_TICKS(10000));
   }
}

void Fan_Task(void* pvParameter){
    pinMode(FAN_PIN, OUTPUT);
    while(1){
        // Nếu nhận được giá trị từ adafruit IO, bật quạt theo tốc độ nhận được
        analogWrite(FAN_PIN, glob_fan_speed); // Điều chỉnh tốc độ quạt
        vTaskDelay(100 / portTICK_PERIOD_MS); // Delay of 100ms
    }
}

Servo myservo;    
void setupDoorTask(){
   myservo.attach(SERVO_PIN); // kết nối servo với chân door_PIN
   myservo.write(0); // Đặt vị trí ban đầu của servo là 0 độ
}

void Servo_Task(int angle){
    // Nếu nhận được giá trị từ adafruit IO, điều chỉnh servo theo giá trị nhận được
    if (angle == 90) { // Kiểm tra nếu góc hợp lệ
        myservo.write(90);
    } else if (angle == 0) {
        myservo.write(0);
    }
}

Adafruit_NeoPixel NeoPixel(4, led1_PIN , NEO_GRB + NEO_KHZ800);

void setupLedTask(){
     NeoPixel.begin();
}

// Hàm cập nhật màu cho toàn bộ dải LED dựa trên giá trị R, G, B
void setAllPixelsColor(uint8_t r, uint8_t g, uint8_t b) {
    for(int i = 0; i < 4; i++) {
        NeoPixel.setPixelColor(i, NeoPixel.Color(r, g, b));
    }
    NeoPixel.show();
}

void LedRGB(int led_num, int led_state) {
    if(led_num == 0){
        if (led_state == 1)NeoPixel.setPixelColor(0, NeoPixel.Color(0, 255, 0));
        else NeoPixel.setPixelColor(0, NeoPixel.Color(0, 0, 0));
        NeoPixel.show();
    }
    else if(led_num == 1){
        if (led_state == 1)NeoPixel.setPixelColor(1, NeoPixel.Color(0, 0, 255));
        else NeoPixel.setPixelColor(1, NeoPixel.Color(0, 0, 0));
        NeoPixel.show();
    }
    else if(led_num == 2){
        if (led_state == 1)NeoPixel.setPixelColor(2, NeoPixel.Color(255, 0, 0));
        else NeoPixel.setPixelColor(2, NeoPixel.Color(0, 0, 0));
        NeoPixel.show();
    }
    else if(led_num == 3){
        if (led_state == 1)NeoPixel.setPixelColor(3, NeoPixel.Color(128, 128,128));
        else NeoPixel.setPixelColor(3, NeoPixel.Color(0, 0, 0));
        NeoPixel.show();
    }
    else if (led_num == 4){
        if (led_state) {
            uint8_t brightness = led_state; // Thay đổi giá trị này từ 0 đến 255 để điều chỉnh độ sáng
            NeoPixel.setPixelColor(0, NeoPixel.Color(brightness, brightness, brightness));
            NeoPixel.setPixelColor(1, NeoPixel.Color(brightness, brightness, brightness));
            NeoPixel.setPixelColor(2, NeoPixel.Color(brightness, brightness, brightness));
            NeoPixel.setPixelColor(3, NeoPixel.Color(brightness, brightness, brightness));
            NeoPixel.show();
        } else {
            NeoPixel.setPixelColor(0, NeoPixel.Color(0, 0, 0));
            NeoPixel.setPixelColor(1, NeoPixel.Color(0, 0, 0));
            NeoPixel.setPixelColor(2, NeoPixel.Color(0, 0, 0));
            NeoPixel.setPixelColor(3, NeoPixel.Color(0, 0, 0));
            NeoPixel.show();
        }
    }
}