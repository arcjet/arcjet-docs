import type { FrameworkKey } from "@/lib/prefs";
import { availableFrameworks, defaultFramework } from "@/lib/prefs";
import { getTypedStorage } from "@/lib/utils";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useState } from "react";

interface Props extends PropsWithChildren {}

/**
 * Framework Name
 *
 * Renders the appropriate framework name based on the selected framework.
 */
const FrameworkName = forwardRef(
  ({ ...props }: Props, ref: ForwardedRef<HTMLElement>) => {
    const [selectedFramework, setSelectedFramework] =
      useState<FrameworkKey>(defaultFramework);

    useEffect(() => {
      const update = () => {
        const selected = getTypedStorage("selected-framework");
        setSelectedFramework(selected);
      };

      update();
      window.addEventListener("change:selected-framework", update);
      return () => {
        window.removeEventListener("change:selected-framework", update);
      };
    }, []);

    return (
      availableFrameworks.find((f) => f.key == selectedFramework)?.label || ""
    );
  },
);
FrameworkName.displayName = "FrameworkName";

export default FrameworkName;
