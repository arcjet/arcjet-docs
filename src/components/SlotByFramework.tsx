import type { FrameworkKey } from "@/lib/prefs";
import { defaultFramework } from "@/lib/prefs";
import { getTypedStorage } from "@/lib/utils";
import type { ForwardedRef, PropsWithChildren, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";

import "@/components/SlotByFramework.scss";

interface Props extends PropsWithChildren {
  bun: ReactNode;
  nextJs: ReactNode;
  nodeJs: ReactNode;
  sveltekit: ReactNode;
}

/**
 * Slot By Framework
 *
 * Renders the appropriate slot based on the selected framework.
 * @param bun - The slot for the Bun framework.
 * @param nextJs - The slot for the Next.js framework.
 * @param nodeJs - The slot for the Node.js framework.
 * @param sveltekit - The slot for the SvelteKit framework.
 */
const SlotByFramework = forwardRef(
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
      <div className="SlotByFramework">
        {selectedFramework == "bun" && props.bun}
        {selectedFramework == "next-js" && props.nextJs}
        {selectedFramework == "node-js" && props.nodeJs}
        {selectedFramework == "sveltekit" && props.sveltekit}
        {props.children}
      </div>
    );
  },
);
SlotByFramework.displayName = "SlotByFramework";

export default SlotByFramework;
