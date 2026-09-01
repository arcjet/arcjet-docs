import { expect, test } from "@playwright/test";
import { REO_CLIENT_ID, REO_SCRIPT_SRC } from "../src/lib/reo";

type HubSpotConsent = {
  categories?: {
    advertisement?: boolean;
    analytics?: boolean;
  };
};

type TestWindow = Window & {
  _hsp?: Array<
    ["addPrivacyConsentListener", (consent: HubSpotConsent) => void]
  >;
  __reoInitConfig?: { clientID: string };
};

test("Reo loads and initializes only after analytics consent", async ({
  page,
}) => {
  let reoScriptRequests = 0;

  await page.route(/https?:\/\/js\.hs-scripts\.com\//, (route) =>
    route.abort(),
  );
  await page.route(REO_SCRIPT_SRC, async (route) => {
    reoScriptRequests += 1;
    await route.fulfill({
      body: `window.Reo = { init(config) { window.__reoInitConfig = config; } };`,
      contentType: "text/javascript",
    });
  });

  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          ((window as TestWindow)._hsp ?? []).filter(
            ([command, listener]) =>
              command === "addPrivacyConsentListener" &&
              typeof listener === "function",
          ).length,
      ),
    )
    .toBeGreaterThanOrEqual(1);

  expect(reoScriptRequests).toBe(0);
  await expect(page.locator("#reo-script")).toHaveCount(0);

  await page.evaluate(() => {
    for (const [command, listener] of (window as TestWindow)._hsp ?? []) {
      if (
        command === "addPrivacyConsentListener" &&
        typeof listener === "function"
      ) {
        listener({ categories: { advertisement: true, analytics: false } });
      }
    }
  });

  expect(reoScriptRequests).toBe(0);
  await expect(page.locator("#reo-script")).toHaveCount(0);

  await page.evaluate(() => {
    for (const [command, listener] of (window as TestWindow)._hsp ?? []) {
      if (
        command === "addPrivacyConsentListener" &&
        typeof listener === "function"
      ) {
        listener({ categories: { analytics: true } });
      }
    }
  });

  await expect(page.locator("#reo-script")).toHaveAttribute(
    "src",
    REO_SCRIPT_SRC,
  );
  await expect
    .poll(() =>
      page.evaluate(() => (window as TestWindow).__reoInitConfig ?? null),
    )
    .toEqual({ clientID: REO_CLIENT_ID });
  expect(reoScriptRequests).toBe(1);
});
