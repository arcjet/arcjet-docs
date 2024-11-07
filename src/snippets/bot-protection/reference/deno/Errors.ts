import arcjet, { detectBot } from "@arcjet/deno";

const aj = arcjet({
  key: Deno.env.get("ARCJET_KEY")!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

Deno.serve(
  { port: 3000 },
  aj.handler(async (req) => {
    const decision = await aj.protect(req);

    // If the request is missing a User-Agent header, the decision will be
    // marked as an error! You should check for this and make a decision about
    // the request since requests without a User-Agent could indicate a crafted
    // request from an automated client.
    if (decision.isErrored()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", decision.reason.message);
      // You could also fail closed here if the request is missing a User-Agent
      //return new Response("Service unavailable", { status: 503 });
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
);
