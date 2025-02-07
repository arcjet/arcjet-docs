import type { Props as TextByFrameworkProps } from "@/components/TextByFramework";
import TextByFramework from "@/components/TextByFramework";
import type { FrameworkKey } from "@/lib/prefs";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";

type Props = TextByFrameworkProps & PropsWithChildren;

const documentTitleSuffix = " | Arcjet Docs";

/**
 * Title By Framework
 *
 * Renders the appropriate title based on the selected framework.
 */
const TitleByFramework = forwardRef(
  (
    { default: defaultTitle, ...props }: Props,
    ref: ForwardedRef<HTMLElement>,
  ) => {
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>();
    const [initialTitle, setInitialTitle] = useState<string>();

    const onChangeFramework = useCallback((framework: FrameworkKey) => {
      setSelectedFramework(framework);
    }, []);

    useEffect(() => {
      // Store initial title for cleanup
      if (!initialTitle) setInitialTitle(document.title);

      // Set the document title
      if (selectedFramework) {
        document.title = props[selectedFramework] + documentTitleSuffix;
      } else if (defaultTitle) {
        document.title = defaultTitle + documentTitleSuffix;
      }

      return () => {
        // cleanup
        if (initialTitle) document.title = initialTitle;
      };
    }, [selectedFramework, defaultTitle]);

    return (
      <h1 id="_top">
        <TextByFramework
          default={defaultTitle}
          onChangeFramework={onChangeFramework}
          {...props}
        />
      </h1>
    );
  },
);
TitleByFramework.displayName = "TitleByFramework";

export default TitleByFramework;
