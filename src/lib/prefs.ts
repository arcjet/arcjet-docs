/** The framework keys */
export type FrameworkKey = "bun" | "next-js" | "node-js" | "sveltekit";

/** The framework display labels */
export type FrameworkLabel = "Bun" | "Next.js" | "Node.js" | "SvelteKit";

/** The full framework type */
export type Framework = {
  key: FrameworkKey;
  label: FrameworkLabel;
};

/** The available user prefs */
export type Prefs = {
  "selected-framework"?: FrameworkKey;
};

/**
 * Available Frameworks
 * The user selectable frameworks for which an Arcjet SDK exists.
 */
export const availableFrameworks: Array<Framework> = [
  {
    key: "bun",
    label: "Bun",
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
    key: "sveltekit",
    label: "SvelteKit",
  },
];

/**
 * Default Framework
 * The framework selected by default if the user didn't make a choice.
 */
export const defaultFramework: FrameworkKey = "next-js";
