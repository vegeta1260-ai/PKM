const http = require("http");
const {calculateDamage, calculateSpeed, compareSpeed} = require("./championsAdapter");

const PORT = Number(process.env.PORT || 8787);

function sendJson(res, status, payload) {
  const body = status === 204 ? "" : JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) reject(new Error("Request body too large"));
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function handler(req, res) {
  const pathname = (req.url || "").split("?")[0];

  if (req.method === "OPTIONS") return sendJson(res, 204, {});

  try {
    if (req.method === "GET" && pathname === "/health") {
      return sendJson(res, 200, {ok: true, service: "pokemon-champions-calculator"});
    }

    if (req.method !== "POST") return sendJson(res, 405, {error: "Method not allowed"});

    const body = await readBody(req);

    if (pathname === "/damage") return sendJson(res, 200, calculateDamage(body));
    if (pathname === "/speed") return sendJson(res, 200, calculateSpeed(body.pokemon || body, body.field || {}));
    if (pathname === "/compare-speed") return sendJson(res, 200, compareSpeed(body));

    return sendJson(res, 404, {error: "Unknown route"});
  } catch (error) {
    return sendJson(res, 400, {
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }
}

if (require.main === module) {
  const server = http.createServer(handler);
  server.listen(PORT, () => {
    console.log(`pokemon-champions-calculator listening on http://127.0.0.1:${PORT}`);
  });
}

module.exports = handler;
module.exports.default = handler;
