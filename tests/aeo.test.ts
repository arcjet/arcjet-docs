import { expect, test } from "@playwright/test";
import { faqs } from "../src/lib/faqs";

const COMPARISON_REDIRECTS = [
  {
    from: "/comparisons/aikido-vs-arcjet",
    to: "https://arcjet.com/compare/aikido-vs-arcjet",
  },
  {
    from: "/comparisons/captchas-vs-arcjet",
    to: "https://arcjet.com/compare/captchas-vs-arcjet",
  },
  {
    from: "/comparisons/cloudflare-vs-arcjet",
    to: "https://arcjet.com/compare/cloudflare-vs-arcjet",
  },
  {
    from: "/comparisons/cloudflare-waf-vs-arcjet",
    to: "https://arcjet.com/compare/cloudflare-vs-arcjet",
  },
  {
    from: "/comparisons/vercel-botid-vs-arcjet",
    to: "https://arcjet.com/compare/vercel-botid-vs-arcjet",
  },
  {
    from: "/comparisons/vercel-waf-vs-arcjet",
    to: "https://arcjet.com/compare/vercel-waf-vs-arcjet",
  },
] as const;

const BLOCKED_AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
];

function isRedirectStatus(status: number) {
  return status === 301 || status === 302 || status === 307 || status === 308;
}

test.describe("AEO hygiene", () => {
  test("robots.txt allows crawling and sets Content-Signal", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toMatch(/User-Agent: \*/i);
    expect(body).toContain(
      "Content-Signal: search=yes, ai-input=yes, ai-train=no",
    );
    expect(body).toMatch(/^Allow: \/$/m);

    for (const bot of BLOCKED_AI_BOTS) {
      expect(body).not.toMatch(
        new RegExp(`User-Agent:\\s*${bot}[\\s\\S]*?Disallow:\\s*/`, "i"),
      );
    }
  });

  test("/sitemap.xml reaches the sitemap index", async ({ request }) => {
    const response = await request.get("/sitemap.xml", { maxRedirects: 0 });
    const status = response.status();

    if (isRedirectStatus(status)) {
      expect(response.headers().location).toMatch(/sitemap-index\.xml\/?$/);
      return;
    }

    expect(status).toBe(200);
    const body = await response.text();
    expect(body).toContain("sitemapindex");
  });

  for (const { from, to } of COMPARISON_REDIRECTS) {
    for (const path of [from, `${from}/`]) {
      test(`${path} permanently redirects to ${to}`, async ({ request }) => {
        const response = await request.get(path, { maxRedirects: 0 });
        expect(isRedirectStatus(response.status())).toBeTruthy();
        expect(response.headers().location).toBe(to);
      });
    }
  }

  for (const path of ["/get-started/", "/bot-protection/quick-start/"]) {
    test(`${path} maps FAQ copy to FAQPage JSON-LD`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      const jsonLd = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((scripts) =>
          scripts
            .map((script) => {
              try {
                return JSON.parse(script.textContent ?? "") as {
                  "@type"?: string;
                  mainEntity?: { name?: string }[];
                };
              } catch {
                return undefined;
              }
            })
            .find((data) => data?.["@type"] === "FAQPage"),
        );

      expect(jsonLd?.["@type"]).toBe("FAQPage");
      expect(jsonLd?.mainEntity?.map((entity) => entity.name)).toEqual(
        faqs.map((faq) => faq.question),
      );
    });
  }
});
