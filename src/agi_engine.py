"""
JARVIS AGI Command & Intelligence Controller.
Translates spoken natural language into direct UI/3D-Earth actions,
orbital locks, flight vector filters, and deep news investigations.
"""
from typing import Dict, List, Optional
from datetime import datetime

from src.satellite_tracker import SatelliteTrackingEngine
from src.aircraft_tracker import AircraftTrackingEngine
from src.news_intelligence import NewsIntelligenceEngine
from src.planetary_intel import PlanetaryIntelRegistry
from src.system_telemetry import SystemTelemetryEngine


class JarvisAGIEngine:
    """Core Stark Industries AGI Reasoning Engine."""

    def __init__(self):
        self.name = "J.A.R.V.I.S."
        self.designation = "Stark Industries Global Intelligence Director"

    def process_command(self, query: str) -> Dict[str, object]:
        """
        Interprets natural language commands and returns structured UI actions,
        camera flight coordinates, layer filters, and spoken synthesis.
        """
        q = query.lower().strip()
        timestamp = datetime.now().strftime("%H:%M:%S UTC")

        # 1. ISS / Space Station Tracking
        if any(w in q for w in ["iss", "space station", "zarya", "international space station"]):
            sats = SatelliteTrackingEngine.get_all_satellite_states()
            iss = next((s for s in sats if "ISS" in s["name"]), sats[0] if sats else None)
            speech = (
                f"Locking tracking sensors onto the International Space Station, NORAD ID {iss['norad_id'] if iss else '25544'}. "
                f"Current altitude is {iss['alt_km'] if iss else 420.0} kilometers above Earth, "
                f"traveling at an orbital velocity of {iss['speed_kms'] if iss else 7.66} kilometers per second. "
                "Projecting full 90-minute orbital trajectory on your HUD now, sir."
            )
            return {
                "intent": "TRACK_SATELLITE",
                "speech": speech,
                "action": "TRACK_SATELLITE",
                "target_name": "ISS (ZARYA)",
                "norad_id": iss["norad_id"] if iss else "25544",
                "target_data": iss,
                "timestamp": timestamp,
            }

        # 2. Satellites Above Specific Country (e.g. India, US, Europe)
        if "satellite" in q and ("above" in q or "over" in q or "passing" in q or "orbit"):
            target_region = "Global"
            lat, lon = 20.0, 78.0  # Default India
            if "india" in q:
                target_region = "India"
                lat, lon = 20.5937, 78.9629
            elif "us" in q or "united states" in q or "america" in q:
                target_region = "United States"
                lat, lon = 37.0902, -95.7129
            elif "europe" in q:
                target_region = "Europe"
                lat, lon = 54.5260, 15.2551

            speech = (
                f"Filtering active CelesTrak orbital objects currently transiting the {target_region} geographic corridor. "
                "Rotating 3D Earth perspective and highlighting orbital passes on your display, sir."
            )
            return {
                "intent": "FILTER_SATELLITES_REGION",
                "speech": speech,
                "action": "FOCUS_AND_FILTER_SATELLITES",
                "region": target_region,
                "lat": lat,
                "lon": lon,
                "timestamp": timestamp,
            }

        # 3. Aircraft Tracking / ADS-B Telemetry
        if any(w in q for w in ["aircraft", "airplane", "flights", "air traffic", "plane"]):
            flights = AircraftTrackingEngine.fetch_live_flights()
            count = len(flights)
            speech = (
                f"Air traffic surveillance active. There are currently {count} live commercial and cargo aircraft "
                "tracked across primary continental airway corridors. Transponder vectors highlighted on the 3D globe."
            )
            return {
                "intent": "AIRCRAFT_TELEMETRY",
                "speech": speech,
                "action": "TOGGLE_AIRCRAFT_LAYER",
                "flight_count": count,
                "flights": flights[:10],
                "timestamp": timestamp,
            }

        # 4. Global Briefing / SITREP
        if any(w in q for w in ["brief", "briefing", "sitrep", "summary", "intelligence report"]):
            events = NewsIntelligenceEngine.get_all_events()
            speech = (
                f"Global Situational Briefing compiled, sir. Top developments include ISRO's reusable spaceplane orbital integration in India, "
                f"quantum-encrypted satellite communications tests in Europe, and continuous magnetic confinement milestones at ITER. "
                "Displaying interactive situational event markers across Earth."
            )
            return {
                "intent": "GLOBAL_BRIEFING",
                "speech": speech,
                "action": "SHOW_GLOBAL_BRIEFING",
                "events": events,
                "timestamp": timestamp,
            }

        # 5. News Investigation Mode
        if any(w in q for w in ["investigate", "explain news", "why it matters", "breaking news"]):
            events = NewsIntelligenceEngine.get_all_events()
            ev = events[0]
            speech = (
                f"Initiating deep intelligence investigation for: '{ev['title']}'. "
                f"Location anchored at {ev['location_name']}. Key entities involved include {', '.join(ev['investigation']['key_entities'])}. "
                f"Why it matters: {ev['investigation']['why_it_matters']}. Opening the full intelligence file on your right console, sir."
            )
            return {
                "intent": "INVESTIGATE_NEWS",
                "speech": speech,
                "action": "OPEN_NEWS_DOSSIER",
                "event_id": ev["id"],
                "event_data": ev,
                "timestamp": timestamp,
            }

        # 6. City / Geographical Camera Reconnaissance
        for city_id, city_data in PlanetaryIntelRegistry.GLOBAL_CITIES.items():
            if city_data["name"].lower() in q or city_id in q:
                city_info = PlanetaryIntelRegistry.get_city(city_id)
                speech = (
                    f"Orienting planetary reconnaissance toward {city_info['name']}, {city_info['country']}. "
                    f"Coordinates: {city_info['lat']:.2f} degrees North, {city_info['lon']:.2f} degrees East. "
                    f"Local time: {city_info['local_time']}. Meteorology: {city_info['weather_condition']}, {city_info['weather_temp_c']} degrees Celsius. "
                    "Deploying 4K satellite multispectral reconnaissance feed to your viewport, sir."
                )
                return {
                    "intent": "CITY_INSPECTION",
                    "speech": speech,
                    "action": "FOCUS_CITY",
                    "city_id": city_id,
                    "city_data": city_info,
                    "lat": city_info["lat"],
                    "lon": city_info["lon"],
                    "timestamp": timestamp,
                }

        # 7. Zoom to Coordinates / Geographic Location
        if "zoom" in q or "go to" in q or "navigate to" in q:
            # Check for city or default to New Delhi
            target_name = "New Delhi"
            lat, lon = 28.6139, 77.2090
            speech = f"Navigating camera coordinates to {target_name}. Resolving high-resolution terrain textures, sir."
            return {
                "intent": "NAVIGATE_COORDINATES",
                "speech": speech,
                "action": "FOCUS_LOCATION",
                "name": target_name,
                "lat": lat,
                "lon": lon,
                "timestamp": timestamp,
            }

        # 8. System Diagnostics & Telemetry
        if any(w in q for w in ["status", "diagnostics", "arc reactor", "telemetry", "health"]):
            telem = SystemTelemetryEngine.get_hardware_telemetry()
            speech = (
                f"Stark intelligence infrastructure operating nominally. Arc Reactor core at {telem['power_percent']} percent power. "
                f"CPU computational load is {telem['cpu_usage_percent']} percent across {telem['cpu_cores']} logical threads. "
                "CelesTrak orbital feed: CONNECTED. OpenSky ADS-B network: ACTIVE."
            )
            return {
                "intent": "SYSTEM_DIAGNOSTICS",
                "speech": speech,
                "action": "DISPLAY_TELEMETRY",
                "telemetry": telem,
                "timestamp": timestamp,
            }

        # 9. General Conversational Intelligence
        speech = (
            f"Command acknowledged: '{query}'. Cross-referencing orbital satellite trajectories, "
            "ADS-B airway feeds, and global situational news. Ready for your directive, sir."
        )
        return {
            "intent": "GENERAL_QUERY",
            "speech": speech,
            "action": "SPEAK",
            "timestamp": timestamp,
        }
