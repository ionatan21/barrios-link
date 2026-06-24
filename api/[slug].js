import { db } from "../lib/firebase.js";
import { FieldValue } from "firebase-admin/firestore";
import { rateLimit } from "../lib/rateLimit.js";
import { setCorsHeaders } from "../lib/cors.js";

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const resetTime = 10 * 60 * 1000; // 10 minutos
  const rateLimitResponse = await rateLimit(req, res, 15, resetTime, 1);
  if (rateLimitResponse) return rateLimitResponse;

  // Extraer el slug de req.query (Vercel) o de la URL
  let slug = req.query.slug;

  // Si no está en query, intentar extraerlo de la URL
  if (!slug && req.url) {
    const match = req.url.match(/\/api\/([^/?]+)/);
    if (match) slug = match[1];
  }

  if (!slug) {
    return res.status(400).json({ error: "Falta el parámetro 'slug'" });
  }

  try {
    const snap = await db.collection("links").doc(slug).get();

    if (!snap.exists) {
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
      return res.redirect(302, "/404");
    }

    const data = snap.data();

    // Incrementar contador de redirects
    await db.collection("usage").doc("all").set(
      { redirects: FieldValue.increment(1) },
      { merge: true }
    );

    res.setHeader("Cache-Control", "public, max-age=600, s-maxage=1800");

    return res.redirect(302, data.url_original);
  } catch {
    return res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
}
