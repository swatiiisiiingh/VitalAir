export default function WeatherCard({ weather }) {
  if (!weather) return null;
  const c = weather.current || {};
  return (
    <div className="stat-card">
      <div className="stat-card-title">Weather</div>
      <div className="stat-big">{c.temperature_2m != null ? `${Math.round(c.temperature_2m)}°C` : "—"}</div>
      <div className="stat-sub-row">
        <span>Feels <strong>{c.apparent_temperature != null ? `${Math.round(c.apparent_temperature)}°C` : "—"}</strong></span>
        <span>Humidity <strong>{c.relative_humidity_2m != null ? `${c.relative_humidity_2m}%` : "—"}</strong></span>
        <span>Wind <strong>{c.wind_speed_10m != null ? `${c.wind_speed_10m} km/h` : "—"}</strong></span>
      </div>
    </div>
  );
}
