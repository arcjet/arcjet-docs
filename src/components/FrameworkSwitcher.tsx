import { Bun as IconBun } from "@/components/icons/tech/Bun";
import { Deno as IconDeno } from "@/components/icons/tech/Deno";
import { Express as IconExpress } from "@/components/icons/tech/Express";
import { Hono as IconHono } from "@/components/icons/tech/Hono";
import { NestJs as IconNestJs } from "@/components/icons/tech/NestJs";
import { NextJs as IconNextJs } from "@/components/icons/tech/NextJs";
import { NodeJs as IconNodeJs } from "@/components/icons/tech/NodeJs";
import { Remix as IconRemix } from "@/components/icons/tech/Remix";
import { SvelteKit as IconSvelteKit } from "@/components/icons/tech/SvelteKit";
import type { Props as SelectProps } from "@/components/Select";
import Select from "@/components/Select";
import type { Framework, FrameworkKey } from "@/lib/prefs";
import {
  getClosestFrameworkMatch,
  getFrameworks,
  getStoredFramework,
  isValidFrameworkKey,
  storeFramework,
} from "@/lib/prefs";
import {
  availableFrameworks,
  displayedFramework,
  queryParamFramework,
} from "@/store";
import { useStore } from "@nanostores/react";
import { forwardRef, useEffect, useState, type ForwardedRef } from "react";

const frameworkIcon = {
  deno: <IconDeno />,
  bun: <IconBun />,
  express: <IconExpress />,
  hono: <IconHono />,
  "nest-js": <IconNestJs />,
  "next-js": <IconNextJs />,
  "node-js": <IconNodeJs />,
  remix: <IconRemix />,
  sveltekit: <IconSvelteKit />,
  "node-js-express": <IconNodeJs />,
  "node-js-hono": <IconNodeJs />,
  "bun-hono": <IconBun />,
};

interface Props extends React.HTMLAttributes<HTMLSelectElement> {
  frameworks?: FrameworkKey[];
  select?: SelectProps;
}

/**
 * Framework Switcher
 * Selects one of the available frameworks.
 * Composes the options from the provided `frameworks`.
 *
 * @param frameworks - The list of framework options to display.
 */
const FrameworkSwitcher = forwardRef(
  (
    { frameworks, select, ...props }: Props,
    ref: ForwardedRef<HTMLSelectElement>,
  ) => {
    let cls = "FrameworkSwitcher";
    if (props.className) cls += " " + props.className;

    const [options, setOptions] = useState(
      frameworks ? getFrameworks(frameworks) : undefined,
    );

    const $availableFrameworks = useStore(availableFrameworks);
    const $displayedFramework = useStore(displayedFramework);
    const $queryParamFramework = useStore(queryParamFramework);

    // The selected framework option
    const [selected, setSelected] = useState<FrameworkKey>();

    // Select change callback
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (!storeFramework(val)) return;

      // Update store
      displayedFramework.set(val as FrameworkKey);
    };

    // Sync store with current page frontmatter
    useEffect(() => {
      if (frameworks && frameworks.length > 0) {
        availableFrameworks.set(getFrameworks(frameworks));
      }
    }, [frameworks]);

    // Sync with query param for framework or local storage value if present
    useEffect(() => {
      let framework: FrameworkKey | undefined = undefined;

      // Get the framework to display from query params
      const params = new URLSearchParams(window.location.search);
      const f = params.get("f");

      if (f && f != $queryParamFramework && isValidFrameworkKey(f)) {
        framework = f as FrameworkKey;
        queryParamFramework.set(f as FrameworkKey);
        storeFramework(f);
      }

      // Or get it from storage
      if (!framework) {
        const storedFramework = getStoredFramework();
        if (storedFramework) framework = storedFramework;
      }

      // We update based on the framework choice if any
      if (framework) {
        // Not all stored frameworks may be in the list currently,
        // so we try to return the closest match
        const match = getClosestFrameworkMatch(
          framework,
          $availableFrameworks.map((f) => f.key),
        );

        displayedFramework.set(match);
      }
    }, [$availableFrameworks, $queryParamFramework]);

    // Handle change in the displayed framework
    // If the nano store for this has changed then we assume local storage
    // has also been updated and only change the displayed selection.
    useEffect(() => {
      setSelected($displayedFramework);
    }, [$displayedFramework]);

    // Handle change in the framework options
    useEffect(() => {
      setOptions($availableFrameworks);
    }, [$availableFrameworks]);

    // Loading handling
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (selected) setLoading(false);
    }, [selected]);

    return (
      !loading &&
      options && (
        <Select
          className={cls}
          ref={ref}
          onChange={onChange}
          value={selected}
          decoratorLeft={selected && frameworkIcon[selected]}
          {...props}
          {...select}
        >
          {options.map((framework: Framework, idx: number) => {
            return (
              <option key={`framework-option-${idx}`} value={framework.key}>
                {framework.label}
              </option>
            );
          })}
        </Select>
      )
    );
  },
);
FrameworkSwitcher.displayName = "FrameworkSwitcher";

export default FrameworkSwitcher;
