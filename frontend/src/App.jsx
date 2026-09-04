import { useState, useCallback, useEffect } from "react";
import LocationSearch from "./components/LocationSearch";
import ProfileForm from "./components/ProfileForm";
import AdvisoryCard from "./components/AdvisoryCard";
import TrendChart from "./components/TrendChart";
import WeatherCard from "./components/WeatherCard";
import AQICard from "./components/AQICard";
import ActionPlan from "./components/ActionPlan";
import AQIScale from "./components/AQIScale";
import RiskMeter from "./components/RiskMeter";
import PollutantGuide from "./components/PollutantGuide";
import GenericCompare from "./components/GenericCompare";
import FamilyCompare from "./components/FamilyCompare";
import ActivityPlanner from "./components/ActivityPlanner";
import ExposureScore from "./components/ExposureScore";
import TrendInsight from "./components/TrendInsight";
import SourcesFooter from "./components/SourcesFooter";
import { getAdvisory, getHistory, deleteHistory, getTrend, getPlan } from "./api";
import "./App.css";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function App() {
  const now = useClock();
  const [location, setLocation] = useState(null);
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [weekTrend, setWeekTrend] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [notifyArmed, setNotifyArmed] = useState(false);

  const handleProfileChange = useCallback((p) => setProfile(p), []);

  const dateLine = now.toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeLine = now.toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const refreshHistory = async (lat, lon) => {
    try {
      const hist = await getHistory(lat, lon);
      setHistory(Array.isArray(hist) ? hist : []);
    } catch {
      setHistory([]);
    }
  };

  const fetchAdvisory = async () => {
    if (!location || !profile) return;
    setLoading(true);
    setError("");
    try {
      const data = await getAdvisory(location.lat, location.lon, location.name, profile);
      setResult(data);
      await refreshHistory(location.lat, location.lon);
      try {
        setWeekTrend(await getTrend(location.lat, location.lon));
      } catch {
        setWeekTrend([]);
      }
      try {
        setPlan(await getPlan(location.lat, location.lon));
      } catch {
        setPlan(null);
      }

      // optional browser notify if AQI high
      const aqiVal = data?.aqi?.aqi;
      if (notifyArmed && aqiVal != null && aqiVal > 100 && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("VitalAir alert", {
            body: `AQI is ${aqiVal} in ${location.name}. Check your advisory.`,
          });
        }
      }
    } catch (err) {
      setError(String(err?.response?.data?.detail || err?.message || "Request failed"));
      setResult(null);
    }
    setLoading(false);
  };

  const runDemo = async () => {
    // Delhi coords — reliable demo city
    const demoLoc = { lat: 28.6139, lon: 77.209, name: "New Delhi" };
    const demoProfile = {
      gender: "Female",
      age_group: "Adult (18-60)",
      health_condition: "Asthma",
      occupation: "Outdoor worker",
    };
    setLocation(demoLoc);
    setProfile(demoProfile);
    setLoading(true);
    setError("");
    try {
      const data = await getAdvisory(demoLoc.lat, demoLoc.lon, demoLoc.name, demoProfile);
      setResult(data);
      await refreshHistory(demoLoc.lat, demoLoc.lon);
      try { setWeekTrend(await getTrend(demoLoc.lat, demoLoc.lon)); } catch { setWeekTrend([]); }
      try { setPlan(await getPlan(demoLoc.lat, demoLoc.lon)); } catch { setPlan(null); }
    } catch (err) {
      setError(String(err?.response?.data?.detail || err?.message || "Demo failed"));
    }
    setLoading(false);
  };

  const onDelete = async (id) => {
    try {
      await deleteHistory(id);
      if (location) await refreshHistory(location.lat, location.lon);
    } catch {
      setError("Delete failed");
    }
  };

  const shareAdvisory = async () => {
    if (!result || !location) return;
    const text = [
      `VitalAir health advisory — ${location.name}`,
      `Risk: ${result.risk_level}`,
      `AQI: ${result.aqi?.aqi ?? "N/A"}`,
      `Temp: ${result.weather?.current?.temperature_2m ?? "N/A"}°C`,
      "",
      result.advisory,
      "",
      `Profile: ${profile?.gender}, ${profile?.age_group}, ${profile?.health_condition}, ${profile?.occupation}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy");
    }
  };

  const speakAdvisory = () => {
    if (!result?.advisory || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      `Risk level ${result.risk_level}. ${result.advisory}`
    );
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const armNotify = async () => {
    if (!("Notification" in window)) {
      setError("Notifications not supported in this browser");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifyArmed(perm === "granted");
  };

  const canFetch = Boolean(location && profile && !loading);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-name">VitalAir</span>
          <span className="brand-sub">Personalized weather & air-quality health guidance</span>
        </div>

        <button type="button" className="btn-demo" onClick={runDemo} disabled={loading}>
          ▶ Demo mode (Delhi · Asthma · Outdoor)
        </button>

        <LocationSearch onLocationSelect={setLocation} />
        {location && (
          <span className="location-pill">
            📍 {location.name}
            <span className="coord-hint">{location.lat.toFixed(2)}, {location.lon.toFixed(2)}</span>
          </span>
        )}

        <ProfileForm onProfileChange={handleProfileChange} />

        <button className="btn-primary" onClick={fetchAdvisory} disabled={!canFetch}>
          {loading ? "Getting advisory…" : "Get My Advisory"}
        </button>

        <button type="button" className="btn-secondary" onClick={armNotify}>
          {notifyArmed ? "Alerts armed ✓" : "Enable AQI alerts"}
        </button>
      </aside>

      <main className="main">
        <div className="main-header">
          <div className="datetime-bar">
            <div className="datetime-date">{dateLine}</div>
            <div className="datetime-time">{timeLine}</div>
          </div>
          <h1>Your conditions today</h1>
          <p>
            {location
              ? `Live data for ${location.name} · personalized to your profile`
              : "Personalized to your profile and live local data"}
          </p>
        </div>

        {error && <div className="error-banner"><strong>Error:</strong> {error}</div>}

        {loading && (
          <div className="skeleton-wrap">
            <div className="skeleton card" />
            <div className="skeleton card" />
            <div className="skeleton line" />
            <div className="skeleton line short" />
          </div>
        )}

        {!loading && result ? (
          <>
            <div className="stat-grid">
              <WeatherCard weather={result.weather} />
              <AQICard aqi={result.aqi} />
            </div>

            <RiskMeter riskLevel={result.risk_level} />
            <AQIScale aqi={result.aqi} />
            <ExposureScore aqi={result.aqi} weather={result.weather} riskLevel={result.risk_level} />

            <AdvisoryCard advisory={result.advisory} riskLevel={result.risk_level} title="Your advisory" />

            <div className="toolbar-row">
              <button className="btn-secondary" onClick={shareAdvisory}>{copied ? "Copied ✓" : "Copy advisory"}</button>
              <button className="btn-secondary" onClick={speakAdvisory}>{speaking ? "Speaking…" : "🔊 Read aloud"}</button>
            </div>

            <GenericCompare advisory={result.advisory} riskLevel={result.risk_level} aqi={result.aqi} />
            <FamilyCompare location={location} currentProfile={profile} currentResult={result} />
            <ActionPlan riskLevel={result.risk_level} profile={profile} aqi={result.aqi} weather={result.weather} />
            <ActivityPlanner plan={plan} />
            <PollutantGuide aqi={result.aqi} />
            <TrendInsight weekTrend={weekTrend} />
            <TrendChart weekTrend={weekTrend} history={history} onDelete={onDelete} />
            <SourcesFooter location={location} profile={profile} result={result} />
          </>
        ) : (
          !loading && (
            <div className="panel empty-panel">
              <p className="empty-state">
                Set location and profile, or press <strong>Demo mode</strong> for a one-click judge walkthrough.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
