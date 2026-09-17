import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const AgentFrameworkGo = forwardRef(
  ({ className, ...props }: Props, ref: ForwardedRef<SVGSVGElement>) => {
    let cls = "aj-Icon aj-Icon-agent-framework-go";
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
        <path d="M12 2.2 20.4 7v10L12 21.8 3.6 17V7L12 2.2Zm0 2.2L5.6 8v8L12 19.6 18.4 16V8L12 4.4Z" />
        <path d="M8.2 12.2h2.1l1.7-3.4h1.9l-2.1 4.1 2.2 4.3h-2l-1.7-3.5H8.2v-1.5Zm7.1 3.6c.9 0 1.5-.2 2-.7.4-.4.6-1 .6-1.7s-.2-1.3-.6-1.7c-.5-.5-1.1-.7-2-.7h-2.2v4.8h2.2Zm-.1-3.5c.4 0 .7.1.9.4.2.2.3.5.3.9s-.1.7-.3.9c-.2.2-.5.4-.9.4h-.6v-2.6h.6Z" />
      </svg>
    );
  },
);
AgentFrameworkGo.displayName = "AgentFrameworkGo";
