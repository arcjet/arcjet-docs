import arcjet, { detectBot } from "@arcjet/remix";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // deny all bots by default, including signals failures
    }),
  ],
});

export async function action(args) {
  const decision = await aj.protect(args);

  if (decision.isDenied()) {
    throw new Response("Forbidden", { status: 403 });
  }

  // process form submission
  return null;
}

export default function ContactPage() {
  return <form method="post">{/* form fields */}</form>;
}
