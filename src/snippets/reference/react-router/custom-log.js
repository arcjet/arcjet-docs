import arcjetReactRouter from "@arcjet/react-router";
import pino from "pino";

const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetReactRouter({
  key: arcjetKey,
  log: pino({
    // Warn in development, debug otherwise.
    level:
      process.env.ARCJET_LOG_LEVEL ||
      (process.env.ARCJET_ENV === "development" ? "debug" : "warn"),
    // Pretty print in development, JSON otherwise.
    transport:
      process.env.ARCJET_ENV === "development"
        ? { options: { colorize: true }, target: "pino-pretty" }
        : undefined,
  }),
  rules: [
    // …
  ],
});
