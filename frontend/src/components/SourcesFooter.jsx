export default function SourcesFooter({ location, profile, result }) {
  return (
    <div className="sources-footer">
      <div>
        <strong>Data sources</strong>
        <span> · Weather: Open-Meteo · Air quality: Open-Meteo / WAQI · Advisory: profile-aware health rules (+ LLM when configured)</span>
      </div>
      {result && location && (
        <div className="sources-meta">
          Generated for {location.name}
          {profile ? ` · ${profile.gender}, ${profile.age_group}, ${profile.health_condition}` : ""}
          {" · "}
          {new Date().toLocaleString()}
        </div>
      )}
    </div>
  );
}
