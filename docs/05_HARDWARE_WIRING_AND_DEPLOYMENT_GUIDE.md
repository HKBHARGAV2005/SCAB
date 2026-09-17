# Hardware Wiring & Field Deployment Guide
### SCAB: Solar Cold-storage Adaptive Brain (SIH 2026)

---

## 1. ESP32 Controller Master Pinout Table

| GPIO Pin | Function | Hardware Peripheral | Protocol / Signal Type | Operating Voltage |
| :--- | :--- | :--- | :--- | :--- |
| **GPIO 16** | GSM RX | SIM800L V2 TXD | Hardware UART 2 | 3.3V Logic |
| **GPIO 17** | GSM TX | SIM800L V2 RXD | Hardware UART 2 | 3.3V Logic |
| **GPIO 4** | GPS RX | u-blox NEO GPS TXD | Hardware UART 1 | 3.3V Logic |
| **GPIO 5** | GPS TX | u-blox NEO GPS RXD | Hardware UART 1 | 3.3V Logic |
| **GPIO 21** | I2C SDA | Sensirion SHT31 & ADS1115 | I2C Bus | 3.3V (4.7kΩ pullup) |
| **GPIO 22** | I2C SCL | Sensirion SHT31 & ADS1115 | I2C Bus | 3.3V (4.7kΩ pullup) |
| **GPIO 15** | 1-Wire Data | Dallas DS18B20 (PCM Temp) | 1-Wire Protocol | 3.3V (4.7kΩ pullup) |
| **GPIO 34** | ADC Analog | Electrochemical O₂ Sensor | Analog In (0-3.3V) | High Impedance |
| **GPIO 35** | ADC Analog | Battery Voltage Divider | Analog In (0-3.3V) | 100kΩ / 10kΩ divider |
| **GPIO 18** | Output | Relay 1: Earth-Air Fan | Active LOW Digital | 3.3V / 5V Optocoupled |
| **GPIO 19** | Output | Relay 2: Rainwater Pump | Active LOW Digital | 3.3V / 5V Optocoupled |
| **GPIO 23** | Output | Relay 3: PCM Freeze Valve | Active LOW Digital | 3.3V / 5V Optocoupled |
| **GPIO 25** | Output | Relay 4: PCM Discharge Valve | Active LOW Digital | 3.3V / 5V Optocoupled |
| **GPIO 26** | Output | Relay 5: Radiative Sky Valve | Active LOW Digital | 3.3V / 5V Optocoupled |
| **GPIO 27** | Output | Relay 6: N₂ Solenoid Valve | Active LOW Digital | 3.3V / 5V Optocoupled |
| **GPIO 14** | Output | Relay 7: Chamber Purge Damper | Active LOW Digital | 3.3V / 5V Optocoupled |
| **GPIO 12** | Output | Relay 8: DC Compressor | Active LOW Digital | 3.3V / 5V Optocoupled |
| **GPIO 32** | Output | Relay 9: Door Safety Lock | Active LOW Digital | Active Lock Solenoid |
| **GPIO 33** | Output | Safety Buzzer & LED Alarm | Digital HIGH Active | 3.3V / 5V Active Buzzer |

---

## 2. Power Supply & SIM800L Critical Design Note

> [!CAUTION]
> **SIM800L Power Spikes**:
> The SIM800L V2 GSM module draws **instantaneous current bursts up to 2.0 Amperes** during RF packet transmission.
> - **DO NOT power SIM800L from the ESP32 3.3V or 5V regulator pin!** Doing so will cause instant brownout resets of the ESP32.
> - **Correct Power Setup**:
>   1. Use a dedicated **LM2596 or MP1584 buck converter** stepped down to **$4.0\,\text{V}$ DC** directly from the 12V/24V battery bank.
>   2. Solder a **$1000\,\mu\text{F} \text{ to } 2200\,\mu\text{F}$ low-ESR electrolytic capacitor** in parallel with a **$100\,\text{nF}$ ceramic capacitor** directly across the SIM800L `VCC` and `GND` header pins.
>   3. Common ground (GND) must be tied between the buck converter, SIM800L, and ESP32.

---

## 3. Sensor Wiring & Interfacing

### A. Sensirion SHT31 (Chamber Temperature & Relative Humidity)
- `VCC` ➔ 3.3V
- `GND` ➔ Common GND
- `SDA` ➔ ESP32 GPIO 21 (tied to 3.3V through 4.7kΩ pullup)
- `SCL` ➔ ESP32 GPIO 22 (tied to 3.3V through 4.7kΩ pullup)

### B. Dallas DS18B20 (PCM Ice Thermal Battery Temperature)
- `RED (VCC)` ➔ 3.3V
- `BLACK (GND)` ➔ Common GND
- `YELLOW (DATA)` ➔ ESP32 GPIO 15 (tied to 3.3V through 4.7kΩ pullup resistor)
- Probe encapsulated inside stainless-steel thermowell immersed directly in the center of the 120 kg water/ice thermal storage tank.

### C. Winsen MH-Z19B NDIR $CO_2$ Sensor
- `VIN` ➔ 5.0V
- `GND` ➔ Common GND
- `TX` ➔ ESP32 GPIO 13 (SoftwareSerial RX)
- `RX` ➔ ESP32 GPIO 12 (SoftwareSerial TX)

---

## 4. Field Deployment Checklist for Rural North Eastern Region

1. **Weatherproofing Enclosure**:
   - All controller electronics, buck converters, and relays must be housed inside an **IP65-rated sealed polycarbonate enclosure** with rubber gasket sealing to protect against Meghalaya / Assam monsoon condensation.
2. **Solar Panel Orientation in NER**:
   - **Tilt Angle**: Set at **$25^\circ\text{ to }28^\circ$ True South** to maximize annual solar irradiance at 25–27°N latitude.
   - Ground clearance must be at least 1.5 meters to prevent vegetative overgrowth in lush rainforest terrain.
3. **Subterranean Earth-Air Heat Exchanger**:
   - Buried at depth of **2.5 to 3.0 meters** where soil remains a stable 18–21°C year-round.
   - Use 100mm corrugated HDPE pipe with a **1.5% drainage slope** to prevent stagnant monsoon condensation water pooling.
4. **Rainwater Condenser Subcooling Tank**:
   - Install a 500-liter shaded poly tank fed directly from the cold storage rooftop catchment gutter.
   - Install a 100-mesh stainless-steel debris strainer at the inlet to prevent clogging of the plate heat exchanger.
5. **Lightning & Earthing Protection**:
   - North East India has the highest lightning strike density in India.
   - Drive a **copper-bonded earthing rod 3.0 meters deep into the earth**. Bond solar panel frames, battery negative, and lightning surge arresters (SPD) to this low-resistance ground ($< 5\,\Omega$).
