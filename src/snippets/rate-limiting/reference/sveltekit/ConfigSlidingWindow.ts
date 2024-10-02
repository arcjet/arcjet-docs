import { env } from "$env/dynamic/private";
import arcjet, { slidingWindow } from "@arcjet/sveltekit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  characteristics: ["ip.src"], // track requests by IP address
  rules: [
    slidingWindow({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      interval: 60, // 60 second sliding window
      max: 100, // allow a maximum of 100 requests
    }),
  ],
});
