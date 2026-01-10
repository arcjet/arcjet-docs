import type { FrameworkKey } from "@/lib/prefs";

/**
 * Keys for all of the valid Arcjet SDKs.
 *
 * These values should correspond as directly as possible to our SDK namess to
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
