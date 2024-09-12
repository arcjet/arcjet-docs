import { env } from "$env/dynamic/private";
import arcjet, { tokenBucket } from "@arcjet/sveltekit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  characteristics: ["ip.src"], // track requests by IP address
  rules: [
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      match: "/api/arcjet", // match all requests to /api/arcjet
      refillRate: 10, // refill 10 tokens per interval
      interval: 60, // 60 second interval
      capacity: 100, // bucket maximum capacity of 100 tokens
    }),
  ],
});