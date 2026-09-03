import { expect, test } from "@playwright/test";

/**
 * `SelectableContent` receives its options as Astro slots, which arrive as
 * `memo(StaticHtml, () => true)`. That memo never re-renders on an update, so
 * without a changing key the dropdown value changes and the content does not.
 * These tests drive the real DOM, because the bug is invisible to any
 * assertion that only reads the select.
 */

function selector(page: import("@playwright/test").Page, optionValue: string) {
  const has = page.locator(`option[value="${optionValue}"]`);
  return {
    select: page.locator(".SelectableContent select").filter({ has }).first(),
    block: page.locator(".SelectableContent").filter({ has }).first(),
  };
}

test.describe("SelectableContent", () => {
  test("switching the package manager rewrites the command", async ({
    page,
  }) => {
    await page.goto("/sdk/next/get-started/");
    const { select, block } = selector(page, "pnpm");
    await expect(select).toBeVisible({ timeout: 15_000 });
    await expect(block).toContainText("npm i @arcjet/next");

    await select.selectOption("pnpm");

    await expect(block).toContainText("pnpm add @arcjet/next");
  });

  test("switching the language rewrites the sample", async ({ page }) => {
    await page.goto("/sdk/node/filters/quick-start/");
    const { select, block } = selector(page, "TS");
    await expect(select).toBeVisible({ timeout: 15_000 });
    await expect(block).toContainText("index.js");

    await select.selectOption("TS");

    await expect(block).toContainText("index.ts");
  });

  const MERGED = [
    ["/sdk/claude-agent-sdk/get-started/", "arcjet[claude-agent-sdk]"],
    ["/sdk/langchain/get-started/", "arcjet[langchain-agents]"],
    [
      "/sdk/strands-agents/sensitive-info/quick-start/",
      "arcjet.guard.strands_agents",
    ],
    [
      "/sdk/claude-agent-sdk/guards/quick-start/",
      "arcjet[claude-agent-sdk,sensitive-info-rampart]",
    ],
    ["/sdk/langchain/rate-limiting/reference/", "arcjet.guard.langchain"],
  ] as const;

  for (const [path, pythonOnly] of MERGED) {
    test(`the language switcher reveals the Python adapter on ${path}`, async ({
      page,
    }) => {
      await page.goto(path);
      const { select } = selector(page, "Python");
      await expect(select).toBeVisible({ timeout: 15_000 });

      // JavaScript is the first slot, so the Python adapter is not shown yet.
      await expect(select).toHaveValue("JavaScript / TypeScript");
      await expect(page.locator("main")).not.toContainText(pythonOnly);

      await select.selectOption("Python");

      await expect(page.locator("main")).toContainText(pythonOnly);
    });
  }

  test("the choice applies to every switcher on the page", async ({ page }) => {
    await page.goto("/sdk/claude-agent-sdk/get-started/");
    const selects = page
      .locator(".SelectableContent select")
      .filter({ has: page.locator('option[value="Python"]') });
    await expect(selects.first()).toBeVisible({ timeout: 15_000 });

    const count = await selects.count();
    expect(count).toBeGreaterThan(1);

    await selects.first().selectOption("Python");

    for (let i = 0; i < count; i++) {
      await expect(selects.nth(i)).toHaveValue("Python");
    }
  });

  test("the choice persists to the next page", async ({ page }) => {
    await page.goto("/sdk/claude-agent-sdk/get-started/");
    const { select } = selector(page, "Python");
    await expect(select).toBeVisible({ timeout: 15_000 });
    await select.selectOption("Python");

    await page.goto("/sdk/strands-agents/sensitive-info/quick-start/");

    await expect(page.locator("main")).toContainText(
      "arcjet.guard.strands_agents",
      { timeout: 15_000 },
    );
  });
});
