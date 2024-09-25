import type { FrameworkKey } from "@/lib/prefs";
import {
  defaultSelectedFramework,
  getFrameworks,
  getStoredDisplayedFramework,
} from "@/lib/prefs";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useMemo, useState } from "react";

interface Props extends PropsWithChildren {
  frameworks?: FrameworkKey[];
}

/**
 * Framework Name
 *
 * Renders the appropriate framework name based on the selected framework.
 *
 * @param frameworks - The list of framework options to display.
 */
const FrameworkName = forwardRef(
  ({ frameworks, ...props }: Props, ref: ForwardedRef<HTMLElement>) => {
    // Get the frameworks to display.
    const displayedFrameworks = useMemo(() => {
      return getFrameworks(frameworks);
    }, []);

    // The selected framework
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>(
      defaultSelectedFramework,
    );

    // Sync with local storage value if present
    useEffect(() => {
      const update = () => {
        const storedFramework = getStoredDisplayedFramework(frameworks);
        if (storedFramework) setSelectedFramework(storedFramework);
      };

      update();
      window.addEventListener("change:displayed-framework", update);
      return () => {
        window.removeEventListener("change:displayed-framework", update);
      };
    }, []);

    return (
      displayedFrameworks.find((f) => f.key == selectedFramework)?.label || ""
    );
  },
);
FrameworkName.displayName = "FrameworkName";

export default FrameworkName;