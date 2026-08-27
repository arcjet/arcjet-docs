import { expect, test } from "@playwright/test";
import {
  docPathFromSdkPathname,
  hrefForLegacyFrameworkKey,
  isFrameworkSpecificEntry,
  legacyFrameworkVercelRedirects,
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

test.describe("isFrameworkSpecificEntry", () => {
  test("matches entries with frameworks frontmatter", () => {
    expect(
      isFrameworkSpecificEntry({ frameworks: ["next-js", "node-js"] }),
    ).toBe(true);
  });

  test("matches entries with titleByFramework frontmatter", () => {
    expect(
      isFrameworkSpecificEntry({
        titleByFramework: { "next-js": "Next.js guide" },
      }),
    ).toBe(true);
  });

  test("skips framework-agnostic entries", () => {
    expect(isFrameworkSpecificEntry({})).toBe(false);
  });
});

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

test.describe("legacyFrameworkVercelRedirects", () => {
  test("redirects legacy get-started URLs to SDK routes", () => {
    const redirects = legacyFrameworkVercelRedirects();
    const match = redirects.find(
      (r) =>
        r.source === "/get-started" &&
        r.has[0]?.value === "next-js" &&
        r.destination === "/sdk/next/get-started/",
    );
    expect(match).toBeDefined();
  });

  test("redirects guard get-started URLs to guard docs", () => {
    const redirects = legacyFrameworkVercelRedirects();
    const match = redirects.find(
      (r) =>
        r.source === "/get-started" &&
        r.has[0]?.value === "crewai" &&
        r.destination === "/guards/crewai/",
    );
    expect(match).toBeDefined();
  });

  test("strips ?f= from SDK routes", () => {
    const redirects = legacyFrameworkVercelRedirects();
    expect(
      redirects.some(
        (r) =>
          r.source === "/sdk/:path*" &&
          r.has[0]?.key === "f" &&
          !r.has[0]?.value,
      ),
    ).toBe(true);
  });

  test("does not redirect guard frameworks on other pages", () => {
    const redirects = legacyFrameworkVercelRedirects();
    expect(
      redirects.some(
        (r) =>
          r.source === "/rate-limiting/quick-start" &&
          r.has[0]?.value === "crewai",
      ),
    ).toBe(false);
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
