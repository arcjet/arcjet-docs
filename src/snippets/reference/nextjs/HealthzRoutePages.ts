import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.headers["user-agent"] !== "healthz") {
    return res.status(404).send("Not found");
  }

  res.status(200).send("OK");
}