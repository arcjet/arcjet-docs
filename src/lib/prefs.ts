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
  | "bun"
  | "bun-hono"
  | "next-js"
  | "node-js"
  | "node-js-express"
  | "node-js-hono"
  | "sveltekit";

/** The framework display labels */
export type FrameworkLabel =
  | "Bun"
  | "Bun + Hono"
  | "Next.js"
  | "Node.js"
  | "Node.js + Express"
  | "Node.js + Hono"
  | "SvelteKit";

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
    key: "bun",
    label: "Bun",
  },
  {
    key: "bun-hono",
    label: "Bun + Hono",
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
    key: "sveltekit",
    label: "SvelteKit",
  },
];

/**
 * Default Frameworks
 * The default frameworks list when they are not specified.
 */
export const defaultFrameworks: FrameworkKey[] = [
  "bun",
  "next-js",
  "node-js",
  "sveltekit",
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
 * Utility to build a frameworks list from given keys if defined or returns default frameworks.
 * @param keys - The keys of the frameworks to include in the list
 */
export const getFrameworks = (keys?: FrameworkKey[]): Array<Framework> => {
  return frameworks.filter((f) =>
    keys ? keys.includes(f.key) : defaultFrameworks.includes(f.key),
  );
};

/**
 * Type guard utility for sanitizing interaction input
 * @param key - The framework key to validate.
 * @param frameworksList - Restricts results to a provided list of frameworks.
 */
export const isValidFrameworkKey = (
  key: string,
  frameworksList?: FrameworkKey[],
) => {
  const frameworksSet = frameworksList
    ? getFrameworks(frameworksList)
    : frameworks;
  return frameworksSet.find((f) => f.key == key);
};

/**
 * Utility that retrieves the stored selected framework safely, or executes a clean up.
 * @param storageField - The storage field.
 * @param frameworksList - Restricts results to a provided list of frameworks.
 */
const getStoredFramework = (
  storageField: keyof Prefs,
  frameworksList?: FrameworkKey[],
): FrameworkKey | undefined => {
  const stored = getTypedStorage<Prefs>(storageField);

  if (!stored) return undefined;

  // Sanitize | clean
  if (!isValidFrameworkKey(stored, frameworksList)) {
    if (!isValidFrameworkKey(stored)) {
      // Remove from storage is value is bad
      removeTypedStorage<Prefs>(storageField);
    }
    return undefined;
  }

  return stored;
};

/**
 * Utility that saves the selected framework in storage safely.
 * @param storageField - The storage field.
 * @param key - The framework key to store.
 * @param frameworksList - Restricts results to a provided list of frameworks.
 */
const storeFramework = (
  storageField: keyof Prefs,
  key: string,
  frameworksList?: FrameworkKey[],
): boolean => {
  // Sanitize
  if (!isValidFrameworkKey(key, frameworksList)) return false;

  const alreadyStored = getStoredFramework(storageField, frameworksList) == key;
  if (alreadyStored) return false;

  setTypedStorage<Prefs>(storageField, key as FrameworkKey);
  return true;
};

/**
 * Utility that retrieves the stored selected framework safely, or executes a clean up.
 * @param frameworksList - Restricts results to a provided list of frameworks.
 */
export const getStoredSelectedFramework = (
  frameworksList?: FrameworkKey[],
): FrameworkKey | undefined => {
  return getStoredFramework("selected-framework", frameworksList);
};

/**
 * Utility that saves the selected framework in storage safely.
 * @param key - The framework key to store.
 * @param frameworksList - Restricts results to a provided list of frameworks.
 */
export const storeSelectedFramework = (
  key: string,
  frameworksList?: FrameworkKey[],
): boolean => {
  return storeFramework("selected-framework", key, frameworksList);
};

/**
 * Utility that retrieves the stored displayed framework safely, or executes a clean up.
 * @param frameworksList - Restricts results to a provided list of frameworks.
 */
export const getStoredDisplayedFramework = (
  frameworksList?: FrameworkKey[],
): FrameworkKey | undefined => {
  return getStoredFramework("displayed-framework", frameworksList);
};

/**
 * Utility that saves the displayed framework in storage safely.
 * @param key - The framework key to store.
 * @param frameworksList - Restricts results to a provided list of frameworks.
 */
export const storeDisplayedFramework = (
  key: string,
  frameworksList?: FrameworkKey[],
): boolean => {
  return storeFramework("displayed-framework", key, frameworksList);
};

/**
 * Utility that returns the closest match from the frameworks list for a given key.
 * @param key - The framework key to store.
 * @param frameworksList - Restricts results to a provided list of frameworks.
 */
export const getClosestFrameworkMatch = (
  key: FrameworkKey,
  frameworksList?: FrameworkKey[],
): FrameworkKey => {
  const frameworksSet = getFrameworks(frameworksList);

  const match = findBestMatch(
    key,
    frameworksSet.map((f) => f.key),
  );

  return match.bestMatch.target as FrameworkKey;
};
