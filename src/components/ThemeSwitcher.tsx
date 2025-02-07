import { ThemeStroke as IconThemeStroke } from "@/components/icons/ThemeStroke";
import { ThemeSystem as IconThemeSystem } from "@/components/icons/ThemeSystem";
import type { Props as SelectProps } from "@/components/Select";
import Select from "@/components/Select";
import Skeleton from "@/components/Skeleton";
import { forwardRef, useEffect, useState, type ForwardedRef } from "react";

import styles from "./ThemeSwitcher.module.scss";

type ThemeOption = {
  key: "auto" | "dark" | "light";
  label: string;
};

const ThemeOptions: ThemeOption[] = [
  {
    key: "dark",
    label: "Dark",
  },
  {
    key: "light",
    label: "Light",
  },
  {
    key: "auto",
    label: "Auto",
  },
];

interface Props extends React.HTMLAttributes<HTMLSelectElement> {
  select?: SelectProps;
}

/**
 * Theme Switcher
 * Selects a theme option among "dark", "light" and "auto".
 */
const ThemeSwitcher = forwardRef(
  ({ select, ...props }: Props, ref: ForwardedRef<HTMLSelectElement>) => {
    const [loading, setLoading] = useState<boolean>(true);

    // The selected theme option
    const [selected, setSelected] = useState<ThemeOption["key"]>("auto");

    // Select change callback
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setSelected(val as ThemeOption["key"]);
    };

    // Set initial value from local storage.
    useEffect(() => {
      const storedTheme = ((typeof localStorage !== "undefined" &&
        localStorage.getItem("starlight-theme")) ||
        "auto") as ThemeOption["key"];
      setSelected(storedTheme);
      setLoading(false);
    }, []);

    let cls = "ThemeSwitcher " + styles.ThemeSwitcher;
    if (props.className) cls += " " + props.className;
    if (loading) cls += " " + styles.Loading;

    return (
      <span className={styles.ThemeSwitcherWrapper}>
        {loading && <Skeleton className={styles.Skeleton} radius={1} />}
        <Select
          className={cls}
          ref={ref}
          onChange={onChange}
          value={selected}
          appearance="discreet"
          level="secondary"
          decoratorLeft={
            selected == "auto" ? <IconThemeSystem /> : <IconThemeStroke />
          }
          {...props}
          {...select}
        >
          {ThemeOptions.map((option: ThemeOption, idx: number) => {
            return (
              <option key={`framework-option-${idx}`} value={option.key}>
                {option.label}
              </option>
            );
          })}
        </Select>
      </span>
    );
  },
);
ThemeSwitcher.displayName = "ThemeSwitcher";

export default ThemeSwitcher;
