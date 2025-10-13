import { findBestMatch } from "@/lib/string-similarity";
import {
  getTypedStorage,
  removeTypedStorage,
  setTypedStorage,
} from "@/lib/utils";

/**
 * Types
 *******************************************************************************************************/

/**
 * Framework keys,
 * includes integration keys (which refer to an SDK, an npm package),
 * but also adds combinations (such as Bun + Hono).
 */
export type FrameworkKey = keyof typeof frameworkToLabel;

/**
 * Display labels for framework choices.
 */
export type FrameworkLabel = (typeof frameworkToLabel)[FrameworkKey];

/**
 * Framework key and label.
 */
export type Framework = {
  [Key in FrameworkKey]: { key: Key; label: (typeof frameworkToLabel)[Key] };
}[FrameworkKey];

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
 * Framework keys to label.
 * Most entries refer to an SDK (an npm package) but some also refer to
 * combinations (such as Bun + Hono).
 */
const frameworkToLabel = {
  astro: "Astro",
  bun: "Bun",
  "bun-hono": "Bun + Hono",
  deno: "Deno",
  fastify: "Fastify",
  "nest-js": "NestJS",
  "next-js": "Next.js",
  "node-js": "Node.js",
  "node-js-express": "Node.js + Express",
  "node-js-hono": "Node.js + Hono",
  nuxt: "Nuxt",
  "react-router": "React Router",
  remix: "Remix",
  sveltekit: "SvelteKit",
} as const;

/**
 * Frameworks.
 * The user selectable framework options.
 */
export const frameworks = Object.entries(frameworkToLabel).map(function ([
  key,
  label,
]) {
  return { key, label };
}) as Array<Framework>;

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
