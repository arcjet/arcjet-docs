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
        fill="currentColor"
        className={cls}
        {...props}
      >
        <path d="M61.8428 84.0001L94.1565 43.874H85.5079L60.1217 75.4267L53.2373 84.0001H61.8428Z" />
        <path d="M0 43.874H53.2138V50.2843H0V43.874Z" />
        <path d="M34.7089 60.592H0V67.0024H34.7089V60.592Z" />
        <path d="M34.709 77.5729H0V83.9832H34.709V77.5729Z" />
        <path d="M87.3789 43.874H127.874V50.2844H87.3789V43.874Z" />
        <path d="M93.1651 60.592H127.874V67.0024H93.1651V60.592Z" />
        <path d="M93.165 77.5729H127.874V83.9832H93.165V77.5729Z" />
      </svg>
    );
  },
);
VercelEve.displayName = "VercelEve";
