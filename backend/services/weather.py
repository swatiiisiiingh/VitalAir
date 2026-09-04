import httpx
import time

_cache = {}
CACHE_TTL = 600  # 10 minutes

async def get_weather(lat: float, lon: float):
    key = f"{round(lat, 2)},{round(lon, 2)}"
    now = time.time()

    if key in _cache:
        cached_data, cached_at = _cache[key]
        if now - cached_at < CACHE_TTL:
            return cached_data

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m",
        "daily": "temperature_2m_max,temperature_2m_min",
        "timezone": "auto",
        "forecast_days": 7,
    }

    async with httpx.AsyncClient() as client:
        for attempt in range(3):
            r = await client.get(url, params=params, timeout=10)
            if r.status_code == 429:
                time.sleep(2)
                continue
            r.raise_for_status()
            data = r.json()
            _cache[key] = (data, now)
            return data

    # If all retries hit 429, return last known cache if we have anything at all
    if key in _cache:
        return _cache[key][0]
    raise Exception("Open-Meteo rate limit exceeded, please try again shortly")
