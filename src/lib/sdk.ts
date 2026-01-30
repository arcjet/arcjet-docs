import type { ElementType } from "react";
import type { FrameworkKey } from "@/lib/prefs";
import { Astro as IconAstro } from "@/components/icons/tech/Astro";
import { Bun as IconBun } from "@/components/icons/tech/Bun";
import { Deno as IconDeno } from "@/components/icons/tech/Deno";
import { Fastify as IconFastify } from "@/components/icons/tech/Fastify";
import { NestJs as IconNestJs } from "@/components/icons/tech/NestJs";
import { NextJs as IconNextJs } from "@/components/icons/tech/NextJs";
import { NodeJs as IconNodeJs } from "@/components/icons/tech/NodeJs";
import { Nuxt as IconNuxt } from "@/components/icons/tech/Nuxt";
import { ReactRouter as IconReactRouter } from "@/components/icons/tech/ReactRouter";
import { Remix as IconRemix } from "@/components/icons/tech/Remix";
import { SvelteKit as IconSvelteKit } from "@/components/icons/tech/SvelteKit";

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
  /**
   * React icon component for the SDK
   */
  readonly ReactIcon: ElementType | null;
};

/**
 * Exhaustive SDK configuration source of truth
 */
const ARCJET_SDKS = {
  astro: {
    key: "astro",
    label: "Astro",
    legacyFrameworkKey: "astro",
    ReactIcon: IconAstro,
  },
  bun: {
    key: "bun",
    label: "Bun",
    legacyFrameworkKey: "bun",
    ReactIcon: IconBun,
  },
  deno: {
    key: "deno",
    label: "Deno",
    legacyFrameworkKey: "deno",
    ReactIcon: IconDeno,
  },
  fastify: {
    key: "fastify",
    label: "Fastify",
    legacyFrameworkKey: "fastify",
    ReactIcon: IconFastify,
  },
  nest: {
    key: "nest",
    label: "NestJS",
    legacyFrameworkKey: "nest-js",
    ReactIcon: IconNestJs,
  },
  next: {
    key: "next",
    label: "Next.js",
    legacyFrameworkKey: "next-js",
    ReactIcon: IconNextJs,
  },
  node: {
    key: "node",
    label: "Node.js",
    legacyFrameworkKey: "node-js",
    ReactIcon: IconNodeJs,
  },
  nuxt: {
    key: "nuxt",
    label: "Nuxt",
    legacyFrameworkKey: "nuxt",
    ReactIcon: IconNuxt,
  },
  python: {
    key: "python",
    label: "Python",
    legacyFrameworkKey: null,
    ReactIcon: null,
  },
  "react-router": {
    key: "react-router",
    label: "React Router",
    legacyFrameworkKey: "react-router",
    ReactIcon: IconReactRouter,
  },
  remix: {
    key: "remix",
    label: "Remix",
    legacyFrameworkKey: "remix",
    ReactIcon: IconRemix,
  },
  sveltekit: {
    key: "sveltekit",
    label: "SvelteKit",
    legacyFrameworkKey: "sveltekit",
    ReactIcon: IconSvelteKit,
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

/**
 * Returns a pathname scoped to the given SDK.
 */
export function pathnameForSdk(pathname: string, sdk: ArcjetSdkKey): string {
  const previousSdk = sdkFromPathname(pathname);

  if (!previousSdk) {
    throw new Error(
      `@/lib/sdk:pathnameForSdk only supports SDK scoped pathnames.`,
    );
  }

  return pathname.replace(`/sdk/${previousSdk}`, `/sdk/${sdk}`);
}
