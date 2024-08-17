import arcjet, { fixedWindow, withArcjet } from "@arcjet/next";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  runtime: "edge",
};

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // Tracking by ip.src is the default if not specified
  //characteristics: ["ip.src"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 60,
    }),
  ],
});

export default withArcjet(
  aj,
  async (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({ name: "Hello world" });
  },
);
