"""
Unit & Integration Tests for Stark Industries JARVIS Global Intelligence System.
Validates CelesTrak SGP4 orbital propagation, OpenSky ADS-B flights, News Investigation Mode & AGI intents.
"""
import pytest
from src.satellite_tracker import SatelliteTrackingEngine
from src.aircraft_tracker import AircraftTrackingEngine
from src.news_intelligence import NewsIntelligenceEngine
from src.agi_engine import JarvisAGIEngine
from src.system_telemetry import SystemTelemetryEngine


def test_satellite_sgp4_propagation():
    sats = SatelliteTrackingEngine.get_all_satellite_states()
    assert len(sats) > 0
    iss = next((s for s in sats if "ISS" in s["name"]), sats[0])
    assert iss["alt_km"] > 100
    assert iss["speed_kms"] > 5.0
    assert "norad_id" in iss


def test_satellite_trajectory_arc():
    sats = SatelliteTrackingEngine.fetch_live_celestrak()
    iss = next((s for s in sats if "ISS" in s["name"]), sats[0])
    arc = SatelliteTrackingEngine.compute_orbital_trajectory_arc(iss, steps=20)
    assert len(arc) == 21
    assert all("lat" in pt and "lon" in pt and "alt_km" in pt for pt in arc)


def test_aircraft_adsb_tracking():
    flights = AircraftTrackingEngine.fetch_live_flights(max_display_flights=20)
    assert len(flights) > 0
    f = flights[0]
    assert "callsign" in f and "altitude_m" in f
    assert "ground_speed_kts" in f and "heading_deg" in f


def test_news_intelligence_investigation():
    events = NewsIntelligenceEngine.get_all_events()
    assert len(events) >= 5
    ev = events[0]
    assert "investigation" in ev
    assert "what_happened" in ev["investigation"]
    assert "why_it_matters" in ev["investigation"]
    assert "timeline" in ev["investigation"]
    assert "facts_vs_speculation" in ev["investigation"]


def test_jarvis_agi_satellite_command():
    agi = JarvisAGIEngine()
    res = agi.process_command("JARVIS, track the International Space Station")
    assert res["action"] == "TRACK_SATELLITE"
    assert "International Space Station" in res["speech"] or "ISS" in res["speech"]


def test_jarvis_agi_news_briefing_command():
    agi = JarvisAGIEngine()
    res = agi.process_command("Give me a global intelligence briefing")
    assert res["action"] == "SHOW_GLOBAL_BRIEFING"
    assert "events" in res
