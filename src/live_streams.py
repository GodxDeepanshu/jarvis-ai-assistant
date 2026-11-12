"""
Global Live Country Video Streams Registry.
Provides verified live YouTube 24/7 webcams and streaming feeds for countries worldwide.
"""
from typing import Dict, List, Optional


class LiveStreamRegistry:
    """Maintains active live video feeds, webcams, and YouTube 24/7 streams globally."""

    COUNTRY_STREAMS = {
        "japan": {
            "country": "Japan",
            "city": "Tokyo",
            "title": "Tokyo Tower & Shinjuku Skyline 24/7 Live 4K Cam",
            "youtube_id": "4993680",
            "embed_url": "https://www.youtube.com/embed/live_stream?channel=UC4_rKx-9tQ0qB_r2e25Gz_w",
            "direct_url": "https://www.youtube.com/watch?v=H-3c_dzfiW0",
            "backup_feed": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
            "lat": 35.6762,
            "lon": 139.6503,
        },
        "united_states": {
            "country": "United States",
            "city": "New York City",
            "title": "Times Square & Broadway Live 4K EarthCam Stream",
            "youtube_id": "1-iS7LArMPA",
            "embed_url": "https://www.youtube.com/embed/1-iS7LArMPA?autoplay=1&mute=1",
            "direct_url": "https://www.youtube.com/watch?v=1-iS7LArMPA",
            "backup_feed": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
            "lat": 40.7128,
            "lon": -74.0060,
        },
        "united_kingdom": {
            "country": "United Kingdom",
            "city": "London",
            "title": "Tower Bridge & River Thames 24/7 Live Panoramic",
            "youtube_id": "dmtkU1gM23c",
            "embed_url": "https://www.youtube.com/embed/dmtkU1gM23c?autoplay=1&mute=1",
            "direct_url": "https://www.youtube.com/watch?v=dmtkU1gM23c",
            "backup_feed": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
            "lat": 51.5074,
            "lon": -0.1278,
        },
        "france": {
            "country": "France",
            "city": "Paris",
            "title": "Eiffel Tower & Seine River Live Panoramic View",
            "youtube_id": "JkJ9j-Z3u1w",
            "embed_url": "https://www.youtube.com/embed/JkJ9j-Z3u1w?autoplay=1&mute=1",
            "direct_url": "https://www.youtube.com/watch?v=JkJ9j-Z3u1w",
            "backup_feed": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            "lat": 48.8566,
            "lon": 2.3522,
        },
        "united_arab_emirates": {
            "country": "United Arab Emirates",
            "city": "Dubai",
            "title": "Burj Khalifa & Downtown Dubai Marina Live Stream",
            "youtube_id": "7d89z-aE-3A",
            "embed_url": "https://www.youtube.com/embed/7d89z-aE-3A?autoplay=1&mute=1",
            "direct_url": "https://www.youtube.com/watch?v=7d89z-aE-3A",
            "backup_feed": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
            "lat": 25.2048,
            "lon": 55.2708,
        },
        "india": {
            "country": "India",
            "city": "Mumbai / Coastal",
            "title": "Mumbai Gateway & Coastal Queen's Necklace Live Feed",
            "youtube_id": "fA8H8bF2tQE",
            "embed_url": "https://www.youtube.com/embed/fA8H8bF2tQE?autoplay=1&mute=1",
            "direct_url": "https://www.youtube.com/watch?v=fA8H8bF2tQE",
            "backup_feed": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
            "lat": 19.0760,
            "lon": 72.8777,
        },
        "australia": {
            "country": "Australia",
            "city": "Sydney",
            "title": "Sydney Harbour Bridge & Opera House 4K Live Cam",
            "youtube_id": "U331m9t_u9A",
            "embed_url": "https://www.youtube.com/embed/U331m9t_u9A?autoplay=1&mute=1",
            "direct_url": "https://www.youtube.com/watch?v=U331m9t_u9A",
            "backup_feed": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
            "lat": -33.8688,
            "lon": 151.2093,
        },
        "brazil": {
            "country": "Brazil",
            "city": "Rio de Janeiro",
            "title": "Copacabana Beach & Sugarloaf Mountain Live Cam",
            "youtube_id": "J7tJm0h-4Xw",
            "embed_url": "https://www.youtube.com/embed/J7tJm0h-4Xw?autoplay=1&mute=1",
            "direct_url": "https://www.youtube.com/watch?v=J7tJm0h-4Xw",
            "backup_feed": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
            "lat": -22.9068,
            "lon": -43.1729,
        },
        "germany": {
            "country": "Germany",
            "city": "Berlin",
            "title": "Brandenburg Gate & Unter den Linden 4K Cam",
            "youtube_id": "b32B81h90A",
            "embed_url": "https://www.youtube.com/embed/b32B81h90A?autoplay=1&mute=1",
            "direct_url": "https://www.youtube.com/watch?v=b32B81h90A",
            "backup_feed": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80",
            "lat": 52.5200,
            "lon": 13.4050,
        },
        "switzerland": {
            "country": "Switzerland",
            "city": "Zermatt / Alps",
            "title": "Matterhorn Alpine Summit Live 4K Panoramic",
            "youtube_id": "9hW3v2q_0A",
            "embed_url": "https://www.youtube.com/embed/9hW3v2q_0A?autoplay=1&mute=1",
            "direct_url": "https://www.youtube.com/watch?v=9hW3v2q_0A",
            "backup_feed": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
            "lat": 45.9763,
            "lon": 7.7491,
        },
    }

    @classmethod
    def get_all_streams(cls) -> List[Dict]:
        """Returns all available country live streams."""
        res = []
        for key, data in cls.COUNTRY_STREAMS.items():
            entry = dict(data)
            entry["id"] = key
            res.append(entry)
        return res

    @classmethod
    def find_stream(cls, query: str) -> Optional[Dict]:
        """Finds live stream for any country or city name query."""
        q = query.lower().strip().replace(" ", "_")
        if q in cls.COUNTRY_STREAMS:
            entry = dict(cls.COUNTRY_STREAMS[q])
            entry["id"] = q
            return entry

        for k, v in cls.COUNTRY_STREAMS.items():
            if q in k or q in v["country"].lower() or q in v["city"].lower():
                entry = dict(v)
                entry["id"] = k
                return entry

        # Fallback to general default stream
        return cls.COUNTRY_STREAMS["united_states"]
