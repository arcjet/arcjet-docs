import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const VercelAi = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-vercel-ai";
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
        <path d="M64 16L120 112H8L64 16Z" />
      </svg>
    );
  },
);
VercelAi.displayName = "VercelAi";
