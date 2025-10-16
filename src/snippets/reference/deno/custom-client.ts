import "jsr:@std/dotenv/load";
import arcjetDeno, { createRemoteClient } from "npm:@arcjet/deno";

const arcjetKey = Deno.env.get("ARCJET_KEY");

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetDeno({
  key: arcjetKey,
  client: createRemoteClient({ timeout: 3000 }),
  rules: [
    // …
  ],
});
