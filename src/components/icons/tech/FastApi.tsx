import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const FastApi = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-fastapi";
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
        <path d="M64 4C97.1371 4 124 30.8629 124 64C124 97.1371 97.1371 124 64 124C30.8629 124 4 97.1371 4 64C4 30.8629 30.8629 4 64 4ZM28.5107 100.453L87.0488 59.3164H59.584L99.7627 31.0801H59.749L28.5107 100.453Z" />
      </svg>
    );
  },
);
FastApi.displayName = "FastApi";
