import { expect, test, type Page } from "@playwright/test";
import { sdks, sdkVariants } from "@/lib/sdk";

/**
 * Validates that per-SDK route pages (`/sdk/:sdk/...`) render the same main
 * content as the legacy `?f=<framework>` pages.
 *
 * The right sidebar (TOC / SDK switcher) will differ, so we only screenshot
 * the `<main>` element.
 */

// These pages are heavy — give each test plenty of time.
test.setTimeout(60_000);

interface SdkRouteEntry {
  /** Legacy `?f=` framework key */
  legacyKey: string;
  /** New SDK-scoped route prefix, e.g. "/sdk/next" or "/sdk/bun/plus/hono" */
  sdkPrefix: string;
}

const SDK_ROUTE_ENTRIES: SdkRouteEntry[] = [];
for (const sdk of sdks()) {
  if (sdk.legacyFrameworkKey) {
    SDK_ROUTE_ENTRIES.push({
      legacyKey: sdk.legacyFrameworkKey,
      sdkPrefix: `/sdk/${sdk.key}`,
    });
  }
  for (const variant of sdkVariants(sdk.key)) {
    SDK_ROUTE_ENTRIES.push({
      legacyKey: variant.legacyFrameworkKey,
      sdkPrefix: `/sdk/${sdk.key}/plus/${variant.key}`,
    });
  }
}

interface PageSpec {
  /** Path without leading `/sdk/…` prefix, e.g. "/get-started" */
  path: string;
  /**
   * Subset of legacy framework keys this page supports.
   * When omitted, all entries from SDK_ROUTE_ENTRIES are tested.
   */
  frameworks?: readonly string[];
}

const PAGES: readonly PageSpec[] = [
  {
    path: "/get-started",
    frameworks: [
      "astro",
      "bun",
      "bun-hono",
      "deno",
      "fastify",
      "nest-js",
      "next-js",
      "node-js",
      "node-js-express",
      "node-js-hono",
      "nuxt",
      "python-fastapi",
      "python-flask",
      "react-router",
      "remix",
      "sveltekit",
    ],
  },
  {
    path: "/bot-protection/quick-start",
    frameworks: [
      "astro",
      "bun",
      "deno",
      "nest-js",
      "next-js",
      "node-js",
      "nuxt",
      "remix",
      "sveltekit",
    ],
  },
  {
    path: "/bot-protection/reference",
    frameworks: [
      "bun",
      "deno",
      "nest-js",
      "next-js",
      "node-js",
      "remix",
      "sveltekit",
    ],
  },
  {
    path: "/email-validation/quick-start",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
  {
    path: "/email-validation/reference",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
  {
    path: "/filters/quick-start",
    frameworks: [
      "astro",
      "bun",
      "deno",
      "fastify",
      "nest-js",
      "next-js",
      "node-js",
      "react-router",
      "remix",
      "sveltekit",
    ],
  },
  {
    path: "/filters/reference",
    frameworks: [
      "bun",
      "deno",
      "nest-js",
      "next-js",
      "node-js",
      "remix",
      "sveltekit",
    ],
  },
  {
    path: "/nosecone/quick-start",
    frameworks: ["bun", "deno", "next-js", "node-js", "sveltekit"],
  },
  {
    path: "/rate-limiting/quick-start",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
  {
    path: "/rate-limiting/reference",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
  {
    path: "/sensitive-info/quick-start",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
  {
    path: "/sensitive-info/reference",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
  {
    path: "/shield/quick-start",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
  {
    path: "/shield/reference",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
  {
    path: "/signup-protection/quick-start",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
  {
    path: "/signup-protection/reference",
    frameworks: ["bun", "nest-js", "next-js", "node-js", "remix", "sveltekit"],
  },
];

/** Remove elements that cause non-deterministic rendering. */
async function sanitizePage(page: Page) {
  // Hide rather than remove — works even with JS disabled.
  const selectors = ["astro-dev-toolbar", "lite-youtube", "div.giscus"];

  for (const sel of selectors) {
    for (const el of await page.locator(sel).all()) {
      await el.evaluate((node) => (node.style.display = "none"));
    }
  }
}

/**
 * Screenshot the `<main>` element after sanitisation.
 *
 * Returns the screenshot buffer so the caller can compare two of them.
 */
async function screenshotMain(page: Page): Promise<Buffer> {
  await sanitizePage(page);

  const main = page.locator("main");
  await main.waitFor({ state: "visible" });

  return (await main.screenshot()) as Buffer;
}

/**
 * Wait for Astro islands to hydrate.
 *
 * On legacy pages `SlotByFrameworkReact` renders a `.Skeleton` placeholder
 * until hydration.  On *both* legacy and SDK pages, `SelectableContent`
 * islands need to hydrate before their tabbed content becomes visible.
 *
 * We wait for all `astro-island` elements inside `<main>` to drop their
 * `ssr` attribute, which Astro removes once an island has hydrated.
 */
async function waitForHydration(page: Page) {
  await page
    .locator("main astro-island[ssr]")
    .first()
    .waitFor({ state: "detached", timeout: 15_000 })
    .catch(() => {
      // No un-hydrated islands — that's fine.
    });

  // Give a short extra beat for any re-renders to settle.
  await page.waitForTimeout(500);
}

for (const spec of PAGES) {
  const entries = spec.frameworks
    ? SDK_ROUTE_ENTRIES.filter((e) => spec.frameworks!.includes(e.legacyKey))
    : SDK_ROUTE_ENTRIES;

  test.describe(`Main-content parity: ${spec.path}`, () => {
    for (const { legacyKey, sdkPrefix } of entries) {
      const legacyUrl = `${spec.path}?f=${legacyKey}`;
      const sdkUrl = `${sdkPrefix}${spec.path}`;
      const safeName = `${spec.path.slice(1).replaceAll("/", "-")}-${legacyKey}`;

      test(`${legacyUrl} vs ${sdkUrl}`, async ({ page }) => {
        const legacyRes = await page.goto(legacyUrl, {
          waitUntil: "networkidle",
        });
        expect(legacyRes?.ok(), `Legacy page ${legacyUrl} failed`).toBeTruthy();
        await waitForHydration(page);

        const legacyShot = await screenshotMain(page);

        const sdkRes = await page.goto(sdkUrl, {
          waitUntil: "networkidle",
        });
        expect(sdkRes?.ok(), `SDK page ${sdkUrl} failed`).toBeTruthy();
        await waitForHydration(page);

        const sdkShot = await screenshotMain(page);

        expect(sdkShot).toMatchSnapshot(`sdk-parity-${safeName}.png`, {
          maxDiffPixels: 200,
          threshold: 0.15,
        });
        expect(legacyShot).toMatchSnapshot(`sdk-parity-${safeName}.png`, {
          maxDiffPixels: 200,
          threshold: 0.15,
        });
      });
    }
  });
}
