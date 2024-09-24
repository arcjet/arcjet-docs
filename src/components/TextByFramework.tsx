import type { FrameworkKey } from "@/lib/prefs";
import {
  defaultSelectedFramework,
  getStoredDisplayedFramework,
} from "@/lib/prefs";
import { kebabToCamel } from "@/lib/utils";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useState } from "react";

/**
 * Text By Framework
 *
 * Renders the appropriate text based on the selected framework.
 */
const TextByFramework = forwardRef(
  ({ ...props }: PropsWithChildren, ref: ForwardedRef<HTMLElement>) => {
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
      <>
        {(props as any)[kebabToCamel(selectedFramework)]}
        {props.children}
      </>
    );
  },
);
TextByFramework.displayName = "TextByFramework";

export default TextByFramework;
