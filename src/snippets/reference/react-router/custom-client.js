import arcjetReactRouter, { createRemoteClient } from "@arcjet/react-router";

const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

const arcjet = arcjetReactRouter({
  key: arcjetKey,
  client: createRemoteClient({ timeout: 3000 }),
  rules: [
    // …
  ],
});
