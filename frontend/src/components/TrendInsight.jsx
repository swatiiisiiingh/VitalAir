export default function TrendInsight({ weekTrend }) {
  if (!weekTrend || weekTrend.length < 2) return null;
  const withAqi = weekTrend.filter((d) => d.aqi != null);
  if (withAqi.length < 2) return null;
  const first = withAqi[0].aqi;
  const last = withAqi[withAqi.length - 1].aqi;
  const delta = last - first;
  let text = "Air quality is fairly steady over the past week.";
  if (delta >= 15) text = `Air quality has worsened vs the start of the week (AQI ${first} → ${last}).`;
  else if (delta <= -15) text = `Air quality has improved vs the start of the week (AQI ${first} → ${last}).`;
  else text = `Air quality is relatively stable this week (AQI around ${last}).`;

  return (
    <div className="insight-banner">
      <strong>Week insight:</strong> {text}
    </div>
  );
}
