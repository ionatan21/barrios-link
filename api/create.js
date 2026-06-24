import { nanoid } from "nanoid";
import { db } from "../lib/firebase.js";
import { FieldValue } from "firebase-admin/firestore";
import { BlockIP, rateLimit } from "../lib/rateLimit.js";
import { isValidReferer, setCorsHeaders } from "../lib/cors.js";

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default async (req, res) => {
  setCorsHeaders(req, res, "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  if (!isValidReferer(req)) {
    const blockIPResponse = BlockIP(req, res);
    return blockIPResponse;
  }
  const resetTime = 24 * 60 * 60 * 1000; // 24 horas
  const rateLimitResponse = await rateLimit(req, res, 10, resetTime, 1);
  if (rateLimitResponse) return rateLimitResponse;

  const { url } = req.body;

  if (!url || !isValidUrl(url))
    return res.status(400).json({ error: "URL inválida" });

  // 1. Buscar si la URL ya está en la base de datos
  try {
    const querySnapshot = await db.collection("links").where("url_original", "==", url).get();

    if (!querySnapshot.empty) {
      // 2. Si ya existe, devolver el slug existente (ID del documento)
      return res.json({ slug: querySnapshot.docs[0].id });
    }
  } catch {
    return res.status(500).json({ error: "Error consultando la base de datos" });
  }

  // 3. Si no existe, generar uno nuevo y guardar
  const slug = nanoid(8);

  try {
    await db.collection("links").doc(slug).set({
      slug,
      url_original: url,
      created_at: new Date(),
    });

    await db.collection("usage").doc("all").set(
      { links: FieldValue.increment(1) },
      { merge: true }
    );

    return res.json({ slug });
  } catch {
    return res.status(500).json({ error: "Error guardando el link" });
  }
};
