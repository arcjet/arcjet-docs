// @ts-check
// @ts-expect-error
import aj from "arcjet:client";

export const POST = async ({ request }) => {
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
