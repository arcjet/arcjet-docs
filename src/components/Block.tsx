import { forwardRef, type ForwardedRef, type PropsWithChildren } from "react";

import styles from "@/components/Block.module.scss";
import stylesShared from "@/components/BlockShared.module.scss";

export interface Props extends PropsWithChildren {}

/**
 * Block
 * A layout block.
 */
const Block = forwardRef(
  ({ ...props }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        className={`Block BlockShared ${styles.Block} ${stylesShared.BlockShared} ${stylesShared.Level1} ${stylesShared.Blur} ${stylesShared.Solid}`}
      >
        <div className={"BlockInner " + stylesShared.BlockInner}>
          {props.children}
        </div>
      </div>
    );
  },
);
Block.displayName = "Block";

export default Block;
