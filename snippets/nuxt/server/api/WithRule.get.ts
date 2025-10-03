// @ts-expect-error
import { detectBot, fixedWindow, type ArcjetDecision } from "#arcjet";

const arcjetForGuests = arcjet
  .withRule(
    fixedWindow({
      max: 10,
      window: "1m",
    }),
  )
  // You can chain multiple rules, or just use one
  .withRule(
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      allow: [], // "allow none" will block all detected bots
    }),
  );

export default defineEventHandler(async (event) => {
  // This userId is hard coded for the example, but this is where you would do a
  // session lookup and get the user ID.
  const userId: string | null = "totoro";

  let decision: ArcjetDecision;
  if (userId) {
    decision = await arcjet.protect(event);
  } else {
    decision = await arcjetForGuests.protect(event);
  }

  if (decision.isDenied()) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return { message: "Hello world" };
});
