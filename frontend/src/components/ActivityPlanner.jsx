export default function ActivityPlanner({ plan }) {
  if (!plan?.windows?.length) return null;
  return (
    <div className="feature-panel">
      <h3>Best outdoor windows today</h3>
      <p className="trend-help">{plan.note}</p>
      <div className="windows-grid">
        {plan.windows.map((w, i) => (
          <div key={i} className="window-card">
            <div className="window-rank">#{i + 1}</div>
            <div className="window-label">{w.label}</div>
            <div className="window-meta">
              {w.temperature != null ? `${w.temperature}°C` : "—"} · AQI {w.aqi ?? "—"}
            </div>
            <div className="window-quality">{w.quality}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
