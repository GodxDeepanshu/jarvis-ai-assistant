"""
Planetary Intelligence Engine: Global Cities Dossier & Live Camera Registry.
Coordinates, real-time metrics, geopolitical data, and live streaming webcam feeds.
"""
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta


class PlanetaryIntelRegistry:
    """Maintains planetary city dossiers and real-time streaming camera channels."""

    GLOBAL_CITIES = {
        "tokyo": {
            "name": "Tokyo",
            "country": "Japan",
            "lat": 35.6762,
            "lon": 139.6503,
            "timezone_offset": 9,
            "population": "37,400,000",
            "elevation": "40 m",
            "strategic_role": "Global Financial Hub & Advanced Megacity",
            "camera_name": "Shibuya Crossing Live Panoramic Feed",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/H-3c_dzfiW0?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 19,
            "weather_condition": "Clear Sky",
            "air_quality_index": 28,
            "description": "Tokyo is the world's most populous metropolitan area, blending ultramodern neon skyscrapers with historic temples.",
        },
        "new_york": {
            "name": "New York City",
            "country": "United States",
            "lat": 40.7128,
            "lon": -74.0060,
            "timezone_offset": -5,
            "population": "19,800,000",
            "elevation": "10 m",
            "strategic_role": "Primary Global Financial Center (NYSE/NASDAQ)",
            "camera_name": "Times Square Live 4K Cam",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/1-iS7LArMPA?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 14,
            "weather_condition": "Partly Cloudy",
            "air_quality_index": 35,
            "description": "The premier economic capital of the Americas, housing the United Nations headquarters and Wall Street.",
        },
        "london": {
            "name": "London",
            "country": "United Kingdom",
            "lat": 51.5074,
            "lon": -0.1278,
            "timezone_offset": 0,
            "population": "9,500,000",
            "elevation": "11 m",
            "strategic_role": "European Commercial & FinTech Center",
            "camera_name": "Tower Bridge & River Thames 24/7 Feed",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/dmtkU1gM23c?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 12,
            "weather_condition": "Light Mist",
            "air_quality_index": 22,
            "description": "Historic global metropolis, prime center of international diplomacy, banking, and European technology innovation.",
        },
        "paris": {
            "name": "Paris",
            "country": "France",
            "lat": 48.8566,
            "lon": 2.3522,
            "timezone_offset": 1,
            "population": "11,100,000",
            "elevation": "35 m",
            "strategic_role": "EU Diplomatic, Aerospace & Culture Capital",
            "camera_name": "Eiffel Tower Live Panoramic Cam",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/JkJ9j-Z3u1w?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 15,
            "weather_condition": "Overcast",
            "air_quality_index": 29,
            "description": "Major political, economic, and cultural capital of the European Union situated along the Seine River.",
        },
        "dubai": {
            "name": "Dubai",
            "country": "United Arab Emirates",
            "lat": 25.2048,
            "lon": 55.2708,
            "timezone_offset": 4,
            "population": "3,600,000",
            "elevation": "5 m",
            "strategic_role": "Middle East Aviation & Commercial Crossroad",
            "camera_name": "Burj Khalifa & Downtown Skyline Feed",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/7d89z-aE-3A?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 31,
            "weather_condition": "Clear / Desert Warmth",
            "air_quality_index": 45,
            "description": "Ultra-modern skyscraper metropolis, sovereign wealth nexus, and primary logistical gateway of the Persian Gulf.",
        },
        "mumbai": {
            "name": "Mumbai",
            "country": "India",
            "lat": 19.0760,
            "lon": 72.8777,
            "timezone_offset": 5.5,
            "population": "21,300,000",
            "elevation": "14 m",
            "strategic_role": "Financial Capital of India (BSE/NSE, RBI)",
            "camera_name": "Marine Drive Coastal Queen's Necklace Cam",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/fA8H8bF2tQE?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 29,
            "weather_condition": "Hazy Sunshine",
            "air_quality_index": 120,
            "description": "Economic powerhouse of South Asia, headquarters to major Indian conglomerates and world's largest film industry.",
        },
        "singapore": {
            "name": "Singapore",
            "country": "Singapore",
            "lat": 1.3521,
            "lon": 103.8198,
            "timezone_offset": 8,
            "population": "5,900,000",
            "elevation": "15 m",
            "strategic_role": "Southeast Asian Maritime & AI Tech Hub",
            "camera_name": "Marina Bay Sands Panoramic Skyline",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/xLzYd5zI3tQ?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 28,
            "weather_condition": "Tropical Shower",
            "air_quality_index": 24,
            "description": "Global island city-state recognized as a premier logistics superport, fintech epicenter, and smart nation leader.",
        },
        "sydney": {
            "name": "Sydney",
            "country": "Australia",
            "lat": -33.8688,
            "lon": 151.2093,
            "timezone_offset": 11,
            "population": "5,300,000",
            "elevation": "19 m",
            "strategic_role": "Oceania Financial & Maritime Gateway",
            "camera_name": "Sydney Harbour & Opera House Live Cam",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/U331m9t_u9A?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 22,
            "weather_condition": "Sunny",
            "air_quality_index": 18,
            "description": "Largest economic hub in Australia, renowned for its deep natural harbor, iconic opera architecture, and tech corridor.",
        },
        "cairo": {
            "name": "Cairo",
            "country": "Egypt",
            "lat": 30.0444,
            "lon": 31.2357,
            "timezone_offset": 2,
            "population": "22,200,000",
            "elevation": "23 m",
            "strategic_role": "North African Diplomatic & Suez Canal Nexus",
            "camera_name": "Giza Plateau & Nile River View",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/3Aadw0aG5Xk?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 26,
            "weather_condition": "Dry & Sunny",
            "air_quality_index": 95,
            "description": "Historic crossroads of Africa and the Middle East, situated near the Nile River and the historic Great Pyramids.",
        },
        "rio_de_janeiro": {
            "name": "Rio de Janeiro",
            "country": "Brazil",
            "lat": -22.9068,
            "lon": -43.1729,
            "timezone_offset": -3,
            "population": "13,600,000",
            "elevation": "5 m",
            "strategic_role": "South American Maritime & Energy Capital",
            "camera_name": "Copacabana Beach & Sugarloaf Cam",
            "camera_type": "public_stream",
            "camera_stream_url": "https://www.youtube.com/embed/J7tJm0h-4Xw?autoplay=1&mute=1",
            "camera_fallback_image": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
            "weather_temp_c": 27,
            "weather_condition": "Coastal Breeze",
            "air_quality_index": 38,
            "description": "Major cultural and trade hub of South America, famed for Guanabara Bay and deep offshore energy reserves.",
        },
    }

    @classmethod
    def get_all_cities(cls) -> List[Dict]:
        """Returns list of all registered cities with computed real-time local timestamps."""
        cities = []
        utc_now = datetime.now(timezone.utc)
        for city_id, data in cls.GLOBAL_CITIES.items():
            offset_hours = data["timezone_offset"]
            local_time = utc_now + timedelta(hours=offset_hours)
            entry = dict(data)
            entry["id"] = city_id
            entry["local_time"] = local_time.strftime("%H:%M:%S (%d %b)")
            cities.append(entry)
        return cities

    @classmethod
    def get_city(cls, city_id: str) -> Optional[Dict]:
        """Retrieve full intelligence dossier for a single city by id or name query."""
        clean_id = city_id.lower().strip().replace(" ", "_")
        if clean_id in cls.GLOBAL_CITIES:
            data = dict(cls.GLOBAL_CITIES[clean_id])
            offset_hours = data["timezone_offset"]
            local_time = datetime.now(timezone.utc) + timedelta(hours=offset_hours)
            data["id"] = clean_id
            data["local_time"] = local_time.strftime("%H:%M:%S (%d %b %Y)")
            return data

        # Fuzzy match by name or country
        for k, v in cls.GLOBAL_CITIES.items():
            if clean_id in k or clean_id in v["name"].lower() or clean_id in v["country"].lower():
                data = dict(v)
                offset_hours = data["timezone_offset"]
                local_time = datetime.now(timezone.utc) + timedelta(hours=offset_hours)
                data["id"] = k
                data["local_time"] = local_time.strftime("%H:%M:%S (%d %b %Y)")
                return data

        return None
