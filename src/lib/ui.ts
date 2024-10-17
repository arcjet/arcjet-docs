import type { ReactNode } from "react";

/**
 * UI Element options
 */
// Size
export type Size = "xs" | "sm" | "md" | "lg" | "xl";

// Color
export type Color = "primary" | "secondary";

// Option
export type Option = {
  key: string;
  value: string | ReactNode;
};
