import { env } from "$env/dynamic/private";
import arcjet, { fixedWindow } from "@arcjet/sveltekit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ['http.request.headers["x-api-key"]'],
      window: "1h",
      max: 60,
    }),
  ],
});
