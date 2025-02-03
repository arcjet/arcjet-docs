import Button from "@/components/Button";
import { Bun as IconBun } from "@/components/icons/tech/Bun";
import { Deno as IconDeno } from "@/components/icons/tech/Deno";
import { NestJs as IconNestJs } from "@/components/icons/tech/NestJs";
import { NextJs as IconNextJs } from "@/components/icons/tech/NextJs";
import { NodeJs as IconNodeJs } from "@/components/icons/tech/NodeJs";
import { Remix as IconRemix } from "@/components/icons/tech/Remix";
import { SvelteKit as IconSvelteKit } from "@/components/icons/tech/SvelteKit";
import { getStoredFramework } from "@/lib/prefs";
import { queryParamFramework } from "@/store";
import { useStore } from "@nanostores/react";
import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef, useEffect, useState } from "react";

import styles from "./FrameworkLinks.module.scss";

/**
 * Framework Links
 *
 * Renders a list of buttons that switch to a specific framework.
 */

interface FrameworkLinksProps extends PropsWithChildren {
  title?: string;
}

const FrameworkLinks = forwardRef(
  (
    { title = "Choose a framework", ...props }: FrameworkLinksProps,
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

      if (f) setHide(true);
      else setHide(false);
    }, [$queryParamFramework]);

    let cls = "FrameworkLinks " + styles.FrameworkLinks;

    return (
      !hide && (
        <div ref={ref} className={cls} {...props}>
          <h2 id="choose-a-framework">{title}</h2>
          <div className={styles.Links}>
            <Button
              as="link"
              size="lg"
              href="?f=bun"
              decoratorLeft={<IconBun />}
            >
              Bun
            </Button>
            <Button
              as="link"
              size="lg"
              href="?f=bun-hono"
              decoratorLeft={<IconBun />}
            >
              Bun + Hono
            </Button>
            <Button
              as="link"
              size="lg"
              href="?f=deno"
              decoratorLeft={<IconDeno />}
            >
              Deno
            </Button>
            <Button
              as="link"
              size="lg"
              href="?f=nest-js"
              decoratorLeft={<IconNestJs />}
            >
              NestJS
            </Button>
            <Button
              as="link"
              size="lg"
              href="?f=next-js"
              decoratorLeft={<IconNextJs />}
            >
              Next.js
            </Button>
            <Button
              as="link"
              size="lg"
              href="?f=node-js"
              decoratorLeft={<IconNodeJs />}
            >
              Node.js
            </Button>
            <Button
              as="link"
              size="lg"
              href="?f=node-js-express"
              decoratorLeft={<IconNodeJs />}
            >
              Node.js + Express
            </Button>
            <Button
              as="link"
              size="lg"
              href="?f=node-js-hono"
              decoratorLeft={<IconNodeJs />}
            >
              Node.js + Hono
            </Button>
            <Button
              as="link"
              size="lg"
              href="?f=remix"
              decoratorLeft={<IconRemix />}
            >
              Remix
            </Button>
            <Button
              as="link"
              size="lg"
              href="?f=sveltekit"
              decoratorLeft={<IconSvelteKit />}
            >
              SvelteKit
            </Button>
          </div>
        </div>
      )
    );
  },
);
FrameworkLinks.displayName = "FrameworkLinks";

export default FrameworkLinks;
