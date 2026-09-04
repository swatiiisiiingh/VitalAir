import httpx
import os

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def build_prompt(weather, aqi, profile):
    current = (weather or {}).get("current", {})
    aqi_val = aqi.get("aqi") if isinstance(aqi, dict) else "unavailable"
    return f"""You are a health advisory assistant. Based on the current conditions and the person's profile,
write a short (3-4 sentence) plain-English health advisory. Be specific and practical.
End with a one-word risk level on its own line: RISK_LEVEL: LOW / MODERATE / HIGH.

Current conditions:
- Temperature: {current.get('temperature_2m')}°C (feels like {current.get('apparent_temperature')}°C)
- Humidity: {current.get('relative_humidity_2m')}%
- Wind: {current.get('wind_speed_10m')} km/h
- AQI: {aqi_val}

Person's profile:
- Gender: {profile.get('gender', 'Not specified')}
- Age group: {profile.get('age_group')}
- Health condition: {profile.get('health_condition')}
- Occupation: {profile.get('occupation')}

Consider known differences where relevant (e.g. pregnancy risk if health condition is Pregnant,
heat/pollution sensitivity, and outdoor exposure by occupation). Keep advice practical and non-alarmist.
"""

def fallback_advisory(weather, aqi, profile):
    current = (weather or {}).get("current", {})
    temp = current.get("temperature_2m")
    aqi_val = aqi.get("aqi") if isinstance(aqi, dict) else None
    age = profile.get("age_group", "Adult")
    health = profile.get("health_condition", "None")
    job = profile.get("occupation", "Indoor")
    gender = profile.get("gender", "")

    risk = "LOW"
    tips = []

    if aqi_val is not None:
        if aqi_val > 150:
            risk = "HIGH"
            tips.append(f"Air quality is poor (AQI {aqi_val}). Limit outdoor time and keep windows closed.")
        elif aqi_val > 100:
            risk = "MODERATE"
            tips.append(f"AQI is {aqi_val} (sensitive groups should reduce outdoor exposure).")
        else:
            tips.append(f"Air quality is acceptable (AQI {aqi_val}).")

    if temp is not None:
        if temp >= 38:
            risk = "HIGH" if risk != "LOW" else "MODERATE"
            tips.append(f"It's very hot ({temp:.0f}°C). Hydrate and avoid peak sun.")
        elif temp <= 10:
            tips.append(f"It's cold ({temp:.0f}°C). Dress warmly outdoors.")

    
    if gender == "Female" and health == "Pregnant":
        risk = "HIGH" if (aqi_val and aqi_val > 100) else ("MODERATE" if risk == "LOW" else risk)
        tips.append("During pregnancy, limit pollution exposure and avoid overheating outdoors.")
    elif gender == "Female":
        tips.append("Stay mindful of heat and air quality during outdoor hours.")

    if health and health != "None":
        if aqi_val and aqi_val > 100:
            risk = "HIGH"
        elif risk == "LOW":
            risk = "MODERATE"
        tips.append(f"With {health.lower()}, watch symptoms and keep medication handy if prescribed.")

    if "Outdoor" in (job or "") or "Athlete" in (job or ""):
        if aqi_val and aqi_val > 100:
            risk = "HIGH"
            tips.append("Outdoor work/exercise means higher exposure — shorten sessions today.")
        else:
            tips.append("Outdoor activity is reasonable; pace yourself and drink water.")

    if str(age).startswith("Senior") or str(age).startswith("Child"):
        if risk == "LOW":
            risk = "MODERATE"
        tips.append("Young children and seniors are more sensitive to heat and pollution.")

    if not tips:
        tips.append("Conditions look manageable. Stay hydrated and recheck if air quality changes.")

    return " ".join(tips), risk

async def generate_advisory(weather, aqi, profile):
    api_key = os.getenv("GROQ_API_KEY")
    if api_key and str(api_key).startswith("gsk_"):
        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
            body = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": build_prompt(weather, aqi, profile)}],
                "temperature": 0.4,
                "max_tokens": 250,
            }
            async with httpx.AsyncClient() as client:
                r = await client.post(GROQ_URL, headers=headers, json=body, timeout=30)
                if r.status_code < 400:
                    text = r.json()["choices"][0]["message"]["content"]
                    risk_level = "MODERATE"
                    upper = text.upper()
                    for level in ["LOW", "MODERATE", "HIGH"]:
                        if f"RISK_LEVEL: {level}" in upper:
                            risk_level = level
                            break
                    return text.split("RISK_LEVEL:")[0].strip(), risk_level
        except Exception:
            pass
    return fallback_advisory(weather, aqi, profile)
