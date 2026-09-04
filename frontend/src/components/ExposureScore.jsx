export default function ExposureScore({ aqi, weather, riskLevel }) {
  const aqiVal = aqi?.aqi;
  const temp = weather?.current?.temperature_2m;
  let outdoor = 80;
  if (aqiVal != null) {
    if (aqiVal > 150) outdoor -= 45;
    else if (aqiVal > 100) outdoor -= 25;
    else if (aqiVal > 50) outdoor -= 10;
  }
  if (temp != null) {
    if (temp >= 38 || temp <= 5) outdoor -= 20;
    else if (temp >= 35) outdoor -= 10;
  }
  if (riskLevel === "HIGH") outdoor -= 15;
  if (riskLevel === "MODERATE") outdoor -= 5;
  outdoor = Math.max(5, Math.min(95, outdoor));
  const indoor = 100 - Math.round(outdoor * 0.35);

  return (
    <div className="feature-panel">
      <h3>Indoor vs outdoor comfort</h3>
      <p className="trend-help">Simple scores for today (higher = more favorable).</p>
      <div className="score-grid">
        <div className="score-card">
          <div className="score-label">Outdoor</div>
          <div className="score-value">{outdoor}</div>
          <div className="score-bar"><div style={{ width: `${outdoor}%` }} /></div>
        </div>
        <div className="score-card">
          <div className="score-label">Indoor default</div>
          <div className="score-value">{Math.min(99, indoor + 10)}</div>
          <div className="score-bar indoor"><div style={{ width: `${Math.min(99, indoor + 10)}%` }} /></div>
        </div>
      </div>
    </div>
  );
}
