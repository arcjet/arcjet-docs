import type { Framework, FrameworkKey, Prefs } from "@/lib/prefs";
import { availableFrameworks, defaultFramework } from "@/lib/prefs";
import {
  getTypedStorage,
  removeTypedStorage,
  setTypedStorage,
} from "@/lib/utils";
import {
  forwardRef,
  useEffect,
  useState,
  type ForwardedRef,
  type PropsWithChildren,
} from "react";

// Type guard util for interaction input
const isFrameworkKey = (
  frameworks: typeof availableFrameworks,
  key: string,
) => {
  return frameworks.find((f) => f.key == key);
};

/**
 * Framework Switcher
 * Select one of the available frameworks.
 */
const FrameworkSwitcher = forwardRef(
  ({ ...props }: PropsWithChildren, ref: ForwardedRef<HTMLSelectElement>) => {
    const [selected, setSelected] = useState<FrameworkKey>(defaultFramework);

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;

      // Sanitize
      if (!isFrameworkKey(availableFrameworks, val)) return;

      if (val == selected) return;
      setTypedStorage<Prefs>("selected-framework", val as FrameworkKey);
      setSelected(val as FrameworkKey);
    };

    useEffect(() => {
      const storedFramework = getTypedStorage<Prefs>("selected-framework");
      if (storedFramework) {
        // Sanitize | clean
        if (!isFrameworkKey(availableFrameworks, storedFramework)) {
          removeTypedStorage<Prefs>("selected-framework");
          return;
        }

        setSelected(storedFramework as FrameworkKey);
      }
    }, []);

    return (
      <select ref={ref} {...props} onChange={onChange} value={selected}>
        {availableFrameworks.map((framework: Framework, idx: number) => {
          return (
            <option key={`framework-option-${idx}`} value={framework.key}>
              {framework.label}
            </option>
          );
        })}
      </select>
    );
  },
);
FrameworkSwitcher.displayName = "FrameworkSwitcher";

export default FrameworkSwitcher;
