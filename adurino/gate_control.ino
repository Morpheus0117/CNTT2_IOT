// Arduino code: Quản lý cổng cửa với cảm biến PIR, relay và gửi trạng thái về server
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

#define PIR_PIN D1      // Chân cảm biến PIR
#define RELAY_DOOR D2   // Relay điều khiển cửa
#define RELAY_LIGHT D3  // Relay điều khiển đèn

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* server = "http://your-server-ip:3001"; // Đổi thành IP backend

int lastPIR = LOW;
unsigned long lastSend = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(RELAY_DOOR, OUTPUT);
  pinMode(RELAY_LIGHT, OUTPUT);
  digitalWrite(RELAY_DOOR, LOW); // Đóng cửa ban đầu
  digitalWrite(RELAY_LIGHT, LOW); // Tắt đèn ban đầu

  WiFi.begin(ssid, password);
  Serial.print("Kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void loop() {
  int pirState = digitalRead(PIR_PIN);
  if (pirState == HIGH && lastPIR == LOW) {
    // Có chuyển động: mở cửa, bật đèn
    digitalWrite(RELAY_DOOR, HIGH);
    digitalWrite(RELAY_LIGHT, HIGH);
    sendStatus("Mở", "Bật");
    lastPIR = HIGH;
  } else if (pirState == LOW && lastPIR == HIGH) {
    // Không chuyển động: đóng cửa, tắt đèn
    digitalWrite(RELAY_DOOR, LOW);
    digitalWrite(RELAY_LIGHT, LOW);
    sendStatus("Đóng", "Tắt");
    lastPIR = LOW;
  }
  delay(200);
}

void sendStatus(String door, String light) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(server) + "/api/status";
    String payload = "{\"door\":\"" + door + "\",\"light\":\"" + light + "\"}";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(payload);
    Serial.print("Gửi trạng thái: ");
    Serial.println(payload);
    Serial.print("HTTP code: ");
    Serial.println(httpCode);
    http.end();
  }
} 