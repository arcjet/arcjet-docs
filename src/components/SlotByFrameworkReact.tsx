import Skeleton from "@/components/Skeleton";
import type { FrameworkKey } from "@/lib/prefs";
import { getClosestFrameworkMatch } from "@/lib/prefs";
import { extractSlotContent } from "@/lib/utils";
import { displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";

import "@/components/SlotByFramework.scss";

interface Props extends PropsWithChildren {
  inline?: boolean;
  /** Pre-rendered framework slot HTML from the Astro wrapper. */
  frameworkSlots?: Partial<Record<FrameworkKey | "default", string>>;
}

/**
 * Slot By Framework
 *
 * Renders the appropriate slot based on the selected framework.
 *
 * @param inline - Renders the content without a wrapping element.
 */
const SlotByFramework = ({ inline, frameworkSlots, ...props }: Props) => {
  const $displayedFramework = useStore(displayedFramework);

  // The selected framework
  const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>();

  useEffect(() => {
    let framework = $displayedFramework;
    const slotKeys = Object.entries(frameworkSlots ?? {})
      .filter(([key, html]) => key !== "default" && !!html)
      .map(([key]) => key as FrameworkKey);

    if (
      framework &&
      slotKeys.length > 0 &&
      !frameworkSlots?.[framework]
    ) {
      framework = getClosestFrameworkMatch(framework, slotKeys);
    }

    setSelectedFramework(framework);
  }, [$displayedFramework, frameworkSlots]);

  const content = useMemo(() => {
    if (!selectedFramework) return null;

    const slottedHtml = frameworkSlots?.[selectedFramework];
    if (slottedHtml) {
      return <span dangerouslySetInnerHTML={{ __html: slottedHtml }} />;
    }

    return (
      <>
        {extractSlotContent(props, selectedFramework)}
        {props.children}
      </>
    );
  }, [frameworkSlots, props, selectedFramework]);

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
