export default defineEventHandler(async (event) => {
  const decision = await arcjet.protect(event);

  if (decision.isDenied()) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  if (decision.ip.hasCountry()) {
    return {
      message: `Hello ${decision.ip.countryName}!`,
      ip: decision.ip,
    };
  }

  return {
    message: "Hello world",
  };
});
