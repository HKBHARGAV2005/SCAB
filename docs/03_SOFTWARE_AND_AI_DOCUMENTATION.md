# Software & AI Engine Documentation
### SCAB: Solar Cold-storage Adaptive Brain (SIH 2026)

---

## 1. Decentralized Edge-Computing Paradigm

### Why the AI Runs on the Mobile Phone (Not the ESP32)
Microcontrollers deployed in rural hardware installations face severe hardware boundaries:
- **ESP32 Limits**: 520 KB SRAM, limited floating-point precision, no native SSL certificate management for multi-year weather API polling, and potential brownout/crash risks under unstable solar voltage.
- **Mobile Smartphone Advantage**: Modern farmer/cooperative smartphones feature multi-core ARM processors, gigabytes of RAM, hardware encryption, cellular and offline SQLite databases, and continuous OS-level background task schedulers.
- **The SCAB Paradigm**:
  - The **ESP32** operates as a lean, failsafe, deterministic Real-Time Controller: reads local ADC sensors and sets relay coils according to validated safety thresholds.
  - The **SCAB Android App** acts as the high-level **Predictive Brain**: ingests 10-day meteorological forecasts, runs multi-variable cost optimization, computes predictive load shifts, and transmits high-level command packets back to the ESP32 over GSM/SMS.

```
       ┌──────────────────────────────┐
       │   10-Day Meteorological      │
       │   Forecast API (Open-Meteo)  │
       └──────────────┬───────────────┘
                      │ High-resolution weather matrix
                      ▼
       ┌──────────────────────────────┐
       │     SCAB MOBILE EDGE-AI      │
       │  (Predictive Optimization)   │
       └──────────────┬───────────────┘
                      │
           Two-Way GSM/SMS Protocol
           (Standard 2G Signaling)
                      │
                      ▼
       ┌──────────────────────────────┐
       │       ESP32 CONTROLLER       │
       │  (Failsafe Actuator Node)    │
       └──────────────────────────────┘
```

---

## 2. 10-Day Real-Time Climate Engine

Implemented in [`weatherService.ts`](file:///C:/Users/hkbha/.gemini/antigravity/scratch/scab-android-app/src/services/weatherService.ts):
- **API**: Queries the Open-Meteo high-resolution global numerical weather prediction (NWP) model for the exact GPS coordinates provided by the u-blox module.
- **Extracted Meteorological Variables**:
  1. `temperature_2m`: Hourly ambient dry-bulb temperature (°C)
  2. `relative_humidity_2m`: Hourly ambient humidity (%)
  3. `shortwave_radiation` & `direct_normal_irradiance`: Hourly solar flux ($W/m^2$)
  4. `precipitation_probability` & `rain`: Hourly rainfall probability (%) and volume (mm)
  5. `cloud_cover`: Total cloud fraction (%)
- **Calculated Meteorological Indexes**:
  - **Radiative Sky Suitability**: Triggered when $t \in [22:00, 05:00]$, $\text{cloud\_cover} < 30\%$, and $\text{ambient RH} < 85\%$.
  - **Ambient Heat Rejection Window**: Triggered when ambient dry-bulb temperature is at the diurnal minimum ($T_{\text{ambient}} < 22^\circ\text{C}$).
  - **Severe Monsoon Alert**: Triggered when 2 or more consecutive days show $\ge 70\%$ rain probability or precipitation $\ge 20\,\text{mm/day}$.

---

## 3. The "Cold Priming" Protocol

Implemented in [`aiDecisionEngine.ts`](file:///C:/Users/hkbha/.gemini/antigravity/scratch/scab-android-app/src/services/aiDecisionEngine.ts):

### The Physical Problem
When 200 kg of fresh vegetables harvested under afternoon sun (35°C) are placed into a cold storage unit that is only partially conditioned:
- The sensible heat pull-down ($Q = m \cdot c_p \cdot \Delta T = 200 \times 3.8 \times 27 \approx 20.5\,\text{MJ}$) creates a massive thermal surge.
- The compressor is forced to run continuously at full displacement during hot afternoon ambient conditions, causing high head pressure, tripping inverter protections, and rapidly depleting the battery.

### The Algorithm
The SCAB app establishes a **Cold Priming Gate**:
$$\text{Primed} = (\text{Battery}_{\text{SOC}} \ge 95\%) \land (T_{\text{PCM}} \le 0.0^\circ\text{C}) \land (\text{PCM}_{\text{Frozen}} \ge 90\%)$$

1. **Gate Closed**: If `Primed == false`, the farmer dashboard displays a prominent Amber Alert: *"Priming in Progress: Please wait until battery reaches 100% and PCM ice is fully frozen before loading."*
2. **Pre-Buffering**: During this phase, all available solar power is converted directly into latent cold storage ($120\,\text{kg}$ ice block).
3. **Gate Open**: When `Primed == true`, fresh vegetables enter. The initial thermal shock is absorbed entirely by the frozen PCM buffer and the Earth-Air pre-cooling duct. The compressor experiences **zero peak overload**.

---

## 4. Multi-Objective Cost Function & Predictive Scheduling

The SCAB Brain optimizes an objective function over a 240-hour (10-day) rolling horizon:

$$J = \min \sum_{t=1}^{240} \left[ w_{\text{solar}} \cdot P_{\text{pv}}(t) + w_{\text{pcm}} \cdot \Delta T_{\text{pcm}}(t) - w_{\text{rain}} \cdot \eta_{\text{rain}}(t) - w_{\text{rad}} \cdot \Phi_{\text{sky}}(t) + w_{\text{comp}} \cdot P_{\text{comp\_pen}}(t) \right]$$

### Parameter Weight Matrix

| Weight | Parameter Description | Default Value | Tuning Range | Physical Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **$w_1$** | Solar PV Preference | `0.90` | $0.1 - 1.0$ | Prioritizes direct solar power over battery storage |
| **$w_2$** | PCM Preservation | `0.85` | $0.1 - 1.0$ | Conserves latent ice reserve for cloudy/monsoon days |
| **$w_3$** | Rainwater COP Multiplier | `0.80` | $0.1 - 1.0$ | Favors compressor runs when rainwater subcooling is available |
| **$w_4$** | Radiative Sky Cooling | `0.75` | $0.1 - 1.0$ | Exploits clear night-sky radiation for zero electrical cost |
| **$w_5$** | Compressor Peak Heat Penalty | `0.90` | $0.1 - 1.0$ | Heavily penalizes compressor operation during hot afternoon air |
| **$H_{\text{look}}$** | Monsoon Horizon | `36 hours` | $12 - 72\text{ h}$ | Lookahead window to start pre-freezing before storms |

### Dynamic Action Selector Rules:
1. **Pre-Freezing Rule**: If an upcoming severe storm is detected within $H_{\text{look}}$ and solar generation $> 250\,\text{W}$, force `PCM_PRE_FREEZE = ON`.
2. **Passive Discharge Rule**: If solar generation $< 80\,\text{W}$ and PCM charge $> 20\%$, force `COMPRESSOR = OFF` and engage `PCM_DISCHARGE = ON` (coasting on ice).
3. **Radiative Window Rule**: If night clear sky index is verified, open `RADIATIVE_VALVE = ON` to subcool PCM for 0 Watts compressor draw.
4. **Rainwater Boost Rule**: If compressor is active and ambient air $> 24^\circ\text{C}$, trigger `RAINWATER_PUMP = ON`.

---

## 5. Controlled Atmosphere & Asphyxiation Safety Interlock

### Gas Dynamic Regulation
Produce respiration follows:
$$\text{Respiration} \propto [O_2]^n \cdot e^{-E_a / RT}$$
- The app matches the target $O_2$ (3.0–5.0%) and $CO_2$ limits based on the selected North Eastern crop.
- If $O_2 > O_{2,\text{max}}$, the ESP32 pulses the $N_2$ solenoid for 15 seconds every 5 minutes.
- If $O_2 < O_{2,\text{min}}$, the exhaust vent damper opens for 30 seconds to admit atmospheric air, preventing anaerobic fermentation.

### Human Life-Safety Interlock
Nitrogen is odorless, colorless, and non-irritating. An atmosphere of $85\%\,N_2$ ($< 15\%\,O_2$) causes rapid unconsciousness in humans within 2–3 breaths.
- **Safety Rule**: If $O_2 < 18.0\%$:
  1. `safetyDoorLock` relay is **latched in the LOCKED state**.
  2. Audible piezoceramic buzzer and flashing red LED alarm are activated.
  3. `n2SolenoidValve` is forcefully disabled.
  4. `ventDamper` is driven fully open until $O_2 \ge 19.5\%$ is confirmed by the optical sensor.

---

## 6. Two-Way GSM/SMS Telemetry & Command Protocol

### Upstream Telemetry Packet (Cold Store ➔ Mobile App)
Sent by SIM800L V2 every 60 seconds (or on event change):
```
$SCAB,LAT=25.5788,LON=91.8933,ALT=1525,TC=7.4,RH=92,O2=4.2,CO2=3.1,PCM=98,BAT=98,SOL=420,CROP=green_chilli,KG=160#
```

### Downstream Command Packet (Mobile App ➔ Cold Store)
Dispatched by the SCAB app to update target parameters and relay states:
```
CMD,MODE=AUTO,T_SET=8.5,RAIN=1,PCM=1,N2=1,CROP=green_chilli,KG=160#
```

Both packets use framing delimiters (`$` start, `#` termination) and simple key-value pairs, guaranteeing robust transmission across noisy rural 2G GSM cellular networks.
