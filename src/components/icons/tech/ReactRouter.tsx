import type { ForwardedRef, HTMLProps } from "react";
import { forwardRef } from "react";

export interface Props extends HTMLProps<SVGSVGElement> {}

export const ReactRouter = forwardRef(
  (props: Props, ref: ForwardedRef<SVGSVGElement>) => {
    const { className: extraClassNames, ...rest } = props;
    let className = "aj-Icon aj-Icon-react-router";
    if (extraClassNames) className += " " + extraClassNames;

    return (
      // TODO: add actual logo.
      <svg
        className={className}
        fill="currentColor"
        height="128"
        ref={ref}
        stroke="currentColor"
        viewBox="0 0 128 128"
        width="128"
        {...rest}
      />
    );
  },
);
