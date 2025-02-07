import arcjet, { validateEmail } from "@arcjet/remix";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY,
  rules: [
    validateEmail({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // block disposable, invalid, and email addresses with no MX records
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
  ],
});

// The action function is called for non-GET requests, which is where you
// typically handle form submissions that might contain an email address.
export async function action(args) {
  // The request body is a FormData object
  const formData = await args.request.formData();
  const email = formData.get("email");

  const decision = await aj.protect(args, { email });
  console.log("Arcjet decision", decision);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      // throw new Response("Service unavailable", { status: 503, statusText: "Service unavailable" });
    }
  }

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return Response.json({ error: "Invalid email." }, { status: 400 });
    } else {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}
