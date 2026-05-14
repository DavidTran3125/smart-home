#include <Arduino.h>
#include <Adafruit_MQTT.h>
#include <Adafruit_MQTT_Client.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include "Adafruit_NeoPixel.h"
#include "DHT20.h"
#include "time.h"
#include "ESP32Servo.h"

#define AIO_SERVER      "io.adafruit.com"
#define AIO_SERVERPORT  1883                                 // use 8883 for SSL
#define AIO_USERNAME    "baotrong"    // Replace with your Adafruit IO Username
#define AIO_KEY         "aio_JvkO706lwWx2JXFLOV4ojiEUMtD3"   // Replace with your Adafruit IO Key

#define LIGHT_SENSOR_PIN 33
#define led1_PIN 32
#define FAN_PIN 26
#define UP_BUTTON_PIN 18
#define DOWN_BUTTON_PIN 19
#define OK_BUTTON_PIN 23
#define CHANGE_BUTTON_PIN 5
#define SERVO_PIN 15

#define WLAN_SSID       "HTS"   // Replace with your Wi-Fi SSID
#define WLAN_PASS       "00000010"   // Replace with your Wi-Fi Password

#define SERIAL_PRINT_DATA 1

extern Adafruit_MQTT_Publish temp;
extern Adafruit_MQTT_Publish humid;   
extern Adafruit_MQTT_Publish light;
extern Adafruit_MQTT_Publish led1;
extern Adafruit_MQTT_Publish led2;
extern Adafruit_MQTT_Publish led3;
extern Adafruit_MQTT_Publish led4;
extern Adafruit_MQTT_Publish door;
extern Adafruit_MQTT_Publish fan;

extern uint16_t global_year;
extern uint8_t global_month;
extern uint8_t global_day; 
extern uint8_t global_hour;
extern uint8_t global_minute;
extern uint8_t global_second;

extern float glob_temperature;
extern float glob_humidity;
extern float glob_light;
extern float glob_fan_speed;
extern int glob_servo_angle;
extern Servo myservo;
extern int glob_ledrgb_state;
extern int glob_system_mode;