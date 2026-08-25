import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const StrandsAgents = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-strands-agents";
    if (className) cls += " " + className;

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width="128"
        height="128"
        fill="currentColor"
        className={cls}
        {...props}
      >
        <path d="M7 2C4.24 2 2 4.24 2 7c0 1.66.81 3.13 2.06 4.06C2.81 11.87 2 13.34 2 15c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.66-.81-3.13-2.06-4.06C11.19 10.13 12 8.66 12 7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3S8.66 10 7 10 4 8.66 4 7s1.34-3 3-3zm0 10c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
        <path d="M17 2c-2.76 0-5 2.24-5 5 0 1.66.81 3.13 2.06 4.06C12.81 11.87 12 13.34 12 15c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.66-.81-3.13-2.06-4.06C21.19 10.13 22 8.66 22 7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 10c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
      </svg>
    );
  },
);
StrandsAgents.displayName = "StrandsAgents";
