import Button from "@/components/Button";
import { Astro as IconAstro } from "@/components/icons/tech/Astro";
import { Bun as IconBun } from "@/components/icons/tech/Bun";
import { Deno as IconDeno } from "@/components/icons/tech/Deno";
import { Fastify as IconFastify } from "@/components/icons/tech/Fastify";
import { NestJs as IconNestJs } from "@/components/icons/tech/NestJs";
import { NextJs as IconNextJs } from "@/components/icons/tech/NextJs";
import { NodeJs as IconNodeJs } from "@/components/icons/tech/NodeJs";
import { Nuxt as IconNuxt } from "@/components/icons/tech/Nuxt";
import { ReactRouter as IconReactRouter } from "@/components/icons/tech/ReactRouter";
import { Remix as IconRemix } from "@/components/icons/tech/Remix";
import { SvelteKit as IconSvelteKit } from "@/components/icons/tech/SvelteKit";
import { frameworks, getStoredFramework, type FrameworkKey } from "@/lib/prefs";
import { queryParamFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { ForwardedRef, PropsWithChildren, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./FrameworkLinks.module.scss";

interface FrameworkLinksProps extends PropsWithChildren {
  title?: string;
  exclude?: FrameworkKey[];
  path?: string;
  alwaysShow?: boolean;
}

/**
 * Framework Links
 *
 * Renders a list of buttons that switch to a specific framework.
 *
 * @param title - The block title.
 * @param exclude - A list of framework to exclude from display.
 * @param path - An optional path to link to, defaults to the same page.
 * @param alwaysShow - Show the links even if a framework is selected or stored.
 */
const FrameworkLinks = forwardRef(
  (
    {
      title = "Choose a framework",
      exclude,
      path = "",
      alwaysShow,
      ...props
    }: FrameworkLinksProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const [hide, setHide] = useState(true);

    const $queryParamFramework = useStore(queryParamFramework);

    useEffect(() => {
      // Get the framework to display from query params
      const params = new URLSearchParams(window.location.search);
      let f = params.get("f");

      if (!f) {
        const storedFramework = getStoredFramework();
        if (storedFramework) f = storedFramework;
      }

      if (f && !alwaysShow) setHide(true);
      else setHide(false);
    }, [$queryParamFramework, alwaysShow]);

    let cls = "FrameworkLinks " + styles.FrameworkLinks;

    return (
      !hide && (
        <div ref={ref} className={cls} {...props}>
          <h2 id="choose-a-framework">{title}</h2>
          <div className={styles.Links}>
            {frameworks.map((f) => {
              let icon: ReactNode;

              switch (f.key) {
                case "astro":
                  icon = <IconAstro />;
                  break;
                case "bun":
                  icon = <IconBun />;
                  break;
                case "bun-hono":
                  icon = <IconBun />;
                  break;
                case "deno":
                  icon = <IconDeno />;
                  break;
                case "fastify":
                  icon = <IconFastify />;
                  break;
                case "nest-js":
                  icon = <IconNestJs />;
                  break;
                case "next-js":
                  icon = <IconNextJs />;
                  break;
                case "node-js":
                  icon = <IconNodeJs />;
                  break;
                case "node-js-express":
                  icon = <IconNodeJs />;
                  break;
                case "node-js-hono":
                  icon = <IconNodeJs />;
                  break;
                case "nuxt":
                  icon = <IconNuxt />;
                  break;
                case "react-router":
                  icon = <IconReactRouter />;
                  break;
                case "remix":
                  icon = <IconRemix />;
                  break;
                case "sveltekit":
                  icon = <IconSvelteKit />;
                  break;
                default:
                  icon = "";
                  break;
              }

              if (exclude?.includes(f.key)) return null;

              return (
                <Button
                  as="link"
                  size="lg"
                  href={`${path}?f=${f.key}`}
                  decoratorLeft={icon}
                >
                  {f.label}
                </Button>
              );
            })}
          </div>
        </div>
      )
    );
  },
);
FrameworkLinks.displayName = "FrameworkLinks";

export default FrameworkLinks;
