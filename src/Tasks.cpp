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
        
        vTaskDelay(pdMS_TO_TICKS(5000)); 
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
      glob_light = (analogRead(LIGHT_SENSOR_PIN)*100)/4095; // Read the light sensor value
      light.publish(glob_light);
      #if SERIAL_PRINT_DATA == 1
         Serial.print(F("Light: "));
         Serial.print(glob_light);
         Serial.print(F("%\n"));
      #endif
      vTaskDelay(20000 / portTICK_PERIOD_MS); // Delay of 20 second
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