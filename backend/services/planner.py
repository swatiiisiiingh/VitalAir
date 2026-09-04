import httpx
from datetime import datetime

async def get_activity_plan(lat: float, lon: float):
    """Find better outdoor 2-hour windows today from hourly temp + US AQI."""
    weather_url = "https://api.open-meteo.com/v1/forecast"
    aqi_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m",
        "forecast_days": 1,
        "timezone": "auto",
    }
    aparams = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "us_aqi",
        "forecast_days": 1,
        "timezone": "auto",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        w = (await client.get(weather_url, params=params)).json()
        a = (await client.get(aqi_url, params=aparams)).json()

    times = (w.get("hourly") or {}).get("time") or []
    temps = (w.get("hourly") or {}).get("temperature_2m") or []
    a_times = (a.get("hourly") or {}).get("time") or []
    aqis = (a.get("hourly") or {}).get("us_aqi") or []
    aqi_map = {t: v for t, v in zip(a_times, aqis)}

    scored = []
    for t, temp in zip(times, temps):
        if temp is None:
            continue
        aqi = aqi_map.get(t)
        # lower score = better outdoors
        heat_pen = max(0, (temp - 32) * 3) + max(0, (8 - temp) * 2)
        aqi_pen = 0 if aqi is None else max(0, aqi - 50) * 0.8
        score = heat_pen + aqi_pen
        scored.append({"time": t, "temperature": temp, "aqi": aqi, "score": score})

    if not scored:
        return {"windows": [], "note": "No hourly forecast available"}

    # rank hours, then merge nearby into 2h windows
    ranked = sorted(scored, key=lambda x: x["score"])[:6]
    windows = []
    used = set()
    for h in ranked:
        if h["time"] in used:
            continue
        # window = this hour + next
        idx = next(i for i, s in enumerate(scored) if s["time"] == h["time"])
        chunk = scored[idx : idx + 2]
        for c in chunk:
            used.add(c["time"])
        start = chunk[0]["time"]
        end = chunk[-1]["time"]
        try:
            label = (
                datetime.fromisoformat(start).strftime("%I %p").lstrip("0")
                + " – "
                + datetime.fromisoformat(end).strftime("%I %p").lstrip("0")
            )
        except Exception:
            label = f"{start[-5:]} – {end[-5:]}"
        avg_aqi = [c["aqi"] for c in chunk if c["aqi"] is not None]
        avg_temp = sum(c["temperature"] for c in chunk) / len(chunk)
        windows.append({
            "label": label,
            "temperature": round(avg_temp, 1),
            "aqi": int(round(sum(avg_aqi) / len(avg_aqi))) if avg_aqi else None,
            "quality": "Good" if (not avg_aqi or sum(avg_aqi)/len(avg_aqi) <= 50) else (
                "OK" if sum(avg_aqi)/len(avg_aqi) <= 100 else "Avoid if sensitive"
            ),
        })
        if len(windows) >= 3:
            break

    return {
        "windows": windows,
        "note": "Best outdoor windows today based on temperature + AQI forecast.",
    }
