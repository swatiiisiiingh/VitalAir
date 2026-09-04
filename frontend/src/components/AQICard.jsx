const label = (aqi) => {
  if (aqi == null) return "N/A";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (Sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};
const color = (aqi) => {
  if (aqi == null) return "var(--text-muted)";
  if (aqi <= 50) return "var(--risk-low-text)";
  if (aqi <= 100) return "var(--risk-moderate-text)";
  return "var(--risk-high-text)";
};

export default function AQICard({ aqi }) {
  const value = aqi?.aqi ?? null;
  const iaqi = aqi?.iaqi || {};
  const pollutants = [
    { key: "pm25", label: "PM2.5" },
    { key: "pm10", label: "PM10" },
    { key: "o3", label: "O₃" },
    { key: "no2", label: "NO₂" },
  ].map((p) => ({ ...p, v: iaqi[p.key]?.v })).filter((p) => p.v != null);

  return (
    <div className="stat-card">
      <div className="stat-card-title">Air Quality</div>
      <div className="stat-big" style={{ color: color(value) }}>{value != null ? value : "—"}</div>
      <span className="aqi-badge" style={{ color: color(value) }}>{label(value)}</span>
      {pollutants.length > 0 && (
        <div className="pollutant-row">
          {pollutants.map((p) => (
            <span key={p.key} className="pollutant-chip">{p.label} <strong>{Math.round(p.v)}</strong></span>
          ))}
        </div>
      )}
    </div>
  );
}
