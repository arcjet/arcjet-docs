import type { FrameworkKey } from "@/lib/prefs";
import { defaultSelectedFramework } from "@/lib/prefs";
import { kebabToCamel } from "@/lib/utils";
import { displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useState } from "react";

/**
 * Text By Framework
 *
 * Renders the appropriate text based on the selected framework.
 */
const TextByFramework = forwardRef(
  ({ ...props }: PropsWithChildren, ref: ForwardedRef<HTMLElement>) => {
    const $displayedFramework = useStore(displayedFramework);

    // The selected framework
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>(
      defaultSelectedFramework,
    );

    useEffect(() => {
      setSelectedFramework($displayedFramework);
    }, [$displayedFramework]);

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
