import arcjet, { sensitiveInfo } from "@arcjet/remix";
import { rampart } from "@arcjet/sensitive-info-rampart";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com
  // and set it as an environment variable rather than hard coding.
  key: process.env.ARCJET_KEY,
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // Detect names and email addresses. See the reference for the full list.
      deny: ["EMAIL", "GIVEN_NAME", "SURNAME"],
      // Use the on-device Rampart NER model instead of the built-in engine.
      backend: rampart(),
    }),
  ],
});

// The action function is called for non-GET requests, which is where you
// typically handle form submissions that might contain sensitive information.
export async function action(args) {
  const decision = await aj.protect(args, {
    sensitiveInfoValue: await args.request.text(),
  });
  console.log("Arcjet decision", decision);

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

export default function Index() {
  return (
    <>
      <h1>Hello world</h1>
    </>
  );
}
