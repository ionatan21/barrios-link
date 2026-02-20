import { useState, useEffect, useCallback, useRef } from "react";
import { API_ENDPOINTS } from "@/config/api";
import ShortenUrl from "@/components/Shortenurl/ShortenUrl";
import UsageStats from "@/components/UsageStats/UsageStats";

const MIN_FETCH_INTERVAL = 30_000; // 30 segundos entre peticiones automáticas

const LinkShortenerSection = () => {
  const [usage, setUsage] = useState({
    links: 0,
    redirects: 0,
  });

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
      console.error("Error al obtener estadísticas:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsage({ force: true });
  }, [fetchUsage]);

  return (
    <>
      <ShortenUrl onLinkCreated={() => fetchUsage({ force: true })} />
      <UsageStats links={usage.links} redirects={usage.redirects} />
    </>
  );
};

export default LinkShortenerSection;
