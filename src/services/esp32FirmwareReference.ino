/*
  ==================================================================================
  SIH 2026 - Problem Statement: Solar-Powered Smart Mini Cold Storage in NER
  PROJECT: SCAB (Solar Cold-storage Adaptive Brain)
  ESP32 Controller & Actuator Firmware Reference
  Hardware:
    - ESP32 WROOM-32
    - SIM800L V2 GSM Module (UART2)
    - u-blox NEO-6M/8M GPS Module (UART1)
    - SHT31 / DHT22 (Chamber Temp & RH)
    - DS18B20 (PCM Ice Thermal Battery Temperature)
    - NDIR CO2 Sensor (MH-Z19)
    - Optical / Electrochemical O2 Sensor (0-25%)
    - LiFePO4 Battery BMS Monitor & Solar Shunt (ADS1115 / INA219)
    - 8-Channel Optocoupled 12V/230V Relay Actuator Board
  ==================================================================================
*/

#include <Arduino.h>
#include <HardwareSerial.h>

// PIN ASSIGNMENTS - RELAYS
#define RELAY_EARTH_AIR_FAN    18  // Stage 1: Earth-Air Pre-cooling Fan
#define RELAY_RAINWATER_PUMP   19  // Stage 2: Rainwater Condenser Subcooling Pump
#define RELAY_PCM_FREEZE_LOOP  21  // Stage 3: PCM Solar Pre-Freezing Loop Valve
#define RELAY_PCM_DISCHARGE    22  // Stage 3: PCM Passive Ice Discharge Valve
#define RELAY_RADIATIVE_SKY    23  // Stage 4: Night Radiative Sky Valve (8-13um window)
#define RELAY_N2_SOLENOID      25  // Stage 5: Intermittent N2 Dosing Solenoid
#define RELAY_VENT_DAMPER      26  // Stage 5: Chamber Purge & O2 Restoration Damper
#define RELAY_COMPRESSOR       27  // Backup DC Variable-Speed Compressor Relay
#define RELAY_DOOR_SAFETY_LOCK 32  // Asphyxiation Safety Door Lock (Active LOW)
#define BUZZER_ALARM           33  // Audio-visual alarm for O2 < 18%

// UART PORTS
HardwareSerial GsmSerial(2); // RX=16, TX=17 for SIM800L
HardwareSerial GpsSerial(1); // RX=4,  TX=5  for u-blox NEO GPS

// SENSOR VARIABLES
float chamberTemp = 7.4;
float chamberRH = 92.0;
float o2Percent = 4.2;
float co2Percent = 3.1;
float pcmTemp = -1.5;
float pcmChargePercent = 98.0;
float batterySoc = 98.0;
float solarWatts = 420.0;
float produceLoadKg = 160.0;
String selectedCrop = "green_chilli";

// GPS VARIABLES
float gpsLat = 25.5788;
float gpsLon = 91.8933;
float gpsAlt = 1525.0;

// TIMING & INTERVALS
unsigned long lastTelemetryTx = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 60000; // 1 min update

void setup() {
  Serial.begin(115200);
  GsmSerial.begin(9600, SERIAL_8N1, 16, 17);
  GpsSerial.begin(9600, SERIAL_8N1, 4, 5);

  // Initialize Relay Pins
  pinMode(RELAY_EARTH_AIR_FAN, OUTPUT);
  pinMode(RELAY_RAINWATER_PUMP, OUTPUT);
  pinMode(RELAY_PCM_FREEZE_LOOP, OUTPUT);
  pinMode(RELAY_PCM_DISCHARGE, OUTPUT);
  pinMode(RELAY_RADIATIVE_SKY, OUTPUT);
  pinMode(RELAY_N2_SOLENOID, OUTPUT);
  pinMode(RELAY_VENT_DAMPER, OUTPUT);
  pinMode(RELAY_COMPRESSOR, OUTPUT);
  pinMode(RELAY_DOOR_SAFETY_LOCK, OUTPUT);
  pinMode(BUZZER_ALARM, OUTPUT);

  // Default Relays OFF (Active LOW relays)
  digitalWrite(RELAY_EARTH_AIR_FAN, HIGH);
  digitalWrite(RELAY_RAINWATER_PUMP, HIGH);
  digitalWrite(RELAY_PCM_FREEZE_LOOP, HIGH);
  digitalWrite(RELAY_PCM_DISCHARGE, HIGH);
  digitalWrite(RELAY_RADIATIVE_SKY, HIGH);
  digitalWrite(RELAY_N2_SOLENOID, HIGH);
  digitalWrite(RELAY_VENT_DAMPER, HIGH);
  digitalWrite(RELAY_COMPRESSOR, HIGH);
  digitalWrite(RELAY_DOOR_SAFETY_LOCK, HIGH); // Unlocked
  digitalWrite(BUZZER_ALARM, LOW);

  Serial.println("[SCAB ESP32] System Booted. Initializing SIM800L & Sensors...");
  delay(1000);
  GsmSerial.println("AT");
  delay(300);
  GsmSerial.println("AT+CMGF=1"); // Set SMS to text mode
}

// TRANSMIT TELEMETRY SMS TO MOBILE APP
void sendTelemetrySms() {
  String telemetry = "$SCAB,LAT=" + String(gpsLat, 4) +
                     ",LON=" + String(gpsLon, 4) +
                     ",ALT=" + String(gpsAlt, 0) +
                     ",TC=" + String(chamberTemp, 1) +
                     ",RH=" + String(chamberRH, 0) +
                     ",O2=" + String(o2Percent, 1) +
                     ",CO2=" + String(co2Percent, 1) +
                     ",PCM=" + String(pcmChargePercent, 0) +
                     ",BAT=" + String(batterySoc, 0) +
                     ",SOL=" + String(solarWatts, 0) +
                     ",CROP=" + selectedCrop +
                     ",KG=" + String(produceLoadKg, 0) + "#";

  Serial.println("[TX TELEMETRY]: " + telemetry);
  // Optional: GsmSerial SMS dispatch commands here
}

// PARSE COMMAND SMS FROM SCAB MOBILE APP
void processIncomingCommand(String cmd) {
  cmd.trim();
  if (!cmd.startsWith("CMD") || !cmd.endsWith("#")) return;
  Serial.println("[RX COMMAND]: " + cmd);

  if (cmd.indexOf("RAIN=1") != -1) digitalWrite(RELAY_RAINWATER_PUMP, LOW);
  else if (cmd.indexOf("RAIN=0") != -1) digitalWrite(RELAY_RAINWATER_PUMP, HIGH);

  if (cmd.indexOf("PCM=1") != -1) digitalWrite(RELAY_PCM_FREEZE_LOOP, LOW);
  else if (cmd.indexOf("PCM=0") != -1) digitalWrite(RELAY_PCM_FREEZE_LOOP, HIGH);

  if (cmd.indexOf("N2=1") != -1) digitalWrite(RELAY_N2_SOLENOID, LOW);
  else if (cmd.indexOf("N2=0") != -1) digitalWrite(RELAY_N2_SOLENOID, HIGH);
}

// ASPHYXIATION SAFETY INTERLOCK
void checkSafetyInterlock() {
  if (o2Percent < 18.0) {
    digitalWrite(RELAY_DOOR_SAFETY_LOCK, LOW); // Latch door locked
    digitalWrite(BUZZER_ALARM, HIGH);          // Sound audible hazard alarm
    digitalWrite(RELAY_N2_SOLENOID, HIGH);     // Force N2 OFF
    digitalWrite(RELAY_VENT_DAMPER, LOW);      // Force fresh air damper OPEN
  } else {
    digitalWrite(RELAY_DOOR_SAFETY_LOCK, HIGH); // Safe to enter
    digitalWrite(BUZZER_ALARM, LOW);
  }
}

void loop() {
  checkSafetyInterlock();

  // Handle periodic telemetry transmission
  if (millis() - lastTelemetryTx > TELEMETRY_INTERVAL_MS) {
    lastTelemetryTx = millis();
    sendTelemetrySms();
  }

  // Handle incoming SMS from SIM800L
  if (GsmSerial.available()) {
    String line = GsmSerial.readStringUntil('\n');
    if (line.indexOf("CMD,") != -1) {
      processIncomingCommand(line);
    }
  }
  delay(100);
}
