import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import aj from "arcjet:client";

export const onRequest = defineRouteMiddleware(
  async ({ isPrerendered, request }) => {
    console.log(
      "[MIDDLEWARE]",
      "isPrerendered:",
      isPrerendered,
      "request:",
      request.url,
    );

    if (!isPrerendered) {
      const decision = await aj.protect(request);

      if (decision.isDenied()) {
        // return new Response(null, { status: 403, statusText: "Forbidden" });
      }
    }
  },
);
