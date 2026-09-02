import { expect, test } from "@playwright/test";

function visibleSdkToggle(page: import("@playwright/test").Page) {
  return page
    .locator('[data-sdk-switcher="desktop"] .toc-toggle')
    .filter({ visible: true });
}

function visibleSdkMenu(page: import("@playwright/test").Page) {
  return page.locator("#toc-sdk").filter({ visible: true });
}

function activeOption(page: import("@playwright/test").Page) {
  return visibleSdkMenu(page).locator("[data-active='true']");
}

test.describe("SDK switcher accessibility", () => {
  test("exposes a select-only combobox with the current value", async ({
    page,
  }) => {
    await page.goto("/sdk/astro/get-started/");
    const toggle = visibleSdkToggle(page);
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await expect(toggle).toHaveRole("combobox");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveAttribute("aria-haspopup", "listbox");
    await expect(toggle).toHaveAccessibleName(/SDK.*Astro|Astro/i);

    await toggle.click();
    const menu = visibleSdkMenu(page);
    await expect(menu).toBeVisible();
    await expect(menu).toHaveRole("listbox");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toBeFocused();

    const current = menu.locator("[aria-current='page']");
    await expect(current).toHaveAttribute("aria-selected", "true");
    await expect(current).toContainText("Astro");
    await expect(menu.locator("svg[aria-hidden='true']").first()).toBeAttached();
  });

  test("ArrowDown opens the menu and Enter chooses the highlighted option", async ({
    page,
  }) => {
    await page.goto("/sdk/astro/get-started/");
    const toggle = visibleSdkToggle(page);
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await toggle.focus();
    await page.keyboard.press("ArrowDown");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(activeOption(page)).toContainText("Astro");

    await page.keyboard.press("ArrowDown");
    await expect(activeOption(page)).toContainText("Bun");
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/sdk\/bun\/get-started\/?/, { timeout: 15_000 });
    await expect(visibleSdkToggle(page)).toContainText("Bun");
  });

  test("Escape closes the menu and returns focus to the button", async ({
    page,
  }) => {
    await page.goto("/sdk/astro/get-started/");
    const toggle = visibleSdkToggle(page);
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await toggle.focus();
    await page.keyboard.press("ArrowDown");
    await expect(visibleSdkMenu(page)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    expect(page.url()).toMatch(/\/sdk\/astro\/get-started\/?/);
  });

  test("Tab closes the menu without navigating", async ({ page }) => {
    await page.goto("/sdk/astro/get-started/");
    const toggle = visibleSdkToggle(page);
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await toggle.focus();
    await page.keyboard.press("ArrowDown");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowDown");
    await expect(activeOption(page)).toContainText("Bun");

    await page.keyboard.press("Tab");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(page.url()).toMatch(/\/sdk\/astro\/get-started\/?/);
  });

  test("typeahead and Home/End match native select behavior", async ({
    page,
  }) => {
    await page.goto("/sdk/astro/get-started/");
    const toggle = visibleSdkToggle(page);
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await toggle.focus();
    await page.keyboard.press("ArrowDown");
    await expect(visibleSdkMenu(page)).toBeVisible();
    await page.keyboard.press("n");
    await expect(activeOption(page)).toContainText("NestJS");

    await page.keyboard.press("e");
    await expect(activeOption(page)).toContainText("NestJS");
    await page.keyboard.press("x");
    await expect(activeOption(page)).toContainText("Next.js");

    await page.keyboard.press("Home");
    await expect(activeOption(page)).toContainText("Astro");
    await page.keyboard.press("End");
    await expect(activeOption(page)).toContainText("Vercel Eve");
  });

  test("Space chooses the highlighted option", async ({ page }) => {
    await page.goto("/sdk/astro/get-started/");
    const toggle = visibleSdkToggle(page);
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await toggle.focus();
    await page.keyboard.press("ArrowDown");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(activeOption(page)).toContainText("Astro");
    await page.keyboard.press("ArrowDown");
    await expect(activeOption(page)).toContainText("Bun");
    await page.keyboard.press(" ");
    await page.waitForURL(/\/sdk\/bun\/get-started\/?/, { timeout: 15_000 });
  });
});
