import arcjet, { fixedWindow } from "@arcjet/remix";
import { redirect } from "@remix-run/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export async function action(args) {
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
