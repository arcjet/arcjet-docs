import { launchArcjet, policyInput } from "@arcjet/guard";

const arcjet = launchArcjet({ key: process.env.ARCJET_KEY! });

// The agent's fetch tool. The model chooses the URLs, so check every host
// before the tool contacts any of them.
export async function fetchPages(userId: string, urls: string[]) {
  const decision = await arcjet.guard({
    // The label selects the policy you published.
    label: "web.fetched",
    actor: userId,
    inputs: {
      // Absolute URLs or bare hosts. Arcjet reads the host of each URL.
      destinations: policyInput.server.stringList(urls),
    },
  });

  // Treat a check that didn't complete as a denial for this tool.
  if (decision.conclusion === "DENY" || decision.hasFailedOpen()) {
    throw new Error("Destination blocked");
  }

  // Arcjet checked only these hosts, so don't follow redirects.
  return Promise.all(
    urls.map(async (url) => (await fetch(url, { redirect: "error" })).text()),
  );
}
