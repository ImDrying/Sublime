import { askGemini } from "./_sublime-ai.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return res.status(200).json({ ok: true, service: "sublime-ai" });
  if (req.method !== "POST") {
    return res.status(404).json({ ok: false, reply: "Ruta no encontrada." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    return res.status(200).json(await askGemini(body));
  } catch (error) {
    return res.status(500).json({
      ok: false,
      reply: `La IA no pudo responder ahora (${String(error.message || error).slice(0, 160)}).`
    });
  }
}
