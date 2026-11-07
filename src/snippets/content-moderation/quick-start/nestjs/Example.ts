import { launchArcjet, moderateContent } from "@arcjet/guard";
import { BadRequestException, Body, Controller, Post } from "@nestjs/common";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

@Controller("messages")
export class MessagesController {
  @Post()
  async create(@Body() body: { message: string }) {
    const decision = await arcjet.guard({
      label: "message.received",
      rules: [moderate(body.message)],
    });

    // Deny harmful content, text over 128 KiB, and checks that Arcjet couldn't
    // complete. Arcjet moderates the first 60 KB and adds an AJ1142 warning to
    // decision.warnings for longer text. To moderate all of it, split it up.
    if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
      throw new BadRequestException(
        "Harmful content detected – rephrase your message",
      );
    }

    return { ok: true };
  }
}
