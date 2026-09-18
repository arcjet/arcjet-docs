import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const CloudflareThink = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-cloudflare-think";
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
        <path d="M6.8 17.5c-2.4 0-4.3-1.9-4.3-4.2 0-1.9 1.3-3.6 3.1-4.1.5-2.6 2.8-4.5 5.5-4.5 2.2 0 4.1 1.2 5.1 3.1.4-.1.8-.2 1.2-.2 2.3 0 4.1 1.8 4.1 4.1 0 2.2-1.8 4-4 4.1H6.8Zm0-1.8h11.6c1.2 0 2.2-1 2.2-2.3 0-1.3-1-2.3-2.3-2.3-.4 0-.8.1-1.1.3l-.5.3-.2-.6c-.6-1.6-2.1-2.6-3.8-2.6-1.9 0-3.6 1.4-3.9 3.3l-.1.6-.6.1c-1.3.2-2.3 1.4-2.3 2.8 0 1.3 1.1 2.4 2.5 2.4Z" />
      </svg>
    );
  },
);
CloudflareThink.displayName = "CloudflareThink";
