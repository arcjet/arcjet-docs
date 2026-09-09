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
        viewBox="0 0 128 128"
        width="128"
        height="128"
        fill="currentColor"
        className={cls}
        {...props}
      >
        <path d="M4.87988 102.438L32.5888 25.5625H49.7846L77.5039 102.438H62.7793L56.4158 84.2463H25.9988L19.6044 102.438H4.87988ZM30.1073 72.2355H52.2868L41.2485 39.7467L30.1073 72.2355ZM124.241 25.5625V37.7896H111.906V90.2104H124.88V102.438H84.722V90.2104H97.8299V37.7896H85.381V25.5625H124.241Z" />
      </svg>
    );
  },
);
VercelAi.displayName = "VercelAi";
