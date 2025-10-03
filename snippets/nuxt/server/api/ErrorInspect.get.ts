import { isMissingUserAgent } from "@arcjet/inspect";

export default defineEventHandler(async (event) => {
  const decision = await arcjet.protect(event);

  if (decision.isDenied()) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
    });
  }

  if (decision.results.some(isMissingUserAgent)) {
    // Requests without User-Agent headers might not be identified as any
    // particular bot and could be marked as an errored result. Most legitimate
    // clients send this header, so we recommend blocking requests without it.
    // See https://docs.arcjet.com/bot-protection/concepts#user-agent-header
    console.warn("User-Agent header is missing");

    throw createError({
      statusCode: 400,
      statusMessage: "Bad request",
    });
  }

  return {
    message: "Hello world",
  };
});
