export default defineEventHandler(async (event) => {
  const decision = await arcjet.protect(event);

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
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return { message: "Hello world" };
});
