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
