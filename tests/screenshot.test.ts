import { expect, test } from "@playwright/test";

/**
 * Manually extracted from the sitemap. We expect these paths to be public
 * and accessible.
 *
 * Playwright doesn't provide a very ergonomic way to fetch this dynamically
 * before running the tests, so to be pragmatic we just copy them here.
 */
const PATHS_FROM_SITEMAP = [
  "/",
  "/architecture/",
  "/best-practices/",
  "/blueprints/ai-quota-control/",
  "/blueprints/cookie-banner/",
  "/blueprints/defining-custom-rules/",
  "/blueprints/feedback-form/",
  "/blueprints/ip-geolocation/",
  "/blueprints/malicious-traffic/",
  "/blueprints/payment-form/",
  "/blueprints/sampling/",
  "/blueprints/vpn-proxy-detection/",
  "/bot-protection/",
  "/bot-protection/identifying-bots/",
  "/bot-protection/quick-start/",
  "/bot-protection/reference/",
  "/comparisons/aikido-vs-arcjet/",
  "/comparisons/vercel-botid-vs-arcjet/",
  "/email-validation/",
  "/email-validation/quick-start/",
  "/email-validation/reference/",
  "/examples/",
  "/filters/",
  "/filters/quick-start/",
  "/filters/reference/",
  "/fingerprints/",
  "/get-started/",
  "/inspect/",
  "/integrations/authjs/",
  "/integrations/better-auth/",
  "/integrations/clerk/",
  "/integrations/langchain/",
  "/integrations/nextauth/",
  "/integrations/openai/",
  "/ip/",
  "/limitations/",
  "/nosecone/quick-start/",
  "/nosecone/reference/",
  "/privacy/",
  "/rate-limiting/",
  "/rate-limiting/algorithms/",
  "/rate-limiting/configuration/",
  "/rate-limiting/quick-start/",
  "/rate-limiting/reference/",
  "/redact/quick-start/",
  "/redact/reference/",
  "/reference/astro/",
  "/reference/bun/",
  "/reference/deno/",
  "/reference/fastify/",
  "/reference/nestjs/",
  "/reference/nextjs/",
  "/reference/nodejs/",
  "/reference/nuxt/",
  "/reference/react-router/",
  "/reference/remix/",
  "/reference/sveltekit/",
  "/regions/",
  "/security/",
  "/sensitive-info/",
  "/sensitive-info/quick-start/",
  "/sensitive-info/reference/",
  "/shield/",
  "/shield/quick-start/",
  "/shield/reference/",
  "/signup-protection/",
  "/signup-protection/quick-start/",
  "/signup-protection/reference/",
  "/support/",
  "/testing/",
  "/troubleshooting/",
  "/upgrading/sdk-migration/",
];

// Some pages are very long, so we limit the screenshot height to avoid
// overly excessive sizes.
const SCREENSHOT_MAX_HEIGHT_PX = 5000;

test.describe("Screenshots", () => {
  for (const path of PATHS_FROM_SITEMAP) {
    for (const colorScheme of ["light", "dark"] as const) {
      const name =
        path === "/" ? "home" : path.slice(1, -1).replaceAll("/", "-");

      test(`${name}-${colorScheme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });

        await page.goto(path, {
          waitUntil: "networkidle",
        });

        await page.evaluate(() => {
          // Astro dev toolbar interferes with screenshots.
          for (const el of document.querySelectorAll("astro-dev-toolbar")) {
            el.remove();
          }

          // YouTube iframes cause inconsistent screenshots.
          for (const el of document.querySelectorAll("lite-youtube")) {
            el.insertAdjacentHTML(
              "afterend",
              "<p>Youtube video removed for screenshot test</p>",
            );
            el.remove();
          }

          // Giscus iframes cause inconsistent screenshots.
          for (const el of document.querySelectorAll("div.giscus")) {
            el.insertAdjacentHTML(
              "afterend",
              "<p>Giscus comments removed for screenshot test</p>",
            );
            el.remove();
          }
        });

        const dimensions = await page.evaluate(() => {
          return {
            height: document.documentElement.scrollHeight,
            width: document.documentElement.scrollWidth,
          };
        });

        await expect(page).toHaveScreenshot(
          `screenshot-${name}-${colorScheme}.png`,
          {
            clip: {
              // Limit height to avoid excessive screenshot sizes
              height: Math.min(dimensions.height, SCREENSHOT_MAX_HEIGHT_PX),
              width: dimensions.width,
              x: 0,
              y: 0,
            },
            fullPage: true,
            // Using absolute threshold rather than a ration seems to be more
            // consistent for these large text-heavy screenshots.
            maxDiffPixels: 100,
            threshold: 0.1,
          },
        );
      });
    }
  }
});
