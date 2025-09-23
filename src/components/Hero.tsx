import Button from "@/components/Button";
import { ArrowRight as IconArrowRight } from "@/components/icons/ArrowRight";
import IconLogoMarkSpark from "@/components/icons/LogoMarkSpark";
import { Bun as IconBun } from "@/components/icons/tech/Bun";
import { Deno as IconDeno } from "@/components/icons/tech/Deno";
import { Fastify as IconFastify } from "@/components/icons/tech/Fastify";
import { NestJs as IconNestJs } from "@/components/icons/tech/NestJs";
import { NextJs as IconNextJs } from "@/components/icons/tech/NextJs";
import { NodeJs as IconNodeJs } from "@/components/icons/tech/NodeJs";
import { ReactRouter as IconReactRouter } from "@/components/icons/tech/ReactRouter";
import { Remix as IconRemix } from "@/components/icons/tech/Remix";
import { SvelteKit as IconSvelteKit } from "@/components/icons/tech/SvelteKit";
import type { ForwardedRef, HTMLProps, ReactNode } from "react";
import { forwardRef, Fragment, memo, useEffect, useState } from "react";
import type { StarlightRouteData } from "@astrojs/starlight/route-data";

import styles from "./Hero.module.scss";

export interface Props extends HTMLProps<HTMLDivElement> {
  astroEntry: StarlightRouteData["entry"];
}

// From: https://starlight.astro.build/reference/frontmatter/#hero
interface HeroConfig {
  title?: string;
  tagline?: string;
  image?:
    | {
        // Relative path to an image in your repository.
        file: string;
        // Alt text to make the image accessible to assistive technology
        alt?: string;
      }
    | {
        // Relative path to an image in your repository to be used for dark mode.
        dark: string;
        // Relative path to an image in your repository to be used for light mode.
        light: string;
        // Alt text to make the image accessible to assistive technology
        alt?: string;
      }
    | {
        // Raw HTML to use in the image slot.
        // Could be a custom `<img>` tag or inline `<svg>`.
        html: string;
      };
  actions?: Array<{
    text: string;
    link: string;
    variant?: "primary" | "secondary" | "minimal";
    icon?: string;
    attrs?: Record<string, string | number | boolean>;
  }>;
}

/**
 * Hero
 *
 * Override to default Starlight Hero component.
 */
const Hero = forwardRef(
  (
    { className, astroEntry, ...props }: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const [title, setTitle] = useState<string>();
    const [actions, setActions] = useState<HeroConfig["actions"]>();
    const [actionSections, setActionSections] =
      useState<HeroConfig["actions"][]>();
    const [image, setImage] = useState<HeroConfig["image"]>();
    const [tagline, setTagline] = useState<HeroConfig["tagline"]>();

    useEffect(() => {
      setTitle(astroEntry.data.title);

      const hero = astroEntry.data.hero;

      // NOTE: HeroConfig and StarlightRouteData typing mismatch for actions
      //       and image. Each array includes a possible `undefined` value.

      setActions(hero?.actions as HeroConfig["actions"]);
      setTagline(hero?.tagline);
      setImage(hero?.image as HeroConfig["image"]);
    }, [astroEntry]);

    useEffect(() => {
      const groups: HeroConfig["actions"][] = [];
      actions &&
        actions.map((action) => {
          const groupIdx: number | undefined =
            action?.attrs?.group != undefined
              ? (action?.attrs?.group as number)
              : undefined;
          if (groupIdx != undefined) {
            if (!groups[groupIdx]) groups[groupIdx] = [];

            groups[groupIdx].push(action);
          }
        });
      setActionSections(groups);
    }, [actions]);

    const Action = memo(({ action }: any) => {
      let icon: ReactNode | null = null;

      if (action?.attrs) {
        switch (action.attrs.ajIcon) {
          case "mark":
            icon = <IconLogoMarkSpark />;
            break;
          case "arrow-right":
            icon = <IconArrowRight />;
            break;
          case "next-js":
            icon = <IconNextJs />;
            break;
          case "node-js":
            icon = <IconNodeJs />;
            break;
          case "bun":
            icon = <IconBun />;
            break;
          case "deno":
            icon = <IconDeno />;
            break;
          case "fastify":
            icon = <IconFastify />;
            break;
          case "sveltekit":
            icon = <IconSvelteKit />;
            break;
          case "nest-js":
            icon = <IconNestJs />;
            break;
          case "react-router":
            icon = <IconReactRouter />;
            break;
          case "remix":
            icon = <IconRemix />;
            break;
          default:
            icon = null;
            break;
        }
      }

      return (
        <Button
          className={styles.Action}
          size={action.attrs.group == 0 ? "xl" : "lg"}
          decoratorLeft={action?.attrs?.ajIconPos == "left" ? icon : undefined}
          decoratorRight={
            action?.attrs?.ajIconPos == "right" ? icon : undefined
          }
          appearance={action?.variant == "primary" ? "default" : "text"}
          as="link"
          href={action.link}
        >
          {action.text}
        </Button>
      );
    });

    let cls = `Hero ${styles.Hero}`;
    if (className) cls += " " + className;

    return (
      <div ref={ref} className={styles.Hero} {...props}>
        {image && "dark" in image && (
          <img
            className={`${styles.Image} ${styles.Dark}`}
            src={(image as any).dark.src}
            alt={image.alt}
          />
        )}
        {image && "light" in image && (
          <img
            className={`${styles.Image} ${styles.Light}`}
            src={(image as any).light.src}
            alt={image.alt}
          />
        )}
        {image && "file" in image && (
          <img
            className={styles.Image}
            src={(image as any).file.src}
            alt={image.alt}
          />
        )}

        <div className={styles.Content}>
          <div className={styles.Body}>
            <h1 id="_top" className={styles.Title}>
              {title}
            </h1>
            {tagline && <div className={styles.Tagline}>{tagline}</div>}
          </div>
          {actions && actions.length > 0 && (
            <div className={styles.Actions}>
              {actionSections?.map((actions, idx) => {
                return (
                  <div
                    key={`hero-actions-${idx}`}
                    className={styles.ActionsRow}
                  >
                    {actions?.map((action, idx) => {
                      return (
                        <Fragment key={`hero-action-${idx}`}>
                          <Action action={action} />
                        </Fragment>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {props.children}
      </div>
    );
  },
);
Hero.displayName = "Hero";

export default Hero;
