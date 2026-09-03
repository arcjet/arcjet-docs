import { launchArcjet, detectPromptInjection } from "@arcjet/guard";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });
const inbound = detectPromptInjection();

export async function screenPrompt(prompt: string) {
  const decision = await arcjet.guard({
    label: "message.received",
    rules: [inbound(prompt)],
  });

  console.log("conclusion", decision.conclusion);
  console.log("reason", decision.reason);
  console.log("failed open", decision.hasFailedOpen());

  for (const result of decision.results) {
    console.log("rule result", result);
  }
}
