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

    if (
      decision.conclusion === "DENY" &&
      decision.reason === "MODERATE_CONTENT"
    ) {
      throw new BadRequestException(
        "Harmful content detected – rephrase your message",
      );
    }

    return { ok: true };
  }
}
