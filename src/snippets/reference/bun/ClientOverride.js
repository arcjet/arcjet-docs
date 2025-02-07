import arcjet, { slidingWindow, createRemoteClient } from "@arcjet/bun";
import { baseUrl } from "@arcjet/env";

const client = createRemoteClient({
  baseUrl: baseUrl(Bun.env),
  // timeout is the maximum time to wait for a response from the server. It
  // defaults to 1000ms when NODE_ENV or ARCJET_ENV is "development" and 500ms
  // otherwise. This is a conservative limit to fail open by default. In most
  // cases, the response time will be <20-30ms.
  timeout: 500,
});
import { env } from "bun";

const aj = arcjet({
  key: env.ARCJET_KEY,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
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
      console.log("Rule Result", result);

      if (result.reason.isRateLimit()) {
        console.log("Rate limit rule", result);
      }
    }

    return new Response("Hello world");
  }),
};
