# Agent Instructions

This file contains instructions specifically for AI agents working on this
codebase.

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
