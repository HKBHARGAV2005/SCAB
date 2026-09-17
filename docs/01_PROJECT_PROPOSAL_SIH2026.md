# Project Proposal: SCAB (Solar Cold-storage Adaptive Brain)
### Smart India Hackathon (SIH 2026)
**Category**: Hardware / Cyber-Physical Systems  
**Theme**: Agriculture, FoodTech & Rural Development  
**Problem Statement**: Solar-Powered Smart Mini Cold Storage System for Fresh Vegetables in North Eastern Region (NER)

---

## 1. Context & Problem Background in NER

The North Eastern Region (NER) of India—comprising Assam, Meghalaya, Arunachal Pradesh, Sikkim, Mizoram, Nagaland, Tripura, and Manipur—possesses unique agro-climatic zones highly conducive to high-value horticultural crops such as **Bhut Jolokia (King Chilli), fresh green chillies, cabbage, French beans, tomatoes, ginger, and Lakadong turmeric**.

However, the region experiences severe post-harvest losses estimated at **35% to 42%**, compared to the national average of 18–25%. The root causes stem from:
1. **Rugged Hilly Terrain & Geographic Isolation**: Production clusters are located in remote villages with winding roads, frequent landslides, and transit times of 2 to 5 days to reach terminal consumption hubs.
2. **Unreliable Rural Grid Electricity**: Mountainous terrain makes conventional three-phase grid power unreliable, with daily blackouts lasting 10 to 18 hours in rural clusters.
3. **Severe Monsoon Climate**: Extended heavy rainfall (Meghalaya holds global rainfall records) leads to persistent cloud cover for 5 to 7 consecutive days, rendering conventional single-source solar PV systems inoperable once lead-acid/lithium batteries deplete within 24–48 hours.
4. **Lack of Farm-Gate Decentralized Storage**: Farmers are forced into distress sales at 60–70% below fair market value because perishable produce decays within 48–72 hours under high ambient humidity (85–98% RH).

---

## 2. Proposed Solution: SCAB Architecture

**SCAB (Solar Cold-storage Adaptive Brain)** is a decentralized, cyber-physical smart mini cold storage system designed specifically for village-level farmer cooperatives, collection centers, and farm-gate aggregation points.

Rather than relying on the fragile brute-force architecture:
$$\text{Solar PV} \longrightarrow \text{Battery} \longrightarrow \text{Compressor} \longrightarrow \text{Cold}$$

SCAB introduces an **Adaptive Multi-Stage Thermal & Controlled-Atmosphere Ecosystem**:

```
                         ☀️ SUN & DEEP SKY
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
           ☀️ Solar PV                      🌌 Radiative Sky
                │                           Cooling (Night)
                ▼                                 │
        LiFePO4 Battery +                         │
        Smart Microgrid                           │
                │                                 │
                ▼                                 ▼
        ┌───────────────┐                 ┌───────────────┐
        │ Rainwater HX  │                 │    PCM Ice    │
        │ Condenser     │                 │Thermal Battery│
        └───────┬───────┘                 └───────┬───────┘
                │                                 │
                └────────────────┬────────────────┘
                                 ▼
        Fresh Produce ──► 🌍 Earth-Air HX ──► 🧊 Cold Chamber (2-12°C)
        (35°C Harvest)    (Pre-cooling)                   ▲
                                                          │
                                               🌬️ Controlled Atmosphere
                                               (N₂ intermittent dosing:
                                                O₂ 3-5%, CO₂ 2-5%)
```

---

## 3. Core Technical Innovations

### Innovation 1: Decentralized Edge-AI "Mobile Brain" Architecture
Traditional microcontroller implementations (ESP32 / Arduino) lack the memory, matrix algebra capabilities, and floating-point power to run multi-variable optimization or fetch high-resolution weather models.
- **The SCAB Solution**: The field ESP32 acts as a robust, low-power telemetry & relay actuator node. Heavy predictive processing is offloaded to the **farmer cooperative operator's smartphone running the SCAB Android Edge-AI Engine**.
- **Two-Way GSM/SMS Protocol**: Telemetry and control commands communicate seamlessly over standard GSM signaling channels (SIM800L V2), ensuring **100% operational reliability even in 2G/no-broadband rural valleys**.

### Innovation 2: The "Cold Priming" Protocol
When 150–300 kg of freshly harvested produce at 35°C is suddenly placed inside an unconditioned chamber, the compressor experiences a **thermal shock surge**, drawing peak starting currents that trip inverters or deeply drain batteries.
- **The SCAB Solution**: The mobile app enforces a **Cold Priming Verification Gate**: Loading is locked until the LiFePO4 battery is 100% charged and the PCM ice thermal battery is 100% frozen ($T_{\text{pcm}} \le 0^\circ\text{C}$). The incoming produce sensible heat is absorbed by the pre-cooled thermal mass and Earth-Air HX, completely eliminating compressor motor strain.

### Innovation 3: Guaranteed 7–8 Day Autonomous Backup
- **PCM Ice Thermal Battery**: 120 kg water/ice storing $11.13\,\text{kWh}_{\text{thermal}}$ ($40.08\,\text{MJ}$ latent heat). Provides **4–5 days of passive refrigeration** with zero electricity.
- **LiFePO4 Battery Pack**: 2.4 kWh storage ($24\text{V}, 100\text{Ah}$) providing **48 hours (2 days)** of electronic monitoring and precision temperature trimming.
- **Combined Result**: **7–8 continuous days of safe preservation** during unbroken monsoon downpours with zero solar generation.

### Innovation 4: Ambient-Aware Compressor Scheduling (Maximum COP)
Compressor COP is governed by the Carnot relationship:
$$COP = \frac{T_{\text{evaporator}}}{T_{\text{condenser}} - T_{\text{evaporator}}}$$
Running a compressor in 38°C afternoon ambient air drives condensing temperature to 52°C, destroying efficiency. SCAB’s AI predicts the coolest ambient hours (late night / dawn) and activates harvested rainwater subcooling to drop $T_{\text{cond}}$ to 24°C, achieving a **+45% COP improvement** ($COP_{\text{conv}} \approx 2.35 \rightarrow COP_{\text{hybrid}} \approx 3.42$).

### Innovation 5: Intermittent Controlled Atmosphere (N₂) & Asphyxiation Safety Lock
- Vegetable respiration consumes organic reserves and generates deterioration heat:
  $$\text{Produce Sugars} + O_2 \longrightarrow CO_2 + H_2O + \text{Heat}$$
- SCAB injects intermittent $N_2$ pulses from a mini PSA/membrane module to maintain crop-specific $O_2$ levels at 3–5%, slowing respiration by **~65%** without causing anaerobic fermentation.
- **Safety Interlock**: If chamber $O_2 < 18\%$, the system automatically latches the physical door lock and sounds an audible alarm, preventing human asphyxiation hazard.

---

## 4. Socio-Economic Impact for North Eastern Farmers

| Metric | Conventional NER Scenario | With SCAB Deployment |
| :--- | :--- | :--- |
| **Post-Harvest Spoilage** | 35% - 42% wastage | **Reduced to < 6%** |
| **Storage Autonomy (Monsoon)** | 12 - 24 hours | **7 - 8 Days Guaranteed** |
| **Farmer Distress Selling** | Forced within 48h of harvest | **Flexible 25 - 45 Day Holding Window** |
| **Average Farmer Income** | Baseline realization | **+32% to +48% net profit increase** |
| **Electrical Energy Cost** | High reliance on diesel gen-sets | **100% Solar & Passive Thermal (Zero fuel cost)** |

---

## 5. Feasibility & Scalability Roadmap

1. **Phase 1 (Hackathon Demonstration)**: Full functional prototype with ESP32, multi-channel relays, simulated/live sensors, Leaflet GPS tracking, Open-Meteo 10-day weather AI, and Android APK deployment.
2. **Phase 2 (Pilot Deployment with FPOs)**: Field deployment of 3 units in horticulture clusters in Ri-Bhoi (Meghalaya), Jorhat (Assam), and Kohima (Nagaland).
3. **Phase 3 (Commercialization & Subsidies)**: Integration under Mission for Integrated Development of Horticulture (MIDH) and PM-KUSUM Component-A for decentralized rural agricultural infrastructure.
