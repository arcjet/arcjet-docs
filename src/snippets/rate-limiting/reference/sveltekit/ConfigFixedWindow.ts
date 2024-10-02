import { env } from "$env/dynamic/private";
import arcjet, { fixedWindow } from "@arcjet/sveltekit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  characteristics: ["ip.src"], // track requests by IP address
  rules: [
    fixedWindow({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      window: "60s", // 60 second fixed window
      max: 100, // allow a maximum of 100 requests
    }),
  ],
});
