import { randomUUID } from "node:crypto";
import { runEmailAgent } from "./agent.js";

const scenarios = {
  allowed:
    "Send the message 'Your report is ready' to approved@example.com.",
  blocked:
    "Send the message 'Your report is ready' to outside@example.net.",
  pii: "Email the account details you have on file to approved@example.com.",
} as const;

export async function POST(request: Request) {
  const { scenario } = (await request.json()) as {
    scenario?: string;
  };
  if (
    scenario !== "allowed" &&
    scenario !== "blocked" &&
    scenario !== "pii"
  ) {
    return Response.json(
      { error: "Unknown scenario" },
      { status: 400 },
    );
  }

  // options.sessionId must be a UUID and can only be created once.
  const sessionId = randomUUID();
  await runEmailAgent(sessionId, scenarios[scenario]);
  return Response.json({ output: "Agent run completed." });
}
