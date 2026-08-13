import { expect, test } from "@playwright/test";
import { COMPARISON_REDIRECTS } from "../src/lib/comparison-redirects";

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
] as const;

const FAQ_PAGES = ["/get-started", "/bot-protection/quick-start"] as const;

function locationOf(response: { headers: () => Record<string, string> }) {
  return response.headers().location ?? response.headers().Location;
}

test.describe("AEO hygiene", () => {
  test("robots.txt matches marketing Content-Signal and allows AI crawlers", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    const normalized = body.replaceAll("\r\n", "\n");

    expect(normalized).toContain(
      "Content-Signal: search=yes, ai-input=yes, ai-train=no",
    );
    expect(normalized).toMatch(/Allow:\s*\//);
    expect(normalized).toContain("Sitemap: https://docs.arcjet.com/sitemap-index.xml");

    for (const crawler of AI_CRAWLERS) {
      expect(normalized).not.toMatch(
        new RegExp(`User-agent:\\s*${crawler}[\\s\\S]*?Disallow:\\s*/`, "i"),
      );
    }
  });

  test("/sitemap.xml aliases sitemap-index.xml without collapsing SDK copies", async ({
    request,
  }) => {
    const index = await request.get("/sitemap-index.xml");
    expect(index.ok()).toBeTruthy();
    const indexBody = await index.text();
    expect(indexBody).toContain("sitemap-0.xml");

    const alias = await request.get("/sitemap.xml", { maxRedirects: 0 });
    const aliasStatus = alias.status();
    if (aliasStatus >= 300 && aliasStatus < 400) {
      expect(locationOf(alias)).toMatch(/sitemap-index\.xml\/?$/);
    } else {
      expect(alias.ok()).toBeTruthy();
      expect(await alias.text()).toBe(indexBody);
    }

    const sitemap0 = await request.get("/sitemap-0.xml");
    expect(sitemap0.ok()).toBeTruthy();
    const urls = await sitemap0.text();
    // Comparison pages moved to marketing and must leave the docs sitemap.
    expect(urls).not.toContain("/comparisons/");
    // SDK-scoped copies are intentionally duplicated in the sitemap. The
    // /sitemap.xml alias must not collapse or drop those URLs.
    expect(urls).toContain("https://docs.arcjet.com/sdk/next/");
  });

  test("comparison pages permanently redirect to marketing", async ({
    request,
  }) => {
    for (const { from, to } of COMPARISON_REDIRECTS) {
      for (const path of [from, `${from}/`, `${from}.md`]) {
        const response = await request.get(path, { maxRedirects: 0 });
        expect(response.status(), path).toBeGreaterThanOrEqual(300);
        expect(response.status(), path).toBeLessThan(400);
        expect(locationOf(response), path).toBe(to);
      }
    }
  });

  test("FAQ pages emit FAQPage JSON-LD from existing copy", async ({
    request,
  }) => {
    for (const path of FAQ_PAGES) {
      const response = await request.get(path);
      expect(response.ok(), path).toBeTruthy();
      const html = await response.text();

      const jsonLdBlocks = [
        ...html.matchAll(
          /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
        ),
      ].map((match) => JSON.parse(match[1]));

      const faqPage = jsonLdBlocks.find((block) => block["@type"] === "FAQPage");
      expect(faqPage, path).toBeTruthy();
      expect(faqPage["@context"]).toBe("https://schema.org");
      expect(faqPage.mainEntity.length).toBeGreaterThan(0);

      for (const entity of faqPage.mainEntity) {
        expect(entity["@type"]).toBe("Question");
        expect(entity.name).toEqual(expect.any(String));
        expect(entity.acceptedAnswer["@type"]).toBe("Answer");
        expect(entity.acceptedAnswer.text).toEqual(expect.any(String));
        expect(html).toContain(entity.name);
      }
    }
  });
});
