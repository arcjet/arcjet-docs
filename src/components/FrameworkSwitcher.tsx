import type { Framework, FrameworkKey } from "@/lib/prefs";
import {
  defaultSelectedFramework,
  getClosestFrameworkMatch,
  getFrameworks,
  getStoredFramework,
  storeFramework,
} from "@/lib/prefs";
import { availableFrameworks, displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import {
  forwardRef,
  useEffect,
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
    const $availableFrameworks = useStore(availableFrameworks);

    // The selected option
    const [selected, setSelected] = useState<FrameworkKey>(
      defaultSelectedFramework,
    );

    // Select change callback
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;

      if (!storeFramework(val)) return;

      setSelected(val as FrameworkKey);

      // Update store
      displayedFramework.set(val as FrameworkKey);
    };

    // Sync with local storage value if present
    useEffect(() => {
      const storedFramework = getStoredFramework();
      if (!storedFramework) return;

      // Not all stored frameworks may be in the list, so we try to return the closest match
      const match = getClosestFrameworkMatch(storedFramework, frameworks);
      if (match) setSelected(match);

      // Update store
      displayedFramework.set(match);
    }, [frameworks]);

    // Sync store with current page frontmatter
    useEffect(() => {
      availableFrameworks.set(getFrameworks(frameworks));
    }, [frameworks]);

    // TODO: Replace with Arcjet's select component.

    return (
      <select ref={ref} {...props} onChange={onChange} value={selected}>
        {$availableFrameworks.map((framework: Framework, idx: number) => {
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
