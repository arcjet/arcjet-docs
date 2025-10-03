// @ts-expect-error
import arcjetNuxt, { shield } from "#arcjet";

export const arcjet = arcjetNuxt({
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});
