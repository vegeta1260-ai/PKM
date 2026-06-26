const http = require("http");
const {calculateDamage, calculateSpeed, compareSpeed, getAdapterInfo} = require("./championsAdapter");

const PORT = Number(process.env.PORT || 8787);
const SERVICE_VERSION = "2026-06-26-action-v1.5.2";

function sendJson(res, status, payload) {
  const body = status === 204 ? "" : JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
  });
  res.end(body);
}

function getPath(req) {
  try {
    return new URL(req.url, "http://localhost").pathname.replace(/\/$/, "") || "/";
  } catch (_) {
    return req.url;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error(`Invalid JSON body: ${error.message}`));
      }
    });
    req.on("error", reject);
  });
}

async function handler(req, res) {
  const route = getPath(req);
  if (req.method === "OPTIONS") return sendJson(res, 204, {});

  try {
    if (req.method === "GET" && route === "/health") {
      return sendJson(res, 200, {
        ok: true,
        service: "pokemon-champions-calculator",
        version: SERVICE_VERSION,
        patch: "builtin-zh-alias-and-health-canary",
        adapter: typeof getAdapterInfo === "function" ? getAdapterInfo() : {error: "adapter-info-missing"},
      });
    }

    if (req.method === "GET" && route === "/self-test") {
      const speed = calculateSpeed({species: "Mega噴火龍Y", statPoints: {hp: 2, spa: 32, spe: 32}, alignment: {plus: "速度"}}, {});
      return sendJson(res, 200, {ok: true, version: SERVICE_VERSION, adapter: typeof getAdapterInfo === "function" ? getAdapterInfo() : {}, speed});
    }

    if (req.method !== "POST") return sendJson(res, 405, {error: "Method not allowed"});
    const body = await readBody(req);

    if (route === "/damage") return sendJson(res, 200, calculateDamage(body));
    if (route === "/speed") return sendJson(res, 200, calculateSpeed(body.pokemon || body, body.field || {}));
    if (route === "/compare-speed") return sendJson(res, 200, compareSpeed(body));

    return sendJson(res, 404, {error: "Unknown route"});
  } catch (error) {
    return sendJson(res, 400, {
      error: error.message,
      hint: "Check species/move Chinese aliases, required fields, and payload shape.",
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }
}

if (require.main === module) {
  http.createServer(handler).listen(PORT, () => {
    console.log(`pokemon-champions-calculator listening on http://127.0.0.1:${PORT}`);
  });
}

module.exports = handler;
