import { expect, test, type Page } from "@playwright/test";
import {
  LEGACY_FRAMEWORK_HUB_PATHS,
  sdks,
  sdkVariants,
} from "@/lib/sdk";

function visibleFrameworkSwitcher(page: Page) {
  return page.locator(".FrameworkSwitcher select").filter({ visible: true });
}

const SITE = "https://docs.arcjet.com";

function sitemapUrls(body: string): Set<string> {
  return new Set(
    [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]),
  );
}

interface PlusVariantSpec {
  baseUrl: string;
  plusUrl: string;
  title: string;
  plusMarkers: readonly string[];
  baseOnlyMarkers: readonly string[];
}

const PLUS_VARIANT_SPECS: readonly PlusVariantSpec[] = [
  {
    baseUrl: "/sdk/bun/get-started/",
    plusUrl: "/sdk/bun/plus/hono/get-started/",
    title: "Get started with Bun + Hono",
    plusMarkers: ["Hono 4.3 or later"],
    baseOnlyMarkers: ["Bun.serve()"],
  },
  {
    baseUrl: "/sdk/node/get-started/",
    plusUrl: "/sdk/node/plus/express/get-started/",
    title: "Get started with Node.js + Express",
    plusMarkers: ["Express.js 4.19 or later"],
    baseOnlyMarkers: ["Hono 4.3 or later"],
  },
  {
    baseUrl: "/sdk/node/get-started/",
    plusUrl: "/sdk/node/plus/hono/get-started/",
    title: "Get started with Node.js + Hono",
    plusMarkers: ["Hono 4.3 or later"],
    baseOnlyMarkers: ["Express.js 4.19 or later"],
  },
  {
    baseUrl: "/sdk/python/plus/flask/get-started/",
    plusUrl: "/sdk/python/plus/fastapi/get-started/",
    title: "Get started with Python + FastAPI",
    plusMarkers: ["arcjet-fastapi"],
    baseOnlyMarkers: ["arcjet-flask"],
  },
  {
    baseUrl: "/sdk/python/plus/fastapi/get-started/",
    plusUrl: "/sdk/python/plus/flask/get-started/",
    title: "Get started with Python + Flask",
    plusMarkers: ["arcjet-flask"],
    baseOnlyMarkers: ["arcjet-fastapi"],
  },
];

const INDEXABLE_SDK_GET_STARTED_URLS = sdks()
  .filter((entry) => entry.legacyFrameworkKey)
  .map((entry) => `/sdk/${entry.key}/get-started/`);

const NOINDEX_PLUS_GET_STARTED_URLS = sdks().flatMap((entry) =>
  sdkVariants(entry.key).map(
    (variant) => `/sdk/${entry.key}/plus/${variant.key}/get-started/`,
  ),
);

const LLMS_TXT_SDK_URLS = [
  "https://docs.arcjet.com/sdk/next/get-started/",
  "https://docs.arcjet.com/sdk/astro/get-started/",
  "https://docs.arcjet.com/sdk/bun/plus/hono/get-started/",
  "https://docs.arcjet.com/sdk/node/plus/express/get-started/",
  "https://docs.arcjet.com/sdk/python/plus/fastapi/get-started/",
] as const;

const LEGACY_HUB_SAMPLES = [
  "/get-started/",
  "/bot-protection/quick-start/",
  "/filters/reference/",
] as const;

async function mainText(page: import("@playwright/test").Page) {
  return page.locator("main").innerText();
}

test.describe("Plus-variant routes render variant-specific guides", () => {
  for (const spec of PLUS_VARIANT_SPECS) {
    test(`${spec.plusUrl} renders ${spec.title}`, async ({ page }) => {
      await page.goto(spec.plusUrl, { waitUntil: "domcontentloaded" });

      await expect(page.locator("h1")).toHaveText(spec.title);
      await expect(page.locator("main .Skeleton")).toHaveCount(0);

      const text = await mainText(page);
      for (const marker of spec.plusMarkers) {
        expect(text, `expected "${marker}" in main content`).toContain(marker);
      }
      for (const marker of spec.baseOnlyMarkers) {
        expect(text, `did not expect "${marker}" in variant content`).not.toContain(
          marker,
        );
      }
    });

    test(`${spec.plusUrl} differs from ${spec.baseUrl}`, async ({ page }) => {
      await page.goto(spec.baseUrl, { waitUntil: "domcontentloaded" });
      const baseText = await mainText(page);

      await page.goto(spec.plusUrl, { waitUntil: "domcontentloaded" });
      const plusText = await mainText(page);

      expect(plusText).not.toEqual(baseText);
    });
  }
});

test.describe("Indexable SDK route SEO metadata", () => {
  for (const path of INDEXABLE_SDK_GET_STARTED_URLS) {
    test(`${path} is indexable with a self-canonical URL`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${SITE}${path}`,
      );

      const robots = page.locator('meta[name="robots"]');
      if ((await robots.count()) > 0) {
        await expect(robots).not.toHaveAttribute("content", /noindex/i);
      }

      await expect(page.locator("h1").first()).not.toBeEmpty();
      await expect(page.locator("title")).not.toHaveText(/Arcjet Docs \| Arcjet Docs/);
    });
  }
});

test.describe("Plus-variant SDK route SEO metadata", () => {
  for (const path of NOINDEX_PLUS_GET_STARTED_URLS) {
    test(`${path} is noindex with a self-canonical URL`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${SITE}${path}`,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex,\s*follow/i,
      );
    });
  }

  test("/sdk/bun/plus/hono/get-started/ JSON-LD uses the variant headline", async ({
    page,
  }) => {
    await page.goto("/sdk/bun/plus/hono/get-started/", {
      waitUntil: "domcontentloaded",
    });

    const headline = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => {
        for (const script of scripts) {
          try {
            const data = JSON.parse(script.textContent ?? "");
            const graph = data["@graph"] ?? [data];
            for (const node of graph) {
              if (node["@type"] === "TechArticle") {
                return node.headline as string | undefined;
              }
            }
          } catch {
            continue;
          }
        }
        return undefined;
      });

    expect(headline).toBe("Get started with Bun + Hono");
  });
});

test.describe("Legacy framework hub SEO metadata", () => {
  for (const path of LEGACY_HUB_SAMPLES) {
    test(`${path} is noindex`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex,\s*follow/i,
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${SITE}${path}`,
      );
    });
  }
});

test.describe("SDK routes in sitemap", () => {
  test("plus-variant get-started URLs are omitted", async ({ request }) => {
    const response = await request.get("/sitemap-0.xml");
    expect(response.status()).toBe(200);

    const urls = sitemapUrls(await response.text());
    for (const spec of PLUS_VARIANT_SPECS) {
      expect(urls.has(`${SITE}${spec.plusUrl}`)).toBe(false);
    }
  });

  test("legacy framework hub URLs are omitted", async ({ request }) => {
    const response = await request.get("/sitemap-0.xml");
    expect(response.status()).toBe(200);

    const urls = sitemapUrls(await response.text());
    for (const path of LEGACY_FRAMEWORK_HUB_PATHS) {
      expect(urls.has(`${SITE}${path}`)).toBe(false);
    }
  });

  test("representative SDK get-started URLs are listed", async ({ request }) => {
    const response = await request.get("/sitemap-0.xml");
    expect(response.status()).toBe(200);

    const body = await response.text();
    for (const path of [
      "/sdk/next/get-started/",
      "/sdk/astro/get-started/",
      "/sdk/sveltekit/get-started/",
    ]) {
      expect(body).toContain(`${SITE}${path}`);
    }
  });
});

test.describe("llms.txt agent discovery", () => {
  test("lists SDK-scoped get-started URLs", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    for (const url of LLMS_TXT_SDK_URLS) {
      expect(body).toContain(url);
    }
    expect(body).not.toMatch(/https:\/\/docs\.arcjet\.com\/[^\s)]*\?f=/);
  });
});

test.describe("llms-full.txt agent discovery", () => {
  test("lists SDK-scoped get-started URLs without legacy ?f= links", async ({
    request,
  }) => {
    const response = await request.get("/llms-full.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("https://docs.arcjet.com/sdk/next/get-started/");
    expect(body).toContain("https://docs.arcjet.com/sdk/bun/plus/hono/get-started/");
    expect(body).not.toMatch(/https:\/\/docs\.arcjet\.com\/[^\s)]*\?f=/);
  });
});

test.describe("SDK switcher labels on plus-variant pages", () => {
  test("/sdk/bun/plus/hono/get-started/ shows Bun + Hono in the SDK switcher", async ({
    page,
  }) => {
    await page.goto("/sdk/bun/plus/hono/get-started/", {
      waitUntil: "domcontentloaded",
    });

    const switcher = visibleFrameworkSwitcher(page);
    await expect(switcher).toBeVisible({ timeout: 15_000 });
    await expect(switcher).toHaveValue("bun-hono");
    await expect(switcher.locator("option:checked")).toHaveText("Bun + Hono");
  });

  test("/sdk/python/plus/fastapi/get-started/ lists Python variants in the SDK switcher", async ({
    page,
  }) => {
    await page.goto("/sdk/python/plus/fastapi/get-started/", {
      waitUntil: "domcontentloaded",
    });

    const switcher = visibleFrameworkSwitcher(page);
    await expect(switcher).toBeVisible({ timeout: 15_000 });
    await expect(switcher).toHaveValue("python-fastapi");

    const labels = await switcher.locator("option").allTextContents();
    expect(labels).toContain("Python + FastAPI");
    expect(labels).toContain("Python + Flask");
    expect(labels.filter((label) => label === "Python")).toHaveLength(0);
  });
});

test.describe("Variant-only SDK redirects", () => {
  test("/sdk/python/get-started/ redirects to FastAPI", async ({ page }) => {
    await page.goto("/sdk/python/get-started/", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/sdk\/python\/plus\/fastapi\/get-started\/?$/);
    await expect(page.locator("h1")).toHaveText("Get started with Python + FastAPI");
    await expect(page.locator("main")).toContainText("arcjet-fastapi");
  });
});
