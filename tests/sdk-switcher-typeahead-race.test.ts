import { expect, test } from "@playwright/test";

/**
 * Diagnostic probe for the SDK switcher typeahead failure.
 *
 * Hypothesis: `SdkSwitcher.tsx` opens the menu with `showPopover()`, which
 * flips visibility synchronously, but the popover `toggle` event it fires is
 * queued as a task. `onButtonKeyDown` sets `pendingActiveIndex` before
 * opening, and `onToggle` later applies that pending index unconditionally.
 * A typeahead keypress landing between the two is therefore applied and then
 * overwritten.
 *
 * Delete this file once the question is settled.
 */

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

const ENABLED = process.env.PROBE === "1";

test.describe("SDK switcher typeahead race", () => {
  // Diagnostic only. Skipped unless PROBE=1, so a normal run and CI ignore
  // it and test B cannot turn the branch red.
  test.skip(!ENABLED, "diagnostic probe; run with PROBE=1");

  // CONTROL. The sequence the suite already uses, with a wait that cannot
  // resolve until `onToggle` has run. Expected to PASS. If this fails, the
  // problem is not the race and the rest of this file is a red herring.
  test("A: control, waits for the active option before typing", async ({
    page,
  }) => {
    await page.goto("/sdk/astro/get-started/");
    const toggle = visibleSdkToggle(page);
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await toggle.focus();

    await page.keyboard.press("ArrowDown");
    // Cannot resolve until onToggle has set activeIndex, so the queued
    // toggle task has drained by the time the next key is pressed.
    await expect(activeOption(page)).toContainText("Astro");

    await page.keyboard.press("n");
    await expect(activeOption(page)).toContainText("NestJS");
  });

  // FORCED RACE. Both keydowns are dispatched in one task, so the queued
  // toggle event cannot run between them. Expected to FAIL with "Astro" if
  // the hypothesis is right. Deterministic on every platform.
  test("B: forced race, both keys dispatched in one task", async ({ page }) => {
    await page.goto("/sdk/astro/get-started/");
    const toggle = visibleSdkToggle(page);
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await toggle.focus();

    await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element) throw new Error("nothing focused");
      const press = (key: string) =>
        element.dispatchEvent(
          new KeyboardEvent("keydown", {
            key,
            bubbles: true,
            cancelable: true,
          }),
        );
      press("ArrowDown");
      press("n"); // same task: the toggle event has not been dispatched yet
    });

    // Give the queued toggle event time to fire and, per the hypothesis,
    // overwrite the typeahead result.
    await page.waitForTimeout(300);

    const text = (await activeOption(page).textContent())?.trim();
    console.log(`[B] active option after forced race: ${text}`);
    expect(text).toContain("NestJS");
  });

  // TIMELINE. Records the real ordering during the sequence that failed on
  // macOS. Always passes; read its console output. If the hypothesis holds,
  // the log shows data-active moving to NestJS and then back to Astro, with
  // the toggle event landing between the two.
  test("C: timeline of toggle event versus data-active changes", async ({
    page,
  }) => {
    await page.goto("/sdk/astro/get-started/");
    const toggle = visibleSdkToggle(page);
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await toggle.focus();

    await page.evaluate(() => {
      const events: string[] = [];
      (window as unknown as { __probe: string[] }).__probe = events;
      const started = performance.now();
      const at = () => `${(performance.now() - started).toFixed(1)}ms`;

      const menu = document.querySelector("#toc-sdk");
      if (!menu) throw new Error("no #toc-sdk");

      menu.addEventListener("toggle", (event) => {
        events.push(`${at()} toggle -> ${(event as ToggleEvent).newState}`);
      });

      new MutationObserver((records) => {
        for (const record of records) {
          const target = record.target as HTMLElement;
          if (target.dataset.active === "true") {
            events.push(`${at()} active -> ${target.textContent?.trim()}`);
          }
        }
      }).observe(menu, {
        attributes: true,
        attributeFilter: ["data-active"],
        subtree: true,
      });

      document.addEventListener(
        "keydown",
        (event) => events.push(`${at()} keydown ${event.key}`),
        true,
      );
    });

    await page.keyboard.press("ArrowDown");
    await expect(visibleSdkMenu(page)).toBeVisible();
    await page.keyboard.press("n");
    await page.waitForTimeout(500);

    const timeline = await page.evaluate(
      () => (window as unknown as { __probe: string[] }).__probe,
    );
    console.log("[C] timeline:");
    for (const line of timeline) console.log(`    ${line}`);
    const text = (await activeOption(page).textContent())?.trim();
    console.log(`[C] active option at end: ${text}`);
  });
});
