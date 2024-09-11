import arcjet, { fixedWindow } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // Define a custom userId characteristic.
  // See https://docs.arcjet.com/architecture#custom-characteristics
  characteristics: ["userId"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export default async function handler(req, res) {
  // Pass userId as a string to identify the user. This could also be a number
  // or boolean value.
  const decision = await aj.protect(req, { userId: "user123" });

  if (decision.isDenied()) {
    return res.status(429).json({ error: "Too Many Requests" });
  }

  res.status(200).json({ name: "Hello world" });
}
