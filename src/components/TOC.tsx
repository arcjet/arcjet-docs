import useElementInView from "@/effects/useElementInView";
import type { FrameworkKey } from "@/lib/prefs";
import {
  defaultSelectedFramework,
  getStoredDisplayedFramework,
} from "@/lib/prefs";
import type { CollectionEntry } from "astro:content"; // Import CollectionEntry from astro:content
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";

import styles from "./TOC.module.scss";

interface Props extends PropsWithChildren {
  astro: any;
}

/**
 * Arcjet Table Of Contents
 *
 * Renders the page TOC according to custom options like SDK framework, etc. .
 *
 * @param astro - The Astro.props
 */
const TOC = forwardRef(
  ({ astro, ...props }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const cls = "TOC " + styles.TOC;

    const [selectedEntry, setSelectedEntry] = useState<string>("");

    const [toc] = useState<CollectionEntry<"docs">["data"]["ajToc"]>(
      astro.entry.data.ajToc,
    );

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

    // TODO: Correct TOC types in schema
    // TODO: Make recursive?

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
