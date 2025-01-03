import arcjet, { shield, validateEmail } from "@arcjet/remix";
import type { ActionFunctionArgs } from "@remix-run/node";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY!,
  rules: [
    validateEmail({
      mode: "LIVE",
      deny: ["DISPOSABLE"],
    }),
    shield({
      mode: "LIVE",
    }),
  ],
});

export async function action(args: ActionFunctionArgs) {
  // The request body is a FormData object
  //const formData = await args.request.formData();
  //const email = formData.get("email") as string;
  const email = "test@0zc7eznv3rsiswlohu.tk"; // Disposable email for demo

  const decision = await aj.protect(args, { email });

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isEmail()) {
      console.log("Email rule", result);
    }

    if (result.reason.isShield()) {
      console.log("Shield protection rule", result);
    }
  }

  if (decision.isDenied()) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  // We don't need to use the decision elsewhere, but you could return it to
  // the component
  return null;
}
