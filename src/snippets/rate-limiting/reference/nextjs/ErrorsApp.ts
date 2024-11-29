import arcjet, { fixedWindow } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export async function GET(req: Request) {
  const decision = await aj.protect(req);

  if (decision.isErrored()) {
    if (decision.reason.message.includes("missing User-Agent header")) {
      // Requests without User-Agent headers can not be identified as any
      // particular bot and will be marked as an errored decision. Most
      // legitimate clients always send this header, so we recommend blocking
      // requests without it.
      console.warn("User-Agent header is missing");
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    } else {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", decision.reason.message);
      // You could also fail closed here for very sensitive routes
      //return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
  }

  if (decision.isDenied()) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        reason: decision.reason,
      },
      {
        status: 429,
      },
    );
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
