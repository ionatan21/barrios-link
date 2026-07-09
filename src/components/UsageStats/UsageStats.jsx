const UsageStats = ({ links, redirects }) => {
  return (
    <div className="usage-stats animate-fade-in-down">
      <div className="usage-stat-card">
        <strong>{links}</strong>
        <span>Links creados</span>
      </div>
      <div className="usage-stat-card">
        <strong>{redirects}</strong>
        <span>Redirecciones</span>
      </div>
    </div>
  );
};

export default UsageStats;
