# VitalAir — AI-Powered Personalized Weather & AQI Health Advisory

**Problem Statement PS-4** · Category: AI + Development
**Team Hackathon** — Vedant Seth · Sharvari Bhimte · Sarvagya Joshi · Swati Singh

## Live Demo

- **App:** https://hackathon-ps4-7m74oyvuv-projectswati.vercel.app?_vercel_share=uimAF2Kx7Prl1n1E4gOJQAM99P0HnVz7
- **Backend API:** https://hackathon-ps4-backend.onrender.com

> Note: the backend runs on Render's free tier, which sleeps after inactivity. The first request after idle may take 30–50 seconds while it wakes up — visit the backend URL once before demoing to warm it up.

## The Problem

Generic weather and AQI alerts apply the same threshold to everyone. But an asthma patient, an outdoor worker, and a healthy adult all face very different real-world risk from the same conditions — and today, they all get the same generic warning.

## What We Built

VitalAir pulls live weather and air quality data for any location, combines it with a short user health profile, and uses an LLM to generate a personalized, plain-English health advisory — instead of a one-size-fits-all threshold alert.

### Core Features
- **Location input** — search any city, or use live geolocation
- **Live weather dashboard** — temperature, feels-like, humidity, wind
- **Live AQI dashboard** — current AQI value, category, and pollutant breakdown
- **Personal health profile** — age group, health condition, occupation
- **AI-generated advisory** — a short, specific, plain-English recommendation that changes based on the person's profile and current conditions, with a risk level (Low / Moderate / High)
- **7-day trend view** — chart of past AQI and temperature readings, pulled from advisory history
- **Profile comparison mode** — instantly compare the advisory for two different profiles (e.g. healthy adult vs. senior with asthma working outdoors) under the same live conditions
- **Demo mode** — one-click walkthrough with a preset profile, for fast judge evaluation

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Weather data | [Open-Meteo](https://open-meteo.com) (free, no API key) |
| Air quality data | [WAQI](https://aqicn.org) free tier |
| AI advisory generation | Groq API |
| Database | SQLite (advisory history) |
| Frontend | React (Vite) |
| Charts | Recharts |
| Backend hosting | Render |
| Frontend hosting | Vercel |

## Why This Matters

Health-relevant environmental risk isn't one-size-fits-all. A senior with asthma working outdoors on a humid, moderately polluted day faces meaningfully different risk than a healthy adult working indoors — but both currently receive the same alert. VitalAir demonstrates how a lightweight AI layer can turn generic environmental data into individually actionable guidance, without needing any specialized medical hardware or paid infrastructure.

## Architecture

```
Frontend (React, on Vercel)  →  Backend (FastAPI, on Render)  →  Open-Meteo (weather)
                                                               →  WAQI (air quality)
                                                               →  Groq LLM (advisory generation)
                                                               →  SQLite (advisory history)
```

1. User sets location (search or geolocation) and profile (age, health condition, occupation)
2. Frontend requests an advisory from the backend
3. Backend fetches live weather + AQI data in parallel, with caching and retry logic to handle upstream rate limits
4. Backend sends conditions + profile to the LLM, which returns a plain-English advisory and a risk level
5. Advisory is logged to SQLite and returned to the frontend
6. Frontend renders the dashboard, advisory card, and trend chart

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows Git Bash
# or: source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

Create a `backend/.env` file:
```
WAQI_TOKEN=your_waqi_token
GROQ_API_KEY=your_groq_key
```

Run the server:
```bash
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
```

Create a `frontend/.env` file:
```
VITE_API_URL=http://localhost:8000
```

Run the dev server:
```bash
npm run dev
```

Open `http://localhost:5173`.

## Data Sources
- Weather: [Open-Meteo](https://open-meteo.com) — free, no signup required
- Air quality: [WAQI](https://aqicn.org) — free tier, station-based real-time AQI
- Advisory generation: [Groq](https://groq.com) — free-tier LLM inference

## Known Limitations
- AQI data depends on WAQI having a monitoring station near the requested location; smaller cities may show limited data, with a nearest-station fallback in place
- Open-Meteo's free tier is rate-limited; the backend caches recent results and retries automatically to reduce failures
- Advisory history is stored per-location in a local SQLite file on the backend, which resets if the backend service redeploys
- Render's free tier sleeps after inactivity, causing a brief delay on the first request after idle

## Team Hackathon
- Vedant Seth
- Sharvari Bhimte
- Sarvagya Joshi
- Swati Singh
