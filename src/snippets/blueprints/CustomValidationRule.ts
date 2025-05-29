import {
  ArcjetRuleResult,
  ArcjetErrorReason,
  ArcjetReason,
} from "@arcjet/protocol";
import type {
  ArcjetRule,
  ArcjetContext,
  ArcjetRequestDetails,
} from "@arcjet/protocol";
import { webcrypto } from "node:crypto";
import { z } from "zod";
import { fromError } from "zod-validation-error";

// Create a subclass of ArcjetReason to store extra information
class LocalDataValidation extends ArcjetReason {
  error?: string;

  constructor({ error }: { error?: string } = {}) {
    super();
    if (error) {
      this.error = error;
    }
  }
}

// Create a constructor for building multiple instances of the rule
function validateBody(options: {
  // Each instance will run in LIVE or DRY_RUN mode
  mode: "LIVE" | "DRY_RUN";
  // Each instance will validate using a Zod schema
  schema: z.Schema;
}) {
  return [
    <ArcjetRule<{}>>{
      version: 1,
      type: "DATA_VALIDATION",
      mode: options.mode,
      priority: 0,
      validate(
        context: ArcjetContext,
        details: ArcjetRequestDetails,
      ): asserts details is ArcjetRequestDetails {},

      async protect(
        context: ArcjetContext,
        details: ArcjetRequestDetails,
      ): Promise<ArcjetRuleResult> {
        // Note that `ruleId` is only used for caching purposes. In
        // this case we want to validate the body on every request,
        // so we provide a new random UUID every time.
        const ruleId = webcrypto.randomUUID();

        try {
          const body = await context.getBody();
          if (typeof body !== "string") {
            return new ArcjetRuleResult({
              ruleId,
              ttl: 0,
              state: "NOT_RUN",
              conclusion: "ALLOW",
              reason: new LocalDataValidation({
                error: "Missing body",
              }),
              fingerprint: "fingerprint",
            });
          }

          const json = JSON.parse(body);
          const result = options.schema.safeParse(json);

          if (result.success) {
            return new ArcjetRuleResult({
              ruleId,
              ttl: 0,
              state: "RUN",
              conclusion: "ALLOW",
              reason: new LocalDataValidation(),
              fingerprint: "fingerprint",
            });
          } else {
            return new ArcjetRuleResult({
              ruleId,
              ttl: 0,
              state: "RUN",
              conclusion: "DENY",
              reason: new LocalDataValidation({
                error: fromError(result.error).toString(),
              }),
              fingerprint: "fingerprint",
            });
          }
        } catch (err) {
          return new ArcjetRuleResult({
            ruleId,
            ttl: 0,
            state: "NOT_RUN",
            conclusion: "ERROR",
            reason: new ArcjetErrorReason(err),
            fingerprint: "fingerprint",
          });
        }
      },
    },
  ];
}
