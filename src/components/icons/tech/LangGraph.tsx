import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const LangGraph = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-langgraph";
    if (className) cls += " " + className;

    return (
      <svg
        ref={ref}
        viewBox="0 0 128 128"
        width="128"
        height="128"
        fill="currentColor"
        className={cls}
        {...props}
      >
        <circle cx="28" cy="32" r="12" />
        <circle cx="100" cy="32" r="12" />
        <circle cx="64" cy="96" r="12" />
        <path
          d="M36 40L58 88M92 40L70 88M40 32H88"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
        />
      </svg>
    );
  },
);
LangGraph.displayName = "LangGraph";
