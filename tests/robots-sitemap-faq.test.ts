import { expect, test } from "@playwright/test";
import { faqs } from "../src/lib/faqs";

const INTEGRATION_REDIRECTS = [
  {
    from: "/integrations",
    to: "/guards/framework-integrations",
  },
  {
    from: "/integrations/vercel-ai",
    to: "/guards/framework-integrations",
  },
  {
    from: "/integrations/langchain",
    to: "/guards/framework-integrations",
  },
  {
    from: "/integrations/mcp",
    to: "/mcp-server",
  },
] as const;

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

function isPermanentRedirectStatus(status: number) {
  return status === 301 || status === 308;
}

test.describe("robots, sitemap, redirects, and FAQ structured data", () => {
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
    expect(body).not.toMatch(/^Disallow:/m);
  });

  test("/sitemap.xml reaches the sitemap index", async ({ request }) => {
    const response = await request.get("/sitemap.xml", { maxRedirects: 0 });
    const status = response.status();

    if (isPermanentRedirectStatus(status)) {
      expect(response.headers().location).toMatch(/sitemap-index\.xml\/?$/);
      return;
    }

    expect(status).toBe(200);
    const body = await response.text();
    expect(body).toContain("sitemapindex");
  });

  for (const { from, to } of INTEGRATION_REDIRECTS) {
    for (const path of [from, `${from}/`]) {
      test(`${path} permanently redirects to ${to}`, async ({ request }) => {
        const response = await request.get(path, { maxRedirects: 0 });
        expect(isPermanentRedirectStatus(response.status())).toBeTruthy();
        expect(response.headers().location).toMatch(
          new RegExp(`${to.replaceAll("/", "\\/")}/?$`),
        );
      });
    }
  }

  test("/.well-known/mcp.json points at the documented MCP server", async ({
    request,
  }) => {
    const response = await request.get("/.well-known/mcp.json");
    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      url?: string;
      transport?: string;
      authentication?: string;
    };
    expect(body.url).toBe("https://api.arcjet.com/mcp");
    expect(body.transport).toBe("streamable-http");
    expect(body.authentication).toBe("oauth");
  });

  for (const { from, to } of COMPARISON_REDIRECTS) {
    for (const path of [from, `${from}/`]) {
      test(`${path} permanently redirects to ${to}`, async ({ request }) => {
        const response = await request.get(path, { maxRedirects: 0 });
        expect(isPermanentRedirectStatus(response.status())).toBeTruthy();
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
