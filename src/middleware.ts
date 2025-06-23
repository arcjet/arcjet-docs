import { defineMiddleware } from "astro:middleware";
// import aj from "arcjet:client";

export const onRequest = defineMiddleware(
  async ({ isPrerendered, request }, next) => {
    console.log(
      "[MIDDLEWARE]",
      "isPrerendered:",
      isPrerendered,
      "request:",
      request.url,
    );

    // if (!isPrerendered) {
    //   const decision = await aj.protect(request);

    //   if (decision.isDenied()) {
    //     return new Response(null, { status: 403, statusText: "Forbidden" });
    //   }
    // }

    return next();
  },
);
