import { expect, test } from "@playwright/test";
import { routeForDocsFile, routeForSitemapUrl } from "../src/lib/content-dates";
import { pageJsonLd, serializeJsonLd } from "../src/lib/structured-data";

const ORGANIZATION_ID = "https://arcjet.com/#organization";
const SOFTWARE_ID = "https://arcjet.com/#software";
const WEBSITE_ID = "https://docs.arcjet.com/#website";

type Node = Record<string, unknown> & { "@type"?: string };

function nodesByType(graph: { "@graph": Node[] }) {
  return new Map(graph["@graph"].map((node) => [node["@type"], node]));
}

test.describe("routeForDocsFile", () => {
  const cases: [string, string | undefined][] = [
    ["src/content/docs/index.mdx", "/"],
    ["src/content/docs/architecture.mdx", "/architecture/"],
    ["src/content/docs/guards/index.mdx", "/guards/"],
    [
      "src/content/docs/ai-protection/budget-control.mdx",
      "/ai-protection/budget-control/",
    ],
    ["src/content/docs/testing.md", "/testing/"],
    // Not a page, or not in the docs collection.
    ["src/content/docs/assets/diagram.png", undefined],
    ["src/lib/sdk.ts", undefined],
    ["src/content/docs", undefined],
  ];

  for (const [filePath, expected] of cases) {
    test(`${filePath} → ${expected}`, () => {
      expect(routeForDocsFile(filePath)).toBe(expected);
    });
  }
});

test.describe("routeForSitemapUrl", () => {
  const cases: [string, string | undefined][] = [
    ["https://docs.arcjet.com/", "/"],
    ["https://docs.arcjet.com/architecture/", "/architecture/"],
    // A missing trailing slash is normalized so it matches a docs route key.
    ["https://docs.arcjet.com/architecture", "/architecture/"],
    // SDK-scoped routes render the same source file, so they share its route.
    ["https://docs.arcjet.com/sdk/astro/architecture/", "/architecture/"],
    [
      "https://docs.arcjet.com/sdk/react-router/shield/quick-start/",
      "/shield/quick-start/",
    ],
    ["https://docs.arcjet.com/sdk/astro/", "/"],
    ["https://docs.arcjet.com/sdk/astro", "/"],
    // `go` is not an SDK key, so the segment must not be stripped.
    ["https://docs.arcjet.com/sdk/go/architecture/", "/sdk/go/architecture/"],
    // Neither is a slug that merely starts like one.
    [
      "https://docs.arcjet.com/sdk/astro-extra/architecture/",
      "/sdk/astro-extra/architecture/",
    ],
    // `/sdk` without a segment is left alone.
    ["https://docs.arcjet.com/sdk/", "/sdk/"],
    ["not a url", undefined],
  ];

  for (const [url, expected] of cases) {
    test(`${url} → ${expected}`, () => {
      expect(routeForSitemapUrl(url)).toBe(expected);
    });
  }
});

test.describe("pageJsonLd", () => {
  const base = {
    canonical: "https://docs.arcjet.com/shield/",
    title: "Arcjet Shield WAF",
    description: "Blocks common attacks.",
    lang: "en",
  };

  test("describes a docs page as a TechArticle joined to the Arcjet entity", () => {
    const nodes = nodesByType(pageJsonLd(base));
    const article = nodes.get("TechArticle");

    expect(article).toBeDefined();
    expect(article?.["@id"]).toBe("https://docs.arcjet.com/shield/#webpage");
    expect(article?.url).toBe(base.canonical);
    expect(article?.headline).toBe(base.title);
    expect(article?.description).toBe(base.description);
    expect(article?.isPartOf).toEqual({ "@id": WEBSITE_ID });
    expect(article?.about).toEqual({ "@id": SOFTWARE_ID });
    expect(article?.publisher).toEqual({ "@id": ORGANIZATION_ID });
    expect(article?.author).toEqual({ "@id": ORGANIZATION_ID });
    expect(article?.inLanguage).toBe("en");
  });

  test("reuses the arcjet.com @id values so the nodes merge", () => {
    const nodes = nodesByType(pageJsonLd(base));

    expect(nodes.get("Organization")?.["@id"]).toBe(ORGANIZATION_ID);
    expect(nodes.get("SoftwareApplication")?.["@id"]).toBe(SOFTWARE_ID);
    expect(nodes.get("WebSite")?.["@id"]).toBe(WEBSITE_ID);
    expect(nodes.get("ImageObject")?.["@id"]).toBe("https://arcjet.com/#logo");
  });

  test("builds a breadcrumb trail ending at the page itself", () => {
    const graph = pageJsonLd({
      ...base,
      breadcrumbs: [{ name: "Building blocks" }],
    });
    const breadcrumb = nodesByType(graph).get("BreadcrumbList") as
      | { itemListElement: { position: number; name: string; item?: string }[] }
      | undefined;

    expect(breadcrumb?.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Arcjet Docs",
        item: "https://docs.arcjet.com/",
      },
      // Sidebar groups are labels, not links, so they carry no `item`.
      { "@type": "ListItem", position: 2, name: "Building blocks" },
      {
        "@type": "ListItem",
        position: 3,
        name: base.title,
        item: base.canonical,
      },
    ]);
  });

  test("describes the landing page as a WebPage with no breadcrumb", () => {
    const graph = pageJsonLd({ ...base, isLandingPage: true });
    const nodes = nodesByType(graph);

    expect(nodes.has("TechArticle")).toBe(false);
    expect(nodes.has("BreadcrumbList")).toBe(false);
    const page = nodes.get("WebPage");
    expect(page?.breadcrumb).toBeUndefined();
    // A landing page is not authored technical writing.
    expect(page?.author).toBeUndefined();
    expect(page?.headline).toBeUndefined();
  });

  test("omits description and dateModified when they are unavailable", () => {
    const nodes = nodesByType(pageJsonLd({ ...base, description: undefined }));
    const article = nodes.get("TechArticle");

    expect(article).not.toHaveProperty("description");
    expect(article).not.toHaveProperty("dateModified");
  });

  test("emits dateModified as an ISO 8601 string", () => {
    const lastUpdated = new Date("2026-08-18T18:48:59.000Z");
    const nodes = nodesByType(pageJsonLd({ ...base, lastUpdated }));

    expect(nodes.get("TechArticle")?.dateModified).toBe(
      "2026-08-18T18:48:59.000Z",
    );
  });
});

test.describe("serializeJsonLd", () => {
  test("escapes < so a value cannot close the script element early", () => {
    const serialized = serializeJsonLd({
      title: "</script><img src=x onerror=alert(1)>",
    });

    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script");
    // Still valid JSON, and the value survives unchanged once parsed.
    expect(JSON.parse(serialized)).toEqual({
      title: "</script><img src=x onerror=alert(1)>",
    });
  });
});

test.describe("rendered metadata", () => {
  test("every sitemap entry carries a lastmod", async ({ request }) => {
    const response = await request.get("/sitemap-0.xml");
    expect(response.status()).toBe(200);

    const body = await response.text();
    const locations = body.match(/<loc>/g) ?? [];
    const lastmods = body.match(/<lastmod>/g) ?? [];

    expect(locations.length).toBeGreaterThan(0);
    expect(lastmods.length).toBe(locations.length);
  });

  for (const path of ["/prompt-injection/", "/reference/nextjs/"]) {
    test(`${path} serves a TechArticle graph and a non-empty h1`, async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      // The h1 has to be in the server-rendered HTML for crawlers that do not
      // execute JavaScript.
      await expect(page.locator("h1").first()).not.toBeEmpty();

      const types = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((scripts) =>
          scripts.flatMap((script) => {
            try {
              const data = JSON.parse(script.textContent ?? "");
              const graph = data["@graph"] ?? [data];
              return graph.map((node: Node) => node["@type"]);
            } catch {
              return [];
            }
          }),
        );

      expect(types).toEqual(
        expect.arrayContaining([
          "Organization",
          "WebSite",
          "TechArticle",
          "BreadcrumbList",
        ]),
      );
    });
  }
});
