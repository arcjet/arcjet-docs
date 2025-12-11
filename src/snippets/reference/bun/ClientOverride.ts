import arcjet, { slidingWindow, createRemoteClient } from "@arcjet/bun";
import { baseUrl } from "@arcjet/env";

const client = createRemoteClient({
  // baseUrl defaults to https://decide.arcjet.com and should only be changed if
  // directed by Arcjet.
  // It can also be set using the
  // [`ARCJET_BASE_URL`](https://docs.arcjet.com/environment#arcjet-base-url)
  // environment variable.
  baseUrl: baseUrl(Bun.env),
  // timeout is the maximum time to wait for a response from the server.
  // It defaults to 1000ms in development
  // (see [`ARCJET_ENV`](https://docs.arcjet.com/environment#arcjet-env))
  // and 500ms otherwise. This is a conservative limit to fail open by default.
  // In most cases, the response time will be <20-30ms.
  timeout: 500,
});
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY!,
  rules: [
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 6,
    }),
  ],
  client,
});

export default {
  port: 3000,
  fetch: aj.handler(async (req) => {
    const decision = await aj.protect(req);

    for (const result of decision.results) {
      if (result.reason.isRateLimit()) {
        console.log("Rate limit rule result", result);
      } else {
        console.log("Rule result", result);
      }
    }

    return new Response("Hello world");
  }),
};
