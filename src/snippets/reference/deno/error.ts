import "jsr:@std/dotenv/load";
import arcjetDeno, { filter } from "npm:@arcjet/deno";

const arcjetKey = Deno.env.get("ARCJET_KEY");

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetDeno({
  key: arcjetKey,
  rules: [
    // This broken expression will result in an error decision:
    filter({ deny: ['ip.src.country is "'] }),
  ],
});

Deno.serve(
  { port: 3000 },
  arcjet.handler(async function (request) {
    const decision = await arcjet.protect(request);

    if (decision.isErrored()) {
      console.warn("Arcjet error", decision.reason.message);
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
);
