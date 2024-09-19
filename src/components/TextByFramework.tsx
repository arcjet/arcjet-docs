import type { FrameworkKey } from "@/lib/prefs";
import { defaultFramework } from "@/lib/prefs";
import { getTypedStorage } from "@/lib/utils";
import type { ForwardedRef, PropsWithChildren, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";

interface Props extends PropsWithChildren {
  bun: ReactNode;
  nextJs: ReactNode;
  nodeJs: ReactNode;
  sveltekit: ReactNode;
}

/**
 * Text By Framework
 *
 * Renders the appropriate text based on the selected framework.
 * @param bun - The text for the Bun framework.
 * @param nextJs - The text for the Next.js framework.
 * @param nodeJs - The text for the Node.js framework.
 * @param sveltekit - The text for the SvelteKit framework.
 */
const TextByFramework = forwardRef(
  ({ ...props }: Props, ref: ForwardedRef<HTMLElement>) => {
    const [selectedFramework, setSelectedFramework] =
      useState<FrameworkKey>(defaultFramework);

    useEffect(() => {
      const update = () => {
        const selected = getTypedStorage("selected-framework");
        setSelectedFramework(selected);
      };

      update();
      window.addEventListener("change:selected-framework", update);
      return () => {
        window.removeEventListener("change:selected-framework", update);
      };
    }, []);

    return (
      <>
        {selectedFramework == "bun" && props.bun}
        {selectedFramework == "next-js" && props.nextJs}
        {selectedFramework == "node-js" && props.nodeJs}
        {selectedFramework == "sveltekit" && props.sveltekit}
        {props.children}
      </>
    );
  },
);
TextByFramework.displayName = "TextByFramework";

export default TextByFramework;
