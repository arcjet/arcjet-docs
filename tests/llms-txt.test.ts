import { expect, test } from "@playwright/test";

const MARKDOWN_PATHS = [
  "/bot-protection.md",
  "/email-validation.md",
  "/filters.md",
  "/llms.txt",
  "/rate-limiting.md",
  "/reference/astro.md",
  "/reference/bun.md",
  "/reference/deno.md",
  "/reference/fastify.md",
  "/reference/nestjs.md",
  "/reference/nextjs.md",
  "/reference/nodejs.md",
  "/reference/nuxt.md",
  "/reference/react-router.md",
  "/reference/remix.md",
  "/reference/sveltekit.md",
  "/sensitive-info.md",
  "/shield.md",
  "/signup-protection.md",
] as const;

test.describe("llms.txt", () => {
  for (const path of MARKDOWN_PATHS) {
    const name = path.slice(1).replaceAll("/", "-");

    test(name, async ({ page }) => {
      const response = await page.request.get(path);
      expect(response.status()).toBe(200);
      let text = await response.text();

      // Clean up some unstable parts
      // TODO: improve our SSR to avoid this output instead.

      // Unstable tab identifiers (ex "#tab-panel-[number]")
      text = text.replaceAll(/#tab-panel-\d+/g, "#tab-panel-XXX");

      // Astro islands (client component script bundles)
      text = text.replaceAll(/astro-island[^\n]+\n/g, "astro-island\n");

      expect(text).toMatchSnapshot(name.replace(".txt", ".md"));
    });
  }
});
