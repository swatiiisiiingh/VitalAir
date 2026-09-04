export default function ActionPlan({ riskLevel, profile, aqi, weather }) {
  const level = riskLevel || "MODERATE";
  const aqiVal = aqi?.aqi;
  const health = profile?.health_condition || "None";
  const job = profile?.occupation || "";
  const temp = weather?.current?.temperature_2m;

  const actions = [];

  if (level === "HIGH" || (aqiVal != null && aqiVal > 150)) {
    actions.push({ icon: "🏠", title: "Prefer indoors", detail: "Limit outdoor time, especially midday." });
    actions.push({ icon: "🪟", title: "Close windows", detail: "Use purified indoor air if available." });
    actions.push({ icon: "😷", title: "Mask outdoors", detail: "N95/KN95 helps when AQI is high." });
  } else if (level === "MODERATE" || (aqiVal != null && aqiVal > 100)) {
    actions.push({ icon: "⏱️", title: "Short outdoor trips", detail: "Keep outdoor sessions shorter than usual." });
    actions.push({ icon: "💧", title: "Hydrate", detail: "Drink water regularly if it's warm or humid." });
  } else {
    actions.push({ icon: "✅", title: "Conditions look manageable", detail: "Normal routine is fine for most people." });
    actions.push({ icon: "🚶", title: "Outdoor activity OK", detail: "Still check air quality if you exercise hard." });
  }

  if (health && health !== "None") {
    actions.push({
      icon: "💊",
      title: `Care for ${health.toLowerCase()}`,
      detail: "Keep prescribed meds accessible and watch for symptoms.",
    });
  }

  if (job?.includes("Outdoor") || job?.includes("Athlete")) {
    actions.push({
      icon: "🏋️",
      title: "Adjust outdoor workload",
      detail: level === "HIGH" ? "Move intense work/exercise indoors if possible." : "Pace yourself and take shade/water breaks.",
    });
  }

  if (temp != null && temp >= 35) {
    actions.push({ icon: "☀️", title: "Heat caution", detail: "Avoid peak sun; wear light clothing." });
  }

  return (
    <div className="action-panel">
      <h3>What to do today</h3>
      <p className="trend-help">Practical steps based on your risk level and profile.</p>
      <div className="action-grid">
        {actions.map((a, i) => (
          <div key={i} className="action-card">
            <span className="action-icon">{a.icon}</span>
            <div>
              <div className="action-title">{a.title}</div>
              <div className="action-detail">{a.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
