import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardMiddleware } from "@arcjet/guard/tanstack-ai/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

// `guardMiddleware` defaults to `onGuardError: "deny"`. It skips the tool
// call with an `ArcjetDenialResult` rather than running the tool. Set
// `"allow"` only when executing without a complete security decision is
// acceptable.
export const middleware = guardMiddleware(arcjet, {
  action: "order.looked-up",
  onGuardError: "deny",
  rules: () => [lookupLimit({ key: "user123", requested: 5 })],
});
