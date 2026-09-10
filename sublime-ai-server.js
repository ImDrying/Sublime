import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { askGemini } from "./api/_sublime-ai.js";

const PORT = Number(process.env.PORT || 8787);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = __dirname;
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
  if (urlPath === "/api/chat") {
    if (req.method === "GET") return json(res, 200, { ok: true, service: "sublime-ai" });
    if (req.method !== "POST") return json(res, 404, { ok: false, reply: "Ruta no encontrada." });

    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      return json(res, 200, await askGemini(body));
    } catch (error) {
      return json(res, 500, {
        ok: false,
        reply: `La IA no pudo responder ahora (${String(error.message || error).slice(0, 160)}).`
      });
    }
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return json(res, 405, { ok: false, reply: "Metodo no permitido." });
  }
  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Sublime listo en http://localhost:${PORT}`);
  console.log(`Endpoint IA listo en http://localhost:${PORT}/api/chat`);
});
