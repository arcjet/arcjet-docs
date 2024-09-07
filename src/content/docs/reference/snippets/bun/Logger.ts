import arcjet, { shield } from "@arcjet/bun";
import { env } from "bun";
import pino, { type Logger } from "pino";

const logger: Logger =
  env.ARCJET_ENV !== "development"
    ? // JSON in production, default to warn
      pino({ level: process.env.ARCJET_LOG_LEVEL || "warn" })
    : // Pretty print in development, default to debug
      pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        level: process.env.ARCJET_LOG_LEVEL || "debug",
      });

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
  // Use the custom logger
  log: logger,
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      return new Response("Access Denied", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
