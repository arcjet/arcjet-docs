import type { CSSProperties, ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

import styles from "./Skeleton.module.scss";

interface Props extends HTMLProps<HTMLSpanElement> {
  elevation?: 1 | 2 | 3;
  appearance?: "Fade";
  radius?: number;
  inline?: boolean;
}

/**
 * Skeleton
 *
 * Shows a loading skeleton.
 *
 * @param elevation Appearance based on desired layout hirerachy position: 1 | 2 | 3.
 * @param radius The skeleton corner radius.
 * @param appearance Visual appearance option.
 * @param inline Shows the element inline.
 *
 */
const Skeleton = forwardRef(
  (
    {
      elevation = 1,
      appearance,
      radius = 2,
      inline,
      className,
      style,
      children,
      ...props
    }: Props,
    ref: ForwardedRef<HTMLSpanElement>,
  ) => {
    let cls = `Skeleton ${styles.Skeleton}`;
    if (className) cls += " " + className;
    if (elevation == 1) cls += " " + styles.Level1;
    if (elevation == 2) cls += " " + styles.Level2;
    if (elevation == 3) cls += " " + styles.Level3;
    if (appearance) cls += " " + styles[appearance];
    if (inline) cls += " " + styles.Inline;

    return (
      <span
        ref={ref}
        className={cls}
        style={
          { ...style, "--rad": `calc(var(--sp) * ${radius})` } as CSSProperties
        }
        {...props}
      >
        {children}
      </span>
    );
  },
);
Skeleton.displayName = "Skeleton";

export default Skeleton;
