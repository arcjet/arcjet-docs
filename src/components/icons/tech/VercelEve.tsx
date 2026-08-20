import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const VercelEve = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-vercel-eve";
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
        <ellipse cx="64" cy="64" rx="48" ry="28" />
        <circle cx="64" cy="64" r="14" fill="currentColor" stroke="none" />
      </svg>
    );
  },
);
VercelEve.displayName = "VercelEve";
