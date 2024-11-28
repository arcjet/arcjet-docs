import arcjet, { shield } from "@arcjet/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com
  // and set it as an environment variable rather than hard coding.
  key: process.env.ARCJET_KEY!,
  rules: [
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "DRY_RUN", // will block requests. Use "DRY_RUN" to log only
    }),
  ],
});

// The loader function is called for every request to the app, but you could
// also protect an action
export async function loader(args: LoaderFunctionArgs) {
  const decision = await aj.protect(args);

  for (const result of decision.results) {
    console.log("Rule Result", result);
  }

  console.log("Conclusion", decision.conclusion);

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}

export default function Index() {
  return (
    <>
      <h1>Hello world</h1>
    </>
  );
}
