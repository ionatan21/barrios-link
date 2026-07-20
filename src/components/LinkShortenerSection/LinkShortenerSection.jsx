import { useState, useEffect, useCallback, useRef } from "react";
import { API_ENDPOINTS } from "../../config/api";
import ShortenUrl from "@/components/Shortenurl/ShortenUrl";
import UsageStats from "@/components/UsageStats/UsageStats";
import "./LinkShortenerSection.css";

const MIN_FETCH_INTERVAL = 30_000; // 30 segundos entre peticiones automáticas

const LinkShortenerSection = () => {
  const [usage, setUsage] = useState(null);

  const lastFetchedAt = useRef(0);

  const fetchUsage = useCallback(async ({ force = false } = {}) => {
    const now = Date.now();
    if (!force && now - lastFetchedAt.current < MIN_FETCH_INTERVAL) return;

    try {
      const response = await fetch(API_ENDPOINTS.getUsage);
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
        lastFetchedAt.current = Date.now();
      }
    } catch (error) {
      setUsage({ links: "423", redirects: "1570" });
      console.error("Error al obtener estadísticas:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsage({ force: true });
  }, [fetchUsage]);

  const hasStats = usage && Number(usage.links) > 0;

  return (
    <section className="link-shortener-section">
      <ShortenUrl onLinkCreated={() => fetchUsage({ force: true })} />
      <div
        className={`usage-stats-slot ${
          hasStats ? "usage-stats-slot--visible" : ""
        }`}
        aria-hidden={!hasStats}
      >
        <UsageStats
          links={usage?.links ?? 0}
          redirects={usage?.redirects ?? 0}
          isVisible={hasStats}
        />
      </div>
    </section>
  );
};

export default LinkShortenerSection;
