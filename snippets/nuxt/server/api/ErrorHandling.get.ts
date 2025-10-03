export default defineEventHandler(async (event) => {
  const decision = await arcjet.protect(event);

  for (const { reason } of decision.results) {
    if (reason.isError()) {
      // Fail open by logging the error and continuing
      console.warn("Arcjet error", reason.message);
      // You could also fail closed here for very sensitive routes
      //return Response.json({ error: "Service unavailable" }, { status: 503 });
    }
  }

  if (decision.isDenied()) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
    });
  }

  return {
    message: "Hello world",
  };
});
