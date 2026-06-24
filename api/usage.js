import { db } from "../lib/firebase.js";
import { BlockIP } from "../lib/rateLimit.js";
import { isValidReferer, setCorsHeaders } from "../lib/cors.js";

// Cache en memoria: { data, timestamp }
let usageCache = null;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!isValidReferer(req)) {
    const blockIPResponse = BlockIP(req, res);
    return blockIPResponse;
  }

  // Retornar cache si aún es válido
  if (usageCache && Date.now() - usageCache.timestamp < CACHE_TTL) {
    return res.json(usageCache.data);
  }

  try {
    const snap = await db.collection("usage").doc("all").get();

    const result = snap.exists
      ? { links: snap.data().links || 0, redirects: snap.data().redirects || 0 }
      : { links: 0, redirects: 0 };

    usageCache = { data: result, timestamp: Date.now() };

    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Error consultando estadísticas" });
  }
}
