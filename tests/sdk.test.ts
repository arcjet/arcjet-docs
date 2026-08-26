import { expect, test } from "@playwright/test";
import {
  legacyKeyFromPathname,
  pathnameForSdk,
  pathnameForSdkVariant,
  scopeHrefToCurrentSdk,
  sdkDisplayLabelFromPathname,
  sdkFromPathname,
  sdkVariantFromPathname,
} from "@/lib/sdk";

test.describe("sdkFromPathname", () => {
  const cases: [string, string | undefined][] = [
    ["/sdk/next/get-started/", "next"],
    ["/sdk/bun/plus/hono/get-started/", "bun"],
    ["/sdk/python/plus/fastapi/get-started/", "python"],
    ["/get-started/", undefined],
    ["/sdk/go/get-started/", undefined],
  ];

  for (const [pathname, expected] of cases) {
    test(`${pathname} → ${expected}`, () => {
      expect(sdkFromPathname(pathname)).toBe(expected);
    });
  }
});

test.describe("sdkVariantFromPathname", () => {
  test("resolves bun + hono", () => {
    const variant = sdkVariantFromPathname("/sdk/bun/plus/hono/get-started/");
    expect(variant?.key).toBe("hono");
    expect(variant?.legacyFrameworkKey).toBe("bun-hono");
  });

  test("returns undefined for plain SDK routes", () => {
    expect(sdkVariantFromPathname("/sdk/bun/get-started/")).toBeUndefined();
  });
});

test.describe("legacyKeyFromPathname", () => {
  const cases: [string, string | undefined][] = [
    ["/sdk/next/get-started/", "next-js"],
    ["/sdk/bun/plus/hono/get-started/", "bun-hono"],
    ["/sdk/node/plus/express/get-started/", "node-js-express"],
    ["/sdk/python/plus/flask/get-started/", "python-flask"],
  ];

  for (const [pathname, expected] of cases) {
    test(`${pathname} → ${expected}`, () => {
      expect(legacyKeyFromPathname(pathname)).toBe(expected);
    });
  }
});

test.describe("sdkDisplayLabelFromPathname", () => {
  const cases: [string, string | undefined][] = [
    ["/sdk/next/get-started/", "Next.js"],
    ["/sdk/bun/plus/hono/get-started/", "Bun + Hono"],
    ["/sdk/node/plus/express/get-started/", "Node.js + Express"],
    ["/sdk/python/plus/fastapi/get-started/", "Python + FastAPI"],
  ];

  for (const [pathname, expected] of cases) {
    test(`${pathname} → ${expected}`, () => {
      expect(sdkDisplayLabelFromPathname(pathname)).toBe(expected);
    });
  }
});

test.describe("pathnameForSdk", () => {
  test("strips plus-variant segments when switching SDKs", () => {
    expect(
      pathnameForSdk("/sdk/bun/plus/hono/rate-limiting/quick-start/", "next"),
    ).toBe("/sdk/next/rate-limiting/quick-start/");
  });
});

test.describe("pathnameForSdkVariant", () => {
  test("injects a plus-variant segment", () => {
    expect(pathnameForSdkVariant("/sdk/bun/get-started/", "bun", "hono")).toBe(
      "/sdk/bun/plus/hono/get-started/",
    );
  });
});

test.describe("scopeHrefToCurrentSdk", () => {
  test("preserves plus-variant prefixes", () => {
    expect(
      scopeHrefToCurrentSdk(
        "/sdk/bun/plus/hono/get-started/",
        "/rate-limiting/quick-start/",
      ),
    ).toBe("/sdk/bun/plus/hono/rate-limiting/quick-start/");
  });
});
