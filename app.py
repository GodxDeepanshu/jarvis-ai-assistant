"""
FastAPI Server & Central Dispatch: JARVIS Stark Industries Global Intelligence System.
Endpoints for 3D Photorealistic Earth, CelesTrak SGP4 Satellites, OpenSky ADS-B Aircraft,
Real-Time Satellite Radar (RainViewer), Live Country Streams, and Live World News.
"""
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import uvicorn

from src.satellite_tracker import SatelliteTrackingEngine
from src.aircraft_tracker import AircraftTrackingEngine
from src.news_intelligence import NewsIntelligenceEngine
from src.live_streams import LiveStreamRegistry
from src.radar_service import RadarSatelliteService
from src.planetary_intel import PlanetaryIntelRegistry
from src.system_telemetry import SystemTelemetryEngine
from src.agi_engine import JarvisAGIEngine

app = FastAPI(title="JARVIS Stark Industries Intelligence System", version="3.2.0")

# Setup directories
base_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(base_dir, "static")
templates_dir = os.path.join(base_dir, "templates")

os.makedirs(static_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Initialize AGI Brain
agi = JarvisAGIEngine()


class CommandRequest(BaseModel):
    query: str


@app.get("/")
async def serve_hud():
    """Renders the Stark Industries Command & Intelligence Centre HUD."""
    index_path = os.path.join(templates_dir, "index.html")
    return FileResponse(index_path, media_type="text/html")


@app.get("/api/satellites")
async def get_satellites():
    """Returns propagated SGP4 state vectors for active CelesTrak orbital objects."""
    sats = SatelliteTrackingEngine.get_all_satellite_states()
    return JSONResponse(content={"total": len(sats), "satellites": sats})


@app.get("/api/satellites/trajectory/{norad_id}")
async def get_satellite_trajectory(norad_id: str):
    """Calculates and returns full 3D orbital trajectory arc for selected satellite."""
    sats = SatelliteTrackingEngine.fetch_live_celestrak()
    target = next((s for s in sats if s["norad_id"] == norad_id), None)
    if not target:
        return JSONResponse(status_code=404, content={"error": "NORAD ID not found in active catalog"})
    arc = SatelliteTrackingEngine.compute_orbital_trajectory_arc(target)
    return JSONResponse(content={"norad_id": norad_id, "name": target["name"], "trajectory": arc})


@app.get("/api/aircraft")
async def get_aircraft():
    """Returns live OpenSky Network ADS-B flight transponder telemetry."""
    flights = AircraftTrackingEngine.fetch_live_flights()
    return JSONResponse(content={"total": len(flights), "flights": flights})


@app.get("/api/news/events")
async def get_news_events():
    """Returns geographically anchored global intelligence events."""
    events = NewsIntelligenceEngine.get_all_events()
    return JSONResponse(content={"total": len(events), "events": events})


@app.get("/api/news/live")
async def get_live_world_news(category: str = "world"):
    """Returns live breaking international news across categories."""
    headlines = NewsIntelligenceEngine.fetch_live_world_headlines(category=category)
    return JSONResponse(content={"category": category, "total": len(headlines), "news": headlines})


@app.get("/api/news/investigate/{event_id}")
async def investigate_news_event(event_id: str):
    """Returns full investigative dossier for selected news event."""
    ev = NewsIntelligenceEngine.get_event(event_id)
    if not ev:
        return JSONResponse(status_code=404, content={"error": "Intelligence event not found"})
    return JSONResponse(content=ev)


@app.get("/api/streams")
async def get_all_country_streams():
    """Returns registry of live video feeds & streams for countries worldwide."""
    return JSONResponse(content=LiveStreamRegistry.get_all_streams())


@app.get("/api/streams/{country_query}")
async def get_country_stream(country_query: str):
    """Returns live stream and YouTube direct feed for a specific country."""
    stream = LiveStreamRegistry.find_stream(country_query)
    if not stream:
        return JSONResponse(status_code=404, content={"error": "Country stream not found"})
    return JSONResponse(content=stream)


@app.get("/api/radar")
async def get_radar_metadata():
    """Returns live RainViewer weather radar & real satellite infrared cloud paths."""
    return JSONResponse(content=RadarSatelliteService.get_live_radar_metadata())


@app.get("/api/telemetry")
async def get_telemetry():
    """Returns host hardware & Stark Arc Reactor telemetry."""
    return JSONResponse(content=SystemTelemetryEngine.get_hardware_telemetry())


@app.post("/api/command")
async def execute_command(req: CommandRequest):
    """Processes spoken or typed natural language command through JARVIS AGI."""
    result = agi.process_command(req.query)
    return JSONResponse(content=result)


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
