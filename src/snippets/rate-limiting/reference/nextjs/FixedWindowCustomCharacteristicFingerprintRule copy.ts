import arcjet, { fixedWindow, detec } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      characteristics: ["fingerprint"], // track requests by a custom fingerprint
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      window: "60s", // 60 second fixed window
      max: 100, // allow a maximum of 100 requests
    }),
  ],
});
