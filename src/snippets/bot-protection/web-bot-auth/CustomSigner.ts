import arcjet, { detectBot } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "DRY_RUN", // Logs only. Use "LIVE" to block requests
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        // A signer that isn't in the catalog, identified by its key directory
        "SIGNED_BOT:https://bot.example.com/.well-known/http-message-signatures-directory",
      ],
    }),
  ],
});
