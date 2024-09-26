import type { Framework, FrameworkKey } from "@/lib/prefs";
import {
  defaultSelectedFramework,
  getClosestFrameworkMatch,
  getFrameworks,
  getStoredSelectedFramework,
  storeDisplayedFramework,
  storeSelectedFramework,
} from "@/lib/prefs";
import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ForwardedRef,
  type PropsWithChildren,
} from "react";

interface Props extends PropsWithChildren {
  frameworks: FrameworkKey[];
}

/**
 * Framework Switcher
 * Selects one of the available frameworks.
 * Composes the options from the provided `frameworks`.
 *
 * @param frameworks - The list of framework options to display.
 */
const FrameworkSwitcher = forwardRef(
  ({ frameworks, ...props }: Props, ref: ForwardedRef<HTMLSelectElement>) => {
    // Get the frameworks to display.
    const displayedFrameworks = useMemo(() => {
      return getFrameworks(frameworks);
    }, [frameworks]);

    // The selected option
    const [selected, setSelected] = useState<FrameworkKey>(
      defaultSelectedFramework,
    );

    // Select change callback
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;

      if (!storeSelectedFramework(val, frameworks)) return;
      storeDisplayedFramework(val, frameworks);

      setSelected(val as FrameworkKey);
      window.dispatchEvent(new Event("change:selected-framework"));
      window.dispatchEvent(new Event("change:displayed-framework"));
    };

    // Sync with local storage value if present
    useEffect(() => {
      const storedFramework = getStoredSelectedFramework(frameworks);
      if (!storedFramework) return;

      // Not all stored frameworks may be in the list, so we try to return the closest match
      const match = getClosestFrameworkMatch(storedFramework, frameworks);
      if (match) setSelected(match);

      storeDisplayedFramework(match, frameworks);
      window.dispatchEvent(new Event("change:displayed-framework"));
    }, [frameworks]);

    // TODO: Replace with Arcjet's select component.

    return (
      <select ref={ref} {...props} onChange={onChange} value={selected}>
        {displayedFrameworks.map((framework: Framework, idx: number) => {
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
