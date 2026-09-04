import httpx
import os

async def get_aqi_waqi(lat: float, lon: float):
    token = os.getenv("WAQI_TOKEN")
    if not token or token.startswith("paste_"):
        return None
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url, params={"token": token}, timeout=12)
            r.raise_for_status()
            data = r.json()
            if data.get("status") != "ok":
                return None
            return data.get("data")
    except Exception:
        return None

async def get_aqi_openmeteo(lat: float, lon: float):
    """Free, no API key — US AQI + pollutants."""
    url = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
        "timezone": "auto",
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params, timeout=12)
        r.raise_for_status()
        data = r.json()
    cur = data.get("current") or {}
    us_aqi = cur.get("us_aqi")
    if us_aqi is None:
        return None
    # Shape like WAQI so the frontend keeps working
    return {
        "aqi": int(round(us_aqi)),
        "iaqi": {
            "pm25": {"v": cur.get("pm2_5")},
            "pm10": {"v": cur.get("pm10")},
            "o3": {"v": cur.get("ozone")},
            "no2": {"v": cur.get("nitrogen_dioxide")},
            "so2": {"v": cur.get("sulphur_dioxide")},
            "co": {"v": cur.get("carbon_monoxide")},
        },
        "source": "open-meteo",
    }

async def get_aqi(lat: float, lon: float):
    # Prefer WAQI if token works; otherwise Open-Meteo
    waqi = await get_aqi_waqi(lat, lon)
    if waqi and waqi.get("aqi") is not None:
        return waqi
    return await get_aqi_openmeteo(lat, lon)
