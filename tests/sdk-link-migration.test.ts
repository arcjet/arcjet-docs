import { expect, test, type Page } from "@playwright/test";

function visibleSdkToggle(page: Page) {
  return page.locator(".toc-toggle, .mtoc-sdk-toggle").filter({ visible: true });
}

function visibleSdkMenu(page: Page) {
  return page.locator("#toc-sdk, #mtoc-sdk").filter({ visible: true });
}

async function openSdkMenu(page: Page) {
  const toggle = visibleSdkToggle(page);
  await expect(toggle).toBeVisible({ timeout: 15_000 });
  await toggle.click();
  const menu = visibleSdkMenu(page);
  await expect(menu).toBeVisible({ timeout: 15_000 });
  return menu;
}

async function sdkMenuLabels(page: Page) {
  const menu = await openSdkMenu(page);
  return menu.locator("a").allTextContents();
}

async function selectSdkOption(page: Page, name: string) {
  const menu = await openSdkMenu(page);
  await menu.getByRole("option", { name, exact: true }).click();
}

test.describe("SDK link migration", () => {
  test("index Get started buttons link to SDK routes", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".FrameworkLinks a[href*='/sdk/']", {
      timeout: 15_000,
    });

    const hrefs = await page
      .locator(".FrameworkLinks a")
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));

    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((href) => !href?.includes("?f="))).toBe(true);
    expect(hrefs.some((href) => href?.startsWith("/sdk/next/get-started"))).toBe(
      true,
    );
    expect(
      hrefs.some((href) => href?.startsWith("/sdk/crewai/get-started")),
    ).toBe(true);
    expect(
      hrefs.some((href) =>
        href?.startsWith("/sdk/claude-agent-sdk-py/get-started"),
      ),
    ).toBe(true);
    expect(hrefs.some((href) => href?.startsWith("/guards/"))).toBe(false);
  });

  test("get-started framework buttons link to SDK get-started routes", async ({
    page,
  }) => {
    await page.goto("/get-started/");
    await page.waitForSelector(".FrameworkLinks a[href*='/sdk/']", {
      timeout: 15_000,
    });

    const hrefs = await page
      .locator(".FrameworkLinks a")
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));

    expect(hrefs.some((href) => href?.startsWith("/sdk/crewai/get-started"))).toBe(
      true,
    );
    expect(
      hrefs.some((href) =>
        href?.startsWith("/sdk/claude-agent-sdk-py/get-started"),
      ),
    ).toBe(true);
    expect(hrefs.some((href) => href?.startsWith("/guards/"))).toBe(false);
  });

  test("SDK and hub pages share a custom switcher with alphabetical options", async ({
    page,
  }) => {
    await page.goto("/get-started/");
    const hubLabels = await sdkMenuLabels(page);
    expect(hubLabels.length).toBeGreaterThan(1);
    expect(hubLabels).toEqual(
      [...hubLabels].sort((a, b) => a.localeCompare(b, "en")),
    );

    await page.goto("/sdk/astro/get-started/");
    await expect(visibleSdkToggle(page)).toBeVisible({ timeout: 15_000 });
    await expect(visibleSdkToggle(page)).toContainText("Astro");

    const sdkLabels = await sdkMenuLabels(page);
    expect(sdkLabels).toEqual(hubLabels);
    await expect(page.locator("#toc-sdk")).toHaveCount(1);

    const icons = page.locator("#toc-sdk a > svg:first-child");
    expect(await icons.count()).toBe(sdkLabels.length);
  });

  test("hub and SDK pages mount the desktop switcher in the Starlight sidebar", async ({
    page,
  }) => {
    const desktopSwitcher = page.locator(
      ".right-sidebar-panel [data-sdk-switcher='desktop']",
    );

    await page.goto("/get-started/");
    await expect(desktopSwitcher).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#toc-sdk")).toBeHidden();
    await expect(desktopSwitcher.locator(".toc-toggle")).toBeVisible();

    await page.goto("/sdk/astro/get-started/");
    await expect(desktopSwitcher).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#toc-sdk")).toBeHidden();
    await expect(desktopSwitcher.locator(".toc-toggle")).toContainText("Astro");
  });

  test("SDK switcher navigates between SDK routes", async ({ page }) => {
    await page.goto("/sdk/astro/get-started/");
    await selectSdkOption(page, "Next.js");
    await page.waitForURL(/\/sdk\/next\/get-started\/?/, { timeout: 15_000 });

    expect(page.url()).toMatch(/\/sdk\/next\/get-started\/?$/);
    await expect(visibleSdkToggle(page)).toContainText("Next.js");
  });

  test("SDK switcher navigates to SDK route on get-started", async ({
    page,
  }) => {
    await page.goto("/get-started/");
    await selectSdkOption(page, "Next.js");
    await page.waitForURL(/\/sdk\/next\/get-started\/?/, { timeout: 15_000 });

    expect(page.url()).toMatch(/\/sdk\/next\/get-started\/?$/);
    expect(page.url()).not.toContain("?f=");
  });

  test("SDK switcher navigates guard adapters to get-started routes", async ({
    page,
  }) => {
    await page.goto("/get-started/");
    await selectSdkOption(page, "CrewAI");
    await page.waitForURL(/\/sdk\/crewai\/get-started\/?/, { timeout: 15_000 });

    expect(page.url()).toMatch(/\/sdk\/crewai\/get-started\/?$/);
    expect(page.url()).not.toContain("?f=");
  });

  test("SDK switcher navigates to Claude Agent SDK Python get-started", async ({
    page,
  }) => {
    await page.goto("/get-started/");
    await selectSdkOption(page, "Claude Agent SDK Python");
    await page.waitForURL(/\/sdk\/claude-agent-sdk-py\/get-started\/?/, {
      timeout: 15_000,
    });

    expect(page.url()).toMatch(/\/sdk\/claude-agent-sdk-py\/get-started\/?$/);
    expect(page.url()).not.toContain("?f=");
    await expect(page.locator("body")).toContainText("create_sdk_mcp_server");
    await expect(page.locator("body")).toContainText(
      "arcjet[claude-agent-sdk]",
    );
  });

  test("SDK switcher navigates to SDK route on guards quick start", async ({
    page,
  }) => {
    await page.goto("/guards/quick-start/");
    await selectSdkOption(page, "LangChain");
    await page.waitForURL(/\/sdk\/langchain\/guards\/quick-start\/?/, {
      timeout: 15_000,
    });

    expect(page.url()).toMatch(/\/sdk\/langchain\/guards\/quick-start\/?$/);
    expect(page.url()).not.toContain("?f=");
  });

  test("SDK switcher navigates to Claude Agent SDK Python guards quick start", async ({
    page,
  }) => {
    await page.goto("/guards/quick-start/");
    await selectSdkOption(page, "Claude Agent SDK Python");
    await page.waitForURL(/\/sdk\/claude-agent-sdk-py\/guards\/quick-start\/?/, {
      timeout: 15_000,
    });

    expect(page.url()).toMatch(
      /\/sdk\/claude-agent-sdk-py\/guards\/quick-start\/?$/,
    );
    expect(page.url()).not.toContain("?f=");
    await expect(page.locator("body")).toContainText("create_sdk_mcp_server");
    await expect(page.locator("body")).toContainText(
      "arcjet[claude-agent-sdk,sensitive-info-rampart]",
    );
    await expect(page.locator("body")).toContainText(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  test("SDK menu scrolls independently on a short viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto("/sdk/astro/get-started/");
    const menu = await openSdkMenu(page);

    const metrics = await menu.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        overflowY: style.overflowY,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      };
    });

    expect(["auto", "scroll", "overlay"]).toContain(metrics.overflowY);
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);

    await menu.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    expect(await menu.evaluate((element) => element.scrollTop)).toBeGreaterThan(
      0,
    );
  });
});
