import { useState, useEffect } from "react";

const DEFAULT = {
  gender: "Female",
  age_group: "Adult (18-60)",
  health_condition: "None",
  occupation: "Desk job / Indoor",
};

export default function ProfileForm({ onProfileChange }) {
  const [profile, setProfile] = useState(DEFAULT);

  useEffect(() => {
    onProfileChange(DEFAULT);
  }, [onProfileChange]);

  const update = (field, value) => {
    const next = { ...profile, [field]: value };
    setProfile(next);
    onProfileChange(next);
  };

  return (
    <div className="sidebar-section">
      <span className="sidebar-label">Your profile</span>

      <div className="field-row">
        <label>Gender</label>
        <select
          className="select-input"
          value={profile.gender}
          onChange={(e) => update("gender", e.target.value)}
        >
          <option>Female</option>
          <option>Male</option>
          <option>Other</option>
        </select>
      </div>

      <div className="field-row">
        <label>Age group</label>
        <select
          className="select-input"
          value={profile.age_group}
          onChange={(e) => update("age_group", e.target.value)}
        >
          <option>Child (under 12)</option>
          <option>Teen (13-17)</option>
          <option>Adult (18-60)</option>
          <option>Senior (60+)</option>
        </select>
      </div>

      <div className="field-row">
        <label>Health condition</label>
        <select
          className="select-input"
          value={profile.health_condition}
          onChange={(e) => update("health_condition", e.target.value)}
        >
          <option>None</option>
          <option>Asthma</option>
          <option>Heart condition</option>
          <option>Pregnant</option>
          <option>Other respiratory condition</option>
        </select>
      </div>

      <div className="field-row">
        <label>Occupation</label>
        <select
          className="select-input"
          value={profile.occupation}
          onChange={(e) => update("occupation", e.target.value)}
        >
          <option>Desk job / Indoor</option>
          <option>Outdoor worker</option>
          <option>Athlete / Regular outdoor exercise</option>
        </select>
      </div>
    </div>
  );
}
