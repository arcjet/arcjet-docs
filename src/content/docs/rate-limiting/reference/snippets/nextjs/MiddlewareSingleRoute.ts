import arcjet, { createMiddleware, fixedWindow } from "@arcjet/next";
export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    fixedWindow({
      mode: "LIVE",
      // match tells Arcjet which routes to apply the rate limit to
      match: "/api/hello",
      window: "1h",
      max: 60,
    }),
  ],
});
// Pass any existing middleware with the optional existingMiddleware prop
export default createMiddleware(aj);
