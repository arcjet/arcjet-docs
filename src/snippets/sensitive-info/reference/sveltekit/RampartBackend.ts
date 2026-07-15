import { env } from "$env/dynamic/private";
import arcjet, { sensitiveInfo } from "@arcjet/sveltekit";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // The Rampart model detects names, addresses, and government/financial
      // identifiers in addition to the built-in types.
      deny: ["EMAIL", "GIVEN_NAME", "SURNAME", "STREET_NAME", "SSN"],
      // Run detection on-device with the Rampart NER model instead of the
      // default WebAssembly engine.
      backend: rampart(),
    }),
  ],
});

export async function POST(event: RequestEvent) {
  const decision = await aj.protect(event, {
    sensitiveInfoValue: await event.request.text(),
  });

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isSensitiveInfo()) {
      console.log("Sensitive info rule", result);
    }
  }

  if (decision.isDenied()) {
    return error(403, "Forbidden");
  }

  return json({ message: "Hello world" });
}
