import Skeleton from "@/components/Skeleton";
import type { FrameworkKey } from "@/lib/prefs";
import { extractSlotContent } from "@/lib/utils";
import { displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";

import "@/components/SlotByFramework.scss";

interface Props extends PropsWithChildren {
  inline?: boolean;
}

/**
 * Slot By Framework
 *
 * Renders the appropriate slot based on the selected framework.
 *
 * @param inline - Renders the content without a wrapping element.
 */
const SlotByFramework = ({ inline, ...props }: Props) => {
  const $displayedFramework = useStore(displayedFramework);

  // The selected framework
  const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>();

  useEffect(() => {
    setSelectedFramework($displayedFramework);
  }, [$displayedFramework]);

  const content = useMemo(() => {
    return (
      <>
        {selectedFramework && extractSlotContent(props, selectedFramework)}
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
    <Skeleton radius={1} appearance="Fade" />
  ) : inline ? (
    content
  ) : (
    <div className="SlotByFramework">{content}</div>
  );
};
SlotByFramework.displayName = "SlotByFramework";

export default SlotByFramework;
