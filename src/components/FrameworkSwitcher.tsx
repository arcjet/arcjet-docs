import type { Framework, FrameworkKey } from "@/lib/prefs";
import {
  defaultSelectedFramework,
  getClosestFrameworkMatch,
  getFrameworks,
  getStoredFramework,
  isValidFrameworkKey,
  storeFramework,
} from "@/lib/prefs";
import {
  availableFrameworks,
  displayedFramework,
  queryParamFramework,
} from "@/store";
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

    const [options, setOptions] = useState(
      frameworks ? getFrameworks(frameworks) : undefined,
    );

    const $availableFrameworks = useStore(availableFrameworks);
    const $displayedFramework = useStore(displayedFramework);
    const $queryParamFramework = useStore(queryParamFramework);

    // The selected framework option
    const [selected, setSelected] = useState<FrameworkKey>(
      defaultSelectedFramework,
    );

    // Select change callback
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (!storeFramework(val)) return;

      // Update store
      displayedFramework.set(val as FrameworkKey);
    };

    // Sync store with current page frontmatter
    useEffect(() => {
      if (frameworks && frameworks.length > 0) {
        availableFrameworks.set(getFrameworks(frameworks));
      }
    }, [frameworks]);

    // Sync with query param for framework or local storage value if present
    useEffect(() => {
      let framework: FrameworkKey | undefined = undefined;

      // Get the framework to display from query params
      const params = new URLSearchParams(window.location.search);
      const f = params.get("f");

      if (f && f != $queryParamFramework && isValidFrameworkKey(f)) {
        framework = f as FrameworkKey;
        queryParamFramework.set(f as FrameworkKey);
        storeFramework(f);
      }

      // Or get it from storage
      if (!framework) {
        const storedFramework = getStoredFramework();
        if (storedFramework) framework = storedFramework;
      }

      // We update based on the framework choice if any
      if (framework) {
        // Not all stored frameworks may be in the list currently,
        // so we try to return the closest match
        const match = getClosestFrameworkMatch(
          framework,
          $availableFrameworks.map((f) => f.key),
        );

        displayedFramework.set(match);
      }
    }, [$availableFrameworks, $queryParamFramework]);

    // Handle change in the displayed framework
    // If the nano store for this has changed then we assume local storage
    // has also been updated and only change the displayed selection.
    useEffect(() => {
      setSelected($displayedFramework);
    }, [$displayedFramework]);

    // Handle change in the framework options
    useEffect(() => {
      setOptions($availableFrameworks);
    }, [$availableFrameworks]);

    // TODO: Replace with Arcjet's select component.

    return (
      options && (
        <select
          className={cls}
          ref={ref}
          {...props}
          onChange={onChange}
          value={selected}
        >
          {options.map((framework: Framework, idx: number) => {
            return (
              <option key={`framework-option-${idx}`} value={framework.key}>
                {framework.label}
              </option>
            );
          })}
        </select>
      )
    );
  },
);
FrameworkSwitcher.displayName = "FrameworkSwitcher";

export default FrameworkSwitcher;
