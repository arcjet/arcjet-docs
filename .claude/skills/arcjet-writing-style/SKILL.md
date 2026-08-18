---
name: arcjet-writing-style
description: Write and edit technical documentation to the Arcjet writing style, based on the Google developer documentation style guide (developers.google.com/style) – voice and tone, second person, active voice, sentence-case headings, list and procedure structure, code and UI formatting, punctuation, accessibility, inclusive language, and the A-Z word list. Use this whenever the user is writing, reviewing, editing, or restructuring developer-facing documentation – READMEs, API reference, quickstarts, tutorials, how-to guides, release notes, SDK docs, CLI docs, error messages, or docs-site pages – and whenever they ask to "follow the Google style guide," "make this sound like good docs," "edit my docs," or "review this documentation." Also use it for questions about a specific usage decision (hyphenation, capitalization, whether a term is allowed, how to format a placeholder or a command).
---

# Arcjet writing style

Editorial rules for developer documentation, condensed from Google's public style guide.
The guide is a house style, not an industry standard – apply it consistently, and depart
from it where doing so serves the reader better. When you depart, be consistent within
the document.

Precedence, highest first: the project's own style guide → this skill → Merriam-Webster
for spelling, Chicago Manual of Style for non-technical style.

Adapting outside Google: guidance naming Google products is a worked example of a general
rule. Substitute the product being documented and keep the rule.

## Project deviations from Google style

These override the guide wherever they conflict. Apply them without comment; they are
house rules, not mistakes.

- **Dashes.** Never an em dash (`—`). Use a spaced en dash (`–`) for a break in the flow
  of a sentence. Google's guidance is the reverse; ignore it. Ranges keep the hyphen.

## The rules that carry most of the weight

1. **Second person.** Address the reader as *you*. Use the imperative for instructions.
   Reserve third person for what the software or the reader's own end users do. Use *user*
   only for the user of the software the reader is building.
2. **Active voice.** Make clear who performs each action. Passive is acceptable to
   de-emphasize the actor or when the actor is irrelevant.
3. **Present tense.** *The server sends an acknowledgment*, not *will send*. Reserve future
   tense for genuinely later events.
4. **Sentence case** for every title, heading, caption, table cell, label, and list item.
   No period at the end of a heading.
5. **Conditions before instructions.** *To delete the document, click Delete* – not the
   reverse. Location before action: *In the Cloud console, click Save*.
6. **Serial comma**, always: *zones, regions, and multi-regions*.
7. **Code font for anything code-like** – filenames, paths, class and method names, flags,
   env vars, HTTP status codes, ports, IP addresses, data types, console output,
   placeholders. **Bold for UI element names.** Both, if an element is both.
8. **Descriptive link text.** Never *click here*, *this document*, or a bare URL. Introduce
   cross-references with *For more information about X, see Y* – *about*, not *on*.
9. **No directional language.** Not *above*, *below*, *left-hand side*. Use *preceding*,
   *following*, *earlier*, or a screenshot.
10. **Timeless.** Cut *currently*, *now*, *new*, *latest*, *soon*, *existing*. Document how
    the product works, not how it changed.
11. **No excessive claims.** Avoid *best*, *fastest*, *simplest*, *always*, *never*,
    *guarantees*. Security features *help with* security; they don't *prevent* incidents.
12. **Contractions are good.** *Don't*, *isn't*, *you're*. Negative contractions especially – a scanning reader misses a standalone *not*.

## Voice and tone

Aim for a knowledgeable friend: conversational, friendly, respectful, never frivolous.
Not pedantic, not chatty.

Avoid: *please* in instructions; *simply*, *easy*, *just*, *quickly* (they shame the reader
who is stuck); exclamation points; jargon and buzzwords; pop-culture references; humor
(it doesn't translate); *let's*; internet abbreviations; metaphor and figurative language;
anthropomorphism (*a Delimiter object specifies where to split a string*, not *tells the
splitter*).

If a sentence resists you, ask "what am I trying to say?" – the answer is usually the
sentence.

## Sentences and paragraphs

Short sentences; aim under 26 words. One idea per paragraph, roughly five or six sentences
at most. Put the load-bearing information first in the sentence and first in the paragraph.
Standard subject-verb-object order; subject and verb early.

Keep helper words that conversational English drops – *that*, *then*, *of*, and relative
pronouns. *If the key isn't found, then the default is returned.* *The rules that you
defined*, not *the rules you defined*.

Use the simple word: *use* not *utilize* or *leverage*, *start* not *commence*, *so* not
*consequently*. Avoid phrasal verbs where a single verb exists (*uses*, not *makes use of*).
Don't stack more than two nouns as modifiers.

Don't use the same word as both noun and verb nearby, and place *only* immediately before
what it modifies.

## Headings

Task sections take a bare infinitive: *Create an instance*, never *Creating an instance*.
Concept sections take a noun phrase that doesn't start with an *-ing* verb: *Migration to
Cloud Run*. Prefix optional sections with *Optional:*.

One `h1` per page, and don't repeat the page title as a section heading. Don't skip levels,
don't leave a heading with no content under it, don't number headings for sequence, don't
put links in headings, and avoid bare code items (add a descriptive noun). Keep articles in:
*Create a VM instance*, not *Create VM instance*.

To introduce a group of subsections, say *the following sections* – not *this section*.

## Lists and procedures

Numbered for sequence, bulleted for everything else, description lists for term-definition
pairs. Never a one-item list. Use a table instead when each item carries three or more
pieces of related data.

Introduce a list with a complete sentence, not a fragment the items complete. *Use the
Submit button for any of the following purposes:* – not *Use the Submit button to:*.

Capitalize each item. End with a period unless the item is a single word, has no verb, is
entirely code font, or is entirely link text. Keep items parallel; if punctuation ends up
inconsistent, rewrite for parallelism.

A one-step procedure is a bulleted item, not a numbered list of one. Sub-steps get
lowercase letters, then lowercase Roman numerals. Within a step: action, then command, then
placeholder explanations, then output. State the goal before the action, the location
before the action, the result after the action. *Optional:* leads the step. Combine menu
selections with `>` rather than splitting them across steps. Include the `Enter` keypress in
the step that needs it. Don't say *run the following command* – say what the command does.
Where there are several ways to do something, document the best one.

## Code, commands, and UI

Put in code font: filenames, paths, directories, class/method/function names, flags,
keywords, env vars, data types, enum names, HTTP verbs and status codes, ports, IP
addresses, query parameters, command output, and text the reader types. Keep in ordinary
font: product names, organization names, domain names, and URLs the reader visits.

Don't inflect code items – no plurals, no possessives, no verbing. Add a noun and inflect
that: *the `wordCount` method's return value*, *send a `POST` request*.

Placeholders are `UPPERCASE_WITH_UNDERSCORES`, always explained. One placeholder: *Replace
`BUILD_ID` with ...*. Two or more: *Replace the following:* then a list, in order of
appearance, each *`NAME`: lowercase description*.

Wrap code at 80 characters, mark omissions with a comment in the sample's own language
(never an ellipsis), and introduce samples with a sentence ending in a colon.

Bold every UI element name, matching the on-screen capitalization unless it's inconsistent
or all-caps (then sentence case). Don't verb UI labels – *In the Name field, enter a name*,
not *Name the account*. Prepositions: *in* a dialog, field, list, menu, pane, or window;
*on* a page, tab, or toolbar. Use *select* and *clear* for checkboxes, *enter* for boxes,
*press* for keys. Spell out modifier keys: `Control+Shift+S`.

## Notices

Four types, used sparingly – two in a row means the content needs reorganizing.
**Note**: useful but skippable. **Caution**: proceed carefully. **Warning**: don't do this,
or it's irreversible. **Success**: interactive content only.

Never use a note for a prerequisite, a cross-reference, a required step, or anything the
reader must know to succeed.

## Numbers, dates, and units

Spell out zero through nine; numerals for 10 and up. Always numerals for versions,
technical quantities, measurements, percentages, dimensions, and anything with a decimal.
Spell out a number that starts a sentence, or rewrite. Ordinals are words: *first*, *fifth*.

Dates: *January 19, 2017*. Numeric only when forced, and then ISO 8601: `2017-04-15`.
Never slashes. Times: 12-hour, `3 PM`, `3:45 PM`. Avoid seasons – use months or quarters.

Units: nonbreaking space between number and unit (`64&nbsp;GB`), no space for `$10`, `65%`,
`180°`. Repeat the unit across a range and join with *to*, not a hyphen: *-40 °C to 85 °C*.
Don't write MB when you mean MiB.

## Reference files

Read the file that covers the question rather than guessing; the details are dense and
mostly not derivable.

| File | Covers |
|---|---|
| `references/word-list.md` | 600+ A-Z term decisions: spelling, hyphenation, capitalization, allowed and forbidden terms. **Check this before settling any individual word.** |
| `references/language-and-grammar.md` | Person, voice, tense, pronouns, articles, possessives, plurals, abbreviations, capitalization, jargon, *must/can/might/should* |
| `references/punctuation.md` | Commas, dashes, hyphens and compounds, colons, semicolons, periods, quotation marks, slashes, parentheses, ellipses |
| `references/formatting.md` | Headings, lists, procedures, tables, notices, links, images and alt text, numbers, dates, units, footnotes, text-formatting summary |
| `references/code-and-ui.md` | Code in text, code samples, command-line syntax, placeholders, UI elements, keyboard keys, API reference comments |
| `references/global-and-inclusive.md` | Accessibility, inclusive language, writing for translation, excessive claims, timeless docs, example names and domains, third-party content |

## Document workflow

**Writing new:** decide task page or concept page – it sets the heading style and the
document title. Draft, then run the checklist below.

**Editing existing:** fix in this order, because later passes depend on earlier ones –
structure (headings, list vs. table, procedure shape), then sentences (person, voice,
tense, length), then terminology (word list), then mechanics (punctuation, code font,
numbers). Preserve the author's technical claims; you're editing style, not facts. If a
sentence is technically ambiguous, flag it rather than guessing at the meaning.

Report substantive changes compactly – grouped by category, not line by line – and leave
the trivia silent.

**Checking your own output:** run `scripts/style_check.py FILE` for the mechanical
violations that are easy to miss – `please`, `simply`, *click here*, `e.g.`, curly quotes,
`&`, directional language, title-case headings, timeless-docs words, em dashes, exclamation
points. It's a regex pass, so it catches a narrow class of errors with a low false-positive
rate. It doesn't replace reading the text.

The same command runs a code font consistency pass. It harvests identifiers from the
document's own code blocks and inline code, then reports any that also appear bare in
prose – the failure that produces a page where `guardTool` is monospaced in the body and
plain in the FAQ. It reads each fenced block's language label, or infers it, so that
keywords are never mistaken for identifiers: `class`, `type`, `range`, `set`, `map`,
`input`, `filter`, and `from` are code in one language and ordinary English in prose, and
a document can mix Python and JavaScript without either one poisoning the other.

| Flag | Effect |
|---|---|
| *(default)* | Reports identifiers used inconsistently within one document |
| `--strict-code-font` | Also reports identifier-shaped tokens that never appear in code font – usually missing backticks, sometimes a product name |
| `--no-code-font` | Skips the pass |
| `--only CATEGORY` | Restricts output to `tone`, `wording`, `timeless`, `claims`, `inclusive`, `a11y`, `mechanics`, `heading`, `code-font`, or `maybe` |

Bare single words qualify only when prose writes them as a call – `protect()` is flagged,
*the tool* is not. Single-word capitalized tool names such as `Bash` and `Write` are below
the detection threshold; check those by eye.

## Review checklist

- Second person, active voice, present tense throughout
- Every heading sentence case; task headings bare infinitive; hierarchy unbroken
- Lists introduced by complete sentences; items parallel; punctuation consistent
- Procedures: location before action, goal before action, one action per step
- Code font on code items, applied consistently in every section including FAQs
- Bold on UI names; placeholders uppercase and explained
- Link text descriptive and meaningful out of context
- No directional language, no *please*, no *simply*, no exclamation points
- No time-anchored words, no superlatives, no unverifiable claims
- Abbreviations defined on first use; terms consistent across the document
- Example names, domains, IPs, and phone numbers drawn from the reserved sets
- Alt text on every image; nothing conveyed by color or position alone
- Contested terms checked against the word list

---

Adapted from the [Google developer documentation style guide](https://developers.google.com/style),
used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
