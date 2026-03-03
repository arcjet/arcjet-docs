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

/**
 * A sub-variant of an SDK that uses the same Arcjet SDK package but
 * pairs it with a different framework (e.g. Bun + Hono, Node.js + Express).
 */
export type ArcjetSdkVariant = {
  /** URL-safe key used in `/sdk/:sdk/plus/:variant/` paths */
  readonly key: string;
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

  return cleanPathname.replace(`/sdk/${previousSdk}`, `/sdk/${targetSdk}`);
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

/**
 * Returns the SDK key corresponding to a legacy framework key, if one exists.
 *
 * For example, `"nest-js"` → `"nest"`, `"bun"` → `"bun"`.
 */
export function sdkKeyFromLegacyFrameworkKey(
  legacyKey: string,
): ArcjetSdkKey | undefined {
  for (const sdkConfig of Object.values(ARCJET_SDKS)) {
    if (sdkConfig.legacyFrameworkKey === legacyKey) {
      return sdkConfig.key;
    }
  }
  return undefined;
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

  return `/sdk/${currentSdk}${href}`;
}

/**
 * Scopes an internal href to a specific target SDK.
 *
 * When the current page is SDK-scoped, produces an `/sdk/{targetSdk}/` path.
 * When the current page is not SDK-scoped, falls back to a `?f={legacyKey}`
 * query parameter for backwards compatibility.
 *
 * @example
 * // On /sdk/next/reference/nodejs:
 * scopeHrefToSdk("/sdk/next/reference/nodejs", "/get-started", "node")
 * // => "/sdk/node/get-started"
 *
 * // On /reference/nodejs (non-SDK page):
 * scopeHrefToSdk("/reference/nodejs", "/get-started", "node")
 * // => "/get-started?f=node-js"
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
    // On an SDK-scoped page — produce a clean /sdk/ path
    return `/sdk/${targetSdk}${href}`;
  }

  // On a non-SDK page — fall back to ?f= for backwards compatibility
  const sdkConfig = ARCJET_SDKS[targetSdk];
  const legacyKey = sdkConfig.legacyFrameworkKey;

  if (!legacyKey) {
    // No legacy key mapping (e.g. python) — return bare href
    return href;
  }

  // Parse the href to handle existing query params and hash fragments
  const url = new URL(href, "https://placeholder.invalid");
  url.searchParams.set("f", legacyKey);
  // Return only the path + search + hash (no origin)
  return `${url.pathname}${url.search}${url.hash}`;
}
