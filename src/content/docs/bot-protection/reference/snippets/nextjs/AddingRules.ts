import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      block: [
        // Only block clients we're sure are automated bots
        "AUTOMATED",
      ],
      patterns: {
        add: {
          // Allows you to add arbitrary bot definitions
          "AcmeBot\\/": "AUTOMATED",
        },
      },
    }),
  ],
});
// Pass any existing middleware with the optional existingMiddleware prop
export default createMiddleware(aj);
