import dns from "node:dns/promises";
import net from "node:net";
import { isValidReferer, setCorsHeaders } from "../lib/cors.js";

const HTML_LIMIT = 500_000;
const TIMEOUT_MS = 5000;

const OEMBED_PROVIDERS = [
  {
    name: "YouTube",
    matches: ["youtube.com", "youtu.be"],
    endpoint: "https://www.youtube.com/oembed?format=json&url=",
  },
  {
    name: "Vimeo",
    matches: ["vimeo.com"],
    endpoint: "https://vimeo.com/api/oembed.json?url=",
  },
  {
    name: "Spotify",
    matches: ["open.spotify.com"],
    endpoint: "https://open.spotify.com/oembed?url=",
  },
  {
    name: "Reddit",
    matches: ["reddit.com"],
    endpoint: "https://www.reddit.com/oembed?url=",
  },
  {
    name: "TikTok",
    matches: ["tiktok.com"],
    endpoint: "https://www.tiktok.com/oembed?url=",
  },
];

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isPrivateIp = (ip) => {
  if (net.isIP(ip) === 6) {
    const value = ip.toLowerCase();
    return (
      value === "::1" ||
      value.startsWith("fc") ||
      value.startsWith("fd") ||
      value.startsWith("fe80:")
    );
  }

  if (net.isIP(ip) !== 4) return false;

  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    a === 0
  );
};

const assertPublicTarget = async (url) => {
  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Local targets are not allowed");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("Private targets are not allowed");
    return;
  }

  const records = await dns.lookup(hostname, { all: true });
  if (!records.length || records.some((record) => isPrivateIp(record.address))) {
    throw new Error("Private targets are not allowed");
  }
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": "Barrios-Link-Metadata/1.0",
        Accept: "text/html,application/xhtml+xml,application/json",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
};

const getProvider = (url) => {
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  return OEMBED_PROVIDERS.find((provider) =>
    provider.matches.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
  );
};

const decodeEntities = (value = "") =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const getMetaContent = (html, key) => {
  const propertyPattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const contentFirstPattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
    "i"
  );
  const match = html.match(propertyPattern) || html.match(contentFirstPattern);
  return match ? decodeEntities(match[1].trim()) : "";
};

const getTitle = (html) => {
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "";
  return decodeEntities(title.trim());
};

const normalizeImage = (image, baseUrl) => {
  if (!image) return "";
  try {
    return new URL(image, baseUrl).toString();
  } catch {
    return "";
  }
};

const fromOEmbed = async (targetUrl, provider) => {
  const response = await fetchWithTimeout(
    `${provider.endpoint}${encodeURIComponent(targetUrl.toString())}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) return null;

  const data = await response.json();
  if (!data.title && !data.author_name) return null;

  return {
    source: provider.name,
    title: data.title || data.author_name,
    description: data.author_name ? `Por ${data.author_name}` : "",
    image: data.thumbnail_url || "",
    url: targetUrl.toString(),
    siteName: provider.name,
  };
};

const fromHtml = async (targetUrl) => {
  const response = await fetchWithTimeout(targetUrl.toString());
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok || !contentType.includes("text/html")) return null;

  const html = (await response.text()).slice(0, HTML_LIMIT);
  const title =
    getMetaContent(html, "og:title") ||
    getMetaContent(html, "twitter:title") ||
    getTitle(html);

  if (!title) return null;

  const description =
    getMetaContent(html, "og:description") ||
    getMetaContent(html, "twitter:description") ||
    getMetaContent(html, "description");

  const image = normalizeImage(
    getMetaContent(html, "og:image") || getMetaContent(html, "twitter:image"),
    targetUrl
  );

  return {
    source: getMetaContent(html, "og:site_name") ? "Open Graph" : "HTML",
    title,
    description,
    image,
    url: getMetaContent(html, "og:url") || targetUrl.toString(),
    siteName: getMetaContent(html, "og:site_name") || targetUrl.hostname,
  };
};

export default async function handler(req, res) {
  setCorsHeaders(req, res, "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  if (!isValidReferer(req)) {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const target = req.query.url;
  if (!target || !isValidUrl(target)) {
    return res.status(400).json({ error: "URL invalida" });
  }

  const targetUrl = new URL(target);

  try {
    await assertPublicTarget(targetUrl);

    const provider = getProvider(targetUrl);
    const metadata =
      (provider ? await fromOEmbed(targetUrl, provider) : null) ||
      (await fromHtml(targetUrl));

    if (!metadata) {
      return res.json({ found: false, url: targetUrl.toString() });
    }

    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return res.json({ found: true, ...metadata });
  } catch {
    return res.json({ found: false, url: targetUrl.toString() });
  }
}
