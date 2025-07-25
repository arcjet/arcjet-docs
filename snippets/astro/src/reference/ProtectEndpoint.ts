import aj from "arcjet:client";
import type { APIRoute } from "astro";

// Not needed in 'server' mode, see:
// https://docs.astro.build/en/guides/routing/#on-demand-dynamic-routes
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  return Response.json({ message: "Hello world" });
};
