<a href="https://arcjet.com" target="_arcjet-home">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://arcjet.com/logo/arcjet-dark-lockup-voyage-horizontal.svg">
    <img src="https://arcjet.com/logo/arcjet-light-lockup-voyage-horizontal.svg" alt="Arcjet Logo" height="128" width="auto">
  </picture>
</a>

# Arcjet Docs

[View the docs](docs).

[Arcjet][arcjet] helps developers protect their apps in just a few lines of
code. Bot detection. Rate limiting. Email validation. Attack protection. Data
redaction. A developer-first approach to security.

Try an Arcjet protected app live at [https://example.arcjet.com][example-url].

## Commands

These docs are built using [Astro][astro] and [Starlight][starlight]. All commands are run from the
root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

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

## Support

[Join our Discord server][discord-invite] or [reach out for support][support].

## Security

This repository follows the [Arcjet Security Policy][arcjet-security].

## License

All content in this repository is licensed under the [Creative Commons
Attribution 4.0 International License](./LICENSE) and all code is licensed under
the [Apache License, Version 2.0](./LICENSE-CODE).

[arcjet]: https://arcjet.com
[astro]: https://astro.build
[starlight]: https://starlight.astro.build
[arcjet-security]: https://docs.arcjet.com/security
[example-url]: https://example.arcjet.com
[discord-invite]: https://arcjet.com/discord
[support]: https://docs.arcjet.com/support
