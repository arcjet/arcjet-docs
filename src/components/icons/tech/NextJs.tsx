import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const NextJs = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-next-js";
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
        <path
          d="M64 124C97.1371 124 124 97.1371 124 64C124 30.8629 97.1371 4 64 4C30.8629 4 4 30.8629 4 64C4 97.1371 30.8629 124 64 124Z"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
        <path
          strokeWidth="0"
          d="M106.317 112.014L49.168 38.4H38.4004V89.5787H47.0145V49.3395L99.5552 117.223C101.926 115.637 104.185 113.895 106.317 112.014Z"
          fill="url(#paint0_linear_213_3286)"
        />
        <path
          strokeWidth="0"
          d="M90.3107 38.4H81.7773V89.6H90.3107V38.4Z"
          fill="url(#paint1_linear_213_3286)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_213_3286"
            x1="77.5115"
            y1="82.8445"
            x2="102.756"
            y2="114.133"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_213_3286"
            x1="86.044"
            y1="38.4"
            x2="85.9011"
            y2="76"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  },
);
