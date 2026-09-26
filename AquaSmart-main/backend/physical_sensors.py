"""
AquaSmart Irrigation System - Physical Sensor Ingestion Guide & Simulator

This file serves two purposes:
1. It simulates an actual hardware sensor module (like an ESP32) sending data to the Flask REST API.
2. It contains the C++/Arduino code template to deploy onto an ESP32 micro-controller.

To run this simulation:
    python backend/physical_sensors.py
"""

import requests
import time
import random

# Target Flask API URL
API_URL = "http://localhost:5000/api/sensors/ingest"

def simulate_esp32_device(farm_id="Farm_A", duration_seconds=10, interval_seconds=2):
    """Simulates a physical IoT device sending real-time telemetry."""
    print(f"Starting physical sensor simulator for {farm_id}...")
    print(f"Target Endpoint: {API_URL}")
    print("Press Ctrl+C to terminate.")
    
    start_time = time.time()
    
    try:
        # Loop simulating active device
        while time.time() - start_time < duration_seconds:
            # Generate realistic fluctuating values simulating physical sensors
            temperature = round(25.0 + random.uniform(-2.0, 5.0), 2)
            humidity = round(60.0 + random.uniform(-10.0, 10.0), 2)
            rainfall = round(random.choice([0.0, 0.0, 0.0, 1.2, 0.0]), 2) # rare rain
            soil_moisture = round(32.0 + random.uniform(-5.0, 5.0), 2)
            
            payload = {
                "farm_id": farm_id,
                "temperature": temperature,
                "humidity": humidity,
                "rainfall": rainfall,
                "soil_moisture": soil_moisture,
                # Optional: specify models to run inference
                "regressor_model": "XGBoost Regressor",
                "classifier_model": "XGBoost Classifier"
            }
            
            try:
                response = requests.post(API_URL, json=payload)
                if response.status_code == 201:
                    result = response.json()
                    decision = result["result"]["decision"]
                    print(f"[{time.strftime('%H:%M:%S')}] Ingest Success!")
                    print(f"   -> Read: Temp={temperature}°C, Soil Moisture={soil_moisture}%")
                    print(f"   -> ML Model Action: {decision['decision'].upper()} (Confidence: {decision['confidence'] * 100:.2f}%)")
                else:
                    print(f"Failed to ingest. Server returned status {response.status_code}: {response.text}")
            except Exception as e:
                print(f"Error connecting to Flask backend: {e}")
                
            time.sleep(interval_seconds)
            
    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")

if __name__ == "__main__":
    simulate_esp32_device()

# ==============================================================================
# ESP32 C++ ARDUINO CODE TEMPLATE FOR ACTUAL HARDWARE
# ==============================================================================
"""
// Copy and paste this code into your Arduino IDE to program your ESP32.
// Required Libraries: WiFi, HTTPClient, ArduinoJson, DHT (Adafruit)

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// Wi-Fi Config
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API Endpoint
const char* serverName = "http://YOUR_SERVER_IP:5000/api/sensors/ingest";

// Pin Configuration
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN 34 // Analog Pin

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi network!");
}

void loop() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    
    // Read physical sensors
    float humidity = dht.readHumidity();
    float temp = dht.readTemperature();
    
    // Read Soil Moisture and map analog value (e.g. 0-4095 for ESP32 ADC) to percentage
    int analogValue = analogRead(SOIL_PIN);
    float soilMoisture = map(analogValue, 4095, 1500, 0, 100); // adjust calibration points
    
    if (isnan(humidity) || isnan(temp)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }
    
    // Construct JSON Payload
    StaticJsonDocument<200> doc;
    doc["farm_id"] = "Farm_A"; // Identify this node
    doc["temperature"] = temp;
    doc["humidity"] = humidity;
    doc["rainfall"] = 0.0; // ESP32 could read tipping bucket sensor here
    doc["soil_moisture"] = soilMoisture;
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    // Send HTTP POST
    int httpResponseCode = http.POST(requestBody);
    
    if(httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Code: ");
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error sending POST: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
  
  delay(10000); // Wait 10 seconds before next reading
}
*/
