import arcjet, { detectBot, filter } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    filter({
      deny: ['len(http.request.cookie["aj_signals"]) eq 0'],
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

export async function POST(req: Request) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    if (decision.reason.isFilter()) {
      // The aj_signals cookie is missing — the request didn't come from a
      // browser that loaded the signals script. Redirect with a helpful error
      // rather than a silent 403 so the user can take action (e.g. enable
      // cookies).
      return NextResponse.redirect(
        new URL("/?error=CookiesRequired", req.url),
        { status: 303 },
      );
    }
    return NextResponse.rewrite(new URL("/denied", req.url), { status: 403 });
  }

  return NextResponse.json({ message: "success" });
}
