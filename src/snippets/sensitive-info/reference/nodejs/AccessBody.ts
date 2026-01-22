import arcjet, { sensitiveInfo } from "@arcjet/node";
import express from "express";

const app = express();
const port = 3000;

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    sensitiveInfo({
      mode: "LIVE",
      deny: ["EMAIL"],
    }),
  ],
});

// Body is accessed here first so it can be used in the protect method and
// referenced later.
app.use(express.text());

app.post("/", async (req, res) => {
  const decision = await aj.protect(req, {
    sensitiveInfoValue: req.body,
  });

  if (decision.isDenied() && decision.reason.isSensitiveInfo()) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Sensitive Information Detected",
        denied: decision.reason.denied,
      }),
    );
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    // We can safely access the body here because it has already been referenced
    res.end(JSON.stringify({ message: `You said: ${req.body}` }));
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
