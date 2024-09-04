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
      // selectively allow known bots from our list of almost 600 bots while
      // blocking all other detected bots
      allow: [
        "GOOGLE_CRAWLER", // allows Googlebot
        "CURL", // allows the default user-agent of the `curl` tool
        "DISCORD_CRAWLER", // allows Discordbot
      ],
    }),
  ],
});
// Pass any existing middleware with the optional existingMiddleware prop
export default createMiddleware(aj);
