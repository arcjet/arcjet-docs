import { forwardRef } from "react";

/**
 * Render Fix
 *
 * Utility to hard fix react components not being hydrated on the client
 * even when using client:* directives. The fix is based on wrapping
 * the comp in forwardRef().
 *
 * How to use: Add at the end of the .mdx file experiencing the issue.
 */
const RenderFix = forwardRef(() => null);
RenderFix.displayName = "RenderFix";

export default RenderFix;
