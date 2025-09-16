import { defineMiddleware } from "astro:middleware";
import aj from "arcjet:client";
import { POSTHOG_PROXY_PATH } from "@/lib/posthog";

export const onRequest = defineMiddleware(
  async ({ isPrerendered, request, url }, next) => {
    if (!isPrerendered && !url.pathname.startsWith(POSTHOG_PROXY_PATH)) {
      const decision = await aj.protect(request);

      if (decision.isDenied()) {
        return new Response(null, { status: 403, statusText: "Forbidden" });
      }
    }

    return next();
  },
);
