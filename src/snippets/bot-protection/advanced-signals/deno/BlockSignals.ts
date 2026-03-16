import "jsr:@std/dotenv/load";

import arcjet, { detectBot } from "@arcjet/deno";

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // deny all bots by default, including signals failures
    }),
  ],
});

Deno.serve(
  { port: 3000 },
  aj.handler(async (req) => {
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
);
