import { expect, test } from "@playwright/test";
import {
  docPathFromSdkPathname,
  hrefForLegacyFrameworkKey,
  isFrameworkSpecificEntry,
  isLegacyFrameworkHubPathname,
  isPlusVariantPathname,
  isRouteSdkKey,
  isSdkSwitcherOptionCurrent,
  legacyFrameworkVercelRedirects,
  LEGACY_F_DOC_PATHS,
  legacyKeyFromPathname,
  pathnameForLegacyFrameworkKey,
  pathnameForSdk,
  pathnameForSdkVariant,
  scopeHrefToCurrentSdk,
  scopeHrefToSdk,
  sdkDisplayLabelFromPathname,
  sdkFromPathname,
  sdkRoutePrefixFromLegacyFrameworkKey,
  sdkSwitcherOptionForLegacyKey,
  sdkSwitcherOptions,
  sdkVariantFromPathname,
  shouldExcludeFromSitemap,
  variantOnlySdkRedirectTarget,
  variantOnlySdkAstroRedirects,
} from "@/lib/sdk";
import {
  moveActiveIndex,
  typeaheadIndex,
} from "@/lib/sdk-switcher-keyboard";

test.describe("isRouteSdkKey", () => {
  test("accepts HTTP SDK keys and guard adapters", () => {
    expect(isRouteSdkKey("next")).toBe(true);
    expect(isRouteSdkKey("langchain")).toBe(true);
    expect(isRouteSdkKey("go")).toBe(false);
  });
});

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
    ["/sdk/langchain/guards/quick-start/", "langchain"],
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
    ["/sdk/langchain/guards/quick-start/", "langchain"],
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
    ["/sdk/langchain/guards/quick-start/", "LangChain"],
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

  test("routes variant-only SDKs to their default plus-variant", () => {
    expect(pathnameForSdk("/sdk/next/get-started/", "python")).toBe(
      "/sdk/python/plus/fastapi/get-started/",
    );
  });
});

test.describe("sdkSwitcherOptions", () => {
  test("lists Python variants instead of bare Python", () => {
    const labels = sdkSwitcherOptions("/sdk/next/get-started/").map(
      (option) => option.label,
    );
    expect(labels).toContain("Python + FastAPI");
    expect(labels).toContain("Python + Flask");
    expect(labels).not.toContain("Python");
  });

  test("includes base and variant entries for Node.js", () => {
    const labels = sdkSwitcherOptions("/sdk/next/get-started/").map(
      (option) => option.label,
    );
    expect(labels).toContain("Node.js");
    expect(labels).toContain("Node.js + Express");
    expect(labels).toContain("Node.js + Hono");
  });

  test("lists guard adapters on guard-scoped pages", () => {
    const options = sdkSwitcherOptions("/sdk/langchain/guards/quick-start/", [
      "langchain",
      "langchain-js",
      "claude-agent-sdk",
      "claude-agent-sdk-py",
    ]);
    const labels = options.map((option) => option.label);
    expect(labels).toEqual([
      "Claude Agent SDK",
      "Claude Agent SDK Python",
      "LangChain",
      "LangChain JS",
    ]);
    expect(
      options.find((option) => option.sdkKey === "langchain")?.href,
    ).toBe("/sdk/langchain/guards/quick-start/");
    expect(
      options.find((option) => option.sdkKey === "claude-agent-sdk-py")?.href,
    ).toBe("/sdk/claude-agent-sdk-py/guards/quick-start/");
    expect(labels).not.toContain("Next.js");
  });

  test("includes HTTP SDKs and guards on mixed get-started pages", () => {
    const fromNext = sdkSwitcherOptions("/sdk/next/get-started/", [
      "next-js",
      "crewai",
      "langchain",
      "claude-agent-sdk-py",
    ]);
    const fromNextLabels = fromNext.map((option) => option.label);
    expect(fromNextLabels).toContain("Next.js");
    expect(fromNextLabels).toContain("CrewAI");
    expect(fromNextLabels).toContain("LangChain");
    expect(fromNextLabels).toContain("Claude Agent SDK Python");
    expect(fromNext.find((option) => option.sdkKey === "crewai")?.href).toBe(
      "/sdk/crewai/get-started/",
    );
    expect(
      fromNext.find((option) => option.sdkKey === "claude-agent-sdk-py")?.href,
    ).toBe("/sdk/claude-agent-sdk-py/get-started/");

    const fromCrewai = sdkSwitcherOptions("/sdk/crewai/get-started/", [
      "next-js",
      "crewai",
      "langchain",
    ]);
    expect(fromCrewai.find((option) => option.sdkKey === "next")?.href).toBe(
      "/sdk/next/get-started/",
    );
  });

  test("sorts options alphabetically by label", () => {
    const guardLabels = sdkSwitcherOptions(
      "/sdk/langchain/guards/quick-start/",
      [
        "vercel-eve",
        "claude-agent-sdk",
        "claude-agent-sdk-py",
        "langchain-js",
        "crewai",
      ],
    ).map((option) => option.label);
    expect(guardLabels).toEqual([
      "Claude Agent SDK",
      "Claude Agent SDK Python",
      "CrewAI",
      "LangChain JS",
      "Vercel Eve",
    ]);

    const httpLabels = sdkSwitcherOptions("/sdk/next/get-started/").map(
      (option) => option.label,
    );
    expect(httpLabels).toEqual(
      [...httpLabels].sort((a, b) => a.localeCompare(b, "en")),
    );
  });

  test("builds SDK-scoped hrefs from hub pathnames", () => {
    const options = sdkSwitcherOptions("/get-started/", [
      "next-js",
      "crewai",
      "python-fastapi",
    ]);
    expect(options.find((option) => option.sdkKey === "next")?.href).toBe(
      "/sdk/next/get-started/",
    );
    expect(options.find((option) => option.sdkKey === "crewai")?.href).toBe(
      "/sdk/crewai/get-started/",
    );
    expect(
      options.find((option) => option.label === "Python + FastAPI")?.href,
    ).toBe("/sdk/python/plus/fastapi/get-started/");
    expect(options.map((option) => option.label)).toEqual(
      [...options.map((option) => option.label)].sort((a, b) =>
        a.localeCompare(b, "en"),
      ),
    );
  });

  test("lists only guard adapters on hub guard pages", () => {
    const options = sdkSwitcherOptions("/guards/quick-start/", [
      "langchain",
      "langchain-js",
      "claude-agent-sdk-py",
    ]);
    expect(options.map((option) => option.label)).toEqual([
      "Claude Agent SDK Python",
      "LangChain",
      "LangChain JS",
    ]);
    expect(
      options.find((option) => option.sdkKey === "langchain")?.href,
    ).toBe("/sdk/langchain/guards/quick-start/");
    expect(options.some((option) => option.sdkKey === "next")).toBe(false);
  });
});

test.describe("sdkSwitcherOptionForLegacyKey", () => {
  test("matches plus-variant and guard keys", () => {
    const options = sdkSwitcherOptions("/get-started/", [
      "next-js",
      "python-fastapi",
      "crewai",
    ]);
    expect(
      sdkSwitcherOptionForLegacyKey(options, "python-fastapi")?.label,
    ).toBe("Python + FastAPI");
    expect(sdkSwitcherOptionForLegacyKey(options, "crewai")?.sdkKey).toBe(
      "crewai",
    );
  });
});

test.describe("isSdkSwitcherOptionCurrent", () => {
  test("matches plus-variant paths", () => {
    const options = sdkSwitcherOptions("/sdk/python/plus/fastapi/get-started/");
    const fastapi = options.find((option) => option.label === "Python + FastAPI");
    expect(fastapi).toBeDefined();
    expect(
      isSdkSwitcherOptionCurrent(
        "/sdk/python/plus/fastapi/get-started/",
        fastapi!,
      ),
    ).toBe(true);
  });
});

test.describe("variantOnlySdkRedirectTarget", () => {
  test("redirects bare Python SDK paths to FastAPI", () => {
    expect(variantOnlySdkRedirectTarget("/sdk/python/get-started/")).toBe(
      "/sdk/python/plus/fastapi/get-started/",
    );
  });

  test("leaves plus-variant Python paths unchanged", () => {
    expect(
      variantOnlySdkRedirectTarget("/sdk/python/plus/flask/get-started/"),
    ).toBeUndefined();
  });

  test("leaves SDKs with base legacy keys unchanged", () => {
    expect(variantOnlySdkRedirectTarget("/sdk/next/get-started/")).toBeUndefined();
  });
});

test.describe("variantOnlySdkAstroRedirects", () => {
  test("redirects bare Python SDK paths to FastAPI", () => {
    const redirects = variantOnlySdkAstroRedirects();
    expect(redirects["/sdk/python/get-started"]).toBe(
      "/sdk/python/plus/fastapi/get-started",
    );
    expect(redirects["/sdk/python/get-started/"]).toBe(
      "/sdk/python/plus/fastapi/get-started/",
    );
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

  test("maps guard frameworks on get-started to SDK get-started routes", () => {
    expect(pathnameForLegacyFrameworkKey("crewai", "/get-started")).toBe(
      "/sdk/crewai/get-started/",
    );
    expect(pathnameForLegacyFrameworkKey("tanstack-ai", "/get-started")).toBe(
      "/sdk/tanstack-ai/get-started/",
    );
    expect(pathnameForLegacyFrameworkKey("google-adk", "/get-started")).toBe(
      "/sdk/google-adk/get-started/",
    );
    expect(
      pathnameForLegacyFrameworkKey("strands-agents-py", "/get-started"),
    ).toBe("/sdk/strands-agents-py/get-started/");
  });

  test("maps Claude Agent SDK Python get-started to the SDK get-started route", () => {
    expect(
      pathnameForLegacyFrameworkKey("claude-agent-sdk-py", "/get-started"),
    ).toBe("/sdk/claude-agent-sdk-py/get-started/");
  });

  test("maps guard frameworks on the agent guards quick start to SDK routes", () => {
    expect(
      pathnameForLegacyFrameworkKey("langchain", "/guards/quick-start"),
    ).toBe("/sdk/langchain/guards/quick-start/");
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

  test("uses SDK routes for guard frameworks on the agent guards quick start", () => {
    expect(
      hrefForLegacyFrameworkKey("langchain", "/guards/quick-start/"),
    ).toBe("/sdk/langchain/guards/quick-start/");
  });

  test("uses SDK get-started routes for guard frameworks", () => {
    expect(hrefForLegacyFrameworkKey("crewai", "/get-started/")).toBe(
      "/sdk/crewai/get-started/",
    );
  });
});

test.describe("scopeHrefToSdk", () => {
  test("uses SDK routes on non-SDK pages", () => {
    expect(scopeHrefToSdk("/reference/nodejs", "/get-started", "node")).toBe(
      "/sdk/node/get-started/",
    );
  });

  test("uses plus-variant routes for Python", () => {
    expect(scopeHrefToSdk("/reference/nodejs", "/get-started", "python")).toBe(
      "/sdk/python/plus/fastapi/get-started/",
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

  test("redirects guard get-started URLs to SDK get-started routes", () => {
    const redirects = legacyFrameworkVercelRedirects();
    const match = redirects.find(
      (r) =>
        r.source === "/get-started" &&
        r.has[0]?.value === "crewai" &&
        r.destination === "/sdk/crewai/get-started/",
    );
    expect(match).toBeDefined();
  });

  test("redirects Claude Agent SDK Python get-started to the SDK get-started route", () => {
    const redirects = legacyFrameworkVercelRedirects();
    const match = redirects.find(
      (r) =>
        r.source === "/get-started" &&
        r.has[0]?.value === "claude-agent-sdk-py" &&
        r.destination === "/sdk/claude-agent-sdk-py/get-started/",
    );
    expect(match).toBeDefined();
  });

  test("redirects Google ADK and Strands Agents Python get-started to SDK routes", () => {
    const redirects = legacyFrameworkVercelRedirects();
    expect(
      redirects.find(
        (r) =>
          r.source === "/get-started" &&
          r.has[0]?.value === "google-adk" &&
          r.destination === "/sdk/google-adk/get-started/",
      ),
    ).toBeDefined();
    expect(
      redirects.find(
        (r) =>
          r.source === "/get-started" &&
          r.has[0]?.value === "strands-agents-py" &&
          r.destination === "/sdk/strands-agents-py/get-started/",
      ),
    ).toBeDefined();
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

  test("does not redirect guard frameworks on HTTP-only pages", () => {
    const redirects = legacyFrameworkVercelRedirects();
    expect(
      redirects.some(
        (r) =>
          r.source === "/rate-limiting/quick-start" &&
          r.has[0]?.value === "crewai",
      ),
    ).toBe(false);
  });

  test("redirects legacy guards quick-start URLs to SDK routes", () => {
    const redirects = legacyFrameworkVercelRedirects();
    const match = redirects.find(
      (r) =>
        r.source === "/guards/quick-start" &&
        r.has[0]?.value === "langchain" &&
        r.destination === "/sdk/langchain/guards/quick-start/",
    );
    expect(match).toBeDefined();
  });

  test("redirects Claude Agent SDK Python guards quick-start URLs", () => {
    const redirects = legacyFrameworkVercelRedirects();
    const match = redirects.find(
      (r) =>
        r.source === "/guards/quick-start" &&
        r.has[0]?.value === "claude-agent-sdk-py" &&
        r.destination === "/sdk/claude-agent-sdk-py/guards/quick-start/",
    );
    expect(match).toBeDefined();
  });

  test("redirects Google ADK and Strands Agents Python guards quick-start URLs", () => {
    const redirects = legacyFrameworkVercelRedirects();
    expect(
      redirects.find(
        (r) =>
          r.source === "/guards/quick-start" &&
          r.has[0]?.value === "google-adk" &&
          r.destination === "/sdk/google-adk/guards/quick-start/",
      ),
    ).toBeDefined();
    expect(
      redirects.find(
        (r) =>
          r.source === "/guards/quick-start" &&
          r.has[0]?.value === "strands-agents-py" &&
          r.destination === "/sdk/strands-agents-py/guards/quick-start/",
      ),
    ).toBeDefined();
  });

  for (const docPath of [
    "/filters/reference",
    "/rate-limiting/reference",
    "/nosecone/quick-start",
    "/sensitive-info/quick-start",
    "/sensitive-info/reference",
  ] as const) {
    test(`redirects ${docPath}?f=next-js to the SDK route`, () => {
      const redirects = legacyFrameworkVercelRedirects();
      const source = docPath.replace(/\/$/, "") || "/";
      const destination = pathnameForLegacyFrameworkKey("next-js", docPath);
      const match = redirects.find(
        (r) =>
          r.source === source &&
          r.has[0]?.value === "next-js" &&
          r.destination === destination,
      );
      expect(match).toBeDefined();
    });
  }

  test("covers every legacy ?f= doc path", () => {
    expect(LEGACY_F_DOC_PATHS.length).toBeGreaterThanOrEqual(16);
  });
});

test.describe("shouldExcludeFromSitemap", () => {
  test("excludes plus-variant SDK routes", () => {
    expect(
      shouldExcludeFromSitemap("/sdk/bun/plus/hono/get-started/"),
    ).toBe(true);
    expect(shouldExcludeFromSitemap("/sdk/next/get-started/")).toBe(false);
  });

  test("excludes legacy framework hub routes", () => {
    expect(isLegacyFrameworkHubPathname("/get-started/")).toBe(true);
    expect(isLegacyFrameworkHubPathname("/sdk/next/get-started/")).toBe(false);
    expect(shouldExcludeFromSitemap("/bot-protection/quick-start/")).toBe(true);
    expect(shouldExcludeFromSitemap("/guards/quick-start/")).toBe(true);
    expect(shouldExcludeFromSitemap("/sdk/langchain/guards/quick-start/")).toBe(
      false,
    );
  });

  test("detects plus-variant pathnames", () => {
    expect(isPlusVariantPathname("/sdk/node/plus/express/get-started/")).toBe(
      true,
    );
    expect(isPlusVariantPathname("/sdk/node/get-started/")).toBe(false);
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

test.describe("sdk switcher keyboard helpers", () => {
  test("moveActiveIndex does not wrap", () => {
    expect(moveActiveIndex(5, 0, -1)).toBe(0);
    expect(moveActiveIndex(5, 4, 1)).toBe(4);
    expect(moveActiveIndex(5, 2, 10)).toBe(4);
    expect(moveActiveIndex(5, 2, 1)).toBe(3);
  });

  test("typeaheadIndex matches prefixes and cycles repeated letters", () => {
    const labels = ["Astro", "Bun", "NestJS", "Next.js", "Node.js"];
    expect(typeaheadIndex(labels, 0, "n")).toBe(2);
    expect(typeaheadIndex(labels, 2, "ne")).toBe(2);
    expect(typeaheadIndex(labels, 2, "nex")).toBe(3);
    expect(typeaheadIndex(labels, 2, "nn")).toBe(3);
    expect(typeaheadIndex(labels, 3, "nn")).toBe(4);
    expect(typeaheadIndex(labels, 4, "nn")).toBe(2);
  });
});
