import { SelectChevron } from "@/components/icons/SelectChevron";
import { SdkIcon } from "@/components/SdkIcon";
import type { FrameworkKey } from "@/lib/prefs";
import {
  isSdkSwitcherOptionCurrent,
  sdkDisplayLabelFromPathname,
  sdkFromPathname,
  sdkSwitcherOptionForLegacyKey,
  sdkSwitcherOptions,
  type SdkSwitcherOption,
} from "@/lib/sdk";
import { displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import { useMemo } from "react";

import styles from "./SdkSwitcher.module.scss";

export type SdkSwitcherProps = {
  pathname: string;
  pageFrameworks?: FrameworkKey[];
  variant?: "desktop" | "mobile";
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 14"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10.914 4.206a.583.583 0 0 0-.828 0L5.74 8.557 3.914 6.726a.596.596 0 0 0-.828.857l2.24 2.24a.583.583 0 0 0 .828 0l4.76-4.76a.583.583 0 0 0 0-.857Z" />
    </svg>
  );
}

function currentOption(
  pathname: string,
  options: readonly SdkSwitcherOption[],
  displayed?: FrameworkKey,
): SdkSwitcherOption | undefined {
  const fromPath = options.find((option) =>
    isSdkSwitcherOptionCurrent(pathname, option),
  );
  if (fromPath) return fromPath;

  if (sdkFromPathname(pathname) || !displayed) {
    return undefined;
  }

  return sdkSwitcherOptionForLegacyKey(options, displayed);
}

/**
 * Custom SDK popover used on SDK routes and hub pages.
 *
 * Native popover + max-height so the list scrolls on short viewports without
 * scrolling the page. Every option renders an icon.
 */
export function SdkSwitcher({
  pathname,
  pageFrameworks,
  variant = "desktop",
}: SdkSwitcherProps) {
  const $displayedFramework = useStore(displayedFramework);
  const options = useMemo(
    () => sdkSwitcherOptions(pathname, pageFrameworks),
    [pathname, pageFrameworks],
  );
  const current = currentOption(pathname, options, $displayedFramework);
  const buttonLabel =
    current?.label ?? sdkDisplayLabelFromPathname(pathname) ?? "SDK";
  const popoverId = variant === "mobile" ? "mtoc-sdk" : "toc-sdk";
  const toggleClass =
    variant === "mobile" ? "mtoc-sdk-toggle" : "toc-toggle";

  if (options.length === 0) return null;

  return (
    <div
      className={variant === "mobile" ? styles.mobile : styles.desktop}
      data-sdk-switcher={variant}
    >
      {variant === "desktop" ? (
        <h2 className={styles.label} id="sdk-switcher-label">
          SDK
        </h2>
      ) : null}
      <button
        className={`${styles.toggle} ${toggleClass}`}
        popoverTarget={popoverId}
        type="button"
        aria-labelledby={
          variant === "desktop" ? "sdk-switcher-label" : undefined
        }
        aria-label={variant === "mobile" ? "SDK" : undefined}
      >
        {current ? (
          <SdkIcon sdk={current.sdkKey} variant={current.variantKey} />
        ) : null}
        {buttonLabel}
        {variant === "desktop" ? (
          <SelectChevron className={styles.chevron} />
        ) : (
          <svg
            aria-hidden="true"
            className={styles.chevron}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="m14.83 11.29-4.24-4.24a1 1 0 1 0-1.42 1.41L12.71 12l-3.54 3.54a1 1 0 0 0 0 1.41 1 1 0 0 0 .71.29 1 1 0 0 0 .71-.29l4.24-4.24a1.002 1.002 0 0 0 0-1.42Z" />
          </svg>
        )}
      </button>
      <nav id={popoverId} popover="" className={styles.menu}>
        <ul>
          {options.map((option) => {
            const isCurrent = current?.id === option.id;
            return (
              <li key={option.id}>
                <a
                  aria-current={isCurrent ? "true" : undefined}
                  href={option.href}
                >
                  <SdkIcon sdk={option.sdkKey} variant={option.variantKey} />
                  {option.label}
                  {isCurrent ? <CheckIcon className={styles.check} /> : null}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default SdkSwitcher;
