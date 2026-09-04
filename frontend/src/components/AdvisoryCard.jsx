export default function AdvisoryCard({ advisory, riskLevel, title }) {
  if (!advisory) return null;
  const level = riskLevel || "MODERATE";
  return (
    <div className={`advisory-card risk-${level}`}>
      {title && <div className="advisory-title">{title}</div>}
      <span className={`risk-tag risk-${level}`}>{level} RISK</span>
      <p className="advisory-text">{advisory}</p>
    </div>
  );
}
