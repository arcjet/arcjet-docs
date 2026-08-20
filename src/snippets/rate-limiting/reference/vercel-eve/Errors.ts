import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardTool } from "@arcjet/guard/vercel-eve/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

// Helpers default to onGuardError: "deny". The tool does not run if Guard
// cannot be evaluated. Set "allow" only when executing without a complete
// security decision is acceptable.
export const policy = {
  action: "order.looked-up",
  onGuardError: "deny",
  rules: () => [lookupLimit({ key: "user123", requested: 5 })],
};
