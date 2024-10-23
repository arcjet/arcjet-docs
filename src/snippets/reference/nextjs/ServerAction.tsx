import arcjet, { shield, request, detectBot } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots. See
      // https://arcjet.com/bot-list
      allow: [],
    }),
  ],
});

// A simple form handler Based on
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#forms
export default function Page() {
  async function createInvoice(formData: FormData) {
    "use server";

    // Access the request object so Arcjet can analyze it
    const req = await request();
    // Call Arcjet protect
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      // This will be caught by the nearest error boundary
      // See https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#error-handling
      throw new Error("Forbidden");
    }

    const rawFormData = {
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    };

    // mutate data
    // revalidate cache
  }

  return <form action={createInvoice}>...</form>;
}
