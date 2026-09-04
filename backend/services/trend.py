import httpx
from collections import defaultdict
from datetime import datetime

async def get_week_trend(lat: float, lon: float):
    """Build last 7 days of daily avg temp + max US AQI from hourly Open-Meteo data."""
    weather_url = "https://api.open-meteo.com/v1/forecast"
    aqi_url = "https://air-quality-api.open-meteo.com/v1/air-quality"

    common = {
        "latitude": lat,
        "longitude": lon,
        "past_days": 7,
        "forecast_days": 1,
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        wr = await client.get(
            weather_url,
            params={**common, "hourly": "temperature_2m"},
        )
        ar = await client.get(
            aqi_url,
            params={**common, "hourly": "us_aqi,pm2_5"},
        )
        wr.raise_for_status()
        ar.raise_for_status()
        weather = wr.json()
        aqi = ar.json()

    # temperature by day
    w_time = (weather.get("hourly") or {}).get("time") or []
    w_temp = (weather.get("hourly") or {}).get("temperature_2m") or []
    temp_buckets = defaultdict(list)
    for t, v in zip(w_time, w_temp):
        if v is None:
            continue
        day = t[:10]  # YYYY-MM-DD
        temp_buckets[day].append(v)

    # aqi by day
    a_time = (aqi.get("hourly") or {}).get("time") or []
    a_aqi = (aqi.get("hourly") or {}).get("us_aqi") or []
    aqi_buckets = defaultdict(list)
    for t, v in zip(a_time, a_aqi):
        if v is None:
            continue
        day = t[:10]
        aqi_buckets[day].append(v)

    all_days = sorted(set(temp_buckets.keys()) | set(aqi_buckets.keys()))
    # only past + today, max 8 points, drop pure future if any
    out = []
    for day in all_days[-7:]:
        try:
            label = datetime.strptime(day, "%Y-%m-%d").strftime("%b %d")  # e.g. Aug 29
        except Exception:
            label = day
        temps = temp_buckets.get(day) or []
        aqis = aqi_buckets.get(day) or []
        out.append({
            "date": day,
            "label": label,
            "temperature": round(sum(temps) / len(temps), 1) if temps else None,
            "aqi": int(round(max(aqis))) if aqis else None,
        })
    return out
