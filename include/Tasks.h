#include "global.h"

#define INIT 0

#define MAIN_PAGE 10

#define SETTING_LED12 20
#define SETTING_LED34 21
#define SETTING_FAN 22
#define SETTING_DOOR 23

#define NOTICE_DOOR 30
#define NOTICE_DETECT 31

extern DHT20 dht20;
extern LiquidCrystal_I2C lcd;
extern uint8_t lcd_counter;

extern void temp_humi_monitor(void *pvParameters);
extern void LCD (void *pvParameters);
extern void Light_Task(void *pvParameters);
extern void Fan_Task(void *pvParameters);
extern void Servo_Task(void* pvParameter);
extern void setupDoorTask();