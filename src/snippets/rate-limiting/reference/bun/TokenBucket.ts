import arcjet, { tokenBucket } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 10, // refill 10 tokens per interval
      interval: 60, // 60 second interval
      capacity: 100, // bucket maximum capacity of 100 tokens
    }),
  ],
});
