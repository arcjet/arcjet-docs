import { createConnectTransport } from "@connectrpc/connect-node";
import arcjet, { shield } from "arcjet";
import { readBody } from "@arcjet/body";
import { createClient } from "@arcjet/protocol/client.js";
import { baseUrl } from "@arcjet/env";
import * as http from "http";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com
  // and set it as an environment variable rather than hard coding.
  // See: https://www.npmjs.com/package/dotenv
  key: process.env.ARCJET_KEY,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
  client: createClient({
    baseUrl: baseUrl(process.env),
    transport: createConnectTransport({
      baseUrl: baseUrl(process.env),
      httpVersion: "2",
    }),
    timeout: 500,
    sdkStack: "NODEJS",
    sdkVersion: "1.0.0-alpha.22",
  }),
});

const server = http.createServer(async function (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  // Construct an object with Arcjet request details
  const path = new URL(req.url || "", `http://${req.headers.host}`);
  const details = {
    ip: req.socket.remoteAddress,
    method: req.method,
    host: req.headers.host,
    path: path.pathname,
    headers: req.headers,
  };

  // Provide a function to get the body in case it is needed by a rule.
  const getBody = async () => {
    try {
      return await readBody(req, {
        // Only read up to 1 MiB of the body
        limit: 1048576,
      });
    } catch {
      // Return undefined in case of failure to allow the rule that called `getBody` handle it.
      return undefined;
    }
  };

  const decision = await aj.protect({ getBody }, details);
  console.log(decision);

  if (decision.isDenied()) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden" }));
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: "Hello World!" }));
  }
});

server.listen(8000);
