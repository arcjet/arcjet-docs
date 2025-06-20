// @ts-check
// @ts-expect-error
import aj from "arcjet:client";
import { isMissingUserAgent } from "@arcjet/inspect";

export const GET = async ({ request }) => {
  const decision = await aj.protect(request);

  if (decision.isDenied()) {
    return Response.json(
      { error: "Too Many Requests" },
      {
        status: 429,
      },
    );
  }

  if (decision.results.some(isMissingUserAgent)) {
    // Requests without User-Agent headers might not be identified as any
    // particular bot and could be marked as an errored result. Most legitimate
    // clients send this header, so we recommend blocking requests without it.
    // See https://docs.arcjet.com/bot-protection/concepts#user-agent-header
    console.warn("User-Agent header is missing");

    return Response.json(
      { error: "Bad request" },
      {
        status: 400,
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
