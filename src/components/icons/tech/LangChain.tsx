import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const LangChain = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-langchain";
    if (className) cls += " " + className;

    return (
      <svg
        ref={ref}
        viewBox="0 0 128 128"
        width="128"
        height="128"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        className={cls}
        {...props}
      >
        <circle cx="38" cy="64" r="22" />
        <circle cx="90" cy="64" r="22" />
        <path d="M60 64H68" />
      </svg>
    );
  },
);
LangChain.displayName = "LangChain";
