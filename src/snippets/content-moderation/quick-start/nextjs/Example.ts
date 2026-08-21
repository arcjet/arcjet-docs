import { launchArcjet, moderateContent } from "@arcjet/guard";
import { NextResponse } from "next/server";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const moderate = moderateContent();

export async function POST(req: Request) {
  const { message }: { message: string } = await req.json();

  const decision = await arcjet.guard({
    label: "message.received",
    rules: [moderate(message)],
  });

  if (decision.conclusion === "DENY" && decision.reason === "MODERATE_CONTENT") {
    return NextResponse.json(
      { error: "Harmful content detected – rephrase your message" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
