import arcjet, { detectBot } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // deny all bots by default, including signals failures
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "success" }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
};
