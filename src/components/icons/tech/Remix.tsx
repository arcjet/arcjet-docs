import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const Remix = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-remix";
    if (className) cls += " " + className;
    return (
      <svg
        ref={ref}
        viewBox="0 0 128 128"
        width="128"
        height="128"
        fill="currentColor"
        stroke="currentColor"
        className={cls}
        {...props}
      >
        <g clipPath="url(#clip0_861_237)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M105.398 92.2027C106.334 104.219 106.334 109.851 106.334 116H78.532C78.532 114.661 78.5559 113.436 78.5801 112.193C78.6553 108.331 78.7338 104.304 78.1081 96.1716C77.2811 84.265 72.1539 81.6193 62.7264 81.6193H19V59.9563H64.0496C75.9579 59.9563 81.9123 56.3337 81.9123 46.7424C81.9123 38.3087 75.9579 33.1979 64.0496 33.1979H19V12H69.0115C95.9708 12 109.368 24.7332 109.368 45.0733C109.368 60.287 99.9404 70.209 87.2049 71.8627C97.9556 74.0124 104.241 80.131 105.398 92.2027Z"
            fill="currentColor"
          />
          <path
            d="M19 116V99.851H48.3964C53.3066 99.851 54.3728 103.493 54.3728 105.665V116H19Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <clipPath id="clip0_861_237">
            <rect width="128" height="128" fill="currentColor" />
          </clipPath>
        </defs>
      </svg>
    );
  },
);
