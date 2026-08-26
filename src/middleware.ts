import { defineMiddleware } from "astro:middleware";
import aj from "arcjet:client";
import type { FrameworkKey } from "@/lib/prefs";
import { isValidFrameworkKey } from "@/lib/prefs";
import { legacyFrameworkQueryRedirect } from "@/lib/sdk";
import { POSTHOG_PROXY_PATH } from "@/lib/posthog";

export const onRequest = defineMiddleware(
  async ({ isPrerendered, request, url }, next) => {
    if (!isPrerendered && !url.pathname.startsWith(POSTHOG_PROXY_PATH)) {
      const decision = await aj.protect(request);

      if (decision.isDenied()) {
        return new Response(null, { status: 403, statusText: "Forbidden" });
      }
    }

    const f = url.searchParams.get("f");
    if (f && isValidFrameworkKey(f)) {
      const legacyRedirect = legacyFrameworkQueryRedirect(
        url,
        f as FrameworkKey,
      );
      if (legacyRedirect) {
        return Response.redirect(legacyRedirect, 301);
      }
    }

    return next();
  },
);
