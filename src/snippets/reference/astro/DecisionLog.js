// @ts-check
// @ts-expect-error
import aj from "arcjet:client";

export const POST = async ({ request }) => {
  const decision = await aj.protect(request);

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isRateLimit()) {
      console.log("Rate limit rule", result);
    }

    if (result.reason.isBot()) {
      console.log("Bot protection rule", result);
    }
  }

  if (decision.isDenied()) {
    return Response.json(
      { error: "Forbidden" },
      {
        status: 403,
      },
    );
  }

  return Response.json(
    { message: "Hello world" },
    {
      status: 200,
    },
  );
};
