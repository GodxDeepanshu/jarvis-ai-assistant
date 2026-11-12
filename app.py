"""
FastAPI Server & Central Dispatch: JARVIS Planetary AGI Command Hub.
Serves Tony Stark 3D Holographic HUD, WebSockets/REST APIs for Live City Cameras,
Real-Time Earth News Ticker, and Voice Synthesis.
"""
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import uvicorn

from src.planetary_intel import PlanetaryIntelRegistry
from src.global_news_radar import GlobalNewsRadar
from src.system_telemetry import SystemTelemetryEngine
from src.agi_engine import JarvisAGIEngine

app = FastAPI(title="JARVIS Planetary AGI", version="2.0.0")

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
    """Renders the Tony Stark 3D Holographic HUD."""
    index_path = os.path.join(templates_dir, "index.html")
    return FileResponse(index_path, media_type="text/html")


@app.get("/api/cities")
async def get_cities():
    """Returns all registered global cities with coordinates and camera streams."""
    return JSONResponse(content=PlanetaryIntelRegistry.get_all_cities())


@app.get("/api/city/{city_id}")
async def get_city_dossier(city_id: str):
    """Returns intelligence dossier and live camera stream for a specific city."""
    city = PlanetaryIntelRegistry.get_city(city_id)
    if not city:
        return JSONResponse(status_code=404, content={"error": "City not found on planetary registry"})
    return JSONResponse(content=city)


@app.get("/api/news")
async def get_global_news():
    """Returns live planetary news radar headlines."""
    return JSONResponse(content=GlobalNewsRadar.fetch_live_headlines())


@app.get("/api/telemetry")
async def get_telemetry():
    """Returns live host hardware & Arc Reactor telemetry."""
    return JSONResponse(content=SystemTelemetryEngine.get_hardware_telemetry())


@app.post("/api/command")
async def execute_command(req: CommandRequest):
    """Processes spoken or typed natural language query through the AGI engine."""
    result = agi.process_command(req.query)
    return JSONResponse(content=result)


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
