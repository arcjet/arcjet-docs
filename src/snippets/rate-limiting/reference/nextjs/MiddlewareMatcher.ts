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
      window: "1h",
      max: 60,
    }),
  ],
});
export default createMiddleware(aj);
