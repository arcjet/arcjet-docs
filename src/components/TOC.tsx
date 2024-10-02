import useElementInView from "@/effects/useElementInView";
import type { FrameworkKey } from "@/lib/prefs";
import { defaultSelectedFramework } from "@/lib/prefs";
import { displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { CollectionEntry } from "astro:content"; // Import CollectionEntry from astro:content
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";

import styles from "./TOC.module.scss";

interface Props extends PropsWithChildren {
  astroEntry: any;
}

/**
 * Arcjet Table Of Contents
 *
 * Renders the page TOC according to custom options like SDK framework, etc. .
 *
 * @param astroEntry - The Astro.props.entry
 */
const TOC = forwardRef(
  ({ astroEntry, ...props }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const $displayedFramework = useStore(displayedFramework);

    const cls = "TOC " + styles.TOC;

    const [selectedEntry, setSelectedEntry] = useState<string>("");

    const [toc] = useState<CollectionEntry<"docs">["data"]["ajToc"]>(
      astroEntry.data.ajToc,
    );

    // The selected framework
    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>(
      defaultSelectedFramework,
    );

    useEffect(() => {
      setSelectedFramework($displayedFramework);
    }, [$displayedFramework]);

    // TODO: Make recursive 3+ levels?

    const onEntryClick = useCallback(
      (anchor: string) => {
        setSelectedEntry(anchor);
      },
      [selectedEntry],
    );

    return (
      <div className={cls} ref={ref} {...props}>
        <h2>On this page</h2>
        <ul>
          {toc.map((entry: (typeof toc)[number], idx: number) => {
            if (
              entry.framework &&
              selectedFramework != entry.framework &&
              !entry.framework.includes(selectedFramework)
            )
              return;

            return (
              <li key={`toc-entry-l1-${idx}`}>
                <TOCLink
                  entry={entry}
                  onClick={onEntryClick}
                  selected={entry.anchor == selectedEntry}
                />
                {entry.children && (
                  <ul>
                    {entry.children.map(
                      (childEntry: (typeof toc)[number], idx: number) => {
                        if (
                          childEntry.framework &&
                          selectedFramework != childEntry.framework &&
                          !childEntry.framework.includes(selectedFramework)
                        )
                          return;

                        return (
                          <li key={`toc-entry-l2-${idx}`}>
                            <TOCLink
                              entry={childEntry}
                              onClick={onEntryClick}
                              selected={childEntry.anchor == selectedEntry}
                            />
                          </li>
                        );
                      },
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);
TOC.displayName = "TOC";

export default TOC;

interface TOCLinkProps extends PropsWithChildren {
  entry: CollectionEntry<"docs">["data"]["ajToc"][number];
  onClick: Function;
  selected: boolean;
}

/**
 * Arcjet Table Of Contents Link
 *
 * Renders each TOC link.
 *
 * @param entry - The TOC entry data
 * @param onClick - The click callback
 * @param selected - The selected state
 */
const TOCLink = forwardRef(
  (
    { entry, onClick, selected, ...props }: TOCLinkProps,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => {
    const click = useCallback(
      (anchor: string) => {
        onClick(anchor);
      },
      [selected],
    );

    const [target, isInView] = useElementInView({
      id: entry.anchor,
      options: { root: null, rootMargin: "-10% 0px -75% 0px", threshold: 0 },
    });

    useEffect(() => {
      if (isInView) click(entry.anchor);
    }, [isInView]);

    // TODO: Improve observer threshold

    return (
      <a
        ref={ref}
        className={selected ? styles.Selected : ""}
        href={"#" + entry.anchor}
        onClick={() => click(entry.anchor)}
        {...props}
      >
        {entry.text}
      </a>
    );
  },
);
TOCLink.displayName = "TOCLink";
