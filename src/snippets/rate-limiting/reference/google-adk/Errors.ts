import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardPlugin } from "@arcjet/guard/google-adk/v2";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

// `guardPlugin` defaults to `onGuardError: "deny"`. It returns the deny dict
// from `beforeToolCallback` rather than `undefined`, so the tool does not
// run. Set `"allow"` only when executing without a complete security
// decision is acceptable.
export const plugin = guardPlugin(arcjet, {
  action: "order.looked-up",
  onGuardError: "deny",
  rules: () => [lookupLimit({ key: "user123", requested: 5 })],
});
