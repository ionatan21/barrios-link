import crypto from "crypto";
import dotenv from "dotenv";
import { db } from "./firebase.js";

dotenv.config();

// Cache en memoria de IPs bloqueadas: key (hash) -> blockedUntil (timestamp)
const blockedIpsCache = new Map();
const BLOCK_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

const isIPBlocked = (key) => {
  const blockedUntil = blockedIpsCache.get(key);
  if (!blockedUntil) return false;
  if (Date.now() > blockedUntil) {
    blockedIpsCache.delete(key);
    return false;
  }
  return true;
};

// Cache en memoria de IPs con rate limit activo: key (hash) -> expiresAt (timestamp)
const rateLimitedIpsCache = new Map();

const isIPRateLimited = (key) => {
  const expiresAt = rateLimitedIpsCache.get(key);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    rateLimitedIpsCache.delete(key);
    return false;
  }
  return true;
};

/**
 * Convierte una IP en un hash SHA-256 para no almacenar la IP real.
 */
const hashIp = (ip) => {
  return crypto.createHash("sha256").update(ip).digest("hex");
};

/**
 * Extrae la IP del request.
 */
const getIp = (req) => {
  return (req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "")
    .split(",")[0]
    .trim();
};

const isLocalHost = (value = "") => {
  if (!value) return false;

  try {
    const { hostname } = new URL(value.includes("://") ? value : `http://${value}`);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
};

const isLocalRateLimitDisabled = (req) => {
  if (process.env.RATE_LIMIT_DISABLED === "true") return true;
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "development") return false;
  if (process.env.NODE_ENV === "production") return false;

  return isLocalHost(req.headers.host);
};

/**
 * Rate limiter persistente usando Firestore.
 *
 * @param {object}  req   - Express/Vercel request
 * @param {object}  res   - Express/Vercel response
 * @param {number}  limit - Máximo de solicitudes permitidas en la ventana
 * @returns {object|null} - Respuesta 429 si se excedió el límite, null si OK
 */
export async function rateLimit(req, res, limit = 10, resetTime, newcount) {
  if (isLocalRateLimitDisabled(req)) {
    return null;
  }

  const ip = getIp(req);
  const key = hashIp(ip);
  const now = Date.now();

  // Verificar caches antes de consultar Firestore
  if (isIPBlocked(key)) {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  if (isIPRateLimited(key)) {
    return res.status(429).json({ error: "Límite de solicitudes alcanzado. Inténtalo mañana." });
  }

  const docRef = db.collection("rate-limit").doc(key);
  const snap = await docRef.get();

  if (!snap.exists) {
    // Primera solicitud de esta IP
    await docRef.set({ count: newcount, firstRequest: now });
    return null;
  }

  const data = snap.data();

  if (now - data.firstRequest > resetTime) {
    // Ventana expirada, reiniciar
    await docRef.set({ count: newcount, firstRequest: now });
    return null;
  } else if (data.count >= limit) {
    // Guardar en cache hasta que expire la ventana
    rateLimitedIpsCache.set(key, data.firstRequest + resetTime);
    return res
      .status(429)
      .json({ error: "Límite de solicitudes alcanzado. Inténtalo mañana." });
  }

  // Incrementar contador
  await docRef.set({
    count: data.count + newcount,
    firstRequest: data.firstRequest,
  });
  return null;
}

export async function BlockIP(req, res) {
  const ip = getIp(req);
  const key = hashIp(ip);
  const now = Date.now();

  // Guardar en cache y en Firestore
  blockedIpsCache.set(key, now + BLOCK_CACHE_TTL);
  const docRef = db.collection("rate-limit").doc(key);
  await docRef.set({ count: 20, firstRequest: now });
  return res
    .status(403)
    .json({ error: "Acceso denegado" });
}
