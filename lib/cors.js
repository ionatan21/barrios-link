import dotenv from "dotenv";
dotenv.config();

export const getAllowedOrigins = () => {
  return (process.env.ALLOWED_ORIGINS || "https://b-lnk.vercel.app")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
};

export const isValidReferer = (req) => {
  const referer = req.headers.referer || req.headers.origin || "";
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.some((o) => referer.startsWith(o));
};

export const setCorsHeaders = (req, res, methods = "GET, OPTIONS") => {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "null");
  }

  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};
