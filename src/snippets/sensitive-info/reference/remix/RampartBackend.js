import arcjet, { sensitiveInfo } from "@arcjet/remix";
import { rampart } from "@arcjet/sensitive-info-rampart";

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
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

export async function action(args) {
  const decision = await aj.protect(args, {
    sensitiveInfoValue: await args.request.text(),
  });

  if (decision.isDenied()) {
    if (decision.reason.isSensitiveInfo()) {
      return Response.json(
        { error: "Please don't send personal data." },
        { status: 400 },
      );
    } else {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}
