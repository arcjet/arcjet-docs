import { NextResponse } from "next/server";

export const GET = async (req) => {
  if (req.headers.get("user-agent") !== "healthz") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response("OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
