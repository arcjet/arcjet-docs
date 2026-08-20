import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const Genkit = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-genkit";
    if (className) cls += " " + className;

    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width="128"
        height="128"
        fill="currentColor"
        className={cls}
        {...props}
      >
        <path d="M12 1.5 13.8 10.2 22.5 12 13.8 13.8 12 22.5 10.2 13.8 1.5 12 10.2 10.2Z" />
      </svg>
    );
  },
);
Genkit.displayName = "Genkit";
