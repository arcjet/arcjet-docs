import arcjet, { validateEmail } from "@arcjet/next";
import { headers } from "next/headers";
//import { ipAddress } from '@vercel/functions';

// Utility function to get the IP address of the client
// From https://nextjs.org/docs/app/api-reference/functions/headers#ip-address
function IP() {
  const FALLBACK_IP_ADDRESS = "127.0.0.1";

  // Uncomment if running on Vercel
  //const ip = ipAddress(request)
  //return ip ?? FALLBACK_IP_ADDRESS;

  const forwardedFor = headers().get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}

// Arcjet client defined outside of the component for example purposes. You
// probably want to put this somewhere else in your app.
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    validateEmail({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      block: ["DISPOSABLE", "NO_MX_RECORDS"], // block disposable email addresses
    }),
  ],
});

// A simple form component that accepts an email address which will be validated
// by Arcjet using a Next.js server action.
export default function Form() {
  async function testForm(formData: FormData) {
    "use server";

    const headersList = headers();
    const host = headersList.get("host");

    // Construct the request needed by Arcjet because we're not in a request
    // handler here.
    const path = new URL(`http://${host}`);
    const req = {
      ip: IP(),
      method: "POST",
      host: headersList.get("host"),
      url: path.href,
      headers: headersList,
    };

    const email = formData.get("email") as string;

    const decision = await aj.protect(req, {
      email,
    });

    console.log("Decision: ", decision);
  }

  return (
    <form action={testForm}>
      <input type="email" name="email" />
      <button type="submit">Submit</button>
    </form>
  );
}
