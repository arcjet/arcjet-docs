import arcjet, { validateEmail, detectBot } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    validateEmail({
      mode: "LIVE",
      allow: ["DISPOSABLE"],
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req, {
    // The email prop is required when a validateEmail rule is configured.
    // TypeScript will guide you based on the configured rules
    email: "test@0zc7eznv3rsiswlohu.tk",
  });

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isEmail()) {
      console.log("Email rule", result);
    }
  }

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
