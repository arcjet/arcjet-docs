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
    command: "npm run dev",
    env: {
      // We need an Arcjet key for the dev server to run, but it doesn't
      // actually need to be valid for the tests to run.
      ARCJET_KEY: "ajkey_dummy",
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
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: [["html", { host: "0.0.0.0" }]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  workers: process.env.CI ? 8 : undefined,
  webServer,
});
