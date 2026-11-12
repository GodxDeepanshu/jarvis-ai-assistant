"""
AGI Reasoning Engine: Multi-Threaded Intent Classification, Tool Dispatch & Reasoning.
Articulates intelligent conversational synthesis in JARVIS's signature Tony Stark persona.
"""
from typing import Dict, List, Optional
import re
from datetime import datetime

from src.planetary_intel import PlanetaryIntelRegistry
from src.global_news_radar import GlobalNewsRadar
from src.system_telemetry import SystemTelemetryEngine


class JarvisAGIEngine:
    """Core Artificial General Intelligence reasoning orchestrator."""

    def __init__(self):
        self.name = "J.A.R.V.I.S."
        self.creator = "Deepanshu Kushwaha & Stark Industries"

    def process_command(self, query: str) -> Dict[str, object]:
        """
        Parses natural language voice/text commands, reasons over planetary tools,
        and returns structured response with speech payload and UI action dispatch.
        """
        q = query.lower().strip()
        timestamp = datetime.now().strftime("%H:%M:%S")

        # 1. City / Planetary Camera Inspection
        # e.g., "Tell me about Tokyo", "Show camera of Paris", "What's happening in Mumbai"
        for city_id, city_data in PlanetaryIntelRegistry.GLOBAL_CITIES.items():
            city_name_lower = city_data["name"].lower()
            if city_name_lower in q or city_id in q:
                city_info = PlanetaryIntelRegistry.get_city(city_id)
                speech = (
                    f"Accessing planetary reconnaissance for {city_info['name']}, {city_info['country']}. "
                    f"Local time is {city_info['local_time']}. Weather is currently {city_info['weather_condition']} "
                    f"at {city_info['weather_temp_c']} degrees Celsius. "
                    f"Strategic status: {city_info['strategic_role']}. "
                    f"Patching live optical sensor feed '{city_info['camera_name']}' to your HUD now, sir."
                )
                return {
                    "intent": "CITY_INSPECTION",
                    "speech": speech,
                    "action": "FOCUS_CITY",
                    "city_id": city_id,
                    "city_data": city_info,
                    "timestamp": timestamp,
                }

        # 2. Global News Radar
        # e.g., "What is the top news on Earth", "breaking news", "headlines"
        if any(w in q for w in ["news", "headline", "happening on earth", "world news", "breaking", "events"]):
            headlines = GlobalNewsRadar.fetch_live_headlines()
            top_3 = headlines[:3]
            speech_headlines = ". ".join([f"{h['category']}: {h['headline']}" for h in top_3])
            speech = f"Scanning global news radar across all orbital feeds. Here are the top events on Earth, sir: {speech_headlines}."
            return {
                "intent": "GLOBAL_NEWS",
                "speech": speech,
                "action": "DISPLAY_NEWS",
                "headlines": headlines,
                "timestamp": timestamp,
            }

        # 3. System Diagnostics / Telemetry / Arc Reactor
        # e.g., "Status", "diagnostics", "arc reactor", "system health", "cpu", "telemetry"
        if any(w in q for w in ["status", "diagnostic", "arc reactor", "telemetry", "health", "cpu", "ram", "power"]):
            telem = SystemTelemetryEngine.get_hardware_telemetry()
            speech = (
                f"All systems operational, sir. Arc Reactor core power is at {telem['power_percent']} percent. "
                f"CPU load is steady at {telem['cpu_usage_percent']} percent across {telem['cpu_cores']} logical threads. "
                f"Memory consumption is {telem['ram_used_gb']} gigabytes of {telem['ram_total_gb']} gigabytes available."
            )
            return {
                "intent": "SYSTEM_DIAGNOSTICS",
                "speech": speech,
                "action": "DISPLAY_TELEMETRY",
                "telemetry": telem,
                "timestamp": timestamp,
            }

        # 4. Identity / AGI Capabilities
        if any(w in q for w in ["who are you", "what are you", "your name", "introduce yourself"]):
            speech = (
                "I am J.A.R.V.I.S. — Just A Rather Very Intelligent System. "
                "Engineered as a planetary artificial general intelligence by Deepanshu Kushwaha. "
                "I monitor real-time planetary metrics, orbital feeds, live city camera networks, "
                "global breaking news, and quantitative intelligence across the Earth. At your service, sir."
            )
            return {
                "intent": "GREETING",
                "speech": speech,
                "action": "SPEAK",
                "timestamp": timestamp,
            }

        # 5. Protocol Initiations
        if "mark" in q or "protocol" in q or "suit" in q or "armor" in q:
            speech = (
                "Protocol initiated, sir. Power distribution redirected to holographic HUD. "
                "Orbital satellite telemetry engaged. Threat level: nominal."
            )
            return {
                "intent": "PROTOCOL",
                "speech": speech,
                "action": "INITIATE_HUD_PULSE",
                "timestamp": timestamp,
            }

        # 6. General Conversational Intelligence
        speech = (
            f"Command acknowledged: '{query}'. Processing planetary data and cross-referencing global telemetry. "
            "How may I further assist your operations on Earth today, sir?"
        )
        return {
            "intent": "GENERAL_QUERY",
            "speech": speech,
            "action": "SPEAK",
            "timestamp": timestamp,
        }
