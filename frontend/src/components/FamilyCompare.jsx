import { useState } from "react";
import { getAdvisory } from "../api";
import AdvisoryCard from "./AdvisoryCard";

const MEMBERS = [
  { key: "you", label: "You (current profile)", useCurrent: true },
  {
    key: "child",
    label: "Child",
    profile: { gender: "Other", age_group: "Child (under 12)", health_condition: "None", occupation: "Athlete / Regular outdoor exercise" },
  },
  {
    key: "asthma",
    label: "Adult · Asthma · Outdoor",
    profile: { gender: "Male", age_group: "Adult (18-60)", health_condition: "Asthma", occupation: "Outdoor worker" },
  },
  {
    key: "senior",
    label: "Senior · Heart",
    profile: { gender: "Female", age_group: "Senior (60+)", health_condition: "Heart condition", occupation: "Desk job / Indoor" },
  },
];

export default function FamilyCompare({ location, currentProfile, currentResult }) {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const run = async () => {
    if (!location || !currentProfile) return;
    setLoading(true);
    setErr("");
    try {
      const out = [];
      for (const m of MEMBERS) {
        if (m.useCurrent && currentResult) {
          out.push({ label: m.label, advisory: currentResult.advisory, risk_level: currentResult.risk_level });
          continue;
        }
        const prof = m.useCurrent ? currentProfile : m.profile;
        const data = await getAdvisory(location.lat, location.lon, location.name, prof);
        out.push({ label: m.label, advisory: data.advisory, risk_level: data.risk_level });
      }
      setRows(out);
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message || "Family compare failed");
    }
    setLoading(false);
  };

  return (
    <div className="feature-panel">
      <div className="feature-panel-head">
        <div>
          <h3>Family risk board</h3>
          <p className="trend-help">Same location — different bodies, different advice.</p>
        </div>
        <button className="btn-secondary" onClick={run} disabled={loading || !location}>
          {loading ? "Building…" : "Run family compare"}
        </button>
      </div>
      {err && <p className="status-msg">{err}</p>}
      {rows && (
        <div className="family-grid">
          {rows.map((r) => (
            <AdvisoryCard key={r.label} title={r.label} advisory={r.advisory} riskLevel={r.risk_level} />
          ))}
        </div>
      )}
    </div>
  );
}
