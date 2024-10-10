import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const NodeJs = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-node-js";
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
        <path
          stroke="none"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M61.9315 16.6146C63.3204 15.7951 65.0613 15.7951 66.4687 16.6146L104.109 38.3281C105.516 39.1429 106.377 40.643 106.377 42.2634V85.7366C106.377 87.357 105.516 88.8571 104.109 89.6719L66.4687 111.385C65.0613 112.205 63.3204 112.205 61.9315 111.385L24.3149 89.6719C22.8797 88.8571 22 87.357 22 85.7366V42.2634C22 40.643 22.8334 39.1429 24.2687 38.3281L61.9315 16.6146Z"
        />
      </svg>
    );
  },
);
