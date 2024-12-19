#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFi.h>  // Thêm dòng này cho ESP32
#include <math.h> 
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
 

#define REPORTING_PERIOD_MS     2000
#define DHTPIN 14
#define DHTTYPE DHT11
 
char ssid[] = "The Gioi PS5 T5";         // Replace with your Wi-Fi SSID
char pass[] = "Choigame1234";     // Replace with your Wi-Fi password

const char* mqtt_server = "dd86dc72f53445328d345c2d91fd9470.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "DoAnIoT"; //User
const char* mqtt_password = "1234567890"; //Password

// Create a PulseOximeter object
PulseOximeter pox;

 
// Time at which the last beat occurred
uint32_t tsLastReport = 0;

WiFiClientSecure espClient;
PubSubClient client(espClient);

DHT dht(DHTPIN, DHTTYPE);
Adafruit_MPU6050 mpu;

// Callback routine is executed when a pulse is detected

void onBeatDetected() {

    Serial.println("♥ Beat!");

}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi ");
  Serial.println(ssid);

  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");

}


/************* Connect to MQTT Broker ***********/
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP8266Client-";   // Create a random client ID
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");

      client.subscribe("led_state");   // subscribe the topics here

    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");   // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void publishMessage(const char* topic, String payload, boolean retained) {
  if (client.publish(topic, payload.c_str(), retained))
    Serial.println("Message published [" + String(topic) + "]: " + payload);
}

void setup() {

    Serial.begin(115200);

    setup_wifi();
    espClient.setInsecure();

    client.setServer(mqtt_server, mqtt_port);
    reconnect();

    dht.begin();
    Wire.begin(21, 22);

    if (!mpu.begin()) {
        Serial.println("Failed to find MPU6050 chip");
        while (1) {
          delay(10);
        }
    }
    Serial.println("MPU6050 Found!");
      // set accelerometer range to +-8G
    mpu.setAccelerometerRange(MPU6050_RANGE_16_G);
      // set gyro range to +- 500 deg/s
    mpu.setGyroRange(MPU6050_RANGE_2000_DEG);
      // set filter bandwidth to 21 Hz
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

    Serial.print("Initializing pulse oximeter..");

    // Initialize sensor
    if (!pox.begin()) {
        Serial.println("FAILED");
        for(;;);
    } else {
        Serial.println("SUCCESS");
    }


  // Configure sensor to use 7.6mA for LED drive
  pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
    // Register a callback routine
  pox.setOnBeatDetectedCallback(onBeatDetected);

  

}

 

void loop() {

    // Read from the sensor
    pox.update();

 
    // Grab the updated heart rate and SpO2 levels
    if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
      float heart = pox.getHeartRate();
      float o2 = pox.getSpO2();

      heart = roundf(heart * 100)/100;

      Serial.print("Heart rate:");
      Serial.print(heart);
      Serial.print("bpm / SpO2:");
      Serial.print(o2);
      Serial.println("%");

      if (heart > 0 && heart < 200 && o2 > 80){

        DynamicJsonDocument doc(1024);
        doc["heartRate"] = heart;
        doc["SpO2"] = o2;

        char mqtt_message[128];
        serializeJson(doc, mqtt_message);
        publishMessage("esp32/max30100", mqtt_message, true);
      }

      float h = dht.readHumidity();
      float t = dht.readTemperature();

      if (!isnan(h) && !isnan(t)) {
        Serial.print("Nhiệt độ: ");
        Serial.print(t);
        Serial.print(" °C, Độ ẩm: ");
        Serial.print(h);
        Serial.println(" %");

        // Send to HiveMQ in JSON format
        DynamicJsonDocument doc(1024);
        doc["humidity"] = h;
        doc["temperature"] = t;

        char mqtt_message[128];
        serializeJson(doc, mqtt_message);
        publishMessage("esp32/dht11", mqtt_message, true);
      } else {
        Serial.println("Không thể đọc từ cảm biến DHT11!");
      }

      // Read MPU6050 accelerometer and gyroscope data
      sensors_event_t a, g, temp;
        mpu.getEvent(&a, &g, &temp);
        /* Print out the values */
        float ax = a.acceleration.x;
        float ay = a.acceleration.y;
        float az = a.acceleration.z;
        float gx = g.gyro.x;
        float gy = g.gyro.y;
        float gz = g.gyro.z;
        ax = roundf(ax * 100) / 100;
        ay = roundf(ay * 100) / 100;
        az = roundf(az * 100) / 100;
        gx = roundf(gx * 100) / 100;
        gy = roundf(gy * 100) / 100;
        gz = roundf(gz * 100) / 100;

      // Send MPU6050 data to HiveMQ in JSON format
      DynamicJsonDocument mpuDoc(1024);
      mpuDoc["accel"]["x"] = ax;
      mpuDoc["accel"]["y"] = ay;
      mpuDoc["accel"]["z"] = az;
      mpuDoc["gyro"]["x"] = gx;
      mpuDoc["gyro"]["y"] = gy;
      mpuDoc["gyro"]["z"] = gz;

      char mpu_message[128];
      serializeJson(mpuDoc, mpu_message);
      publishMessage("esp32/mpu6050", mpu_message, true);

      tsLastReport = millis();

    }

}