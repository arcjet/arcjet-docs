import { launchArcjet, tokenBucket } from "@arcjet/guard";
import { guardCustomTool } from "@arcjet/guard/claude-managed-agents/v0";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

const lookupLimit = tokenBucket({
  bucket: "lookups",
  refillRate: 5,
  intervalSeconds: 10,
  maxTokens: 10,
});

// `guardCustomTool` and `guardEvents` default to `onGuardError: "deny"`. The
// custom-tool handler does not run if Guard cannot be evaluated. Return the
// denial as `user.custom_tool_result` with `is_error` set. Don't throw.
export const policy = {
  action: "order.looked-up",
  onGuardError: "deny",
  rules: () => [lookupLimit({ key: "user123", requested: 5 })],
};
