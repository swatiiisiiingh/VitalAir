from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.weather import get_weather
from services.aqi import get_aqi
from services.advisory import generate_advisory
from services.trend import get_week_trend
from services.planner import get_activity_plan
from models import AdvisoryRequest
from database import init_db, save_advisory, get_history, delete_advisory

init_db()

app = FastAPI(title="Aira — Weather & AQI Health Advisory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "service": "Aira API"}

@app.get("/conditions")
async def conditions(lat: float, lon: float):
    weather = await get_weather(lat, lon)
    aqi = await get_aqi(lat, lon)
    return {"weather": weather, "aqi": aqi}

@app.post("/advisory")
async def advisory(req: AdvisoryRequest):
    try:
        weather = await get_weather(req.lat, req.lon)
        aqi = await get_aqi(req.lat, req.lon)
        if not weather:
            raise HTTPException(status_code=502, detail="Weather API failed")

        profile = req.profile.model_dump() if hasattr(req.profile, "model_dump") else req.profile.dict()
        advisory_text, risk_level = await generate_advisory(weather, aqi, profile)

        temp = (weather.get("current") or {}).get("temperature_2m")
        aqi_val = aqi.get("aqi") if isinstance(aqi, dict) else None

        save_advisory(
            location=req.location_name,
            lat=req.lat,
            lon=req.lon,
            temperature=temp,
            aqi=aqi_val,
            profile_summary=f"{profile.get('gender')}, {profile.get('age_group')}, {profile.get('health_condition')}, {profile.get('occupation')}",
            advisory_text=advisory_text,
            risk_level=risk_level,
        )

        return {
            "weather": weather,
            "aqi": aqi,
            "advisory": advisory_text,
            "risk_level": risk_level,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def history(lat: float, lon: float):
    return get_history(lat, lon)

@app.delete("/history/{item_id}")
def history_delete(item_id: int):
    delete_advisory(item_id)
    return {"ok": True, "deleted": item_id}


@app.get("/trend")
async def trend(lat: float, lon: float):
    try:
        return await get_week_trend(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Trend failed: {e}")

@app.get("/plan")
async def plan(lat: float, lon: float):
    try:
        return await get_activity_plan(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Plan failed: {e}")
