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
  return safeParse(localStorage.getItem(safeToString(key)) || "{}");
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
