import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { askGemini } from "./api/_sublime-ai.js";

const PORT = Number(process.env.PORT || 8787);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = __dirname;
const AUDIT_FILE = path.join(__dirname, "data", "sales-audit.json");
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const RATE_BUCKET = new Map();
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 100000) {
        reject(new Error("Solicitud demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function ensureAuditFile() {
  try {
    fs.mkdirSync(path.dirname(AUDIT_FILE), { recursive: true });
    if (!fs.existsSync(AUDIT_FILE)) {
      fs.writeFileSync(AUDIT_FILE, "[]", "utf8");
    }
  } catch {}
}

function safeStaticPath(urlPath) {
  let cleanPath;
  try {
    cleanPath = decodeURIComponent(urlPath.split("?")[0] || "/");
  } catch {
    return null;
  }
  const relative = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const target = path.resolve(PUBLIC_DIR, relative);
  const relativeTarget = path.relative(PUBLIC_DIR, target);
  if (relativeTarget.startsWith("..") || path.isAbsolute(relativeTarget)) return null;
  return target;
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return req.socket?.remoteAddress || "local";
}

function normalizeQuery(q) {
  return String(q || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\u00f1\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00e1\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

function isStoreRelatedQuery(q) {
  const s = normalizeQuery(q);
  if (!s || s.length < 2) return false;
  const signals = [
    "sublime", "joyeria", "joya", "joyero", "joyas", "catalogo", "catalog", "producto", "pieza",
    "anillo", "collar", "cadena", "pulsera", "arete", "zarcillo", "pedido", "checkout", "pago",
    "paypal", "zelle", "pagomovil", "envio", "entrega", "whatsapp", "garantia", "mayorista",
    "cupon", "descuento", "regalo", "boda", "compromiso", "compra", "precio", "carrito"
  ];
  const hasShopSignal = signals.some(token => s.includes(token));
  const hasStoreRef = /sublime|joyeria|catalogo|catalog|precio|pago|envio|pedido/.test(s);
  return hasShopSignal || hasStoreRef;
}

function chatRateLimited(req, res) {
  const ip = clientIp(req);
  const now = Date.now();
  const bucket = RATE_BUCKET.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  bucket.count += 1;
  RATE_BUCKET.set(ip, bucket);
  if (bucket.count > RATE_LIMIT_MAX) {
    json(res, 429, {
      ok: false,
      code: "rate_limited",
      reply: "Has hecho demasiadas preguntas. Espera unos segundos y vuelve a escribir para seguir con el Concierge de Sublime."
    });
    return true;
  }
  return false;
}

function serveStatic(req, res) {
  const target = safeStaticPath(req.url || "/");
  if (!target) return json(res, 403, { ok: false, reply: "Acceso no permitido." });
  fs.readFile(target, (error, content) => {
    if (error) return json(res, 404, { ok: false, reply: "Archivo no encontrado." });
    const type = MIME[path.extname(target).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": type.includes("html") ? "no-cache" : "public, max-age=300"
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});

  const urlPath = (req.url || "/").split("?")[0];

  if (urlPath.startsWith("/api/networks/") && urlPath.endsWith("/sublime/concierge/chat")) {
    if (req.method === "GET") return json(res, 200, { ok: true, service: "sublime-ai", rateLimit: { windowMs: RATE_LIMIT_WINDOW_MS, maxRequests: RATE_LIMIT_MAX } });
    if (req.method !== "POST") return json(res, 405, { ok: false, reply: "Metodo no permitido." });
    if (chatRateLimited(req, res)) return;

    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw || "{}");
      if (!body || typeof body !== "object") return json(res, 400, { ok: false, reply: "La pregunta no llegó en un formato válido." });
      if (!String(body.message || "").trim()) return json(res, 400, { ok: false, reply: "Escribe una pregunta para que el Concierge IA pueda responder." });
      if (!isStoreRelatedQuery(String(body.message || ""))) {
        return json(res, 200, {
          ok: true,
          scope: "shop-only",
          reply: "Solo puedo apoyar temas de la tienda: catálogo, piezas, precios, pagos, entregas, garantía, mayorista y carrito."
        });
      }
      const reply = await askGemini(body);
      return json(res, 200, reply);
    } catch (error) {
      return json(res, 500, {
        ok: false,
        reply: `La IA no pudo responder ahora (${String(error.message || error).slice(0, 160)}).`
      });
    }
  }

  if (urlPath === "/api/chat") {
    if (req.method === "GET") return json(res, 200, { ok: true, service: "sublime-ai", rateLimit: { windowMs: RATE_LIMIT_WINDOW_MS, maxRequests: RATE_LIMIT_MAX } });
    if (req.method !== "POST") return json(res, 404, { ok: false, reply: "Ruta no encontrada." });
    if (chatRateLimited(req, res)) return;

    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw || "{}");
      if (!body || typeof body !== "object") return json(res, 400, { ok: false, reply: "La pregunta no llegó en un formato válido." });
      if (!String(body.message || "").trim()) return json(res, 400, { ok: false, reply: "Escribe una pregunta para que el Concierge IA pueda responder." });
      if (!isStoreRelatedQuery(String(body.message || ""))) {
        return json(res, 200, {
          ok: true,
          scope: "shop-only",
          reply: "Solo puedo apoyar temas de la tienda: catálogo, piezas, precios, pagos, entregas, garantía, mayorista y carrito."
        });
      }
      const reply = await askGemini(body);
      return json(res, 200, reply);
    } catch (error) {
      return json(res, 500, {
        ok: false,
        reply: `La IA no pudo responder ahora (${String(error.message || error).slice(0, 160)}).`
      });
    }
  }

  if (urlPath === "/api/sales") {
    ensureAuditFile();
    if (req.method === "GET") {
      try {
        const rows = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8") || "[]");
        return json(res, 200, { ok: true, count: rows.length, rows });
      } catch (error) {
        return json(res, 500, { ok: false, reply: String(error.message || error) });
      }
    }
    if (req.method === "POST") {
      try {
        const body = JSON.parse((await readBody(req)) || "{}");
        const rows = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8") || "[]");
        const sale = { ...(body.sale || body), id: body.sale?.id || body.id || `SALE-${Date.now()}`, date: body.sale?.date || body.date || new Date().toISOString(), createdAt: new Date().toISOString() };
        rows.push(sale);
        fs.writeFileSync(AUDIT_FILE, JSON.stringify(rows, null, 2), "utf8");
        return json(res, 200, { ok: true, saved: sale.id, count: rows.length });
      } catch (error) {
        return json(res, 500, { ok: false, reply: String(error.message || error) });
      }
    }
    return json(res, 405, { ok: false, reply: "Metodo no permitido." });
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return json(res, 405, { ok: false, reply: "Metodo no permitido." });
  }
  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Sublime listo en http://localhost:${PORT}`);
  console.log(`Endpoint IA listo en http://localhost:${PORT}/api/chat`);
  console.log(`Registro de ventas listo en http://localhost:${PORT}/api/sales`);
});
