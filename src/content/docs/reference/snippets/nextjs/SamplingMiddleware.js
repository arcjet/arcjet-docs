import arcjet, { detectBot, shield } from "@arcjet/next";
import { NextResponse } from "next/server";

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs
  // the middleware on all routes except for static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

const sampleRate = 0.1; // 10% of requests

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // You could include one or more base rules to apply to all requests
  rules: [],
});

function shouldSampleRequest(sampleRate) {
  // sampleRate should be between 0 and 1, e.g., 0.1 for 10%, 0.5 for 50%
  return Math.random() < sampleRate;
}

// Shield and bot rules will be configured with live mode if the request is
// sampled, otherwise only Shield will be configured with dry run mode
function sampleSecurity() {
  if (shouldSampleRequest(sampleRate)) {
    console.log("Rule is LIVE");
    return aj
      .withRule(
        shield(
          { mode: "LIVE" }, // will block requests if triggered
        ),
      )
      .withRule(
        detectBot({
          mode: "LIVE",
          block: ["AUTOMATED"], // blocks all automated clients
        }),
      );
  } else {
    console.log("Rule is DRY_RUN");
    return aj.withRule(
      shield({
        mode: "DRY_RUN", // Only logs the result
      }),
    );
  }
}

export default async function middleware(request) {
  const decision = await sampleSecurity().protect(request);

  if (decision.isDenied()) {
    if (decision.reason.isBot()) {
      return NextResponse.json({ error: "You are a bot" }, { status: 403 });
    } else if (decision.reason.isShield()) {
      return NextResponse.json({ error: "Shields up!" }, { status: 403 });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  } else {
    return NextResponse.next();
  }
}
