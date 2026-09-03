import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const GoogleAdk = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-google-adk";
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
        <path d="M12 1.5 21.5 7v10L12 22.5 2.5 17V7L12 1.5Zm0 2.3L4.5 8.1v7.8L12 20.2l7.5-4.3V8.1L12 3.8Z" />
        <path d="M12 7.2 16.8 10v4L12 16.8 7.2 14v-4L12 7.2Zm0 2.1L9.3 10.8v2.4L12 14.7l2.7-1.5v-2.4L12 9.3Z" />
      </svg>
    );
  },
);
GoogleAdk.displayName = "GoogleAdk";
