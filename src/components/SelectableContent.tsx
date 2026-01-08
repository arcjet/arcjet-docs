import Select from "@/components/Select";
import { getStoredSyncKey, storeSyncKey } from "@/lib/prefs";
import { syncKeys as storedSyncKeys } from "@/store";
import { useStore } from "@nanostores/react";
import type { HTMLProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import styles from "./SelectableContent.module.scss";

type Slot = {
  key: string;
  value: ReactNode;
};

interface Props extends HTMLProps<HTMLDivElement> {
  syncKey?: string;
}

/**
 * Selectable Content
 *
 * Displays content based on user selection of syncKey and framework.
 *
 * For correctly sorting the drodpown options pass the slotIdx="..."
 * to the slot element with the desired number. Any html element works
 * however most often you'll want:
 *
 * &lt;div slotIdx="1"&gt;...&lt;/div&gt;
 *
 * &lt;div slotIdx="2"&gt;...&lt;/div&gt;
 *
 * ...
 *
 * @param syncKey - The sync key to persist the selection.
 */
const SelectableContent = ({
  syncKey,
  className,
  children,
  ...props
}: Props) => {
  const $storedSyncKeys = useStore(storedSyncKeys);

  const [selectedSlot, setSelectedSlot] = useState<Slot>();
  const [slots, setSlots] = useState<Slot[]>();

  // Select change callback
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (syncKey) {
      const val = e.target.value;

      storeSyncKey(syncKey, val);

      // Sync with nano store
      const stored = { ...storedSyncKeys.get() };
      stored[syncKey] = val;
      storedSyncKeys.set(stored);

      if (slots && slots.length > 0) {
        setSelectedSlot(slots.find((s) => s.key == val));
      }
    }
  };

  // Map props to slots
  useEffect(() => {
    setSlots(() => {
      return (
        Object.entries(props)
          .reduce((s, entry) => {
            // Get the slot html and retrieve the slotIdx attr if in use
            const el = document.createElement("div");
            el.innerHTML = renderToStaticMarkup(entry[1]);
            const indexedSlot = el.querySelector("[slotIdx]");
            const idx = parseInt(indexedSlot?.getAttribute("slotIdx") || "");

            // Add element to array at slotIdx or just push
            if (indexedSlot && idx) {
              s[idx] = { key: entry[0], value: entry[1] };
            } else {
              s.push({ key: entry[0], value: entry[1] });
            }

            return s;
          }, [] as Slot[])
          // Clean empty or undefined entries
          .filter((r) => r != undefined && r != null)
      );
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
    if (syncKey) {
      const stored = getStoredSyncKey(syncKey);
      if (stored) setStoredSyncKeyValue(stored);
    }
  }, []);

  useEffect(() => {
    if (storedSyncKeyValue) {
      const slot = slots?.find((slot) => slot.key == storedSyncKeyValue);
      if (slot) setSelectedSlot(slot);
    }
  }, [storedSyncKeyValue]);

  useEffect(() => {
    if (syncKey) {
      if ($storedSyncKeys && $storedSyncKeys[syncKey]) {
        const slot = slots?.find(
          (slot) => slot.key == $storedSyncKeys[syncKey],
        );
        setSelectedSlot(slot);
      }
    }
  }, [$storedSyncKeys, syncKey, slots]);

  let cls = "SelectableContent " + styles.SelectableContent;
  if (className) cls += " " + className;

  // TODO: sync sync key with nano store

  return (
    <div className={cls}>
      <div className={styles.Toolbar}>
        {slots && (slots.length > 1 || syncKey == "language") && (
          <Select
            onChange={onChange}
            value={selectedSlot?.key}
            trigger={{ size: "sm" }}
            level="secondary"
            disabled={slots.length <= 1 && syncKey == "language"}
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
      </div>
      {selectedSlot?.value}
      {children}
    </div>
  );
};
SelectableContent.displayName = "SelectableContent";

export default SelectableContent;
