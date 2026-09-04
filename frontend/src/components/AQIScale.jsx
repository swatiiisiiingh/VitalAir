const BANDS = [
  { max: 50, label: "Good", color: "#34d399" },
  { max: 100, label: "Moderate", color: "#fbbf24" },
  { max: 150, label: "Unhealthy*", color: "#fb923c" },
  { max: 200, label: "Unhealthy", color: "#fb6a6a" },
  { max: 300, label: "Very Unhealthy", color: "#c084fc" },
  { max: 500, label: "Hazardous", color: "#f472b6" },
];

export default function AQIScale({ aqi }) {
  const value = aqi?.aqi;
  if (value == null) return null;
  const pct = Math.min(100, Math.max(0, (value / 300) * 100));

  return (
    <div className="aqi-scale-panel">
      <div className="aqi-scale-head">
        <span>AQI scale</span>
        <strong style={{ color: BANDS.find((b) => value <= b.max)?.color || "#fb6a6a" }}>
          {value} · {BANDS.find((b) => value <= b.max)?.label || "Hazardous"}
        </strong>
      </div>
      <div className="aqi-scale-bar">
        {BANDS.map((b, i) => (
          <div key={b.label} className="aqi-scale-seg" style={{ background: b.color, flex: i === 0 ? 50 : b.max - BANDS[i - 1].max }} />
        ))}
        <div className="aqi-scale-marker" style={{ left: `${pct}%` }} title={`AQI ${value}`} />
      </div>
      <div className="aqi-scale-labels">
        <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300+</span>
      </div>
      <p className="trend-help" style={{ marginTop: 8 }}>* Unhealthy for sensitive groups</p>
    </div>
  );
}
