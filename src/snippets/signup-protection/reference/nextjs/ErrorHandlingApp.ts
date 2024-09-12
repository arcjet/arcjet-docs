import arcjet, { protectSignup } from "@arcjet/next";
import { NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    protectSignup({
      email: {
        mode: "LIVE",
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: "LIVE",
        allow: [],
      },
      rateLimit: {
        mode: "LIVE",
        interval: "10m",
        max: 5,
      },
    }),
  ],
});

export async function POST(req: Request) {
  const data = await req.json();
  const email = data.email;

  const decision = await aj.protect(req, {
    // The submitted email is passed to the protect function
    email,
  });

  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here for very sensitive routes
    //return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return NextResponse.json(
        {
          message: "Invalid email",
          reason: decision.reason,
        },
        { status: 400 },
      );
    } else {
      // This returns an error which is then displayed on the form, but you
      // could take other actions such as redirecting to an error page. See
      // https://nextjs.org/docs/pages/building-your-application/data-fetching/forms-and-mutations#redirecting
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  } else {
    // The form submission is allowed to proceed so do something with it here

    return NextResponse.json({
      message: "Hello world",
    });
  }
}
