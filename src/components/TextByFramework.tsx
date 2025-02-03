import type { FrameworkKey } from "@/lib/prefs";
import { getClosestFrameworkMatch, getStoredFramework } from "@/lib/prefs";
import { extractSlotContent } from "@/lib/utils";
import { availableFrameworks, displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useMemo, useState } from "react";
import Skeleton from "./Skeleton";

// The framework mapped texts
type PropsWithFrameworks = {
  [key in FrameworkKey]: string;
};

// The default text
type PropsWithDefault = {
  default?: string;
  onChangeFramework?: (framework: FrameworkKey) => void;
};

export type Props = PropsWithDefault & PropsWithFrameworks & PropsWithChildren;

/**
 * Text By Framework
 *
 * Renders the appropriate text based on the selected framework.
 */
const TextByFramework = forwardRef(
  (
    { onChangeFramework, default: defaultText, ...props }: Props,
    ref: ForwardedRef<HTMLElement>,
  ) => {
    const $displayedFramework = useStore(displayedFramework);
    const $availableFrameworks = useStore(availableFrameworks);

    // The selected framework
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>();

    // Sync with local storage value or displayed framework
    useEffect(() => {
      let framework: FrameworkKey | undefined = undefined;

      if (defaultText) {
        // When a default is provided, set the framework
        // only if a preference is stored.
        const storedFramework = getStoredFramework();
        if (storedFramework) framework = storedFramework;
      } else {
        // Else set it from the currently displayed framework
        framework = $displayedFramework;
      }

      if (framework) {
        // Not all stored frameworks may be in the list currently,
        // so we try to return the closest match
        const match = getClosestFrameworkMatch(
          framework,
          $availableFrameworks.map((f) => f.key),
        );

        setSelectedFramework(match);
        if (onChangeFramework) onChangeFramework(match);
      }
    }, [
      $displayedFramework,
      $availableFrameworks,
      onChangeFramework,
      defaultText,
    ]);

    const content = useMemo(() => {
      return (
        <>
          {selectedFramework
            ? extractSlotContent(props, selectedFramework)
            : defaultText}
          {props.children}
        </>
      );
    }, [selectedFramework, defaultText]);

    // Loading handling
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (selectedFramework || defaultText !== undefined) setLoading(false);
    }, [selectedFramework, defaultText]);

    return loading ? <Skeleton as="span" radius={0.5} inline /> : content;
  },
);
TextByFramework.displayName = "TextByFramework";

export default TextByFramework;
