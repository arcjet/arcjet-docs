import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const Mastra = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-mastra";
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
        <path d="M16 108V20H40L64 68L88 20H112V108H92V52L64 104L36 52V108H16Z" />
      </svg>
    );
  },
);
Mastra.displayName = "Mastra";
