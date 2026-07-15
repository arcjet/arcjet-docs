import arcjet, { sensitiveInfo } from "@arcjet/next";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { NextResponse } from "next/server";

// The Rampart backend loads a native ONNX runtime, so this route must run on
// the Node.js runtime, not the Edge runtime.
export const runtime = "nodejs";

const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    sensitiveInfo({
      mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
      // The Rampart model detects names, addresses, and government/financial
      // identifiers in addition to the built-in types.
      deny: ["EMAIL", "GIVEN_NAME", "SURNAME", "STREET_NAME", "SSN"],
      // Run detection on-device with the Rampart NER model instead of the
      // default WebAssembly engine.
      backend: rampart(),
    }),
  ],
});

export async function POST(req) {
  const decision = await aj.protect(req, {
    sensitiveInfoValue: await req.text(),
  });

  for (const result of decision.results) {
    console.log("Rule Result", result);

    if (result.reason.isSensitiveInfo()) {
      console.log("Sensitive info rule", result);
    }
  }

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    message: "Hello world",
  });
}
