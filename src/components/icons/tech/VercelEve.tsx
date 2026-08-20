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
        viewBox="0 0 102 102"
        width="128"
        height="128"
        fill="currentColor"
        className={cls}
        {...props}
      >
        <path d="M49.2811 66.9377L75.0311 34.9622H68.1393L47.9096 60.1058L42.4236 66.9377H49.2811Z" />
        <path d="M0 34.9622H42.4048V40.0704H0V34.9622Z" />
        <rect y="48.2844" width="27.6587" height="5.10824" />
        <rect y="61.816" width="27.6588" height="5.10824" />
        <rect
          width="32.2696"
          height="5.10824"
          transform="matrix(-1 0 0 1 101.9 34.9622)"
        />
        <rect
          width="27.6587"
          height="5.10824"
          transform="matrix(-1 0 0 1 101.9 48.2844)"
        />
        <rect
          width="27.6588"
          height="5.10824"
          transform="matrix(-1 0 0 1 101.9 61.816)"
        />
      </svg>
    );
  },
);
VercelEve.displayName = "VercelEve";
