import arcjet, { detectBot } from "@arcjet/next";
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
      if (reason.message.includes("requires user-agent header")) {
        // Requests without User-Agent headers can not be identified as any
        // particular bot and will be marked as an errored decision. Most
        // legitimate clients always send this header, so we recommend blocking
        // requests without it.
        // See https://docs.arcjet.com/bot-protection/concepts#user-agent-header
        console.warn("User-Agent header is missing");
        return new Response("Bad request", { status: 400 });
      } else {
        // Fail open by logging the error and continuing
        console.warn("Arcjet error", reason.message);
        // You could also fail closed here for very sensitive routes
        //return new Response("Service unavailable", { status: 503 });
      }
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

  return NextResponse.json({
    message: "Hello world",
  });
}
