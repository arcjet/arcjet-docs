import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
export const config = {
  // The matcher prevents the middleware executing on static assets and the
  // /api/hello API route because you already installed Arcjet directly
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/hello).*)"],
};
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});
// Pass any existing middleware with the optional existingMiddleware prop
export default createMiddleware(aj);
