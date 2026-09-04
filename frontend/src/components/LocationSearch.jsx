import { useState } from "react";

export default function LocationSearch({ onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [searching, setSearching] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported.");
      return;
    }
    setStatus("Getting location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationSelect({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          name: "My Location",
        });
        setStatus("");
      },
      (err) => {
        if (err.code === 1) setStatus("Permission denied. Search by city instead.");
        else setStatus("Could not get location. Search by city.");
      },
      { timeout: 10000 }
    );
  };

  const searchCity = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return setStatus("Type a city name.");
    setSearching(true);
    setStatus("Searching…");
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1`
      );
      const data = await res.json();
      if (data.results?.length) {
        const r = data.results[0];
        onLocationSelect({
          lat: r.latitude,
          lon: r.longitude,
          name: r.admin1 ? `${r.name}, ${r.admin1}` : r.name,
        });
        setStatus("");
        setQuery("");
      } else setStatus(`No results for "${q}".`);
    } catch {
      setStatus("Search failed.");
    }
    setSearching(false);
  };

  return (
    <div className="sidebar-section">
      <span className="sidebar-label">Location</span>
      <form onSubmit={searchCity} className="location-row">
        <input className="text-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter city name" />
        <button type="submit" className="btn-secondary" disabled={searching}>{searching ? "…" : "Go"}</button>
      </form>
      <button type="button" onClick={useMyLocation} className="btn-secondary">Use my location</button>
      {status && <p className="status-msg">{status}</p>}
    </div>
  );
}
