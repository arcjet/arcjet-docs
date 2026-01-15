import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";

const IS_CI = !!process.env.CI;

let baseURL: string | undefined = process.env.PLAYWRIGHT_BASE_URL;
let webServer: PlaywrightTestConfig["webServer"] = undefined;

if (!baseURL) {
  let command =
    "npm run astro build && npm run astro -- preview --port 4321 --host 0.0.0.0";
  if (IS_CI) {
    // In CI we do a full build in a previous step, so we can skip that here.
    command = "npm run astro -- preview --port 4321 --host 0.0.0.0";
  }

  baseURL = "http://localhost:4321";
  webServer = {
    command,
    env: {
      // We need an Arcjet key for the dev server to run, but it doesn't
      // actually need to be valid for the tests to run.
      ARCJET_KEY: "ajkey_dummy",
      // See astro.config.mts for context.
      ASTRO_FORCE_NODE_ADAPTER: "1",
    },
    port: 4321,
    reuseExistingServer: !IS_CI,
    // We have a lot of pages so builds can take a while.
    timeout: 5 * 60 * 1000, // 5m
  };
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  forbidOnly: !!IS_CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--font-render-hinting=none",
            "--disable-lcd-text",
            "--disable-font-subpixel-positioning",
          ],
        },
      },
    },
  ],
  reporter: [["html", { host: "0.0.0.0" }]],
  retries: process.env.CI ? 1 : 0,
  testDir: "./tests",
  use: {
    baseURL,
    headless: true,
    trace: "on-first-retry",
  },
  workers: process.env.CI ? 2 : undefined,
  webServer,
});
