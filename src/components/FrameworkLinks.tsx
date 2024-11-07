import Button from "@/components/Button";
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
const FrameworkLinks = forwardRef(
  ({ ...props }: PropsWithChildren, ref: ForwardedRef<HTMLDivElement>) => {
    const [hide, setHide] = useState(false);

    const $queryParamFramework = useStore(queryParamFramework);

    useEffect(() => {
      // Get the framework to display from query params
      const params = new URLSearchParams(window.location.search);
      const f = params.get("f");

      if (f) setHide(true);
    }, [$queryParamFramework]);

    let cls = "FrameworkLinks " + styles.FrameworkLinks;

    return (
      !hide && (
        <div ref={ref} className={cls} {...props}>
          <h2 id="choose-a-framework">Choose a framework</h2>
          <div className={styles.Links}>
            <Button as="link" size="lg" href="/get-started?f=bun">
              Bun
            </Button>
            <Button as="link" size="lg" href="/get-started?f=bun-hono">
              Bun + Hono
            </Button>
            <Button as="link" size="lg" href="/get-started?f=deno">
              Deno
            </Button>
            <Button as="link" size="lg" href="/get-started?f=nest-js">
              NestJS
            </Button>
            <Button as="link" size="lg" href="/get-started?f=next-js">
              Next.js
            </Button>
            <Button as="link" size="lg" href="/get-started?f=node-js">
              Node.js
            </Button>
            <Button as="link" size="lg" href="/get-started?f=node-js-express">
              Node.js + Express
            </Button>
            <Button as="link" size="lg" href="/get-started?f=node-js-hono">
              Node.js + Hono
            </Button>
            <Button as="link" size="lg" href="/get-started?f=remix">
              Remix
            </Button>
            <Button as="link" size="lg" href="/get-started?f=sveltekit">
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
