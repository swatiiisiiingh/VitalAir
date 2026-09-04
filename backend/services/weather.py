import httpx

async def get_weather(lat: float, lon: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m",
        "timezone": "auto",
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params, timeout=15)
        r.raise_for_status()
        return r.json()
