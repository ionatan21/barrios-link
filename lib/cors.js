import dotenv from "dotenv";
dotenv.config();

const trimTrailingSlash = (value) => value.replace(/\/$/, "");

const normalizeOrigin = (value = "") => {
  if (!value) return "";

  try {
    return trimTrailingSlash(new URL(value).origin);
  } catch {
    return trimTrailingSlash(value);
  }
};

const getRequestOrigin = (req) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!host) return "";

  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    forwardedProto || (String(host).startsWith("localhost") ? "http" : "https");

  return normalizeOrigin(`${protocol}://${host}`);
};

const isLocalOrigin = (origin) => {
  if (!origin) return false;

  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
};

const isLocalMode = () => {
  return process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production";
};

export const getAllowedOrigins = () => {
  const localMode = isLocalMode();
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => normalizeOrigin(s.trim()))
    .filter((origin) => origin && (localMode || !isLocalOrigin(origin)));

  const envOrigins = [
    process.env.VITE_APP_URL,
    process.env.VITE_API_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ]
    .map(normalizeOrigin)
    .filter((origin) => origin && (localMode || !isLocalOrigin(origin)));

  return [...new Set([...configuredOrigins, ...envOrigins, "https://b-lnk.vercel.app"])];
};

export const getAllowedOriginsForRequest = (req) => {
  const origins = new Set(getAllowedOrigins());
  const requestOrigin = getRequestOrigin(req);

  if (requestOrigin) origins.add(requestOrigin);

  if (isLocalMode()) {
    origins.add("http://localhost:5173");
    origins.add("http://127.0.0.1:5173");
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return [...origins];
};

export const isValidReferer = (req) => {
  const source = normalizeOrigin(req.headers.origin || req.headers.referer || "");
  const requestOrigin = getRequestOrigin(req);

  if (!source) return false;
  if (source === requestOrigin) return true;

  const allowedOrigins = getAllowedOriginsForRequest(req);
  return allowedOrigins.includes(source) || (isLocalMode() && isLocalOrigin(source));
};

export const setCorsHeaders = (req, res, methods = "GET, OPTIONS") => {
  const allowedOrigins = getAllowedOriginsForRequest(req);
  const origin = normalizeOrigin(req.headers.origin || "");

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (origin && isLocalMode() && isLocalOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};
