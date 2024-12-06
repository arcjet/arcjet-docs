import { forwardRef, type ForwardedRef, type HTMLProps } from "react";

import styles from "@/components/Block.module.scss";
import stylesShared from "@/components/BlockShared.module.scss";

export interface Props extends HTMLProps<HTMLDivElement> {}

/**
 * Block
 * A layout block.
 */
const Block = forwardRef(
  ({ ...props }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    let cls = `Block BlockShared ${styles.Block} ${stylesShared.BlockShared} ${stylesShared.Level1} ${stylesShared.Blur} ${stylesShared.Solid}`;
    if (props.className) cls += " " + props.className;

    return (
      <div className={cls} {...props}>
        <div className={"BlockInner " + stylesShared.BlockInner}>
          {props.children}
        </div>
      </div>
    );
  },
);
Block.displayName = "Block";

export default Block;
