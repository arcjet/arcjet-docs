export default function handler(req, res) {
  if (req.headers["user-agent"] !== "healthz") {
    return res.status(404).send("Not found");
  }

  res.status(200).send("OK");
}
