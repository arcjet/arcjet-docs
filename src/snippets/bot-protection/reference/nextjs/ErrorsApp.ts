import arcjet, { detectBot } from "@arcjet/next";
import { isMissingUserAgent } from "@arcjet/inspect";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export async function GET(req: Request) {
  const decision = await aj.protect(req);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      // return NextResponse.json(
      //   {
      //     error: "Service unavailable",
      //   },
      //   { status: 503 },
      // );
    }
  }

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "You are a bot!",
      },
      {
        status: 403,
      },
    );
  }

  if (decision.results.some(isMissingUserAgent)) {
    // Requests without User-Agent headers might not be identified as any
    // particular bot and could be marked as an errored result. Most legitimate
    // clients send this header, so we recommend blocking requests without it.
    // See https://docs.arcjet.com/bot-protection/reference#user-agent-header
    console.warn("User-Agent header is missing");

    return NextResponse.json(
      {
        error: "Bad request",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
