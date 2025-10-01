import { arcjet as arcjetNuxt, fixedWindow, detectBot } from "#arcjet";

export const arcjet = arcjetNuxt({
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});
