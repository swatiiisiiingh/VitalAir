const GUIDE = {
  pm25: { name: "PM2.5", blurb: "Tiny particles that go deep into lungs. High levels irritate asthma and heart conditions." },
  pm10: { name: "PM10", blurb: "Larger dust/particles. Can irritate eyes, nose, and throat." },
  o3: { name: "Ozone (O₃)", blurb: "Often higher in afternoon heat. Can trigger coughing and chest tightness." },
  no2: { name: "NO₂", blurb: "Linked to traffic/combustion. Sensitive groups should limit roadside exposure." },
};

export default function PollutantGuide({ aqi }) {
  const iaqi = aqi?.iaqi || {};
  const items = Object.entries(GUIDE)
    .map(([key, meta]) => ({ ...meta, key, v: iaqi[key]?.v }))
    .filter((x) => x.v != null);

  if (!items.length) return null;

  return (
    <div className="feature-panel">
      <h3>What the pollutants mean</h3>
      <p className="trend-help">Plain-English guide for the numbers on your air-quality card.</p>
      <div className="pollutant-guide-grid">
        {items.map((p) => (
          <div key={p.key} className="pollutant-guide-card">
            <div className="pollutant-guide-top">
              <strong>{p.name}</strong>
              <span>{Math.round(p.v)}</span>
            </div>
            <p>{p.blurb}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
