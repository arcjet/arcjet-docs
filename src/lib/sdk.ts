import type { FrameworkKey } from "@/lib/prefs";

/**
 * Keys for all of the valid Arcjet SDKs.
 *
 * These values should correspond as directly as possible to our SDK names to
 * avoid confusion. For example use `node` because the SDK is `@arcjet/node`.
 */
export type ArcjetSdkKey =
  | "astro"
  | "bun"
  | "deno"
  | "fastify"
  | "nest"
  | "next"
  | "node"
  | "nuxt"
  | "python"
  | "react-router"
  | "remix"
  | "sveltekit";

export type ArcjetSdkVariantKey = "express" | "fastapi" | "flask" | "hono";

/**
 * A sub-variant of an SDK that uses the same Arcjet SDK package but
 * pairs it with a different framework (e.g. Bun + Hono, Node.js + Express).
 */
export type ArcjetSdkVariant = {
  /** URL-safe key used in `/sdk/:sdk/plus/:variant/` paths (`[a-z-]+`) */
  readonly key: ArcjetSdkVariantKey;
  /** Human readable label */
  readonly label: string;
  /** Maps to a legacy FrameworkKey for slot resolution */
  readonly legacyFrameworkKey: FrameworkKey;
};

/**
 * Sub-variants for SDKs that support multiple framework pairings.
 */
const SDK_VARIANTS: Partial<Record<ArcjetSdkKey, readonly ArcjetSdkVariant[]>> =
  {
    bun: [{ key: "hono", label: "Hono", legacyFrameworkKey: "bun-hono" }],
    node: [
      {
        key: "express",
        label: "Express",
        legacyFrameworkKey: "node-js-express",
      },
      { key: "hono", label: "Hono", legacyFrameworkKey: "node-js-hono" },
    ],
    python: [
      {
        key: "fastapi",
        label: "FastAPI",
        legacyFrameworkKey: "python-fastapi",
      },
      { key: "flask", label: "Flask", legacyFrameworkKey: "python-flask" },
    ],
  } as const;

/**
 * Returns the sub-variants for a given SDK, or an empty array if none.
 */
export function sdkVariants(sdkKey: ArcjetSdkKey): readonly ArcjetSdkVariant[] {
  return SDK_VARIANTS[sdkKey] ?? [];
}

/**
 * Returns all SDKs that have sub-variants.
 */
export function sdksWithVariants(): [
  ArcjetSdkKey,
  readonly ArcjetSdkVariant[],
][] {
  // Object.entries widens keys to `string`; narrow back to ArcjetSdkKey.
  return Object.entries(SDK_VARIANTS) as [
    ArcjetSdkKey,
    readonly ArcjetSdkVariant[],
  ][];
}

/**
 * Documentation configuration object for an Arcjet SDK
 */
type ArcjetSdk<TKey extends ArcjetSdkKey = ArcjetSdkKey> = {
  /**
   * Unique key of the SDK.
   */
  readonly key: TKey;
  /**
   * Maps to a legacy framework as defined in @/lib/prefs
   * @deprecated
   */
  readonly legacyFrameworkKey: FrameworkKey | null;
  /**
   * Human readable name of the SDK
   */
  readonly label: string;
};

/**
 * Exhaustive SDK configuration source of truth
 */
const ARCJET_SDKS = {
  astro: {
    key: "astro",
    label: "Astro",
    legacyFrameworkKey: "astro",
  },
  bun: {
    key: "bun",
    label: "Bun",
    legacyFrameworkKey: "bun",
  },
  deno: {
    key: "deno",
    label: "Deno",
    legacyFrameworkKey: "deno",
  },
  fastify: {
    key: "fastify",
    label: "Fastify",
    legacyFrameworkKey: "fastify",
  },
  nest: {
    key: "nest",
    label: "NestJS",
    legacyFrameworkKey: "nest-js",
  },
  next: {
    key: "next",
    label: "Next.js",
    legacyFrameworkKey: "next-js",
  },
  node: {
    key: "node",
    label: "Node.js",
    legacyFrameworkKey: "node-js",
  },
  nuxt: {
    key: "nuxt",
    label: "Nuxt",
    legacyFrameworkKey: "nuxt",
  },
  python: {
    key: "python",
    label: "Python",
    legacyFrameworkKey: null,
  },
  "react-router": {
    key: "react-router",
    label: "React Router",
    legacyFrameworkKey: "react-router",
  },
  remix: {
    key: "remix",
    label: "Remix",
    legacyFrameworkKey: "remix",
  },
  sveltekit: {
    key: "sveltekit",
    label: "SvelteKit",
    legacyFrameworkKey: "sveltekit",
  },
} as const satisfies { [TKey in ArcjetSdkKey]: ArcjetSdk<TKey> };

/**
 * Returns a generator that iterates through SDK configurations.
 */
export function* sdks(): Generator<ArcjetSdk> {
  for (const entry of Object.values(ARCJET_SDKS)) {
    yield entry;
  }
}

/**
 * Returns the SDK configuration for the given key.
 */
export function sdk<TKey extends ArcjetSdkKey>(key: TKey): ArcjetSdk<TKey> {
  // Intentionally downcast so caller knows the literal key but doesn't get the
  // entire literal definition. This hopefully avoids accidentally narrowing on
  // non-key properties.
  return ARCJET_SDKS[key] as ArcjetSdk<TKey>;
}

/**
 * Asserts whether the given value is a valid Arcjet SDK key.
 */
export function isSdkKey(value: string): value is ArcjetSdkKey {
  return Object.keys(ARCJET_SDKS).includes(value);
}

const SDK_PATH_REGEX = /^\/sdk\/([a-z-]+)/;
const SDK_PLUS_PATH_REGEX = /^\/sdk\/([a-z-]+)\/plus\/([a-z-]+)/;

/**
 * Extracts an Arcjet SDK variant key from a `/sdk/:sdk/plus/:variant/` pathname.
 * Returns `undefined` if the path is not a plus-variant route.
 */
export function sdkVariantFromPathname(
  pathname: string,
): ArcjetSdkVariant | undefined {
  if (typeof pathname !== "string") return undefined;

  const match = pathname.match(SDK_PLUS_PATH_REGEX);
  if (!match) return undefined;

  const sdkKey = match[1];
  const variantKey = match[2];

  if (!isSdkKey(sdkKey)) return undefined;

  const variants = SDK_VARIANTS[sdkKey];
  return variants?.find((v) => v.key === variantKey);
}

/**
 * Resolves the legacy FrameworkKey for the current SDK-scoped pathname.
 *
 * For plus-variant paths like `/sdk/bun/plus/hono/...`, returns the variant's
 * legacy key (e.g. `"bun-hono"`). For plain SDK paths like `/sdk/next/...`,
 * returns the SDK's legacy key (e.g. `"next-js"`).
 */
export function legacyKeyFromPathname(
  pathname: string,
): FrameworkKey | undefined {
  const variant = sdkVariantFromPathname(pathname);
  if (variant) return variant.legacyFrameworkKey;

  const sdkKey = sdkFromPathname(pathname);
  if (!sdkKey) return undefined;

  return ARCJET_SDKS[sdkKey].legacyFrameworkKey ?? undefined;
}

/**
 * Extracts an Arcjet SDK key from a given pathname, if possible.
 */
export function sdkFromPathname(pathname: string): ArcjetSdkKey | undefined {
  // Some of our callers from mdx / astro files don't have the _best_ static
  // type checking support, so we defensively check the type here.
  if (typeof pathname !== "string") {
    return undefined;
  }

  const sdkMatch = pathname.match(SDK_PATH_REGEX);

  // Unscoped - do nothing
  if (!sdkMatch) {
    return undefined;
  }

  const sdk = sdkMatch[1];
  if (!isSdkKey(sdk)) {
    return undefined;
  }

  return sdk;
}

/**
 * Returns a pathname scoped to the given SDK.
 *
 * If the current path is a plus-variant route (e.g. `/sdk/bun/plus/hono/foo`),
 * the variant segment is stripped when switching to a different SDK because
 * variants are SDK-specific.
 *
 * SDKs without a base legacy framework key (currently Python) redirect to
 * their first plus-variant instead of a bare `/sdk/:sdk/` path.
 */
export function pathnameForSdk(
  pathname: string,
  targetSdk: ArcjetSdkKey,
): string {
  const previousSdk = sdkFromPathname(pathname);

  if (!previousSdk) {
    throw new Error(
      `@/lib/sdk:pathnameForSdk only supports SDK scoped pathnames.`,
    );
  }

  // Strip any /plus/:variant/ segment since variants are SDK-specific
  const plusVariant = sdkVariantFromPathname(pathname);
  let cleanPathname = pathname;
  if (plusVariant) {
    cleanPathname = pathname.replace(`/plus/${plusVariant.key}`, "");
  }

  let result = cleanPathname.replace(`/sdk/${previousSdk}`, `/sdk/${targetSdk}`);

  if (!ARCJET_SDKS[targetSdk].legacyFrameworkKey) {
    const defaultVariant = sdkVariants(targetSdk)[0];
    if (defaultVariant) {
      return pathnameForSdkVariant(result, targetSdk, defaultVariant.key);
    }
  }

  return result;
}

/**
 * Returns a pathname scoped to a specific SDK variant.
 *
 * @example
 * pathnameForSdkVariant("/sdk/bun/get-started", "bun", "hono")
 * // => "/sdk/bun/plus/hono/get-started"
 */
export function pathnameForSdkVariant(
  pathname: string,
  sdkKey: ArcjetSdkKey,
  variantKey: string,
): string {
  const previousSdk = sdkFromPathname(pathname);

  if (!previousSdk) {
    throw new Error(
      `@/lib/sdk:pathnameForSdkVariant only supports SDK scoped pathnames.`,
    );
  }

  // Strip any existing /plus/:variant/ segment
  const existingVariant = sdkVariantFromPathname(pathname);
  let cleanPathname = pathname;
  if (existingVariant) {
    cleanPathname = pathname.replace(`/plus/${existingVariant.key}`, "");
  }

  // Replace SDK and inject variant
  return cleanPathname.replace(
    `/sdk/${previousSdk}`,
    `/sdk/${sdkKey}/plus/${variantKey}`,
  );
}

export function sdkDisplayLabelFromPathname(
  pathname: string,
): string | undefined {
  const sdkKey = sdkFromPathname(pathname);
  if (!sdkKey) return undefined;

  const variant = sdkVariantFromPathname(pathname);
  const sdkConfig = sdk(sdkKey);

  if (variant) {
    return `${sdkConfig.label} + ${variant.label}`;
  }

  return sdkConfig.label;
}

/** One entry in the SDK switcher menu (base SDK or plus-variant). */
export type SdkSwitcherOption = {
  id: string;
  label: string;
  href: string;
  sdkKey: ArcjetSdkKey;
  variantKey?: ArcjetSdkVariantKey;
};

/**
 * Returns SDK switcher menu options for the current pathname.
 *
 * SDKs with a base legacy framework key appear once (e.g. Next.js). SDKs that
 * only ship plus-variants (Python) list each variant instead of a bare SDK row.
 * SDKs with optional variants (Node.js, Bun) list both the base SDK and variants.
 */
export function sdkSwitcherOptions(pathname: string): readonly SdkSwitcherOption[] {
  const options: SdkSwitcherOption[] = [];

  for (const sdkItem of sdks()) {
    const variants = sdkVariants(sdkItem.key);

    if (sdkItem.legacyFrameworkKey) {
      options.push({
        id: sdkItem.key,
        label: sdkItem.label,
        href: pathnameForSdk(pathname, sdkItem.key),
        sdkKey: sdkItem.key,
      });
    }

    for (const variant of variants) {
      options.push({
        id: `${sdkItem.key}+${variant.key}`,
        label: `${sdkItem.label} + ${variant.label}`,
        href: pathnameForSdkVariant(pathname, sdkItem.key, variant.key),
        sdkKey: sdkItem.key,
        variantKey: variant.key,
      });
    }
  }

  return options;
}

/** Returns whether a switcher option matches the current SDK-scoped pathname. */
export function isSdkSwitcherOptionCurrent(
  pathname: string,
  option: SdkSwitcherOption,
): boolean {
  const activeSdk = sdkFromPathname(pathname);
  if (!activeSdk || activeSdk !== option.sdkKey) {
    return false;
  }

  const activeVariant = sdkVariantFromPathname(pathname);
  if (option.variantKey) {
    return activeVariant?.key === option.variantKey;
  }

  return activeVariant === undefined;
}

/**
 * Returns a redirect target when `pathname` is a bare SDK route for an SDK
 * that requires a plus-variant (e.g. `/sdk/python/get-started/`).
 */
export function variantOnlySdkRedirectTarget(pathname: string): string | undefined {
  const sdkKey = sdkFromPathname(pathname);
  if (!sdkKey || sdkVariantFromPathname(pathname)) {
    return undefined;
  }

  if (ARCJET_SDKS[sdkKey].legacyFrameworkKey) {
    return undefined;
  }

  const defaultVariant = sdkVariants(sdkKey)[0];
  if (!defaultVariant) {
    return undefined;
  }

  const prefix = `/sdk/${sdkKey}`;
  const suffix =
    pathname.length > prefix.length ? pathname.slice(prefix.length) : "";

  return `${prefix}/plus/${defaultVariant.key}${suffix}`;
}

/**
 * Static Astro redirects for SDKs that require a plus-variant.
 *
 * Needed because prerendered pages are served as static files in preview and
 * production, so middleware never runs for missing bare SDK routes.
 */
export function variantOnlySdkAstroRedirects(): Record<string, string> {
  const redirects: Record<string, string> = {};

  for (const sdkConfig of Object.values(ARCJET_SDKS)) {
    if (sdkConfig.legacyFrameworkKey) continue;

    const defaultVariant = sdkVariants(sdkConfig.key)[0];
    if (!defaultVariant) continue;

    const prefix = `/sdk/${sdkConfig.key}`;
    const targetPrefix = `${prefix}/plus/${defaultVariant.key}`;

    redirects[prefix] = targetPrefix;
    redirects[`${prefix}/`] = `${targetPrefix}/`;

    for (const hubPath of LEGACY_FRAMEWORK_HUB_PATHS) {
      const withSlash = normalizeDocHref(hubPath);
      const withoutSlash = withSlash.replace(/\/$/, "") || withSlash;
      redirects[`${prefix}${withoutSlash}`] = `${targetPrefix}${withoutSlash}`;
      redirects[`${prefix}${withSlash}`] = `${targetPrefix}${withSlash}`;
    }
  }

  return redirects;
}

export type VercelSdkBaseRedirect = {
  source: string;
  destination: string;
  permanent: true;
};

/** Vercel redirect rules for bare variant-only SDK paths. */
export function variantOnlySdkVercelRedirects(): VercelSdkBaseRedirect[] {
  const redirects: VercelSdkBaseRedirect[] = [];

  for (const sdkConfig of Object.values(ARCJET_SDKS)) {
    if (sdkConfig.legacyFrameworkKey) continue;

    const defaultVariant = sdkVariants(sdkConfig.key)[0];
    if (!defaultVariant) continue;

    redirects.push({
      source: `/sdk/${sdkConfig.key}`,
      destination: `/sdk/${sdkConfig.key}/plus/${defaultVariant.key}`,
      permanent: true,
    });
    redirects.push({
      source: `/sdk/${sdkConfig.key}/:path((?!plus/).*)`,
      destination: `/sdk/${sdkConfig.key}/plus/${defaultVariant.key}/:path`,
      permanent: true,
    });
  }

  return redirects;
}

/**
 * Returns the SDK key corresponding to a legacy framework key, if one exists.
 *
 * For example, `"nest-js"` → `"nest"`, `"bun"` → `"bun"`.
 */
export function sdkKeyFromLegacyFrameworkKey(
  legacyKey: string,
): ArcjetSdkKey | undefined {
  for (const [sdkKey, variants] of Object.entries(SDK_VARIANTS)) {
    for (const variant of variants ?? []) {
      if (variant.legacyFrameworkKey === legacyKey) {
        return sdkKey as ArcjetSdkKey;
      }
    }
  }

  for (const sdkConfig of Object.values(ARCJET_SDKS)) {
    if (sdkConfig.legacyFrameworkKey === legacyKey) {
      return sdkConfig.key;
    }
  }
  return undefined;
}

/**
 * Agent guard docs entry points keyed by legacy framework key.
 *
 * Used when linking to `/get-started` for guard-only frameworks that do not
 * have an HTTP SDK route prefix.
 */
const GUARD_DOC_PATHS: Partial<Record<FrameworkKey, string>> = {
  "claude-agent-sdk": "/guards/claude-agent-sdk/",
  crewai: "/guards/crewai/",
  genkit: "/guards/genkit/",
  langchain: "/guards/langchain/",
  "langchain-js": "/guards/langchain-js/",
  langgraph: "/guards/langgraph/",
  mastra: "/guards/mastra/",
  "openai-agents": "/guards/openai-agents/",
  "strands-agents": "/guards/strands-agents/",
  "vercel-ai": "/guards/vercel-ai/",
  "vercel-eve": "/guards/vercel-eve/",
};

function normalizeDocHref(href: string): string {
  if (!href || href === "/") return "/";
  const withLeading = href.startsWith("/") ? href : `/${href}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/**
 * Returns the `/sdk/...` route prefix for a legacy framework key, if one exists.
 *
 * @example
 * sdkRoutePrefixFromLegacyFrameworkKey("next-js") // => "/sdk/next"
 * sdkRoutePrefixFromLegacyFrameworkKey("bun-hono") // => "/sdk/bun/plus/hono"
 */
export function sdkRoutePrefixFromLegacyFrameworkKey(
  legacyKey: FrameworkKey,
): string | undefined {
  for (const [sdkKey, variants] of Object.entries(SDK_VARIANTS)) {
    for (const variant of variants ?? []) {
      if (variant.legacyFrameworkKey === legacyKey) {
        return `/sdk/${sdkKey}/plus/${variant.key}`;
      }
    }
  }

  for (const sdkConfig of Object.values(ARCJET_SDKS)) {
    if (sdkConfig.legacyFrameworkKey === legacyKey) {
      return `/sdk/${sdkConfig.key}`;
    }
  }

  return undefined;
}

/**
 * Strips an `/sdk/:sdk/` (and optional `/plus/:variant/`) prefix from a pathname,
 * returning the underlying docs route.
 *
 * @example
 * docPathFromSdkPathname("/sdk/bun/plus/hono/get-started/")
 * // => "/get-started/"
 */
export function docPathFromSdkPathname(pathname: string): string {
  const sdkKey = sdkFromPathname(pathname);
  if (!sdkKey) {
    return normalizeDocHref(pathname);
  }

  let rest = pathname.replace(new RegExp(`^/sdk/${sdkKey}`), "") || "/";

  const variant = sdkVariantFromPathname(pathname);
  if (variant) {
    rest = rest.replace(`/plus/${variant.key}`, "") || "/";
  }

  return normalizeDocHref(rest);
}

/**
 * Returns the SDK-scoped (or guard docs) pathname for a legacy framework key.
 *
 * @example
 * pathnameForLegacyFrameworkKey("next-js", "/get-started")
 * // => "/sdk/next/get-started/"
 *
 * pathnameForLegacyFrameworkKey("bun-hono", "/get-started")
 * // => "/sdk/bun/plus/hono/get-started/"
 *
 * pathnameForLegacyFrameworkKey("crewai", "/get-started")
 * // => "/guards/crewai/"
 */
export function pathnameForLegacyFrameworkKey(
  legacyKey: FrameworkKey,
  href: string,
): string {
  let docHref = normalizeDocHref(href);
  if (sdkFromPathname(docHref)) {
    docHref = docPathFromSdkPathname(docHref);
  }

  const sdkPrefix = sdkRoutePrefixFromLegacyFrameworkKey(legacyKey);

  if (sdkPrefix) {
    return `${sdkPrefix}${docHref === "/" ? "" : docHref}`;
  }

  const guardPath = GUARD_DOC_PATHS[legacyKey];
  if (guardPath && docHref === "/get-started/") {
    return guardPath;
  }

  return docHref;
}

/**
 * Returns the href to use when linking or navigating to a legacy framework.
 *
 * Produces SDK-scoped (or guard docs) paths when available. Falls back to
 * `{path}?f={legacyKey}` for guard-only frameworks on pages other than
 * get-started.
 */
export function hrefForLegacyFrameworkKey(
  legacyKey: FrameworkKey,
  href: string,
): string {
  const targetPath = pathnameForLegacyFrameworkKey(legacyKey, href);
  const normalizedHref = normalizeDocHref(
    sdkFromPathname(href) ? docPathFromSdkPathname(href) : href,
  );
  const normalizedTarget = normalizeDocHref(targetPath);

  if (normalizedTarget !== normalizedHref) {
    return targetPath;
  }

  const sdkPrefix = sdkRoutePrefixFromLegacyFrameworkKey(legacyKey);
  const guardPath = GUARD_DOC_PATHS[legacyKey];
  const hasDedicatedRoute =
    !!sdkPrefix ||
    (!!guardPath && normalizedHref === "/get-started/");

  if (hasDedicatedRoute) {
    return targetPath;
  }

  const base = href.split("?")[0].split("#")[0];
  const normalizedBase = normalizeDocHref(base).replace(/\/$/, "") || "/";
  return `${normalizedBase}?f=${legacyKey}`;
}

// Paths that should never be scoped to an SDK
const UNSCOPED_PATH_PREFIXES = ["/_", "/assets/", "/fonts/", "/favicon"];

/**
 * Scopes an internal href to the current page's SDK, if on an SDK-scoped page.
 *
 * On a non-SDK page, the href is returned unchanged.
 *
 * @example
 * // On /sdk/next/bot-protection:
 * scopeHrefToCurrentSdk("/sdk/next/bot-protection", "/get-started")
 * // => "/sdk/next/get-started"
 *
 * // On /bot-protection (non-SDK page):
 * scopeHrefToCurrentSdk("/bot-protection", "/get-started")
 * // => "/get-started"
 */
export function scopeHrefToCurrentSdk(
  currentPathname: string,
  href: string,
): string {
  if (!href.startsWith("/") || href.startsWith("/sdk/")) {
    return href;
  }

  if (UNSCOPED_PATH_PREFIXES.some((prefix) => href.startsWith(prefix))) {
    return href;
  }

  const currentSdk = sdkFromPathname(currentPathname);
  if (!currentSdk) {
    return href;
  }

  const variant = sdkVariantFromPathname(currentPathname);
  if (variant) {
    return `/sdk/${currentSdk}/plus/${variant.key}${href}`;
  }

  return `/sdk/${currentSdk}${href}`;
}

/**
 * Scopes an internal href to a specific target SDK.
 *
 * Produces an `/sdk/{targetSdk}/` path (including plus-variant prefixes when
 * the target SDK maps to a legacy framework key).
 *
 * @example
 * scopeHrefToSdk("/reference/nodejs", "/get-started", "node")
 * // => "/sdk/node/get-started/"
 */
export function scopeHrefToSdk(
  currentPathname: string,
  href: string,
  targetSdk: ArcjetSdkKey,
): string {
  if (!href.startsWith("/") || href.startsWith("/sdk/")) {
    return href;
  }

  if (UNSCOPED_PATH_PREFIXES.some((prefix) => href.startsWith(prefix))) {
    return href;
  }

  const currentSdk = sdkFromPathname(currentPathname);

  if (currentSdk) {
    return `/sdk/${targetSdk}${normalizeDocHref(href) === "/" ? "" : normalizeDocHref(href)}`;
  }

  const sdkConfig = ARCJET_SDKS[targetSdk];
  const legacyKey = sdkConfig.legacyFrameworkKey;

  if (legacyKey) {
    return pathnameForLegacyFrameworkKey(legacyKey, href);
  }

  const defaultVariant = sdkVariants(targetSdk)[0];
  if (defaultVariant) {
    return pathnameForLegacyFrameworkKey(
      defaultVariant.legacyFrameworkKey,
      href,
    );
  }

  return `/sdk/${targetSdk}${normalizeDocHref(href) === "/" ? "" : normalizeDocHref(href)}`;
}

/**
 * Returns whether a docs entry should be duplicated under `/sdk/...` routes.
 *
 * Only framework-specific pages (those with `frameworks` or `titleByFramework`
 * frontmatter) vary by SDK. Duplicating every doc would create many near-
 * identical crawlable URLs that only differ in the SDK sidebar.
 */
export function isFrameworkSpecificEntry(data: {
  frameworks?: FrameworkKey[];
  titleByFramework?: Partial<Record<FrameworkKey, string>>;
}): boolean {
  if (Array.isArray(data.frameworks) && data.frameworks.length > 0) {
    return true;
  }

  if (data.titleByFramework && Object.keys(data.titleByFramework).length > 0) {
    return true;
  }

  return false;
}

/** Doc paths that historically accepted legacy `?f=` framework query params. */
export const LEGACY_F_DOC_PATHS = [
  "/get-started",
  "/shield/quick-start",
  "/shield/reference",
  "/rate-limiting/quick-start",
  "/rate-limiting/reference",
  "/bot-protection/quick-start",
  "/bot-protection/reference",
  "/email-validation/quick-start",
  "/email-validation/reference",
  "/signup-protection/quick-start",
  "/signup-protection/reference",
  "/filters/quick-start",
  "/filters/reference",
  "/nosecone/quick-start",
  "/sensitive-info/quick-start",
  "/sensitive-info/reference",
  "/ai-protection/abuse-protection",
] as const;

/**
 * Legacy hub URLs for framework-specific docs (non-SDK paths).
 *
 * Kept in sync with MDX entries that declare `frameworks` frontmatter. Used
 * to exclude duplicate hub pages from the sitemap once SDK routes are canonical.
 */
export const LEGACY_FRAMEWORK_HUB_PATHS = [
  "/get-started/",
  "/bot-protection/quick-start/",
  "/bot-protection/reference/",
  "/bot-protection/advanced-signals/",
  "/shield/quick-start/",
  "/shield/reference/",
  "/rate-limiting/quick-start/",
  "/rate-limiting/reference/",
  "/email-validation/quick-start/",
  "/email-validation/reference/",
  "/signup-protection/quick-start/",
  "/signup-protection/reference/",
  "/filters/quick-start/",
  "/filters/reference/",
  "/nosecone/quick-start/",
  "/sensitive-info/quick-start/",
  "/sensitive-info/reference/",
  "/ai-protection/abuse-protection/",
  "/ai-protection/budget-control/",
  "/ai-protection/data-loss-prevention/",
  "/ai-protection/prompt-injection/",
  "/content-moderation/",
  "/content-moderation/quick-start/",
  "/prompt-injection/quick-start/",
] as const;

/** Returns whether a pathname is a plus-variant SDK route (`/sdk/:sdk/plus/:variant/...`). */
export function isPlusVariantPathname(pathname: string): boolean {
  return sdkVariantFromPathname(pathname) !== undefined;
}

/** Returns whether a pathname is a legacy framework hub (non-SDK, framework-specific). */
export function isLegacyFrameworkHubPathname(pathname: string): boolean {
  if (sdkFromPathname(pathname)) return false;
  const normalized = normalizeDocHref(pathname);
  return LEGACY_FRAMEWORK_HUB_PATHS.some(
    (hubPath) => normalizeDocHref(hubPath) === normalized,
  );
}

/** Returns whether a URL should be omitted from the sitemap. */
export function shouldExcludeFromSitemap(pathname: string): boolean {
  return (
    isPlusVariantPathname(pathname) || isLegacyFrameworkHubPathname(pathname)
  );
}

export type VercelLegacyFrameworkRedirect = {
  source: string;
  has: Array<{ type: "query"; key: string; value?: string }>;
  destination: string;
  permanent: true;
};

function legacyFrameworkKeysForDocPath(docPath: string): FrameworkKey[] {
  const keys: FrameworkKey[] = [];

  for (const variants of Object.values(SDK_VARIANTS)) {
    for (const variant of variants ?? []) {
      keys.push(variant.legacyFrameworkKey);
    }
  }

  for (const sdkConfig of Object.values(ARCJET_SDKS)) {
    if (sdkConfig.legacyFrameworkKey) {
      keys.push(sdkConfig.legacyFrameworkKey);
    }
  }

  if (normalizeDocHref(docPath) === "/get-started/") {
    keys.push(...(Object.keys(GUARD_DOC_PATHS) as FrameworkKey[]));
  }

  return keys;
}

/**
 * Returns Vercel redirect rules for legacy `?f=` URLs.
 *
 * Used to keep `/vercel.json` in sync via `scripts/generate-legacy-f-redirects.ts`.
 */
export function legacyFrameworkVercelRedirects(): VercelLegacyFrameworkRedirect[] {
  const redirects: VercelLegacyFrameworkRedirect[] = [];

  for (const docPath of LEGACY_F_DOC_PATHS) {
    const source = docPath.replace(/\/$/, "") || "/";
    const normalizedDoc = normalizeDocHref(docPath);

    for (const legacyKey of legacyFrameworkKeysForDocPath(docPath)) {
      const destination = pathnameForLegacyFrameworkKey(legacyKey, docPath);
      if (normalizeDocHref(destination) === normalizedDoc) continue;

      redirects.push({
        source,
        has: [{ type: "query", key: "f", value: legacyKey }],
        destination,
        permanent: true,
      });
    }
  }

  redirects.push({
    source: "/sdk/:path*",
    has: [{ type: "query", key: "f" }],
    destination: "/sdk/:path*",
    permanent: true,
  });

  return redirects;
}
