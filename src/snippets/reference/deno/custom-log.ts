import "jsr:@std/dotenv/load";
import arcjetDeno from "npm:@arcjet/deno";
import pinoPretty from "npm:pino-pretty";
import pino from "npm:pino";

const arcjetKey = Deno.env.get("ARCJET_KEY");

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetDeno({
  key: arcjetKey,
  log: pino(
    {
      // Warn in development, debug otherwise.
      level:
        Deno.env.get("ARCJET_LOG_LEVEL") ||
        (Deno.env.get("ARCJET_ENV") === "development" ? "debug" : "warn"),
    },
    // Pretty print in development, JSON otherwise.
    Deno.env.get("ARCJET_ENV") === "development"
      ? pinoPretty({ colorize: true })
      : undefined,
  ),
  rules: [
    // …
  ],
});
