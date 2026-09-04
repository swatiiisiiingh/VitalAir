export default function GenericCompare({ advisory, riskLevel, aqi }) {
  const aqiVal = aqi?.aqi;
  const generic =
    aqiVal == null
      ? "Air quality advisory: Check local conditions and limit outdoor activity if you feel discomfort."
      : aqiVal <= 50
        ? "Air quality is Good. No restrictions for the general public."
        : aqiVal <= 100
          ? "Air quality is Moderate. Unusually sensitive people should consider reducing prolonged outdoor exertion."
          : aqiVal <= 150
            ? "Air quality is Unhealthy for sensitive groups. Everyone else may continue normal activity."
            : "Air quality is Unhealthy. Everyone should reduce prolonged outdoor exertion.";

  return (
    <div className="feature-panel">
      <h3>Why personalization matters</h3>
      <p className="trend-help">Same city data — generic alert vs advice tailored to you.</p>
      <div className="compare-grid">
        <div className="contrast-card">
          <div className="advisory-title">Generic public alert</div>
          <p className="advisory-text">{generic}</p>
        </div>
        <div className={`contrast-card risk-${riskLevel || "MODERATE"}`}>
          <div className="advisory-title">Your personalized advisory · {riskLevel}</div>
          <p className="advisory-text">{advisory}</p>
        </div>
      </div>
    </div>
  );
}
