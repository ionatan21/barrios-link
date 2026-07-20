import GlassElement from "@/components/GlassElement";

const UsageStats = ({ links, redirects }) => {
  return (
    <div className="usage-stats">
      <GlassElement
        className="usage-stat-glass"
        width="100%"
        height="104px"
        radius={20}
      >
        <div className="usage-stat-card">
          <strong>{links}</strong>
          <span style={{ color: "white" }}>Links creados</span>
        </div>
      </GlassElement>
      <GlassElement
        className="usage-stat-glass"
        width="100%"
        height="104px"
        radius={20}
      >
        <div className="usage-stat-card">
          <strong>{redirects}</strong>
          <span style={{ color: "white" }}>Redirecciones</span>
        </div>
      </GlassElement>
    </div>
  );
};

export default UsageStats;
