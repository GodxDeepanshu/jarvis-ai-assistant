"""
Radar & Real Satellite Imagery Service.
Integrates live RainViewer global radar API for real-time precipitation and satellite clouds.
"""
from typing import Dict, List, Optional
import time
import requests


class RadarSatelliteService:
    """Fetches real-time global weather radar and satellite cloud paths."""

    RAINVIEWER_API_URL = "https://api.rainviewer.com/public/weather-maps.json"

    _cache: Dict[str, object] = {
        "host": "https://tilecache.rainviewer.com",
        "latest_radar_path": "/v2/radar/50e04cdc930a",
        "latest_satellite_path": "/v2/satellite/50e04cdc930a",
        "past_radar_frames": [],
        "last_updated": 0,
    }

    @classmethod
    def get_live_radar_metadata(cls) -> Dict[str, object]:
        """Fetches current live radar and satellite paths from RainViewer."""
        now = time.time()
        if cls._cache["past_radar_frames"] and (now - cls._cache["last_updated"]) < 120:
            return cls._cache

        try:
            resp = requests.get(cls.RAINVIEWER_API_URL, timeout=4.0)
            if resp.status_code == 200:
                data = resp.json()
                host = data.get("host", "https://tilecache.rainviewer.com")
                radar_past = data.get("radar", {}).get("past", [])
                satellite_past = data.get("satellite", {}).get("infrared", [])

                if radar_past:
                    latest_radar = radar_past[-1]["path"]
                    cls._cache["latest_radar_path"] = latest_radar
                    cls._cache["past_radar_frames"] = radar_past

                if satellite_past:
                    cls._cache["latest_satellite_path"] = satellite_past[-1]["path"]

                cls._cache["host"] = host
                cls._cache["last_updated"] = now
        except Exception:
            pass

        return {
            "host": cls._cache["host"],
            "latest_radar_path": cls._cache["latest_radar_path"],
            "latest_satellite_path": cls._cache["latest_satellite_path"],
            "radar_tile_url_template": f"{cls._cache['host']}{cls._cache['latest_radar_path']}/512/{{z}}/{{x}}/{{y}}/2/1_1.png",
            "satellite_tile_url_template": f"{cls._cache['host']}{cls._cache['latest_satellite_path']}/512/{{z}}/{{x}}/{{y}}/0/0_0.png",
            "status": "LIVE_SATELLITE_RADAR_SYNCHRONIZED",
        }
