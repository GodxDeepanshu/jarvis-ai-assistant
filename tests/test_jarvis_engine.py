"""
Unit & Integration Tests for J.A.R.V.I.S. Planetary AGI Engine.
Validates Intent Classification, Planetary Dossiers, Live News Radar, and Telemetry.
"""
import pytest
from src.planetary_intel import PlanetaryIntelRegistry
from src.global_news_radar import GlobalNewsRadar
from src.system_telemetry import SystemTelemetryEngine
from src.agi_engine import JarvisAGIEngine


def test_planetary_intel_registry():
    cities = PlanetaryIntelRegistry.get_all_cities()
    assert len(cities) >= 10
    # Test specific city
    tokyo = PlanetaryIntelRegistry.get_city("tokyo")
    assert tokyo is not None
    assert tokyo["name"] == "Tokyo"
    assert "camera_stream_url" in tokyo
    assert "lat" in tokyo and "lon" in tokyo

    # Test fuzzy search
    ny = PlanetaryIntelRegistry.get_city("New York")
    assert ny is not None
    assert ny["country"] == "United States"


def test_global_news_radar():
    headlines = GlobalNewsRadar.fetch_live_headlines()
    assert len(headlines) > 0
    assert all("headline" in h and "category" in h for h in headlines)


def test_system_telemetry_engine():
    telem = SystemTelemetryEngine.get_hardware_telemetry()
    assert telem["status"] == "OPERATIONAL"
    assert telem["cpu_usage_percent"] >= 0
    assert telem["ram_total_gb"] > 0
    assert "power_percent" in telem


def test_jarvis_agi_engine_city_inspection():
    agi = JarvisAGIEngine()
    res = agi.process_command("Jarvis, show me live camera of Tokyo")
    assert res["intent"] == "CITY_INSPECTION"
    assert res["action"] == "FOCUS_CITY"
    assert res["city_id"] == "tokyo"
    assert "Tokyo" in res["speech"]


def test_jarvis_agi_engine_news():
    agi = JarvisAGIEngine()
    res = agi.process_command("What is the top news happening on Earth right now?")
    assert res["intent"] == "GLOBAL_NEWS"
    assert res["action"] == "DISPLAY_NEWS"
    assert "headlines" in res


def test_jarvis_agi_engine_diagnostics():
    agi = JarvisAGIEngine()
    res = agi.process_command("Jarvis, report arc reactor and system status")
    assert res["intent"] == "SYSTEM_DIAGNOSTICS"
    assert "telemetry" in res
