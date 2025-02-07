import {
  type NoseconeOptions,
  createMiddleware,
  defaults,
} from "@nosecone/next";
// @ts-ignore: Import your auth library. See https://authjs.dev
import { auth } from "./auth";

// Nosecone security headers configuration
// https://docs.arcjet.com/nosecone/quick-start
const noseconeOptions: NoseconeOptions = {
  ...defaults,
};

const securityHeaders = createMiddleware(noseconeOptions);

// @ts-ignore: This type will be correct when used in a real app
export default auth(async (req) => {
  // Redirect to signin page if not authenticated
  // Example from https://authjs.dev/getting-started/session-management/protecting
  if (!req.auth && !req.nextUrl.pathname.startsWith("/auth")) {
    const newUrl = new URL("/auth/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // Otherwise return security headers
  return securityHeaders();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
