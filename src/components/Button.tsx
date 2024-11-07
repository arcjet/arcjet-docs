import type { Color, Size } from "@/lib/ui";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
  Ref,
} from "react";
import { forwardRef, useCallback, useMemo } from "react";

import styles from "./Button.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

type SharedProps = {
  appearance?: "text" | "default";
  level?: Color;
  size?: Size;
  decoratorLeft?: ReactNode;
  decoratorRight?: ReactNode;
};

type Props = SharedProps &
  (
    | ({ as?: "button" } & ButtonProps)
    | ({ as: "link"; href: string } & AnchorProps)
  );

/**
 * Button
 */
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  (
    {
      as,
      appearance = "default",
      level = "primary",
      size = "md",
      decoratorLeft,
      decoratorRight,
      className,
      onClick,
      ...props
    }: Props,
    ref,
  ) => {
    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement> & MouseEvent<HTMLAnchorElement>) => {
        onClick && onClick(e);
      },
      [],
    );

    let cls = "Button " + styles.Button;
    if (className) cls += " " + className;
    if (appearance)
      cls +=
        " Appearance-" + appearance + " " + styles["Appearance-" + appearance];
    if (level) cls += " Level-" + level + " " + styles["Level-" + level];
    if (size) cls += " Size-" + size + " " + styles["Size-" + size];

    const content = useMemo(() => {
      return (
        <>
          {decoratorLeft && (
            <span className={styles.DecoratorLeft}>{decoratorLeft}</span>
          )}
          {props.children}
          {decoratorRight && (
            <span className={styles.DecoratorLeft}>{decoratorRight}</span>
          )}
        </>
      );
    }, []);

    if (as === "link") {
      const { href, ...aProps } = props as AnchorProps;
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={cls}
          onClick={handleClick}
          {...aProps}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        className={cls}
        onClick={handleClick}
        {...(props as ButtonProps)}
      >
        {content}
      </button>
    );
  },
);
Button.displayName = "Button";

export default Button;
