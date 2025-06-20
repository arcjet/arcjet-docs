import aj from "arcjet:client";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const decision = await aj.protect(request);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //return Response.json({ error: "Service unavailable" }, { status: 503 });
    }
  }

  if (decision.isDenied()) {
    return Response.json(
      { error: "Too Many Requests" },
      {
        status: 429,
      },
    );
  }

  return Response.json(
    {
      message: "Hello world",
    },
    {
      status: 200,
    },
  );
};
