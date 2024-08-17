import arcjet, { validateEmail } from "@arcjet/next";
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    validateEmail({
      mode: "LIVE",
      block: ["DISPOSABLE"],
    }),
  ],
});

export async function GET(req) {
  const decision = await aj.protect(req, {
    // The email prop is required when a validateEmail rule is configured.
    email: "test@0zc7eznv3rsiswlohu.tk",
  });

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Forbidden",
        // Useful for debugging, but don't return it to the client in production
        //reason: decision.reason,
      },
      {
        status: 403,
      },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
