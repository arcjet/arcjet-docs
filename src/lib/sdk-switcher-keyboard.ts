/**
 * Keyboard helpers for the SDK switcher.
 *
 * Behavior follows the WAI-ARIA select-only combobox pattern, which matches
 * a native `<select>`: arrows move the highlight, Home/End jump the ends,
 * and printable keys typeahead.
 */

/** Moves the highlight without wrapping, like a native select list. */
export function moveActiveIndex(
  count: number,
  current: number,
  delta: number,
): number {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, current + delta));
}

function startsWithQuery(label: string, query: string): boolean {
  return label.toLocaleLowerCase("en").startsWith(query.toLocaleLowerCase("en"));
}

function isRepeatedCharacter(query: string): boolean {
  if (query.length < 2) return false;
  const first = query[0]?.toLocaleLowerCase("en");
  return [...query].every((character) => character.toLocaleLowerCase("en") === first);
}

/**
 * Returns the next option index for a typeahead buffer.
 *
 * A single letter or prefix finds the next match from the active option,
 * wrapping once. Repeating the same letter (for example `nn`) cycles through
 * labels that start with that letter.
 */
export function typeaheadIndex(
  labels: readonly string[],
  activeIndex: number,
  query: string,
): number {
  if (!query || labels.length === 0) {
    return Math.max(0, Math.min(activeIndex, labels.length - 1));
  }

  if (isRepeatedCharacter(query)) {
    const letter = query[0] ?? "";
    const matches = labels.flatMap((label, index) =>
      startsWithQuery(label, letter) ? [index] : [],
    );
    if (matches.length === 0) {
      return activeIndex;
    }
    const currentMatch = matches.indexOf(activeIndex);
    const next = currentMatch === -1 ? 0 : (currentMatch + 1) % matches.length;
    return matches[next] ?? activeIndex;
  }

  const start = Math.max(0, activeIndex);
  for (let offset = 0; offset < labels.length; offset++) {
    const index = (start + offset) % labels.length;
    const label = labels[index];
    if (label && startsWithQuery(label, query)) {
      return index;
    }
  }

  return activeIndex;
}

export const TYPEAHEAD_RESET_MS = 500;
