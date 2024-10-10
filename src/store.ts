import { atom } from "nanostores";

import type { Framework, FrameworkKey } from "./lib/prefs";
import { defaultSelectedFramework, frameworks } from "./lib/prefs";

export const displayedFramework = atom<FrameworkKey>(defaultSelectedFramework);
export const queryParamFramework = atom<FrameworkKey | undefined>();
export const availableFrameworks = atom<Array<Framework>>(frameworks);
