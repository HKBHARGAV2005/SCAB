# SCAB Master Documentation Index
### Smart India Hackathon (SIH 2026)
**Project**: Solar-Powered Smart Mini Cold Storage System for Fresh Vegetables in North Eastern Region (NER)  
**Acronym**: **SCAB** (*Solar Cold-storage Adaptive Brain*)

---

## 📑 Complete Documentation Directory

| Document | Title | Description | Target Audience |
| :--- | :--- | :--- | :--- |
| **[01_PROJECT_PROPOSAL_SIH2026.md](./01_PROJECT_PROPOSAL_SIH2026.md)** | **Project Proposal & Problem Background** | Detailed socio-economic analysis of North East India post-harvest challenges, solution novelty, economic impact, and roadmap. | SIH Evaluators, Government Officials, Venture Mentors |
| **[02_SYSTEM_ARCHITECTURE_SPECIFICATION.md](./02_SYSTEM_ARCHITECTURE_SPECIFICATION.md)** | **System Architecture & Thermodynamics** | Complete cyber-physical block diagram, BOM, sizing equations, PUF transmission losses, latent heat of PCM ($120\,\text{kg}$), and COP boost. | Thermal Engineers, Mechanical Evaluators, SIH Jury |
| **[03_SOFTWARE_AND_AI_DOCUMENTATION.md](./03_SOFTWARE_AND_AI_DOCUMENTATION.md)** | **Software & Edge-AI Engine** | Edge computing paradigm, Open-Meteo 10-day weather lookahead, Cold Priming algorithm, multi-variable cost optimization, and GSM protocol. | Software Engineers, AI/ML Evaluators, App Developers |
| **[04_CROP_STORAGE_MANUAL_NER.md](./04_CROP_STORAGE_MANUAL_NER.md)** | **North Eastern Region Crop Storage Manual** | Literature-backed post-harvest parameters for 8 NER crops (Bhut Jolokia, Green Chilli, Cabbage, French Beans, Tomatoes, Lai Xaak, Ginger, Turmeric). | Agricultural Officers, Horticulturalists, Farmers |
| **[05_HARDWARE_WIRING_AND_DEPLOYMENT_GUIDE.md](./05_HARDWARE_WIRING_AND_DEPLOYMENT_GUIDE.md)** | **Hardware Wiring & Deployment Guide** | ESP32 GPIO pinout table, SIM800L 4.0V buck power circuit, u-blox GPS interfacing, sensors, relays, IP65 weatherproofing, and lightning protection. | Embedded Engineers, Hardware Teams, Field Technicians |
| **[06_SIH_JURY_PITCH_AND_QNA_GUIDE.md](./06_SIH_JURY_PITCH_AND_QNA_GUIDE.md)** | **SIH Jury Presentation Pitch & Q&A Defense** | 5-minute timed presentation script with slide cues, live demo walkthrough, and top 10 tough technical questions with bulletproof answers. | Hackathon Team Presenters, Pitch Leaders |

---

## 💻 Source Code Quick Links
- **Mobile Edge-AI Application**: [`src/App.tsx`](../src/App.tsx)
- **AI Decision & Optimization Engine**: [`src/services/aiDecisionEngine.ts`](../src/services/aiDecisionEngine.ts)
- **10-Day Real-Time Weather Engine**: [`src/services/weatherService.ts`](../src/services/weatherService.ts)
- **North Eastern Crop Database**: [`src/services/cropDatabase.ts`](../src/services/cropDatabase.ts)
- **Two-Way GSM/SMS Protocol**: [`src/services/smsProtocol.ts`](../src/services/smsProtocol.ts)
- **ESP32 Firmware Source**: [`src/services/esp32FirmwareReference.ino`](../src/services/esp32FirmwareReference.ino)
- **Native Android Project**: [`android/`](../android/)
