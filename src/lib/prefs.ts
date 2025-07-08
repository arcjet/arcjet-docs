import { findBestMatch } from "@/lib/string-similarity";
import {
  getTypedStorage,
  removeTypedStorage,
  setTypedStorage,
} from "@/lib/utils";

/**
 * Types
 *******************************************************************************************************/

/** The framework keys */
export type FrameworkKey =
  | "astro"
  | "bun"
  | "bun-hono"
  | "deno"
  | "fastify"
  | "nest-js"
  | "next-js"
  | "node-js"
  | "node-js-express"
  | "node-js-hono"
  | "sveltekit"
  | "remix"
  | "nest-js"
  | "express";

/** The framework display labels */
export type FrameworkLabel =
  | "Astro"
  | "Bun"
  | "Bun + Hono"
  | "Deno"
  | "Fastify"
  | "NestJS"
  | "Next.js"
  | "Node.js"
  | "Node.js + Express"
  | "Node.js + Hono"
  | "SvelteKit"
  | "Remix"
  | "NestJs"
  | "Express";

/** The full framework type */
export type Framework = {
  key: FrameworkKey;
  label: FrameworkLabel;
};

/**
 * The available user prefs
 * Defines the user preferences that are persisted.
 */
export type Prefs = {
  // The user selected framework
  "selected-framework"?: FrameworkKey;
  // The framework currently displayed (might differ from what the user has selected if not available in the current page)
  "displayed-framework"?: FrameworkKey;
  [key: `starlight-synced-tabs__${string}`]: string;
};

/**
 * Values
 *******************************************************************************************************/

/**
 * Frameworks
 * The user selectable framework options.
 */
export const frameworks: Array<Framework> = [
  {
    key: "astro",
    label: "Astro",
  },
  {
    key: "bun",
    label: "Bun",
  },
  {
    key: "bun-hono",
    label: "Bun + Hono",
  },
  {
    key: "deno",
    label: "Deno",
  },
  {
    key: "fastify",
    label: "Fastify",
  },
  {
    key: "nest-js",
    label: "NestJS",
  },
  {
    key: "next-js",
    label: "Next.js",
  },
  {
    key: "node-js",
    label: "Node.js",
  },
  {
    key: "node-js-express",
    label: "Node.js + Express",
  },
  {
    key: "node-js-hono",
    label: "Node.js + Hono",
  },
  {
    key: "remix",
    label: "Remix",
  },
  {
    key: "sveltekit",
    label: "SvelteKit",
  },
  // {
  //   key: "express",
  //   label: "Express",
  // },
];

/**
 * Default Selected Framework
 * The framework selected by default if the user didn't make a choice.
 */
export const defaultSelectedFramework: FrameworkKey = "next-js";

/**
 * Utilities
 *******************************************************************************************************/

/**
 * Utility to build a frameworks list from given keys.
 * @param keys - The keys of the frameworks to include in the list
 */
export const getFrameworks = (keys: FrameworkKey[]): Array<Framework> => {
  return frameworks.filter((f) => keys.includes(f.key));
};

/**
 * Type guard utility for sanitizing interaction input
 * @param key - The framework key to validate.
 */
export const isValidFrameworkKey = (key: string) => {
  return frameworks.find((f) => f.key === key);
};

/**
 * Utility that retrieves the stored selected framework safely, or executes a clean up.
 */
export const getStoredFramework = (): FrameworkKey | undefined => {
  const stored = getTypedStorage<Prefs>("selected-framework");

  if (!stored) return undefined;

  // Sanitize | clean
  if (!isValidFrameworkKey(stored)) {
    // Remove from storage is value is bad
    removeTypedStorage<Prefs>("selected-framework");
  }

  return stored as FrameworkKey;
};

/**
 * Utility that saves the selected framework in storage safely.
 * @param key - The framework key to store.
 */
export const storeFramework = (key: string): boolean => {
  // Sanitize
  if (!isValidFrameworkKey(key)) return false;

  const alreadyStored = getStoredFramework() == key;
  if (alreadyStored) return false;

  setTypedStorage<Prefs>("selected-framework", key as FrameworkKey);
  return true;
};

/**
 * Utility that returns the closest match from the frameworks list for a given key.
 * @param key - The framework key to store.
 * @param frameworksList - Restricts results to a provided list of frameworks.
 */
export const getClosestFrameworkMatch = (
  key: FrameworkKey,
  frameworksList: FrameworkKey[],
): FrameworkKey => {
  const frameworksSet = getFrameworks(frameworksList);

  const match = findBestMatch(
    key,
    frameworksSet.map((f) => f.key),
  );

  return match.bestMatch.target as FrameworkKey;
};

/**
 * Utility that retrieves a stored syncKey.
 */
export const getStoredSyncKey = (suffix: string): string | undefined => {
  const stored = getTypedStorage<Prefs>(`starlight-synced-tabs__${suffix}`);

  if (!stored) return undefined;
  return stored;
};

/**
 * Utility that saves the selected framework in storage safely.
 * @param key - The framework key to store.
 */
export const storeSyncKey = (suffix: string, key: string): boolean => {
  const alreadyStored = getStoredSyncKey(suffix) == key;
  if (alreadyStored) return false;

  setTypedStorage<Prefs>(`starlight-synced-tabs__${suffix}`, key);
  return true;
};
