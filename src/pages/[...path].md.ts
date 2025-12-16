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
