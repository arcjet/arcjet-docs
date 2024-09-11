import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
export const config = {
  // The matcher runs just on the /hello pages route
  matcher: ["/hello"],
};
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});
// Pass any existing middleware with the optional existingMiddleware prop
export default createMiddleware(aj);
