import FrameworkSwitcher from "@/components/FrameworkSwitcher";
import type { TocNode } from "@/content.config";
import useElementInView from "@/effects/useElementInView";
import type { FrameworkKey } from "@/lib/prefs";
import { displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { CollectionEntry } from "astro:content"; // Import CollectionEntry from astro:content
import { onSet } from "nanostores";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";

import styles from "./TOC.module.scss";

interface Props extends PropsWithChildren {
  astroEntry: any;
}

/**
 * Arcjet Table Of Contents
 *
 * Renders the page TOC according to custom options like SDK framework, etc. .
 *
 * @param astroEntry - The Astro.locals.starlightRoute.entry
 */
const TOC = forwardRef(
  ({ astroEntry, ...props }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const cls = "TOC " + styles.TOC;

    // The toc data
    const [toc] = useState<CollectionEntry<"docs">["data"]["ajToc"]>(
      astroEntry.data.ajToc,
    );

    // Managet the selected framework
    const $displayedFramework = useStore(displayedFramework);

    const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>();

    useEffect(() => {
      setSelectedFramework($displayedFramework);
    }, [$displayedFramework]);

    useEffect(() => {
      onSet(displayedFramework, ({ newValue }) => {
        setSelectedFramework(newValue);
      });
    }, []);

    // The selected TOC link
    const [selectedEntry, setSelectedEntry] = useState<TocNode>();

    const onEntryClick = useCallback((entry: TocNode) => {
      setSelectedEntry(entry);
    }, []);

    // Renders list items recursively
    const recursiveRenderTocList = useCallback(
      (toc: TocNode[], depth = 0) => {
        return (
          selectedFramework && (
            <ul style={{ "--depth": depth } as React.CSSProperties}>
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
                      selected={entry.anchor == selectedEntry?.anchor}
                    />
                    {entry.children &&
                      recursiveRenderTocList(entry.children, depth + 1)}
                  </li>
                );
              })}
            </ul>
          )
        );
      },
      [selectedFramework, selectedEntry],
    );

    // Render framework switcher
    const switcher = useMemo(() => {
      return (
        <div className={styles.Switcher}>
          <div className="toc-label sl-hidden lg:sl-block">Framework</div>
          <FrameworkSwitcher frameworks={astroEntry.data.frameworks} />
        </div>
      );
    }, [astroEntry.data.frameworks]);

    // Mobile drodpwon state
    const [mobileDropdownVisible, setMobileDropdownVisible] =
      useState<boolean>(false);

    // Loading handling
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (selectedFramework) setLoading(false);
    }, [selectedFramework]);

    /**
     * Reproduce first load scroll to anchor.
     * The native behaviour doesn't work due
     * to the content being rendered after load.
     */
    useEffect(() => {
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        let element = document.getElementById(targetId);

        const scroll = () => {
          if (element) {
            // Find the element position (with a pad)
            let elementPosition =
              element.getBoundingClientRect().top +
              window.scrollY -
              window.innerHeight * 0.075;

            // Scroll
            window.scrollTo({
              top: elementPosition,
              behavior: "smooth",
            });
          }
        };

        // Track document changes to find the element.
        const observer = new MutationObserver(() => {
          element = document.getElementById(targetId);
          scroll();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        scroll();
      }
    }, []);

    return (
      !loading && (
        <div className={cls} ref={ref} {...props}>
          <div className={styles.NavDesktop + " sl-hidden lg:sl-block"}>
            {switcher}
            <div
              className={
                styles.OnThisPageLabel + " toc-label sl-hidden lg:sl-block"
              }
            >
              Contents
            </div>
            {recursiveRenderTocList(toc)}
          </div>
          <div className={styles.NavMobile + " lg:sl-hidden"}>
            <summary className="sl-flex">
              {switcher}
              <div
                className={
                  "toggle sl-flex" + (mobileDropdownVisible ? " open" : "")
                }
                onClick={() => setMobileDropdownVisible(!mobileDropdownVisible)}
              >
                Contents
                <svg
                  aria-hidden="true"
                  className="caret"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="m14.83 11.29-4.24-4.24a1 1 0 1 0-1.42 1.41L12.71 12l-3.54 3.54a1 1 0 0 0 0 1.41 1 1 0 0 0 .71.29 1 1 0 0 0 .71-.29l4.24-4.24a1.002 1.002 0 0 0 0-1.42Z"></path>
                </svg>
              </div>
              <span className="display-current">{selectedEntry?.text}</span>
            </summary>
            {mobileDropdownVisible && (
              <div className="dropdown">
                <ul className="isMobile">{recursiveRenderTocList(toc)}</ul>
              </div>
            )}
          </div>
        </div>
      )
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
      (entry: TocNode) => {
        onClick(entry);
      },
      [selected],
    );

    const [target, isInView] = useElementInView({
      id: entry.anchor,
      options: { root: null, rootMargin: "-5% 0px -90% 0px", threshold: 0 },
    });

    useEffect(() => {
      if (isInView) click(entry);
    }, [isInView]);

    return (
      <a
        ref={ref}
        className={selected ? styles.Selected : ""}
        href={"#" + entry.anchor}
        onClick={() => click({ ...entry })}
        {...props}
      >
        {entry.text}
      </a>
    );
  },
);
TOCLink.displayName = "TOCLink";
