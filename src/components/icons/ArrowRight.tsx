import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const ArrowRight = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-arrow-right";
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
        <path
          d="M25.5 64.208L101 64.208"
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M61.6025 24.5L101.311 64.2081L61.6025 103.916"
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  },
);
