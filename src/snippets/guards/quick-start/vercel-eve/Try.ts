import { emailTools } from "./agent.js";

const user = {
  id: "customer-123",
  allowedRecipients: ["approved@example.com"],
  record: {
    name: "Alex Morgan",
    bankAccount: "0123456789",
    routingNumber: "022000020",
  },
};

export const tools = emailTools(user);

// Register `tools` on the Eve agent, then send each scenario as a
// channel message. Keep identity and the record on the server.
//
// Give the agent this instruction too. Without a role the model asks a
// clarifying question, or masks the account numbers itself, instead of
// calling send_email with them, and the guard never gets a decision to
// make. The last two sentences make the sample deterministic; a real
// prompt can't be relied on for that, which is the reason to guard the
// tool.
export const systemPrompt =
  "You are a support desk assistant. Use get_client_record when the " +
  "request needs account details. Use send_email exactly once to " +
  "complete the request. Never ask a follow-up question. Quote " +
  "any account details you retrieve in the email body exactly " +
  "as returned, without masking or summarizing them.";

export const scenarios = {
  allowed: "Send the message 'Your report is ready' to approved@example.com.",
  blocked: "Send the message 'Your report is ready' to outside@example.net.",
  pii: "Email the account details you have on file to approved@example.com.",
} as const;
