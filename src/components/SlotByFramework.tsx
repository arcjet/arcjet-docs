import type { FrameworkKey } from "@/lib/prefs";
import {
  defaultSelectedFramework,
  getStoredDisplayedFramework,
} from "@/lib/prefs";
import { kebabToCamel } from "@/lib/utils";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useMemo, useState } from "react";

import "@/components/SlotByFramework.scss";

interface Props extends PropsWithChildren {
  frameworks?: FrameworkKey[];
  inline?: boolean;
}

// Retrieves the slot content from props with erratic kebab-case/camelCase naming
const extractSlot = (props: any, selectedFramework: FrameworkKey) => {
  return (
    (props as any)[selectedFramework] ||
    (props as any)[kebabToCamel(selectedFramework)]
  );
};

/**
 * Slot By Framework
 *
 * Renders the appropriate slot based on the selected framework.
 * Slots are received as props named as the available frameworks,
 * however they are occasionally/erratically converted to camelCase (next-js > nextJs,
 * see: https://docs.astro.build/en/guides/framework-components/#passing-children-to-framework-components)
 * so we parse them with the "extractSlot" function to consume them.
 *
 * @param frameworks - The list of framework options to display.
 * @param inline - Renders the content without a wrapping element.
 */
const SlotByFramework = forwardRef(
  (
    { frameworks, inline, ...props }: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>(
      defaultSelectedFramework,
    );

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

    const content = useMemo(() => {
      return (
        <>
          {extractSlot(props, selectedFramework)}
          {props.children}
        </>
      );
    }, [selectedFramework]);

    return inline ? (
      content
    ) : (
      <div ref={ref} className="SlotByFramework">
        {content}
      </div>
    );
  },
);
SlotByFramework.displayName = "SlotByFramework";

export default SlotByFramework;
