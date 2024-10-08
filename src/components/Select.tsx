import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef, useCallback, useId, useState } from "react";

import styles from "./Select.module.scss";

interface Props extends HTMLProps<HTMLSelectElement> {}

/**
 * Select
 */
const Select = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<HTMLSelectElement>) => {
    const id = useId();

    let cls = "Select " + styles.Select;

    const [focus, setFocus] = useState(false);
    const handleFocus = useCallback(() => {
      setFocus(true);
    }, []);
    const handleBlur = useCallback(() => {
      setFocus(false);
    }, []);

    let clsWrapper = "SelectWrapper " + styles.SelectWrapper;
    if (className) clsWrapper += " " + className;
    if (focus) clsWrapper += " Focus " + styles.Focus;

    return (
      <label htmlFor={id} className={clsWrapper}>
        <select
          id={id}
          ref={ref}
          className={cls}
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {props.children}
        </select>
      </label>
    );
  },
);
Select.displayName = "Select";

export default Select;
