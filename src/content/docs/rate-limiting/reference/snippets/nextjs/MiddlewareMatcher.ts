import arcjet, { createMiddleware, fixedWindow } from "@arcjet/next";
export const config = {
  // The matcher prevents the middleware executing on the /api/hello API route
  // because you already installed Arcjet directly in the route
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/hello).*)"],
};
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      // no match means it runs on every route
      //match: "/api/hello",
      window: "1h",
      max: 60,
    }),
  ],
});
export default createMiddleware(aj);
