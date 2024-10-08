import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

import styles from "./Select.module.scss";

interface Props extends HTMLProps<HTMLSelectElement> {}

/**
 * Select
 */
const Select = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<HTMLSelectElement>) => {
    let cls = "Select " + styles.Select;
    if (className) cls += " " + className;

    return (
      <select ref={ref} className={cls} {...props}>
        {props.children}
      </select>
    );
  },
);
Select.displayName = "Select";

export default Select;
