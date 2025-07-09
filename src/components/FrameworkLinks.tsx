import Button from "@/components/Button";
import { Astro as IconAstro } from "@/components/icons/tech/Astro";
import { Bun as IconBun } from "@/components/icons/tech/Bun";
import { Deno as IconDeno } from "@/components/icons/tech/Deno";
import { Fastify as IconFastify } from "@/components/icons/tech/Fastify";
import { NestJs as IconNestJs } from "@/components/icons/tech/NestJs";
import { NextJs as IconNextJs } from "@/components/icons/tech/NextJs";
import { NodeJs as IconNodeJs } from "@/components/icons/tech/NodeJs";
import { Remix as IconRemix } from "@/components/icons/tech/Remix";
import { SvelteKit as IconSvelteKit } from "@/components/icons/tech/SvelteKit";
import { getStoredFramework, type FrameworkKey } from "@/lib/prefs";
import { queryParamFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { ForwardedRef, PropsWithChildren } from "react";
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
            {(!exclude || !exclude.includes("astro")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=astro`}
                decoratorLeft={<IconAstro />}
              >
                Astro
              </Button>
            )}
            {(!exclude || !exclude.includes("bun")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=bun`}
                decoratorLeft={<IconBun />}
              >
                Bun
              </Button>
            )}
            {(!exclude || !exclude.includes("bun-hono")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=bun-hono`}
                decoratorLeft={<IconBun />}
              >
                Bun + Hono
              </Button>
            )}
            {(!exclude || !exclude.includes("deno")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=deno`}
                decoratorLeft={<IconDeno />}
              >
                Deno
              </Button>
            )}
            {(!exclude || !exclude.includes("fastify")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=fastify`}
                decoratorLeft={<IconFastify />}
              >
                Fastify
              </Button>
            )}
            {(!exclude || !exclude.includes("nest-js")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=nest-js`}
                decoratorLeft={<IconNestJs />}
              >
                NestJS
              </Button>
            )}
            {(!exclude || !exclude.includes("next-js")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=next-js`}
                decoratorLeft={<IconNextJs />}
              >
                Next.js
              </Button>
            )}
            {(!exclude || !exclude.includes("node-js")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=node-js`}
                decoratorLeft={<IconNodeJs />}
              >
                Node.js
              </Button>
            )}
            {(!exclude || !exclude.includes("node-js-express")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=node-js-express`}
                decoratorLeft={<IconNodeJs />}
              >
                Node.js + Express
              </Button>
            )}
            {(!exclude || !exclude.includes("node-js-hono")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=node-js-hono`}
                decoratorLeft={<IconNodeJs />}
              >
                Node.js + Hono
              </Button>
            )}
            {(!exclude || !exclude.includes("remix")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=remix`}
                decoratorLeft={<IconRemix />}
              >
                Remix
              </Button>
            )}
            {(!exclude || !exclude.includes("sveltekit")) && (
              <Button
                as="link"
                size="lg"
                href={`${path}?f=sveltekit`}
                decoratorLeft={<IconSvelteKit />}
              >
                SvelteKit
              </Button>
            )}
          </div>
        </div>
      )
    );
  },
);
FrameworkLinks.displayName = "FrameworkLinks";

export default FrameworkLinks;
