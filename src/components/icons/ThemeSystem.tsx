import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const ThemeSystem = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-theme-system";
    if (className) cls += " " + className;
    return (
      <svg
        ref={ref}
        viewBox="0 0 128 128"
        width="128"
        height="128"
        stroke="currentColor"
        fill="currentColor"
        className={cls}
        {...props}
      >
        <g clipPath="url(#clip0_181_3189)">
          <path
            d="M106.427 106.427C82.9953 129.858 45.0054 129.858 21.5739 106.427L106.427 21.5737C129.858 45.0052 129.858 82.9951 106.427 106.427Z"
            fill="currentColor"
          />
          <circle
            cx="64"
            cy="63.9998"
            r="59.5"
            transform="rotate(45 64 63.9998)"
            stroke="currentColor"
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        </g>
        <defs>
          <clipPath id="clip0_181_3189">
            <rect width="128" height="128" fill="currentColor" />
          </clipPath>
        </defs>
      </svg>
    );
  },
);
