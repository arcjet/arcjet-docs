# Contributing

## Commands

These docs are built using [Astro][astro] and [Starlight][starlight]. All commands are run from the
root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm ci`                  | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Tests

We use [Playwright](https://playwright.dev/) for browser testing. The tests are
located in the [`./tests`](./tests) directory.

_These instructions assume you are already running in the provided devcontainer_.

### Run Playwright locally

Playwright will automatically detect if your local dev server is already
running. **If your local dev server isn't running, Playwright will build and
preview the site for testing.**

To open Playwright in UI mode:

```sh
npm run pw:open
```

To run Playwright tests in the terminal:

```sh
npm run pw:run
```

### Updating screenshots

We use screenshot testing to ensure visual consistency. If you make intentional
changes you will likely need to update the stored screenshots. To do so run:

```sh
npm run pw:run -- --update-snapshots changed
```

This will update only the screenshots for tests that have changed. On rare
occasions you may want to update all screenshots, which you can do with:

```sh
npm run pw:run -- --update-snapshots all
```

## Adding content

### Add a framework

- in `lib/prefs.ts` add the key and label to the `frameworks` array
- in `src/components/icons/tech/$Framework.tsx` add an icon
- in `src/components/FrameworkSwitcher.tsx` reference the icon in the
  `frameworkIcon` object
- in `src/components/FrameworkLinks.tsx` add a `case "$framework"` for the icon
- in `src/content/docs/get-started.mdx` add to `frameworks` and
  `titleByFramework`, define steps, and use those steps where appropriate
- in `src/content/docs/reference/$framework.mdx` write a reference guide
- in `src/components/SdkReferenceLinkByFramework.mdx` and `src/lib/sidebar.ts`
  link that reference
- in `public/llms.txt` under SDKs link that reference

### Add framework options to a page

To add a framework option to a page such as `src/content/docs/get-started.mdx`:

- Add your framework to the frontmatter `frameworks`
- Add the page title to the frontmatter `titleByFramework`
- Use `<SlotByFramework />` or `<TextByFramework />` components to display
  content for the currently selected framework:

  ```mdx
  <SlotByFramework client:load>
    ...
    <SomeContent slot="$framework" />
  </SlotByFramework>
  ```

  This will make `<SomeContent />` only visible when the new framework is selected.

### In-page framework links

We provide a framework selection component for each page including the docs home. However the docs home is the only page that always display the links. The other pages will hide the component if a framework is already selected.

In home:

```mdx
<FrameworkLinks
  title="Get started"
  path="/get-started"
  alwaysShow
  client:load
/>
```

## Dependency updates

We maintain a 30 day cooldown period for dependency versions to mitigate supply
chain risks. This cooldown period does not include Arcjet maintained packages or
security updates.

### Update all Arcjet packages to their latest versions

```sh
npx npm-check-updates --interactive --workspaces --filter 'arcjet, @arcjet/*, nosecone, @nosecone/*'
npm up arcjet "@arcjet/*" nosecone "@nosecone/*" --workspaces
```

### Update all dependencies to their cooldown minor versions

```sh
npx npm-check-updates --interactive --cooldown 30 --target minor --workspaces
```

### Update all dependencies to their cooldown major versions

```sh
npx npm-check-updates --interactive --cooldown 30 --target @latest --workspaces
```
