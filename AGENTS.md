# Agent Instructions

This file contains instructions specifically for AI agents working on this
codebase.

## Internal links

See [Internal links](CONTRIBUTING.md#internal-links) in CONTRIBUTING.md.

When editing MDX files, convert any plain markdown internal links to
`<Link.Page>` or `<Link.ToSdk>`. Never split Link text across multiple lines.

## Screenshot generation

**Commit the content change first, then regenerate, then commit the
snapshots.** Regenerating before the content is committed produces snapshots
that fail as soon as you commit.

```sh
git commit -m "docs: ..." -- <the files you changed>
npm run pw:run -- --update-snapshots=changed
git add tests/
git commit --amend --no-edit -- <the files you changed> tests/
```

`git add tests/` is not optional. A new page produces new snapshot files, and
a pathspec commit only covers files git already tracks, so without the `add`
they stay untracked and the commit silently ships without them.

Every page renders a git-derived "Last updated" date. The `<time>` element
carries `data-playwright-mask` and `tests/screenshot.test.ts` masks that
selector, but Playwright sizes the mask to the element's bounding box, so the
rendered width of the date still reaches the image. A modified-but-uncommitted
page shows its *previous* commit's date; committing changes it to today. When
that changes the width — a single-digit day becoming double-digit is enough —
the snapshot differs.

Measured on `src/content/docs/examples.mdx`, previously committed on
2026-09-03: regenerated uncommitted it rendered `Sep 3, 2026`, and the same
content committed rendered `Sep 22, 2026` and differed by 359 pixels against a
`maxDiffPixels` of 300. Both images were 1280x4043, so the layout never moved.

This only bites when the width changes, so getting the order wrong is harmless
most of the time and then is not.

**A change to `src/lib/sidebars.ts` shifts every page.** Adding one top-level
entry failed all 196 screenshots. Regenerate the whole set rather than the ones
you expect to move, and prefer the `playwright-update.yml` workflow dispatched
against your branch: it runs `--update-snapshots=all` on an amd64 runner, which
is the architecture CI compares against. Note that its push does not retrigger
the test workflow, so push again or re-run the checks to verify the result.

## Dependency updates

See the [Dependency updates](CONTRIBUTING.md#dependency-updates) section in
CONTRIBUTING.md for the base commands.

The commands in CONTRIBUTING.md use `--interactive` for human use. As an agent,
follow this workflow instead:

1. Check available updates - Run the command without `--interactive` or `-u` to
   see what updates are available
2. Selectively update - Use `-u` with `--filter 'package1,package2'` to update
   specific packages
3. Install and verify - Run `npm install` and check for peer dependency warnings
4. Handle conflicts - If peer dependency warnings occur, revert problematic
   packages and inform the user why they were not updated.
5. Clean up lockfile (CRITICAL) - If you revert any dependency changes, running
   `npm i` again is NOT sufficient. You MUST clean up the lockfile to prevent
   bloating the diff:
   ```sh
   git checkout main -- package-lock.json
   npm install
   ```

## Security audit

After dependency updates (or independently), resolve known vulnerabilities:

1. Run `npm audit` to list current issues.
2. For each vulnerability, attempt a fix:
   - If `npm audit` says "fix available via `npm audit fix`" (no `--force`),
     run `npm up <package>` for the affected top-level dependency.
   - If it says `--force` is required or the fix is a breaking change, try
     `npm up <package>` anyway — it may pull in a non-breaking patched version.
   - If `npm up` doesn't help because the package is pinned, use
     `npx --no -- npm-check-updates --filter '<package>' --target minor -u`
     (or `--target patch`) then `npm i`.
   - **Do not** run `npm audit fix --force` — it can cause unintended major
     version bumps across the tree.
3. After each update, run `npm audit` again:
   - If the vulnerability is resolved, commit the change:
     `deps: update <package> past <GHSA ID(s)>`.
   - If the vulnerability is **not** resolved, revert the change, clean up the
     lockfile (see step 5 in Dependency updates), and record the package so you
     can report it to the user at the end.
4. After processing all vulnerabilities, report any that could not be resolved
   and explain why (e.g. fix requires a breaking change to a peer dependency).
