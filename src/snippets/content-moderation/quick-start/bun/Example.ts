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

    if (
      decision.conclusion === "DENY" &&
      decision.reason === "MODERATE_CONTENT"
    ) {
      return Response.json(
        { error: "Harmful content detected – rephrase your message" },
        { status: 400 },
      );
    }

    return Response.json({ ok: true });
  },
};
