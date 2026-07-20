import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import GlassElement from "@/components/GlassElement";

const numberFormatter = new Intl.NumberFormat("es");

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const AnimatedCounter = ({ value }) => {
  const target = toNumber(value);
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(
    shouldReduceMotion ? target : 0,
  );

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(target);
      return undefined;
    }

    setDisplayValue(0);

    const controls = animate(0, target, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [shouldReduceMotion, target]);

  return <strong>{numberFormatter.format(displayValue)}</strong>;
};

const UsageStats = ({ links, redirects, isVisible = true }) => {
  return (
    <div className={`usage-stats ${isVisible ? "is-visible" : ""}`}>
      <GlassElement
        className="usage-stat-glass"
        width="100%"
        height="104px"
        radius={20}
      >
        <div className="usage-stat-card">
          <AnimatedCounter value={links} />
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
          <AnimatedCounter value={redirects} />
          <span style={{ color: "white" }}>Redirecciones</span>
        </div>
      </GlassElement>
    </div>
  );
};

export default UsageStats;
