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
import { forwardRef, useEffect, useState, type ForwardedRef } from "react";

interface Props extends React.HTMLAttributes<HTMLSelectElement> {
  frameworks?: FrameworkKey[];
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
    let cls = "FrameworkSwitcher";
    if (props.className) cls += " " + props.className;

    const $availableFrameworks = useStore(availableFrameworks);
    const $displayedFramework = useStore(displayedFramework);

    // The selected framework option
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
      const match = getClosestFrameworkMatch(
        storedFramework,
        $availableFrameworks.map((f) => f.key),
      );
      if (match) setSelected(match);

      // Update store
      displayedFramework.set(match);
    }, [$availableFrameworks]);

    // Sync store with current page frontmatter
    useEffect(() => {
      if (frameworks && frameworks.length > 0) {
        availableFrameworks.set(getFrameworks(frameworks));
      }
    }, [frameworks]);

    // Handle query params
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const f = params.get("f");

      if (!f || !storeFramework(f)) return;

      setSelected(f as FrameworkKey);

      // Update store
      displayedFramework.set(f as FrameworkKey);
    }, []);

    // Handle change in the displayed framework
    // If the nano store for this has changed then we assume
    // local storage has also been updated and only change the displayed selection.
    useEffect(() => {
      setSelected($displayedFramework);
    }, [$displayedFramework]);

    // TODO: Replace with Arcjet's select component.

    return (
      <select
        className={cls}
        ref={ref}
        {...props}
        onChange={onChange}
        value={selected}
      >
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
