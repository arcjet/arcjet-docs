import { atom } from "nanostores";

import type { Framework, FrameworkKey } from "./lib/prefs";
import {
  defaultSelectedFramework,
  frameworks,
  getStoredFramework,
  isValidFrameworkKey,
} from "./lib/prefs";

/**
 * Returns the framework to display on initial load.
 * On the client, prefers the query param framework, then the stored preference,
 * and finally the default. On the server, always returns the default to avoid
 * accessing browser APIs.
 */
function getInitialFramework(): FrameworkKey {
  if (typeof window === "undefined") return defaultSelectedFramework;

  // Check query param first (takes priority over stored preference)
  const params = new URLSearchParams(window.location.search);
  const f = params.get("f");
  if (f && isValidFrameworkKey(f)) {
    return f as FrameworkKey;
  }

  return getStoredFramework() ?? defaultSelectedFramework;
}

export const displayedFramework = atom<FrameworkKey>(getInitialFramework());
export const queryParamFramework = atom<FrameworkKey | undefined>();
export const availableFrameworks = atom<ReadonlyArray<Framework>>(frameworks);
export const syncKeys = atom<{ [key: string]: string }>({});
