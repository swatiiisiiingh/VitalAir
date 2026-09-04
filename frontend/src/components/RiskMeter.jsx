export default function RiskMeter({ riskLevel }) {
  const level = riskLevel || "MODERATE";
  const map = { LOW: 28, MODERATE: 58, HIGH: 88 };
  const colors = {
    LOW: "var(--risk-low-text)",
    MODERATE: "var(--risk-moderate-text)",
    HIGH: "var(--risk-high-text)",
  };
  const pct = map[level] ?? 50;

  return (
    <div className="risk-meter">
      <div className="risk-meter-top">
        <span>Personal risk</span>
        <strong style={{ color: colors[level] }}>{level}</strong>
      </div>
      <div className="risk-meter-track">
        <div className="risk-meter-fill" style={{ width: `${pct}%`, background: colors[level] }} />
      </div>
      <div className="risk-meter-labels">
        <span>Low</span><span>Moderate</span><span>High</span>
      </div>
    </div>
  );
}
