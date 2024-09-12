import arcjet, { sensitiveInfo } from "@arcjet/bun";
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      deny: ["EMAIL"],
      mode: "LIVE",
    }),
  ],
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const result of decision.results) {
      console.log("Rule Result", result);

      if (result.reason.isSensitiveInfo()) {
        console.log("Sensitive info rule", result);
      }
    }

    if (decision.isDenied()) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response("Hello world");
  }),
};
