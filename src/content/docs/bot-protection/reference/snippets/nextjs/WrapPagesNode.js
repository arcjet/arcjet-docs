import arcjet, { detectBot, withArcjet } from "@arcjet/next";

export const config = {
  runtime: "edge",
};

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});

export default withArcjet(aj, async (req, res) => {
  res.status(200).json({ name: "Hello world" });
});
