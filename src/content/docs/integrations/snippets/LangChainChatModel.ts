import { ArcjetRedact } from "@langchain/community/chat_models/arcjet";
import { ChatOpenAI } from "@langchain/openai";

// Create an instance of another chat model for Arcjet to wrap
const openai = new ChatOpenAI({
  temperature: 0.8,
  model: "gpt-3.5-turbo-0125",
});

const arcjetRedactOptions = {
  // Specify a LLM that Arcjet Redact will call once it has redacted the input.
  chatModel: openai,

  // Specify the list of entities that should be redacted.
  // If this isn't specified then all entities will be redacted.
  entities: ["email", "phone-number", "ip-address", "custom-entity"],

  // You can provide a custom detect function to detect entities that we don't support yet.
  // It takes a list of tokens and you return a list of identified types or undefined.
  // The undefined types that you return should be added to the entities list if used.
  detect: (tokens: string[]) => {
    return tokens.map((t) =>
      t === "some-sensitive-info" ? "custom-entity" : undefined,
    );
  },

  // The number of tokens to provide to the custom detect function. This defaults to 1.
  // It can be used to provide additional context when detecting custom entity types.
  contextWindowSize: 1,

  // This allows you to provide custom replacements when redacting. Please ensure
  // that the replacements are unique so that unredaction works as expected.
  replace: (identifiedType: string) => {
    return identifiedType === "email" ? "redacted@example.com" : undefined;
  },
};

const arcjetRedact = new ArcjetRedact(arcjetRedactOptions);
const response = await arcjetRedact.invoke(
  "My email address is test@example.com, here is some-sensitive-info",
);
