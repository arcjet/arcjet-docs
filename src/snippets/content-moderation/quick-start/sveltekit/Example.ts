import { launchArcjet, moderateContent } from "@arcjet/guard";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export const POST: RequestHandler = async ({ request }) => {
  const { message }: { message: string } = await request.json();

  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(message)],
  });

  if (decision.conclusion === "DENY" && decision.reason === "MODERATE_CONTENT") {
    return error(400, "Harmful content detected – rephrase your message");
  }

  return json({ ok: true });
};
