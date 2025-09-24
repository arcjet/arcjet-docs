import type { FrameworkKey } from "@/lib/prefs";

/**
 * Typed local storage setter/getter
 * --------------------------------------------------------------------------------------------------------------
 */
const safeStringify = (param: any) => {
  return typeof param === "string" ? param : JSON.stringify(param);
};

const safeToString = (param: any) => {
  return typeof param === "string" ? param : param.toString();
};

const safeParse = (param: any) => {
  return typeof param === "string" ? param : JSON.parse(param);
};

export const setTypedStorage = <T>(key: keyof T, value: T[keyof T]) => {
  localStorage.setItem(key.toString(), safeStringify(value));
};

export const getTypedStorage = <T>(key: keyof T): T[keyof T] => {
  return safeParse(localStorage.getItem(safeToString(key)));
};

export const removeTypedStorage = <T>(key: keyof T): void => {
  return localStorage.removeItem(safeToString(key));
};

/**
 * Data parsing
 * --------------------------------------------------------------------------------------------------------------
 */

// Convert icon objects to an icon name string
export const convertIconObjsToString = (actions: any[]): any => {
  const parsed = actions.map((action) => {
    return {
      ...action,
      icon: action.icon?.type ? action.icon.name : action.icon,
    };
  });
  return parsed;
};

// Converts "kebab-case" to "camelCase"
export const kebabToCamel = (str: string) => {
  return str
    .toLowerCase()
    .split("-")
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("");
};

/**
 * In React, slots are occasionally/erratically converted to camelCase when received as props (next-js > nextJs,
 * see: https://docs.astro.build/en/guides/framework-components/#passing-children-to-framework-components)
 * so we parse them and retrieve the content with this utility.
 */
export const extractSlotContent = (
  props: any,
  selectedFramework: FrameworkKey,
) => {
  return (
    (props as any)[selectedFramework] ||
    (props as any)[kebabToCamel(selectedFramework)]
  );
};

/**
 * Sorting
 * --------------------------------------------------------------------------------------------------------------
 */
export const descendingComparator = <T>(a: T, b: T, orderBy: keyof T) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export type Order = "asc" | "desc";

export function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function getStringComparator(
  order: Order,
): (a: string, b: string) => number {
  return order === "desc"
    ? (a, b) => (a > b ? -1 : a < b ? 1 : 0)
    : (a, b) => (a > b ? 1 : a < b ? -1 : 0);
}

/** END: Sorting utils */

/**
 * Remove lines containing TypeScript comment directives such as
 * `// @ts-ignore` or `// @ts-expect-error`
 */
export function removeTSCCommentDirectives(code: string): string {
  // Remove TypeScript comment directives like `// @ts-ignore` or `// @ts-expect-error`
  return code.replaceAll(
    /[ 	]*\/\/[ 	]*@ts-(check|nocheck|expect-error)[^\n]*\n/gm,
    "",
  );
}
