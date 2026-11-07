import { launchArcjet, moderateContent } from "@arcjet/guard";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export default {
  port: 3000,
  fetch: async (req: Request) => {
    const { message }: { message: string } = await req.json();

    const decision = await arcjet.guard({
      label: "message.received",
      rules: [moderate(message)],
    });

    // Deny harmful content, text over 128 KiB, and checks that Arcjet couldn't
    // complete. Arcjet moderates the first 60 KB and adds an AJ1142 warning to
    // decision.warnings for longer text. To moderate all of it, split it up.
    if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
      return Response.json(
        { error: "Harmful content detected – rephrase your message" },
        { status: 400 },
      );
    }

    return Response.json({ ok: true });
  },
};
