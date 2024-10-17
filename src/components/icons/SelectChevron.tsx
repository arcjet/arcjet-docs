import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const SelectChevron = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-select-chevron";
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
          vectorEffect="non-scaling-stroke"
          d="M92 44L64 16L36 44"
          strokeLinecap="round"
          fill="none"
        />
        <path
          vectorEffect="non-scaling-stroke"
          d="M36 92L64 120L92 92"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  },
);
