const http = require("http");
const {calculateDamage, calculateSpeed, compareSpeed} = require("./championsAdapter");

const PORT = Number(process.env.PORT || 8787);

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
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

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return sendJson(res, 204, {});
  try {
    if (req.method === "GET" && req.url === "/health") {
      return sendJson(res, 200, {ok: true, service: "pokemon-champions-calculator"});
    }
    if (req.method !== "POST") return sendJson(res, 405, {error: "Method not allowed"});
    const body = await readBody(req);
    if (req.url === "/damage") return sendJson(res, 200, calculateDamage(body));
    if (req.url === "/speed") return sendJson(res, 200, calculateSpeed(body.pokemon || body, body.field || {}));
    if (req.url === "/compare-speed") return sendJson(res, 200, compareSpeed(body));
    return sendJson(res, 404, {error: "Unknown route"});
  } catch (error) {
    return sendJson(res, 400, {error: error.message, stack: process.env.NODE_ENV === "production" ? undefined : error.stack});
  }
});

server.listen(PORT, () => {
  console.log(`pokemon-champions-calculator listening on http://127.0.0.1:${PORT}`);
});
