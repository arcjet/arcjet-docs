import type { FrameworkKey } from "@/lib/prefs";
import { defaultSelectedFramework } from "@/lib/prefs";
import { availableFrameworks, displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useState } from "react";

/**
 * Framework Name
 *
 * Renders the appropriate framework name based on the selected framework.
 */
const FrameworkName = forwardRef(
  ({ ...props }: PropsWithChildren, ref: ForwardedRef<HTMLElement>) => {
    const $displayedFramework = useStore(displayedFramework);
    const $availableFrameworks = useStore(availableFrameworks);

    // The selected framework
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>(
      defaultSelectedFramework,
    );

    useEffect(() => {
      setSelectedFramework($displayedFramework);
    }, [$displayedFramework]);

    return (
      $availableFrameworks.find((f) => f.key == selectedFramework)?.label || ""
    );
  },
);
FrameworkName.displayName = "FrameworkName";

export default FrameworkName;
