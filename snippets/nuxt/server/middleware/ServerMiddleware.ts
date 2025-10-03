export default defineEventHandler(async (event) => {
  const decision = await arcjet.protect(event);

  if (decision.isDenied()) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
});
