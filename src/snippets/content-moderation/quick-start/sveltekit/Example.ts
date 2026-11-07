import { launchArcjet, moderateContent } from "@arcjet/guard";
import { error, json, type RequestEvent } from "@sveltejs/kit";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export async function POST({ request }: RequestEvent) {
  const { message }: { message: string } = await request.json();

  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(message)],
  });

  // Deny harmful content, text over 128 KiB, and checks that Arcjet couldn't
  // complete. Arcjet moderates the first 60 KB and adds an AJ1142 warning to
  // decision.warnings for longer text. To moderate all of it, split it up.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    return error(400, "Harmful content detected – rephrase your message");
  }

  return json({ ok: true });
}
