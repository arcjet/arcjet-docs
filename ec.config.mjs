import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineEcConfig } from "astro-expressive-code";

function lineNumbers() {
  // Only show line numbers on these languages
  const lineNumberLanguages = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "ini",
  ];

  let plugin = pluginLineNumbers();

  return {
    ...plugin,
    name: `Line numbers (${lineNumberLanguages.join(", ")})`,
    hooks: {
      preprocessMetadata: (opt) => {
        const { codeBlock: { language } } = opt;
        if (lineNumberLanguages.includes(language)) {
          return plugin.hooks.preprocessMetadata(opt);
        }
      },

      postprocessRenderedBlock: (opt) => {
        const { codeBlock: { language } } = opt;
        if (lineNumberLanguages.includes(language)) {
          return plugin.hooks.postprocessRenderedBlock(opt);
        }
      },
    }
  };
}

export default defineEcConfig({
  plugins: [
    lineNumbers(),
    pluginCollapsibleSections(),
  ],
});
