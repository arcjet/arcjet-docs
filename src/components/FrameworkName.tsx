import Skeleton from "@/components/Skeleton";
import type { FrameworkKey } from "@/lib/prefs";
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
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>();

    useEffect(() => {
      setSelectedFramework($displayedFramework);
    }, [$displayedFramework]);

    // Loading handling
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (selectedFramework) setLoading(false);
    }, [selectedFramework]);

    return loading ? (
      <Skeleton as="span" radius={0.5} inline />
    ) : (
      $availableFrameworks.find((f) => f.key == selectedFramework)?.label || ""
    );
  },
);
FrameworkName.displayName = "FrameworkName";

export default FrameworkName;
