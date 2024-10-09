import { SelectChevron } from "@/components/icons/SelectChevron";
import type { Color, Option, Size } from "@/lib/ui";
import type { ChangeEvent, FocusEvent, ForwardedRef, HTMLProps } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import styles from "./Select.module.scss";

const triggerTextFromOptions = (options: Option[]) => {
  return Array.from(options).reduce(
    (str, opt) => (str += (str != "" ? ", " : "") + opt.value),
    "",
  );
};

export interface Props extends HTMLProps<HTMLSelectElement> {
  appearance?: "discreet" | "default";
  level?: Color;
  trigger?: {
    size?: Size;
  };
  dropdown?: {
    size?: Size;
  };
}

/**
 * Select
 */
const Select = forwardRef(
  (
    {
      appearance = "default",
      level = "primary",
      trigger = { size: "md" },
      dropdown,
      className,
      onChange,
      onFocus,
      onBlur,
      ...props
    }: Props,
    ref: ForwardedRef<HTMLSelectElement>,
  ) => {
    const id = useId();

    // Fix height to rendered max rows
    const elRef = useRef<HTMLSelectElement>(null);
    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => elRef.current,
    );

    const [focus, setFocus] = useState(false);
    const [selected, setSelected] = useState<Option[]>();

    const handleFocus = useCallback((e: FocusEvent<HTMLSelectElement>) => {
      setFocus(true);
      onFocus && onFocus(e);
    }, []);

    const handleBlur = useCallback((e: FocusEvent<HTMLSelectElement>) => {
      setFocus(false);
      onBlur && onBlur(e);
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
      setSelected(
        Array.from(e.target.selectedOptions).map((opt) => ({
          key: opt.value,
          value: opt.innerHTML,
        })),
      );

      onChange && onChange(e);
    }, []);

    // Set initial option
    useEffect(() => {
      if (elRef.current) {
        setSelected(
          Array.from(elRef.current.selectedOptions).map((opt) => ({
            key: opt.value,
            value: opt.innerHTML,
          })),
        );
      }
    }, [elRef]);

    let clsWrapper = "SelectWrapper " + styles.SelectWrapper;
    if (className) clsWrapper += " " + className;
    if (appearance)
      clsWrapper +=
        " Appearance-" + appearance + " " + styles["Appearance-" + appearance];
    if (level) clsWrapper += " Level-" + level + " " + styles["Level-" + level];
    if (focus) clsWrapper += " Focus " + styles.Focus;
    if (trigger.size)
      clsWrapper +=
        " Size-" + trigger.size + " " + styles["Size-" + trigger.size];

    let cls = "Select " + styles.Select;

    return (
      <label htmlFor={id} className={clsWrapper}>
        <span className={styles.TriggerText}>
          {selected && triggerTextFromOptions(selected)}
        </span>
        <select
          id={id}
          ref={elRef}
          className={cls}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        >
          {props.children}
        </select>
        <SelectChevron className={styles.IndicatorDropdown} />
      </label>
    );
  },
);
Select.displayName = "Select";

export default Select;
