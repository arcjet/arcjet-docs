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
  "/ai-protection/",
  "/ai-protection/abuse-protection",
  "/ai-protection/budget-control",
  "/ai-protection/data-loss-prevention",
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
  "/content-moderation/",
  "/content-moderation/policy/",
  "/bot-protection/identifying-bots/",
  "/bot-protection/quick-start/",
  "/bot-protection/reference/",
  "/email-validation/",
  "/email-validation/quick-start/",
  "/email-validation/reference/",
  "/examples/",
  "/filters/",
  "/filters/quick-start/",
  "/filters/reference/",
  "/fingerprints/",
  "/get-started/",
  "/guards/",
  "/guards/claude-agent-sdk/",
  "/guards/claude-managed-agents/",
  "/guards/crewai/",
  "/guards/framework-integrations/",
  "/guards/genkit/",
  "/guards/google-adk/",
  "/guards/langchain/",
  "/guards/langgraph/",
  "/guards/mastra/",
  "/guards/openai-agents/",
  "/guards/quick-start/",
  "/guards/strands-agents/",
  "/guards/tanstack-ai/",
  "/guards/vercel-ai/",
  "/guards/vercel-eve/",
  "/inspect/",
  "/integrations/better-auth/",
  "/integrations/clerk/",
  "/ip/",
  "/limitations/",
  "/nosecone/quick-start/",
  "/nosecone/reference/",
  "/privacy/",
  "/prompt-injection/",
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

        const status = await page.goto(path, {
          waitUntil: "networkidle",
        });

        // Verify the page loaded correctly and we are on the expected path.

        expect(status?.ok()).toBeTruthy();
        const actualUrl = new URL(page.url());
        expect(actualUrl.pathname).toBe(path);

        await page.evaluate(async () => {
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

          // npm version badges are masked, but a missed shields.io load
          // collapses their height and shifts the article. Wait for each
          // image, then keep a 20px box if it still has no intrinsic size.
          const badges = [
            ...document.querySelectorAll<HTMLImageElement>("picture.badge img"),
          ];
          await Promise.all(
            badges.map((img) => {
              if (img.complete) {
                return Promise.resolve();
              }
              return new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true });
                img.addEventListener("error", () => resolve(), { once: true });
              });
            }),
          );
          for (const img of badges) {
            if (img.naturalHeight > 0) {
              continue;
            }
            const picture = img.closest("picture");
            if (picture instanceof HTMLElement) {
              picture.style.display = "inline-block";
              picture.style.height = "20px";
            }
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
            // Using absolute threshold rather than a ratio seems to be more
            // consistent for these large text-heavy screenshots. Allow enough
            // headroom for minor font-rendering differences across CI runners.
            maxDiffPixels: 300,
            mask: [page.locator("[data-playwright-mask]")],
            // The reference pages are tens of thousands of pixels tall and
            // the default 5s budget is not enough to capture one on a loaded
            // runner. A timeout here is worse than slow: with
            // `--update-snapshots=changed` the partial capture is written to
            // disk as the new expectation, so a page that was only slow
            // silently becomes a wrong snapshot.
            timeout: 20_000,
            threshold: 0.1,
          },
        );
      });
    }
  }
});
