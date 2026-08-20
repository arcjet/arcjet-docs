import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const VercelAi = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-vercel-ai";
    if (className) cls += " " + className;

    return (
      <svg
        ref={ref}
        viewBox="2.97 3.64 77.84 82.36"
        width="128"
        height="128"
        fill="currentColor"
        className={cls}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M2.97269 86L32.6687 3.64H51.1127L80.8087 86H65.0327L58.1887 66.512H25.5927L18.7487 86H2.97269ZM30.0007 53.636H53.7807L41.9487 18.836L30.0007 53.636Z"
        />
      </svg>
    );
  },
);
VercelAi.displayName = "VercelAi";
