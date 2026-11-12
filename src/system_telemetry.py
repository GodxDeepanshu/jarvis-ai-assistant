"""
System Telemetry Engine: Real-Time Host Hardware & Core OS Performance Diagnostics.
CPU utilization, RAM consumption, network I/O, and platform diagnostics.
"""
from typing import Dict
import psutil
import platform
import time


class SystemTelemetryEngine:
    """Extracts hardware and operational telemetry for Stark HUD displays."""

    @classmethod
    def get_hardware_telemetry(cls) -> Dict[str, object]:
        """Collects instantaneous CPU, Memory, Disk, and Network telemetry."""
        cpu_pct = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/") if platform.system() != "Windows" else psutil.disk_usage("C:\\")
        net_io = psutil.net_io_counters()

        # Core status
        cpu_cores = psutil.cpu_count(logical=True)
        cpu_freq = psutil.cpu_freq()
        current_freq_ghz = round(cpu_freq.current / 1000.0, 2) if cpu_freq else 3.20

        # Battery / Arc Reactor power status
        battery = psutil.sensors_battery()
        power_level = battery.percent if battery else 100
        power_plugged = battery.power_plugged if battery else True

        return {
            "status": "OPERATIONAL",
            "cpu_usage_percent": cpu_pct,
            "cpu_cores": cpu_cores,
            "cpu_frequency_ghz": current_freq_ghz,
            "ram_used_gb": round(mem.used / (1024**3), 2),
            "ram_total_gb": round(mem.total / (1024**3), 2),
            "ram_percent": mem.percent,
            "disk_percent": disk.percent,
            "bytes_sent_mb": round(net_io.bytes_sent / (1024**2), 1),
            "bytes_recv_mb": round(net_io.bytes_recv / (1024**2), 1),
            "power_percent": power_level,
            "power_plugged": power_plugged,
            "os_platform": f"{platform.system()} {platform.release()}",
            "system_uptime_seconds": int(time.time() - psutil.boot_time()),
        }
