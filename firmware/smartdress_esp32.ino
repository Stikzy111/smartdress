// SmartDress V1 - firmware ESP32 (Arduino IDE)
// Bibliotheques : "ESP32Servo" (Kevin Harrington). BLE est inclus dans le package ESP32.
// Protocole texte, une commande par ligne terminee par \n :
//   PING -> PONG | STATUS -> STATE|READY/PREPARING/ERROR
//   CREATE|id|MODELE|TAILLE|COULEUR|TISSU -> ACK|id, PROGRESS|id|10..100, DONE|id
//   CANCEL|id -> CANCELLED|id

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ESP32Servo.h>

#define SERVICE_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define RX_UUID      "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define TX_UUID      "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"
#define SERVO_PIN    18

BLECharacteristic *txChar;
Servo servo;
String rxBuf = "";
String pending = "";
bool connected = false;
bool running = false;
String jobId = "";
int step = 0;
unsigned long lastStep = 0;

void sendLine(String s) {
  if (!connected) return;
  s += "\n";
  txChar->setValue((uint8_t *)s.c_str(), s.length());
  txChar->notify();
  delay(15);
}

class ServerCb : public BLEServerCallbacks {
  void onConnect(BLEServer *s) { connected = true; }
  void onDisconnect(BLEServer *s) {
    connected = false;
    running = false;
    servo.write(0);
    BLEDevice::startAdvertising();
  }
};

class RxCb : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *c) {
    String v = c->getValue();
    pending += v;
  }
};

void handleLine(String l) {
  l.trim();
  if (l == "PING") sendLine("PONG");
  else if (l == "STATUS") sendLine(running ? "STATE|PREPARING" : "STATE|READY");
  else if (l.startsWith("CREATE|")) {
    if (running) { sendLine("ERROR|" + jobId + "|BUSY"); return; }
    int a = l.indexOf('|', 7);
    jobId = (a > 0) ? l.substring(7, a) : l.substring(7);
    // Champs : modele, taille, couleur, tissu (a utiliser pour choisir le morceau de tissu)
    running = true; step = 0; lastStep = millis();
    sendLine("ACK|" + jobId);
  } else if (l.startsWith("CANCEL")) {
    running = false;
    servo.write(0);
    sendLine("CANCELLED|" + jobId);
  }
}

void setup() {
  servo.attach(SERVO_PIN);
  servo.write(0);
  BLEDevice::init("SmartDress");
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new ServerCb());
  BLEService *svc = server->createService(SERVICE_UUID);
  txChar = svc->createCharacteristic(TX_UUID, BLECharacteristic::PROPERTY_NOTIFY);
  txChar->addDescriptor(new BLE2902());
  BLECharacteristic *rx = svc->createCharacteristic(RX_UUID, BLECharacteristic::PROPERTY_WRITE);
  rx->setCallbacks(new RxCb());
  svc->start();
  BLEAdvertising *adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(SERVICE_UUID);
  adv->setScanResponse(true);
  BLEDevice::startAdvertising();
}

void loop() {
  // Decoupage des lignes recues
  int i;
  while ((i = pending.indexOf('\n')) >= 0) {
    handleLine(pending.substring(0, i));
    pending = pending.substring(i + 1);
  }
  // Execution du mecanisme (10 etapes de 500 ms) - remplacer par votre mecanisme reel
  if (running && millis() - lastStep >= 500) {
    lastStep = millis();
    step++;
    servo.write(map(step, 0, 10, 0, 160));
    sendLine("PROGRESS|" + jobId + "|" + String(step * 10));
    if (step >= 10) {
      running = false;
      delay(300);
      servo.write(0);
      sendLine("DONE|" + jobId);
    }
  }
}
