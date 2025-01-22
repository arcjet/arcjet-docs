import arcjet, { validateEmail } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    validateEmail({
      mode: "LIVE",
      deny: ["DISPOSABLE"],
    }),
  ],
});

export default async function handler(req, res) {
  const decision = await aj.protect(req, {
    // The email prop is required when a validateEmail rule is configured.
    email: "test@0zc7eznv3rsiswlohu.tk",
  });

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
  }

  if (decision.isDenied()) {
    return res
      .status(403)
      .json({ error: "Forbidden", reason: decision.reason });
  }

  res.status(200).json({ name: "Hello world" });
}
