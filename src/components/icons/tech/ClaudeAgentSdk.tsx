import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const ClaudeAgentSdk = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-claude-agent-sdk";
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
        <path d="M64 8L72 40H104L78 60L88 92L64 72L40 92L50 60L24 40H56L64 8Z" />
        <circle cx="64" cy="64" r="10" />
      </svg>
    );
  },
);
ClaudeAgentSdk.displayName = "ClaudeAgentSdk";
