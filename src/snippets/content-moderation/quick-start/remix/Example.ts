import { launchArcjet, moderateContent } from "@arcjet/guard";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export async function action({ request }: ActionFunctionArgs) {
  const { message }: { message: string } = await request.json();

  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(message)],
  });

  if (decision.conclusion === "DENY" && decision.reason === "MODERATE_CONTENT") {
    return json(
      { error: "Harmful content detected – rephrase your message" },
      { status: 400 },
    );
  }

  return json({ ok: true });
}
