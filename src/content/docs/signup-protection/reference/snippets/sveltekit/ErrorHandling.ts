import { env } from "$env/dynamic/private";
import arcjet, { protectSignup } from "@arcjet/sveltekit";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  // Limiting by IP is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    protectSignup({
      email: {
        mode: "LIVE",
        // Block emails that are disposable, invalid, or have no MX records
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: "LIVE",
        // Block clients that we are sure are automated
        block: ["AUTOMATED"],
      },
      rateLimit: {
        // uses a sliding window rate limit
        mode: "LIVE",
        // It would be unusual for a form to be submitted more than 5 times in 10
        // minutes, but you may wish to increase this.
        interval: "10m",
        max: 5,
      },
    }),
  ],
});

export async function POST(event: RequestEvent) {
  const { email } = await event.request.json();

  const decision = await aj.protect(event, {
    // The submitted email is passed to the protect function
    email,
  });

  if (decision.isErrored()) {
    // Fail open by logging the error and continuing
    console.warn("Arcjet error", decision.reason.message);
    // You could also fail closed here for very sensitive routes
    //return error(503, { message: "Service unavailable" });
  }

  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      return error(400, { message: "Invalid email" });
    } else {
      // This returns an error which is then displayed on the form, but you
      // could take other actions such as redirecting to an error page. See
      // https://nextjs.org/docs/app/building-your-application/routing/route-handlers#redirects
      return error(403, { message: "Forbidden" });
    }
  } else {
    // User creation code goes here...
  }

  return json({ message: "Valid email" });
}
