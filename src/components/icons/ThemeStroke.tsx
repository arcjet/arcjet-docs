import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const ThemeStroke = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-theme-stroke";
    if (className) cls += " " + className;
    return (
      <svg
        ref={ref}
        viewBox="0 0 128 128"
        width="128"
        height="128"
        stroke="currentColor"
        className={cls}
        {...props}
      >
        <circle
          cx="64"
          cy="64"
          r="59.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  },
);
