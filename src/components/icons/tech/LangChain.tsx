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
        fill="currentColor"
        className={cls}
        {...props}
      >
        <path d="M117.67 108.15A33.99 33.99 0 0 1 65.15 103.23L46.11 84.19A33.99 33.99 0 0 1 96.66 87.14L117.67 108.15Z" />
        <path d="M19.52 10L40.53 31.01A33.99 33.99 0 0 1 43.48 81.56L24.44 62.52A33.99 33.99 0 0 1 19.52 10Z" />
        <path d="M10 84.19L43.48 84.19L43.48 117.67A33.99 33.99 0 0 1 10 84.19Z" />
        <path d="M102.9 48.41L79.26 72.04L55.3 48.41A33.99 33.99 0 0 1 102.9 48.41Z" />
      </svg>
    );
  },
);
LangChain.displayName = "LangChain";
