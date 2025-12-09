import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";

let baseURL: string | undefined = process.env.PLAYWRIGHT_BASE_URL;
let webServer: PlaywrightTestConfig["webServer"] = undefined;

if (!baseURL) {
  baseURL = "http://localhost:4321";
  webServer = {
    command:
      "npm run astro build && npm run astro -- preview --port 4321 --host 0.0.0.0",
    env: {
      // We need an Arcjet key for the dev server to run, but it doesn't
      // actually need to be valid for the tests to run.
      ARCJET_KEY: "ajkey_dummy",
      // See astro.config.mts for context.
      ASTRO_FORCE_NODE_ADAPTER: "1",
    },
    port: 4321,
    reuseExistingServer: !process.env.CI,
  };
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  forbidOnly: !!process.env.CI,
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
