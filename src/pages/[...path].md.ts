import type { APIRoute } from "astro";
import { getCollection, render } from "astro:content";
import { experimental_AstroContainer } from "astro/container";
import TurndownService from "turndown";

import mdxRenderer from "@astrojs/mdx/server.js";
import reactRenderer from "@astrojs/react/server.js";

/**
 * Loosely based on the implementation of
 * https://github.com/delucis/starlight-llms-txt, but simplified and adapted
 * to our specific use case.
 */

const container = await experimental_AstroContainer.create();
container.addServerRenderer({ renderer: mdxRenderer });
container.addServerRenderer({ renderer: reactRenderer });

const turndownService = new TurndownService({
  codeBlockStyle: "fenced",
});

// Expressive Code renders each line of a code block as
// `<div class="ec-line"><div class="gutter">…line number…</div>
// <div class="code">…code…</div></div>`. Turndown's default handling
// concatenates the text content of every element, which mashes the line
// numbers into the code and drops the line breaks (e.g. `1import …2const …`).
// This rule reconstructs the code from the `.code` element of each line only,
// preserving line breaks and restoring the language annotation.
turndownService.addRule("expressiveCode", {
  filter: (node) =>
    node.nodeName === "PRE" && node.querySelector(".ec-line") !== null,
  replacement: (_content, node) => {
    const lines = Array.from(node.querySelectorAll(".ec-line")).map((line) => {
      const codeEl = line.querySelector(".code");
      return (codeEl?.textContent ?? line.textContent ?? "").replace(/\n$/, "");
    });
    const language = node.getAttribute("data-language") ?? "";
    const fenceLanguage = language === "plaintext" ? "" : language;
    return `\n\n\`\`\`${fenceLanguage}\n${lines.join("\n")}\n\`\`\`\n\n`;
  },
});

export const prerender = true;

export async function getStaticPaths() {
  const docs = await getCollection(
    "docs",
    (entry) => entry.data.generateMarkdownRoute === true,
  );

  return docs.map((doc) => ({
    params: { path: doc.id },
    props: { id: doc.id },
  }));
}

export const GET: APIRoute<{ id: string }> = async ({ props, locals }) => {
  const [doc] = await getCollection("docs", (entry) => entry.id === props.id);

  if (!doc?.data.generateMarkdownRoute) {
    throw new Error("Document is not configured to generate markdown route");
  }

  const { Content } = await render(doc);

  const html = await container.renderToString(Content);

  const markdown = turndownService.turndown(html);

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
