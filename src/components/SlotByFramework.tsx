import Skeleton from "@/components/Skeleton";
import type { FrameworkKey } from "@/lib/prefs";
import { kebabToCamel } from "@/lib/utils";
import { displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useMemo, useState } from "react";

import "@/components/SlotByFramework.scss";

interface Props extends PropsWithChildren {
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
 * @param inline - Renders the content without a wrapping element.
 */
const SlotByFramework = forwardRef(
  ({ inline, ...props }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const $displayedFramework = useStore(displayedFramework);

    // The selected framework
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>();

    useEffect(() => {
      setSelectedFramework($displayedFramework);
    }, [$displayedFramework]);

    const content = useMemo(() => {
      return (
        <>
          {selectedFramework && extractSlot(props, selectedFramework)}
          {props.children}
        </>
      );
    }, [selectedFramework]);

    // Loading handling
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (selectedFramework) setLoading(false);
    }, [selectedFramework]);

    return loading ? (
      <Skeleton radius={1} />
    ) : inline ? (
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
