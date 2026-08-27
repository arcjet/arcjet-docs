import { defineMiddleware } from "astro:middleware";
import aj from "arcjet:client";
import { POSTHOG_PROXY_PATH } from "@/lib/posthog";
import { variantOnlySdkRedirectTarget } from "@/lib/sdk";

export const onRequest = defineMiddleware(
  async ({ isPrerendered, request, url }, next) => {
    const redirectTarget = variantOnlySdkRedirectTarget(url.pathname);
    if (redirectTarget) {
      const destination = new URL(redirectTarget, url);
      destination.search = url.search;
      return Response.redirect(destination, 308);
    }

    if (!isPrerendered && !url.pathname.startsWith(POSTHOG_PROXY_PATH)) {
      const decision = await aj.protect(request);

      if (decision.isDenied()) {
        return new Response(null, { status: 403, statusText: "Forbidden" });
      }
    }

    return next();
  },
);
