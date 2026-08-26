import { expect, test } from "@playwright/test";
import {
  docPathFromSdkPathname,
  hrefForLegacyFrameworkKey,
  legacyFrameworkQueryRedirect,
  legacyKeyFromPathname,
  pathnameForLegacyFrameworkKey,
  pathnameForSdk,
  pathnameForSdkVariant,
  scopeHrefToCurrentSdk,
  scopeHrefToSdk,
  sdkDisplayLabelFromPathname,
  sdkFromPathname,
  sdkRoutePrefixFromLegacyFrameworkKey,
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

test.describe("pathnameForLegacyFrameworkKey", () => {
  test("maps HTTP SDKs to /sdk routes", () => {
    expect(pathnameForLegacyFrameworkKey("next-js", "/get-started")).toBe(
      "/sdk/next/get-started/",
    );
    expect(pathnameForLegacyFrameworkKey("bun-hono", "/get-started")).toBe(
      "/sdk/bun/plus/hono/get-started/",
    );
  });

  test("maps guard frameworks on get-started to guard docs", () => {
    expect(pathnameForLegacyFrameworkKey("crewai", "/get-started")).toBe(
      "/guards/crewai/",
    );
  });

  test("strips existing SDK prefixes from href", () => {
    expect(
      pathnameForLegacyFrameworkKey("next-js", "/sdk/bun/get-started/"),
    ).toBe("/sdk/next/get-started/");
  });
});

test.describe("hrefForLegacyFrameworkKey", () => {
  test("uses SDK routes for HTTP SDKs", () => {
    expect(hrefForLegacyFrameworkKey("next-js", "/get-started")).toBe(
      "/sdk/next/get-started/",
    );
  });

  test("falls back to ?f= for guard frameworks on non-get-started pages", () => {
    expect(
      hrefForLegacyFrameworkKey("crewai", "/rate-limiting/quick-start/"),
    ).toBe("/rate-limiting/quick-start?f=crewai");
  });
});

test.describe("scopeHrefToSdk", () => {
  test("uses SDK routes on non-SDK pages", () => {
    expect(scopeHrefToSdk("/reference/nodejs", "/get-started", "node")).toBe(
      "/sdk/node/get-started/",
    );
  });
});

test.describe("legacyFrameworkQueryRedirect", () => {
  test("redirects legacy get-started URLs to SDK routes", () => {
    const url = new URL("https://docs.arcjet.com/get-started?f=next-js");
    expect(legacyFrameworkQueryRedirect(url, "next-js")).toBe(
      "https://docs.arcjet.com/sdk/next/get-started/",
    );
  });

  test("strips ?f= on SDK routes", () => {
    const url = new URL(
      "https://docs.arcjet.com/sdk/next/get-started/?f=next-js",
    );
    expect(legacyFrameworkQueryRedirect(url, "next-js")).toBe(
      "https://docs.arcjet.com/sdk/next/get-started/",
    );
  });

  test("preserves ?f= for guard frameworks on other pages", () => {
    const url = new URL(
      "https://docs.arcjet.com/rate-limiting/quick-start?f=crewai",
    );
    expect(legacyFrameworkQueryRedirect(url, "crewai")).toBeNull();
  });
});

test.describe("sdkRoutePrefixFromLegacyFrameworkKey", () => {
  test("resolves plus variants", () => {
    expect(sdkRoutePrefixFromLegacyFrameworkKey("node-js-express")).toBe(
      "/sdk/node/plus/express",
    );
  });
});

test.describe("docPathFromSdkPathname", () => {
  test("strips SDK and plus-variant prefixes", () => {
    expect(docPathFromSdkPathname("/sdk/bun/plus/hono/get-started/")).toBe(
      "/get-started/",
    );
  });
});
