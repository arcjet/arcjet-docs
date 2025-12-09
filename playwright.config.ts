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
  workers: process.env.CI ? 1 : undefined,
  webServer,
});
