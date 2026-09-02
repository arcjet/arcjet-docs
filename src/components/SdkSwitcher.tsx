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
import {
  moveActiveIndex,
  TYPEAHEAD_RESET_MS,
  typeaheadIndex,
} from "@/lib/sdk-switcher-keyboard";
import { displayedFramework } from "@/store";
import { useStore } from "@nanostores/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

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

function optionDomId(listId: string, optionId: string): string {
  return `${listId}-option-${optionId.replaceAll("+", "-")}`;
}

/**
 * Custom SDK popover used on SDK routes and hub pages.
 *
 * Implements the WAI-ARIA select-only combobox pattern so keyboard use
 * matches a native `<select>`: arrows, Home/End, typeahead, Enter to
 * choose, and Escape to dismiss. Focus stays on the button.
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
  const reactId = useId();
  const labelId = `sdk-switcher-label-${reactId}`;
  const buttonId = `sdk-switcher-button-${reactId}`;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typeaheadQuery = useRef("");
  const typeaheadTimer = useRef<number>(0);
  const pendingActiveIndex = useRef<number | null>(null);

  const currentIndex = Math.max(
    0,
    options.findIndex((option) => option.id === current?.id),
  );
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const activeIndexRef = useRef(currentIndex);

  const labels = useMemo(
    () => options.map((option) => option.label),
    [options],
  );

  const clearTypeahead = useCallback(() => {
    window.clearTimeout(typeaheadTimer.current);
    typeaheadQuery.current = "";
  }, []);

  const applyTypeahead = useCallback(
    (character: string) => {
      window.clearTimeout(typeaheadTimer.current);
      typeaheadQuery.current += character;
      const nextIndex = typeaheadIndex(
        labels,
        activeIndexRef.current,
        typeaheadQuery.current,
      );
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      typeaheadTimer.current = window.setTimeout(
        clearTypeahead,
        TYPEAHEAD_RESET_MS,
      );
    },
    [clearTypeahead, labels],
  );

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const onToggle = (event: Event) => {
      const toggle = event as ToggleEvent;
      const isOpen = toggle.newState === "open";
      openRef.current = isOpen;
      setOpen(isOpen);
      if (isOpen) {
        const pending = pendingActiveIndex.current;
        pendingActiveIndex.current = null;
        const nextIndex =
          pending ??
          Math.max(
            0,
            options.findIndex((option) => option.id === current?.id),
          );
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
        requestAnimationFrame(() => buttonRef.current?.focus());
      } else {
        clearTypeahead();
      }
    };

    menu.addEventListener("toggle", onToggle);
    return () => menu.removeEventListener("toggle", onToggle);
  }, [clearTypeahead, current?.id, options]);

  useEffect(() => {
    if (!open) return;
    const active = menuRef.current?.querySelector<HTMLElement>(
      `[data-option-index="${activeIndex}"]`,
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  useEffect(() => {
    return () => window.clearTimeout(typeaheadTimer.current);
  }, []);

  const openMenu = useCallback(() => {
    openRef.current = true;
    menuRef.current?.showPopover();
  }, []);

  const closeMenu = useCallback(() => {
    openRef.current = false;
    menuRef.current?.hidePopover();
  }, []);

  const activateIndex = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      closeMenu();
      window.location.assign(option.href);
    },
    [closeMenu, options],
  );

  const onButtonKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const printable =
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key !== " ";

      if (!openRef.current) {
        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "Home" ||
          event.key === "End" ||
          (event.altKey && event.key === "ArrowDown")
        ) {
          event.preventDefault();
          if (event.key === "ArrowUp" || event.key === "End") {
            pendingActiveIndex.current = options.length - 1;
          } else if (event.key === "Home") {
            pendingActiveIndex.current = 0;
          } else {
            pendingActiveIndex.current = currentIndex;
          }
          event.stopPropagation();
          openMenu();
        } else if (printable) {
          event.preventDefault();
          event.stopPropagation();
          typeaheadQuery.current = event.key;
          pendingActiveIndex.current = typeaheadIndex(
            labels,
            currentIndex,
            event.key,
          );
          window.clearTimeout(typeaheadTimer.current);
          typeaheadTimer.current = window.setTimeout(
            clearTypeahead,
            TYPEAHEAD_RESET_MS,
          );
          openMenu();
        }
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          event.stopPropagation();
          setActiveIndex((index) => {
            const next = moveActiveIndex(options.length, index, 1);
            activeIndexRef.current = next;
            return next;
          });
          break;
        case "ArrowUp":
          event.preventDefault();
          event.stopPropagation();
          setActiveIndex((index) => {
            const next = moveActiveIndex(options.length, index, -1);
            activeIndexRef.current = next;
            return next;
          });
          break;
        case "Home":
          event.preventDefault();
          event.stopPropagation();
          activeIndexRef.current = 0;
          setActiveIndex(0);
          break;
        case "End":
          event.preventDefault();
          event.stopPropagation();
          activeIndexRef.current = options.length - 1;
          setActiveIndex(options.length - 1);
          break;
        case "PageDown":
          event.preventDefault();
          event.stopPropagation();
          setActiveIndex((index) => {
            const next = moveActiveIndex(options.length, index, 10);
            activeIndexRef.current = next;
            return next;
          });
          break;
        case "PageUp":
          event.preventDefault();
          event.stopPropagation();
          setActiveIndex((index) => {
            const next = moveActiveIndex(options.length, index, -10);
            activeIndexRef.current = next;
            return next;
          });
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          event.stopPropagation();
          activateIndex(activeIndexRef.current);
          break;
        case "Escape":
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
          break;
        case "Tab":
          closeMenu();
          break;
        default:
          if (printable) {
            event.preventDefault();
            event.stopPropagation();
            applyTypeahead(event.key);
          }
      }
    },
    [
      activateIndex,
      applyTypeahead,
      clearTypeahead,
      closeMenu,
      currentIndex,
      labels,
      openMenu,
      options.length,
    ],
  );

  if (options.length === 0) return null;

  const activeOption = options[activeIndex];
  const activeId = activeOption
    ? optionDomId(popoverId, activeOption.id)
    : undefined;

  return (
    <div
      className={variant === "mobile" ? styles.mobile : styles.desktop}
      data-sdk-switcher={variant}
    >
      {variant === "desktop" ? (
        <h2 className={styles.label} id={labelId}>
          SDK
        </h2>
      ) : null}
      <button
        ref={buttonRef}
        id={buttonId}
        className={`${styles.toggle} ${toggleClass}`}
        popoverTarget={popoverId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-haspopup="listbox"
        aria-activedescendant={open ? activeId : undefined}
        aria-labelledby={
          variant === "desktop" ? `${labelId} ${buttonId}` : undefined
        }
        aria-label={
          variant === "mobile" ? `SDK, ${buttonLabel}` : undefined
        }
        onKeyDown={onButtonKeyDown}
      >
        {current ? (
          <SdkIcon sdk={current.sdkKey} variant={current.variantKey} />
        ) : null}
        {buttonLabel}
        {variant === "desktop" ? (
          <SelectChevron className={styles.chevron} aria-hidden="true" />
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
      <div
        ref={menuRef}
        id={popoverId}
        popover="auto"
        className={styles.menu}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={variant === "desktop" ? labelId : buttonId}
        onKeyDown={onButtonKeyDown}
      >
        {options.map((option, index) => {
          const isCurrent = current?.id === option.id;
          const isActive = index === activeIndex;
          return (
            <a
              key={option.id}
              id={optionDomId(popoverId, option.id)}
              role="option"
              aria-selected={isCurrent}
              aria-current={isCurrent ? "page" : undefined}
              data-active={isActive ? "true" : undefined}
              data-option-index={index}
              tabIndex={-1}
              href={option.href}
            >
              <SdkIcon sdk={option.sdkKey} variant={option.variantKey} />
              {option.label}
              {isCurrent ? <CheckIcon className={styles.check} /> : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default SdkSwitcher;
