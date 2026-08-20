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
        viewBox="0 0 24 24"
        width="128"
        height="128"
        fill="currentColor"
        className={cls}
        {...props}
      >
        <path d="M5 19H10A5 5 0 115 14ZM19 14A5 5 0 1114 19H19ZM10 5A5 5 0 105 10V5ZM19 5V10A5 5 0 1014 5Z" />
      </svg>
    );
  },
);
LangGraph.displayName = "LangGraph";
