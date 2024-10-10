import FrameworkSwitcher from "@/components/FrameworkSwitcher";
import Select from "@/components/Select";
import { getStoredSyncKey, storeSyncKey } from "@/lib/prefs";
import { getComparator } from "@/lib/utils";
import type { ForwardedRef, HTMLProps, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./SelectableContent.module.scss";

type Slot = {
  key: string;
  value: ReactNode;
};

interface Props extends HTMLProps<HTMLDivElement> {
  syncKey: string;
  frameworkSwitcher: boolean;
}

/**
 * Selectable Content
 *
 * Displays content based on user selection of syncKey and framework.
 *
 * @param syncKey - The sync key to persist the selection.
 * @param frameworkSwitcher - Shows the framework switcher.
 */
const SelectableContent = forwardRef(
  (
    {
      syncKey,
      frameworkSwitcher = false,
      className,
      children,
      ...props
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    let cls = "SelectableContent " + styles.SelectableContent;
    if (className) cls += " " + className;

    const [selectedSlot, setSelectedSlot] = useState<Slot>();
    const [slots, setSlots] = useState<Slot[]>();

    // Select change callback
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;

      storeSyncKey(syncKey, val);

      if (slots && slots.length > 0) {
        setSelectedSlot(slots.find((s) => s.key == val));
      }
    };

    // Map props to slots
    useEffect(() => {
      setSlots(() => {
        return Object.entries(props)
          .map((entry) => {
            return { key: entry[0], value: entry[1] };
          })
          .sort(getComparator("desc", "key"));
      });
    }, []);

    // Set the initially selected slot
    useEffect(() => {
      if (slots && slots.length > 0 && !selectedSlot) {
        setSelectedSlot(slots[0]);
      }
    }, [slots]);

    // Handle stored syncKey value
    const [storedSyncKeyValue, setStoredSyncKeyValue] = useState<string>();
    useEffect(() => {
      const stored = getStoredSyncKey(syncKey);
      if (stored) setStoredSyncKeyValue(stored);
    }, []);

    useEffect(() => {
      if (storedSyncKeyValue) {
        const slot = slots?.find((slot) => slot.key == storedSyncKeyValue);
        if (slot) setSelectedSlot(slot);
      }
    }, [storedSyncKeyValue]);

    // TODO: sync sync key with nano store

    return (
      <div ref={ref} className={cls}>
        <div className={styles.Toolbar}>
          {slots && (
            <Select
              onChange={onChange}
              value={selectedSlot?.key}
              trigger={{ size: "sm" }}
              level="secondary"
            >
              {slots.map((slot: Slot, idx: number) => {
                return (
                  <option key={`content-slot-key-${idx}`} value={slot.key}>
                    {slot.key}
                  </option>
                );
              })}
            </Select>
          )}
          {frameworkSwitcher && (
            <FrameworkSwitcher
              select={{ level: "secondary", trigger: { size: "sm" } }}
            />
          )}
        </div>
        <div>{selectedSlot?.value}</div>
      </div>
    );
  },
);
SelectableContent.displayName = "SelectableContent";

export default SelectableContent;
