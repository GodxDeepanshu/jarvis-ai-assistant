# STARK INDUSTRIES // J.A.R.V.I.S. GLOBAL INTELLIGENCE SYSTEM

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-Photorealistic%204K%20Earth-black.svg)](https://threejs.org/)
[![CelesTrak](https://img.shields.io/badge/CelesTrak-SGP4%20Orbital%20Propagator-00e5ff.svg)](https://celestrak.org/)
[![OpenSky](https://img.shields.io/badge/OpenSky-Live%20ADS--B%20Transponders-ffaa00.svg)](https://opensky-network.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Mission%20Control%20Backend-009688.svg)](https://fastapi.tiangolo.com/)

An authentic Stark Industries aerospace command and situational awareness environment inspired by Tony Stark's J.A.R.V.I.S. from Iron Man. Features a photorealistic 3D Earth occupying ~75% of the viewport, authentic CelesTrak satellite tracking with mathematical SGP4 orbital propagation, real-time OpenSky Network ADS-B aircraft vectors, geographically anchored global news intelligence with deep-dive investigation dossiers, and an integrated conversational AGI agent that directly drives interface actions.

---

## 🛰️ System Architecture & Core Capabilities

```
jarvis-ai-assistant/
├── app.py                      # FastAPI Mission Control server & central REST dispatch
├── src/
│   ├── satellite_tracker.py    # CelesTrak GP/TLE ingestion & SGP4 orbital propagator
│   ├── aircraft_tracker.py     # OpenSky Network live ADS-B flight transponder vectors
│   ├── news_intelligence.py    # Geographically anchored news radar & investigation engine
│   ├── planetary_intel.py      # City citadels, coordinates, and local time
│   ├── agi_engine.py           # Conversational AGI intent understanding & interface control
│   └── system_telemetry.py     # Mission control hardware & connection telemetry
├── static/
│   ├── css/
│   │   └── stark_hud.css       # Restrained aerospace dark mission control styling
│   └── js/
│       ├── globe_core.js       # Three.js 4K photorealistic Earth, OrbitControls & lighting
│       ├── satellite_layer.js  # Orbital propagation, category filtering, 3D orbits
│       ├── aircraft_layer.js   # Live flight vectors, callsigns, altitude scaling
│       ├── news_layer.js       # Geographic event pins & Investigation Mode
│       ├── arc_reactor.js      # Stark biometric core
│       └── jarvis_controller.js# Master interface orchestration, voice & AI control
├── templates/
│   └── index.html              # 75% Earth viewport, aerospace HUD layout
└── tests/
    └── test_jarvis_engine.py   # Full test suite (100% passing)
```

### 1. Photorealistic 4K Earth Hero Viewport (~75% Screen)
- **High-Resolution NASA Textures**: Seamless spherical mapping of realistic planetary surface maps (`earth_day.jpg`), revolving atmospheric cloud sphere (`earth_clouds.png`), specular ocean reflectance, and atmospheric cyan rim glow.
- **Lighting & Space Environment**: Directional solar lighting simulating realistic day/night terminator lines with deep space starfield.
- **Restrained Aerospace Aesthetic**: Dark space background (`#01040a`), fine technical typography, monospace telemetry counters, thin dividers, and restrained cyan (`#00e5ff`), gold (`#ffd700`), and amber (`#ffaa00`) accents.

### 2. Global Satellite Tracking (Authentic CelesTrak & SGP4)
- **Real Orbital Propagation**: Uses the standard python `sgp4` library to compute geodetic positions $(\text{lat}, \text{lon})$, altitude (km), and orbital speed (km/s) from live CelesTrak Two-Line Elements (TLEs).
- **Orbital Spectrum Categories**:
  - Space Stations (ISS, Tiangong)
  - Earth Observation (Landsat, Sentinel)
  - Navigation (GPS, GLONASS)
  - Weather (NOAA, Himawari)
  - Communications (Starlink, OneWeb)
  - Science (Hubble)
- **3D Trajectory Projection**: Click any satellite or say *"Track the International Space Station"* to project its full 90-minute 3D orbital tube on Earth.

### 3. Global Aircraft Tracking (OpenSky Network ADS-B)
- **Live Transponder Telemetry**: Connects to OpenSky Network to track airborne commercial and cargo flights.
- **Flight Vectors**: Displays callsign, ICAO24, origin country, true heading orientation, altitude in feet/meters, and ground speed in knots/kmh.

### 4. Global News Intelligence & Investigation Mode
- Geographically anchored world events with category-colored tactical beacon pins.
- **News Investigation Mode**:
  - **What Happened**: Clear factual situation summary.
  - **Where & When**: Precise coordinates, location name, and timestamp.
  - **Why It Matters**: Strategic and geopolitical significance.
  - **Key Organizations & Entities**: Highlighted tags.
  - **Chronological Timeline**: Step-by-step event sequence.
  - **Confirmed Facts vs. Speculation**: Rigorous intelligence verification.
  - **Direct Source Repository**: One-click link to original source.

### 5. Conversational J.A.R.V.I.S. AI Assistant (Actions, Not Just Text)
- Speech recognition and speech synthesis in J.A.R.V.I.S.'s signature British cadence.
- Context-aware command understanding that **actually drives the visual interface**:
  - *"Track the International Space Station"* -> Highlights ISS, renders its orbit, flies camera to it, and opens orbital dossier.
  - *"Show me satellites above India"* -> Rotates globe to India and filters passing orbital objects.
  - *"Show aircraft"* -> Toggles live OpenSky flight transponder vectors.
  - *"Give me a global intelligence briefing"* -> Summarizes top global SITREP reports.
  - *"Investigate this breaking news"* -> Opens complete investigative dossier.

---

## 🚀 Quickstart

### 1. Installation
```bash
git clone https://github.com/GodxDeepanshu/jarvis-ai-assistant.git
cd jarvis-ai-assistant

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Launch Mission Control
```bash
python app.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

- Click on any **Satellite**, **Aircraft**, or **News Pin** to inspect its intelligence file.
- Speak commands or type into the bottom command bar to command J.A.R.V.I.S. directly!

### 3. Run Automated Tests
```bash
pytest tests/ -v
```

---

## 👤 Author

**Deepanshu Kushwaha**  
- Dual-degree: B.S. Data Science (IIT Madras) | B.Tech Electrical Engineering (BIET Jhansi)
- Aspire Institute Seed Fund Grantee (Harvard Business School faculty initiative)
- Reliance Foundation Undergraduate STEM Scholar
- GitHub: [@GodxDeepanshu](https://github.com/GodxDeepanshu)
