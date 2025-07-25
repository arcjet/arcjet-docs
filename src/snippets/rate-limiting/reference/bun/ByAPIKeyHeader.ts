import arcjet, { fixedWindow } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ['http.request.headers["x-api-key"]'],
      window: "1h",
      max: 60,
    }),
  ],
});
