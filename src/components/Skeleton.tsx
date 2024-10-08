import type { ComponentPropsWithRef, CSSProperties, ElementType } from "react";
import { forwardRef } from "react";

import styles from "./Skeleton.module.scss";

type Props<T extends ElementType> = {
  as?: T;
  elevation?: 1 | 2 | 3;
  appearance?: "Fade";
  radius?: number;
  inline: boolean;
} & ComponentPropsWithRef<T>;

/**
 * Skeleton
 *
 * Shows a loading skeleton.
 *
 * @param as - Pass an optional html element type, eg: "span" for an inline loading skeleton.
 */
const Skeleton = forwardRef(
  <T extends ElementType = "div">(
    {
      as: Element = "div",
      elevation = 1,
      appearance,
      radius = 2,
      className,
      style,
      children,
      inline,
      ...props
    }: Props<T>,
    ref: React.Ref<Element>,
  ) => {
    let cls = `Skeleton ${styles.Skeleton}`;
    if (className) cls += " " + className;
    if (elevation == 1) cls += " " + styles.Level1;
    if (elevation == 2) cls += " " + styles.Level2;
    if (elevation == 3) cls += " " + styles.Level3;
    if (appearance) cls += " " + styles[appearance];
    if (inline) cls += " " + styles.Inline;

    return (
      <Element
        ref={ref}
        className={cls}
        style={
          { ...style, "--rad": `calc(var(--sp) * ${radius})` } as CSSProperties
        }
        {...props}
      >
        {children}
      </Element>
    );
  },
);
Skeleton.displayName = "Skeleton";

export default Skeleton;
