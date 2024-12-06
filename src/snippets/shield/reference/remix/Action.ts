import arcjet, { shield } from "@arcjet/remix";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});

export async function action(args: ActionFunctionArgs) {
  const decision = await aj.protect(args);

  if (decision.isDenied()) {
    // This redirects to a generic error page (which you should create), but you
    // could also throw an error
    return redirect(`/error`);
  }

  // ...
  // Process the action here
  // ...

  return null;
}
