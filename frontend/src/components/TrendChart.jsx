import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MiniChart({ title, dataKey, color, unit, data, domain }) {
  return (
    <div className="mini-chart">
      <div className="mini-chart-head">
        <span className="mini-chart-title">{title}</span>
        <span className="mini-chart-unit">{unit}</span>
      </div>
      {!data?.length ? (
        <p className="empty-state">No data yet</p>
      ) : (
        <div style={{ height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,197,255,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="#7c8ba3" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#7c8ba3" fontSize={11} tickLine={false} axisLine={false} width={36} domain={domain || ["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "#0d1420",
                  border: "1px solid rgba(148,197,255,0.2)",
                  borderRadius: 10,
                  fontSize: 13,
                }}
                labelStyle={{ color: "#8b93a7", marginBottom: 4 }}
                formatter={(value) => [
                  value == null ? "—" : unit === "°C" ? `${value}°C` : value,
                  title,
                ]}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#grad-${dataKey})`}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function TrendChart({ weekTrend, history, onDelete }) {
  const chartData = Array.isArray(weekTrend) ? weekTrend : [];

  return (
    <div className="trend-panel">
      <h3>Last 7 days</h3>
      <p className="trend-help">
        Daily air quality and temperature for this location (Sep-style labels). Higher AQI means more pollution.
      </p>

      <div className="chart-grid">
        <MiniChart
          title="Air quality (AQI)"
          dataKey="aqi"
          color="#3fd0ff"
          unit="AQI"
          data={chartData}
          domain={[0, "auto"]}
        />
        <MiniChart
          title="Temperature"
          dataKey="temperature"
          color="#34d399"
          unit="°C"
          data={chartData}
        />
      </div>

      {history?.length > 0 && onDelete && (
        <div className="history-list">
          <div className="history-list-title">Your saved advisories</div>
          {history.slice(0, 6).map((h) => (
            <div key={h.id} className="history-row">
              <span>
                <strong>{formatTime(h.created_at)}</strong>
                {" · "}
                AQI {h.aqi ?? "—"}
                {" · "}
                {h.temperature != null ? `${Math.round(h.temperature)}°C` : "—"}
                {" · "}
                <span className={`risk-inline risk-${h.risk_level}`}>{h.risk_level}</span>
              </span>
              <button type="button" className="btn-secondary" onClick={() => onDelete(h.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
