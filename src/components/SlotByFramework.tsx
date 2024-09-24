import type { FrameworkKey } from "@/lib/prefs";
import {
  defaultSelectedFramework,
  getStoredDisplayedFramework,
} from "@/lib/prefs";
import { kebabToCamel } from "@/lib/utils";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useState } from "react";

import "@/components/SlotByFramework.scss";

/**
 * Slot By Framework
 *
 * Renders the appropriate slot based on the selected framework.
 */
const SlotByFramework = forwardRef(
  ({ ...props }: PropsWithChildren, ref: ForwardedRef<HTMLDivElement>) => {
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>(
      defaultSelectedFramework,
    );

    useEffect(() => {
      const update = () => {
        const storedFramework = getStoredDisplayedFramework();
        if (storedFramework) setSelectedFramework(storedFramework);
      };

      update();
      window.addEventListener("change:displayed-framework", update);
      return () => {
        window.removeEventListener("change:displayed-framework", update);
      };
    }, []);

    return (
      <div ref={ref} className="SlotByFramework" {...props}>
        {(props as any)[kebabToCamel(selectedFramework)]}
        {props.children}
      </div>
    );
  },
);
SlotByFramework.displayName = "SlotByFramework";

export default SlotByFramework;
