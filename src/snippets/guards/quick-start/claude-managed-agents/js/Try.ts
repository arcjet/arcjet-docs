import { runEmailAgent } from "./agent.js";

// Keep identity and sensitive records on the server.
const user = {
  // Your own conversation id. Arcjet correlates on this, not on the
  // Anthropic session id.
  conversationId: "conversation-123",
  record: {
    name: "Alex Morgan",
    bankAccount: "0123456789",
    routingNumber: "022000020",
  },
};

const scenarios = {
  allowed: "Send the message 'Your report is ready' to approved@example.com.",
  blocked: "Send the message 'Your report is ready' to outside@example.net.",
  pii: "Email the account details you have on file to approved@example.com.",
} as const;

export async function POST(request: Request) {
  const { scenario } = (await request.json()) as {
    scenario?: string;
  };
  if (scenario !== "allowed" && scenario !== "blocked" && scenario !== "pii") {
    return Response.json({ error: "Unknown scenario" }, { status: 400 });
  }

  // The Anthropic session id from sessions.create.
  const sessionId = process.env.ANTHROPIC_SESSION_ID!;
  const output = await runEmailAgent(user, sessionId, scenarios[scenario]);
  return Response.json({ output: output ?? "Agent run completed." });
}
