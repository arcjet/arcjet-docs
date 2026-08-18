#!/usr/bin/env python3
"""Flag mechanical Google-style violations in Markdown or HTML documentation.

Usage:
    python3 style_check.py FILE [FILE ...] [--json] [--only CATEGORY]

This is a regex pass over prose. It catches a narrow, high-confidence class of
errors and says nothing about voice, structure, or accuracy – read the text too.
Code blocks and inline code are skipped, because most rules don't apply there.

Exit code is 1 if anything is flagged, 0 otherwise.
"""

import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from code_font import check_code_font  # noqa: E402

# (category, pattern, message). Patterns run against prose with code masked out.
RULES = [
    # --- Tone ---
    ("tone", r"\bplease\b",
     "Drop 'please' from instructions."),
    ("tone", r"\b(?:simply|easily|effortlessly|quickly)\b|it[’']?s (?:easy|that simple)",
     "Don't call the task easy or fast – it isn't, for the reader who is stuck."),
    ("tone", r"!(?!=)",
     "Avoid exclamation points outside code and literal strings."),
    ("tone", r"\b(?:let's|lets)\s+(?:start|begin|take|look|create|dive)\b",
     "Avoid 'let's' – use second person or the imperative."),
    ("tone", r"\b(?:tl;dr|ymmv|rtfm|imho|fyi)\b",
     "No internet-slang abbreviations."),
    ("tone", r"\bnote that\b",
     "'Note that' is filler – state the fact, or use a Note notice."),

    # --- Word choice ---
    ("wording", r"\b(?:utilize|utilizes|utilizing|leverage|leverages|leveraging)\b",
     "Use 'use'."),
    ("wording", r"\b(?:commence|commences|endeavor|endeavour)\b",
     "Use the simple word: 'start', 'try'."),
    ("wording", r"\bin order to\b",
     "'to' is enough."),
    ("wording", r"\b(?:allows you to|enables you to|permits you to)\b",
     "Use 'lets you'."),
    ("wording", r"\b(?:e\.g\.|i\.e\.)",
     "Write 'for example' or 'that is'."),
    ("wording", r"\betc\.",
     "Introduce the list so it's clearly not exhaustive instead of trailing 'etc.'"),
    ("wording", r"\band/or\b",
     "Spell out the options: 'A, B, or both'."),
    ("wording", r"\bshould\b",
     "'should' is ambiguous. Use 'must', 'can', 'might', or 'We recommend'."),
    ("wording", r"\bhover(?:s|ing)? over\b",
     "Use 'hold the pointer over'."),
    ("wording", r"\brun the following command\b",
     "Say what the command does instead."),
    ("wording", r"\bfor more information on\b",
     "Use 'for more information about'."),
    ("wording", r"\bmake use of\b",
     "Use 'use'."),

    # --- Timeless documentation ---
    ("timeless", r"\b(?:currently|presently|at present|as of this writing|for the time being)\b",
     "Time-anchored: the documentation is assumed current."),
    ("timeless", r"\b(?:soon|eventually|in the future|does not yet|doesn't yet)\b",
     "Don't anchor to a timeline or pre-announce."),
    ("timeless", r"\bthe latest\b",
     "'latest' goes stale – name the version."),

    # --- Excessive claims ---
    ("claims", r"\b(?:the best|the fastest|the simplest|the easiest|world-class|blazing[- ]fast)\b",
     "Superlative claim – state something verifiable instead."),
    ("claims", r"\b(?:guarantees|guaranteed|ensures)\b",
     "Only claim a guarantee where one truly exists."),

    # --- Inclusive language ---
    ("inclusive", r"\b(?:whitelist|blacklist|whitelisted|blacklisted)\b",
     "Use 'allowlist' / 'denylist', or rewrite around it."),
    ("inclusive", r"\b(?:sanity[- ]check|crazy|insane|dummy|cripples?|lame)\b",
     "Ableist. Choose a precise, neutral word."),
    ("inclusive", r"\bman-hours\b",
     "Use 'person-hours'."),
    ("inclusive", r"\b(?:mankind|manpower|manned)\b",
     "Use a gender-neutral term."),
    ("inclusive", r"\b(?:he/she|\(s\)he|s/he)\b",
     "Use singular 'they'."),
    ("inclusive", r"\b(?:master|slave)\b",
     "Prefer 'primary'/'replica' or 'parent'/'worker' unless it's a code keyword in code font."),

    # --- Accessibility ---
    ("a11y", r"\b(?:diagram|table|figure|image|screenshot|section|example|command|list|steps?)\s+(?:above|below)\b",
     "Directional language. Use 'preceding' or 'following'."),
    ("a11y", r"\b(?:above|below)\s+(?:diagram|table|figure|image|screenshot|section|example)\b",
     "Directional language. Use 'preceding' or 'following'."),
    ("a11y", r"\b(?:left|right)[- ]hand side\b|\b(?:on the|in the) (?:left|right)\b",
     "Directional language doesn't survive translation or screen readers."),
    ("a11y", r"\[(?:click here|here|this document|this page|this link|read more|learn more|more)\]",
     "Link text must make sense out of context."),
    ("a11y", r"\bclick here\b",
     "Link text must make sense out of context."),
    ("a11y", r"!\[\s*\]\(",
     "Image has empty alt text – confirm the image is purely decorative."),

    # --- Punctuation and mechanics ---
    ("mechanics", r"[\u2018\u2019\u201c\u201d]",
     "Use straight quotation marks and apostrophes."),
    ("mechanics", r"\u2014",
     "Project rule: no em dashes. Use a spaced en dash (–)."),
    ("mechanics", r"(?<!-)--(?!-)",
     "Double hyphen used as a dash. Use a spaced en dash (–)."),
    ("mechanics", r"\d\u2013\d",
     "Ranges take a hyphen, not an en dash."),
    ("mechanics", r"[^\s\d]\u2013|\u2013[^\s\d]",
     "Put a space on each side of an en dash used as a sentence break."),
    ("mechanics", r"\s+&\s+",
     "Use 'and', not an ampersand."),
    ("mechanics", r"\b\d{1,2}/\d{1,2}/\d{2,4}\b",
     "Ambiguous numeric date. Write 'January 19, 2017' or ISO 8601."),
    ("mechanics", r"\b\d+(?:st|nd|rd|th)\b",
     "Spell out ordinals: 'first', 'fifth'."),
    ("mechanics", r"\b\d+x\b(?!\d)",
     "Write '10 times', not '10x'. (Dimensions like 192x192 are fine.)"),
    ("mechanics", r"\b\w+\(s\)",
     "No parenthetical plurals. Pick singular or plural, or use 'one or more'."),
    ("mechanics", r"\b\d+(?:GB|MB|KB|TB|GiB|MiB|KiB|ms|kg|mm|Mbps)\b",
     "Put a nonbreaking space between the number and the unit."),
    ("mechanics", r"\b(?:GBs|MBs|KBs|TBs)\b",
     "Don't pluralize a unit abbreviation."),
    ("mechanics", r"\bclick the \"",
     "Refer to a button by its bold label, not a quoted label plus 'button'."),

    # --- Lower-confidence heuristics ---
    ("maybe", r"\b(?:is|are|was|were|be|been|being)\s+\w+(?:ed|wn|en)\s+by\b",
     "Possible passive voice – name the actor."),
    ("maybe", r"\b\w+,\s+\w+\s+and\s+\w+\b",
     "Possible missing serial comma."),
]

CODE_FENCE = re.compile(r"^(\s*)(```|~~~)")
INLINE_CODE = re.compile(r"`[^`]*`")
HTML_CODE = re.compile(r"<(code|pre|kbd|var)\b.*?</\1>", re.S | re.I)
MD_LINK_URL = re.compile(r"\]\([^)]*\)")
HEADING = re.compile(r"^(#{1,6})\s+(.*?)\s*$")
GERUND_OK = {"billing", "pricing", "licensing", "networking", "logging", "monitoring",
             "formatting", "processing", "reporting", "onboarding", "troubleshooting"}


def mask(text):
    """Replace code spans with same-length filler so offsets stay accurate."""
    def blank(m):
        return " " * (m.end() - m.start())
    text = HTML_CODE.sub(blank, text)
    text = INLINE_CODE.sub(blank, text)
    text = MD_LINK_URL.sub(blank, text)
    return text


def check_heading(line_no, hashes, text, findings):
    if text.endswith("."):
        findings.append((line_no, 1, "heading", "No period at the end of a heading.", text))
    first = re.sub(r"[^\w-]", "", text.split()[0]).lower().split("-")[-1] if text.split() else ""
    if first.endswith("ing") and first not in GERUND_OK:
        findings.append((line_no, 1, "heading",
                         "Task headings take a bare infinitive: 'Create an instance'.", text))
    if re.match(r"^(?:step\s*)?\d+[.):]", text.strip(), re.I):
        findings.append((line_no, 1, "heading",
                         "Don't number headings – hierarchy conveys sequence.", text))
    if re.search(r"\[[^\]]+\]\(", text):
        findings.append((line_no, 1, "heading", "Don't put links in headings.", text))
    words = [w for w in re.findall(r"[A-Za-z][\w'-]*", text)][1:]
    capped = [w for w in words if w[:1].isupper() and not w.isupper()]
    if len(words) >= 3 and len(capped) >= max(2, len(words) - 1):
        findings.append((line_no, 1, "heading",
                         "Looks like title case. Use sentence case.", text))


def check_file(path, only=None, code_font=True, unmarked=True):
    findings = []
    languages = set()
    try:
        text = open(path, encoding="utf-8").read()
    except OSError as err:
        print(f"{path}: {err}", file=sys.stderr)
        return findings, languages
    lines = text.split("\n")

    if code_font:
        found, languages = check_code_font(text, include_unmarked=unmarked)
        findings.extend(found)

    in_fence = False
    fence_marker = None
    for i, raw in enumerate(lines, start=1):
        fence = CODE_FENCE.match(raw)
        if fence:
            marker = fence.group(2)
            if not in_fence:
                in_fence, fence_marker = True, marker
            elif marker == fence_marker:
                in_fence, fence_marker = False, None
            continue
        if in_fence or re.match(r"^(?: {4,}|\t)\S", raw):
            continue

        heading = HEADING.match(raw)
        if heading:
            check_heading(i, heading.group(1), heading.group(2), findings)

        line = mask(raw)
        for category, pattern, message in RULES:
            if only and category != only:
                continue
            for m in re.finditer(pattern, line, re.I):
                findings.append((i, m.start() + 1, category, message, m.group(0).strip()))

    if only:
        findings = [f for f in findings if f[2].rstrip("?") == only.rstrip("?")]
    return sorted(findings), languages


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("files", nargs="+")
    parser.add_argument("--json", action="store_true", help="emit JSON")
    parser.add_argument("--only", help="restrict to one category")
    parser.add_argument("--no-code-font", action="store_true",
                        help="skip the code font consistency pass")
    parser.add_argument("--strict-code-font", action="store_true",
                        help="also report identifiers that never appear in code font")
    args = parser.parse_args()

    checked = {p: check_file(p, args.only, code_font=not args.no_code_font,
                             unmarked=args.strict_code_font) for p in args.files}
    results = {p: v[0] for p, v in checked.items()}
    langs = {p: v[1] for p, v in checked.items()}
    total = sum(len(v) for v in results.values())

    if args.json:
        print(json.dumps(
            {p: [{"line": l, "col": c, "category": cat, "message": msg, "match": mt}
                 for l, c, cat, msg, mt in v] for p, v in results.items()},
            indent=2))
        return 1 if total else 0

    for path, found in results.items():
        detected = ", ".join(sorted(langs[path])) or "none detected"
        if not found:
            print(f"{path}: clean (code languages: {detected})")
            continue
        print(f"\n{path}: {len(found)} finding{'s' if len(found) != 1 else ''} "
              f"(code languages: {detected})")
        for line, col, category, message, match in found:
            print(f"  {line}:{col} [{category}] {message}")
            print(f"      -> {match!r}")

    if total:
        print(f"\n{total} total. 'maybe' and 'code-font?' findings are heuristics \u2013 "
              "verify before changing.")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
