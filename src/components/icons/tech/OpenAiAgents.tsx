import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const OpenAiAgents = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-openai-agents";
    if (className) cls += " " + className;

    return (
      <svg
        ref={ref}
        viewBox="0 0 128 128"
        width="128"
        height="128"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinejoin="round"
        className={cls}
        {...props}
      >
        <path d="M64 16L100 36V76L64 96L28 76V36L64 16Z" />
        <path d="M64 40L80 49V67L64 76L48 67V49L64 40Z" />
      </svg>
    );
  },
);
OpenAiAgents.displayName = "OpenAiAgents";
