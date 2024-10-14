import { defineCollection, type CollectionConfig } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";
import { opendir, readdir, readFile } from "node:fs/promises";
import { join, basename, extname } from "path";

const collections: Record<string, CollectionConfig<any>> = {
  docs: defineCollection({ schema: docsSchema() }),
};

const contentDir = await opendir("./src/content");

for await (const dirent of contentDir) {
  // Ignore this file and other non-directories in the `content` directory
  if (!dirent.isDirectory()) {
    continue;
  }
  // Filter docs for transition
  if (dirent.name === "docs") {
    continue;
  }

  collections[dirent.name] = defineCollection({
    async loader() {
      const codeSnippets = (
        await readdir(join(dirent.parentPath, dirent.name), {
          withFileTypes: true,
        })
      ).filter((dirent) => dirent.isFile() && !dirent.name.endsWith(".astro"));

      return Promise.all(
        codeSnippets.map(async ({ parentPath, name }) => {
          const location = join(parentPath, name);
          return {
            id: basename(name, extname(name)).toLowerCase(),
            content: await readFile(location, "utf-8"),
          };
        }),
      );
    },
  });
}

export { collections };
