import { expect, test } from "@playwright/test";

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

  test("framework switcher navigates to SDK route on get-started", async ({
    page,
  }) => {
    await page.goto("/get-started/");
    await page.waitForSelector(".FrameworkSwitcher select", {
      timeout: 15_000,
    });

    await page.selectOption(".FrameworkSwitcher select", "next-js");
    await page.waitForURL(/\/sdk\/next\/get-started\/?/, { timeout: 15_000 });

    expect(page.url()).toMatch(/\/sdk\/next\/get-started\/?$/);
    expect(page.url()).not.toContain("?f=");
  });

  test("framework switcher navigates guard adapters to get-started routes", async ({
    page,
  }) => {
    await page.goto("/get-started/");
    await page.waitForSelector(".FrameworkSwitcher select", {
      timeout: 15_000,
    });

    await page.selectOption(".FrameworkSwitcher select", "crewai");
    await page.waitForURL(/\/sdk\/crewai\/get-started\/?/, { timeout: 15_000 });

    expect(page.url()).toMatch(/\/sdk\/crewai\/get-started\/?$/);
    expect(page.url()).not.toContain("?f=");
  });

  test("framework switcher navigates to Claude Agent SDK Python get-started", async ({
    page,
  }) => {
    await page.goto("/get-started/");
    await page.waitForSelector(".FrameworkSwitcher select", {
      timeout: 15_000,
    });

    await page.selectOption(".FrameworkSwitcher select", "claude-agent-sdk-py");
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

  test("framework switcher navigates to SDK route on guards quick start", async ({
    page,
  }) => {
    await page.goto("/guards/quick-start/");
    await page.waitForSelector(".FrameworkSwitcher select", {
      timeout: 15_000,
    });

    await page.selectOption(".FrameworkSwitcher select", "langchain");
    await page.waitForURL(/\/sdk\/langchain\/guards\/quick-start\/?/, {
      timeout: 15_000,
    });

    expect(page.url()).toMatch(/\/sdk\/langchain\/guards\/quick-start\/?$/);
    expect(page.url()).not.toContain("?f=");
  });

  test("framework switcher navigates to Claude Agent SDK Python guards quick start", async ({
    page,
  }) => {
    await page.goto("/guards/quick-start/");
    await page.waitForSelector(".FrameworkSwitcher select", {
      timeout: 15_000,
    });

    await page.selectOption(".FrameworkSwitcher select", "claude-agent-sdk-py");
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
});
