import FrameworkSwitcher from "@/components/FrameworkSwitcher";
import type { ForwardedRef, HTMLProps, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./SelectableContent.module.scss";

type Slot = {
  key: string;
  value: ReactNode;
};

interface Props extends HTMLProps<HTMLDivElement> {
  syncKey: string;
}

/**
 * Selectable Content
 *
 * Displays content based on user selection of syncKey and framework.
 *
 * @param syncKey - The sync key to persist the selection.
 */
const SelectableContent = forwardRef(
  (
    { syncKey, className, children, ...props }: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    let cls = "SelectableContent " + styles.SelectableContent;
    if (className) cls += " " + className;

    const [selectedSlot, setSelectedSlot] = useState<Slot>();
    const [slots, setSlots] = useState<Slot[]>();

    // Select change callback
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;

      if (slots && slots.length > 0) {
        setSelectedSlot(slots.find((s) => s.key == val));
      }
    };

    // Map props to slots
    useEffect(() => {
      setSlots(() => {
        return Object.entries(props).map((entry) => {
          return { key: entry[0], value: entry[1] };
        });
      });
    }, []);

    // Set the initially selected slot
    useEffect(() => {
      if (slots && slots.length > 0 && !selectedSlot) {
        setSelectedSlot(slots[0]);
      }
    }, [slots]);

    return (
      <div ref={ref} className={cls}>
        <div className={styles.Toolbar}>
          {slots && (
            <select onChange={onChange}>
              {slots.map((slot: Slot, idx: number) => {
                return (
                  <option key={`content-slot-key-${idx}`} value={slot.key}>
                    {slot.key}
                  </option>
                );
              })}
            </select>
          )}
          <FrameworkSwitcher />
        </div>
        <div>{selectedSlot?.value}</div>
      </div>
    );
  },
);
SelectableContent.displayName = "SelectableContent";

export default SelectableContent;
