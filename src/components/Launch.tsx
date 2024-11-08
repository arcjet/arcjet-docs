import Button from "@/components/Button";
import { ArrowRight as IconArrowRight } from "@/components/icons/ArrowRight";
import type { ForwardedRef, HTMLProps, ReactNode } from "react";
import { forwardRef } from "react";

import styles from "./Launch.module.scss";

export interface Props extends HTMLProps<HTMLDivElement> {
  text: string;
  actions: {
    link: string;
    text: string;
    decoratorLeft?: string;
    decoratorRight?: string;
  }[];
}

/**
 * Launch
 *
 * A box used for launching a specific action.
 */
const FrameworkName = forwardRef(
  ({ text, actions, ...props }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    let cls = `Launch ${styles.Launch}`;
    if (props.className) cls += " " + props.className;

    return (
      <div className={cls} {...props}>
        <div className={styles.Content}>{text}</div>
        <div className={styles.Actions}>
          {actions.map((action, idx) => {
            let iconLeft: ReactNode | null = null;
            let iconRight: ReactNode | null = null;

            if (action?.decoratorLeft) {
              switch (action.decoratorLeft) {
                case "arrow-right":
                  iconLeft = <IconArrowRight />;
                  break;
                default:
                  iconLeft = null;
                  break;
              }
            }

            if (action?.decoratorRight) {
              switch (action.decoratorRight) {
                case "arrow-right":
                  iconRight = <IconArrowRight />;
                  break;
                default:
                  iconRight = null;
                  break;
              }
            }

            return (
              <Button
                key={`launch-action-${idx}`}
                as="link"
                href={action.link}
                size="xl"
                appearance="text"
                decoratorLeft={iconLeft}
                decoratorRight={iconRight}
              >
                {action.text}
              </Button>
            );
          })}
        </div>
      </div>
    );
  },
);
FrameworkName.displayName = "FrameworkName";

export default FrameworkName;
