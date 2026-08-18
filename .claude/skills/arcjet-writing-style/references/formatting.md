# Formatting and organization

Text formatting · Headings · Lists · Procedures · Tables · Notices · Links · Images and alt
text · Numbers · Dates and times · Units · Footnotes · Math · Filenames · HTML and Markdown

## Text-formatting summary

| Style | Use for |
|---|---|
| **Bold** (`<b>`, `**`) | UI element names; run-in headings, including the label at the start of a notice |
| *Italic* (`<i>`, `_`) | New terms on first definition; words as words; titles of full-length works; mathematical and version variables; genuine emphasis |
| `Code` (`<code>`, backticks) | Anything code-like in running text (see `code-and-ui.md`) |
| Code block (`<pre>`, fences) | Code samples, commands, output |
| Underline | Links only |

In Markdown, use `**` for bold and `_` for italics – `__` and `*` are hard to tell apart in
source. Don't override font family, size, or color inline. Never use `&` as a conjunction,
including in headings and navigation; the exception is a UI element whose own label
contains `&`.

## Headings

**Task sections** start with a bare infinitive: *Create an instance*. **Concept sections**
use a noun phrase that doesn't start with an *-ing* verb: *Migration to Google Cloud*.
Mixing both styles in one document is fine – match each heading to its own section.

Gerunds as the first word translate inconsistently and eat character budget. Established
noun gerunds (*Billing*, *Pricing*) are fine, as is an *-ing* form later in a heading
(*Introduction to BigQuery monitoring*).

Prefix optional sections with *Optional:* rather than trailing *(optional)*.

Rules:

- Sentence case; no terminal period; keep articles.
- One `h1` per page. Don't repeat the page title as a section heading – page *Create and
  start VM instances* with sections *Create a VM* and *Start a VM*.
- Never skip a level; never leave a heading with no content beneath it.
- Don't number headings for sequence – hierarchy and order convey it.
- Don't put links in headings. Avoid bare code items; add a descriptive noun.
- Keep punctuation simple; complex punctuation means the heading needs rewriting.
- Abbreviate only when the abbreviation is the better-known form; define it in the first
  paragraph below.
- Use heading elements for structure, CSS for appearance.

Introduce a group of subsections with *the following sections*, never *this section*.

For anchors, use lowercase and hyphens. Add a custom anchor when you expect frequent
inbound links or when revising a heading would otherwise break existing links; if you
change a heading that has an auto-generated anchor, add the old ID as a custom anchor.

## Lists

| Type | Use for | Elements |
|---|---|---|
| Numbered | Sequence: steps, phases, priorities | `ol`, `li` |
| Bulleted | Non-sequential sets; make clear whether all items are required | `ul`, `li` |
| Description | Term-and-definition pairs, glossaries | `dl`, `dt`, `dd` |
| Description with run-in headings | Several concepts to highlight and explain compactly | `ul`, `li` |

Never make a list of one item. Nested numbered lists take lowercase letters, then lowercase
Roman numerals. A list item can hold multiple paragraphs – use `p` elements, not `br`.

**Introductions.** Precede a list with a complete sentence, not a fragment the items
complete. Colon if the list follows immediately, period if other material intervenes. A
list needs no introduction if the preceding heading supplies the context.

| Recommended | Not recommended |
|---|---|
| Use the **Submit** button for any of the following purposes: | Use the **Submit** button to: |
| To get the USB driver, follow these steps: | To get the USB driver: |
| If you need to add an instance manually, do the following: | If you need to add an instance manually: |

**Capitalization and end punctuation.** Capitalize each item unless case carries meaning.
End with a period, except when the item is a single word, has no verb, is entirely code
font, or is entirely link text or a document title. If punctuation ends up inconsistent
across items, rewrite for parallelism rather than mixing.

**Description lists.** Capitalize each term; no period after the term; period at the end of
each description.

**Run-in headings.** Capitalize; end with a period or a colon, consistently within the
list. After a period, the description starts capitalized and ends with a period. After a
colon, the description starts lowercase and takes a period only if it contains a verb or
expresses a standalone thought:

- **Coffee**: latte, mocha, cappuccino, espresso
- **It increases fuel economy by reducing baggage weight**. By charging astronomical prices
  for anything larger than a wallet...

Never separate an item from its description with a dash.

**Comma-separated lists in prose** take serial commas. Don't end with *etc.* or *and so
on* – introduce the list so it's clear it isn't exhaustive: *The service processes data like
event logs, clickstream data, and e-commerce transactions.*

## Procedures

Introduce with a complete sentence, ending in a colon if the steps follow immediately:
*To customize the buttons, follow these steps:* or *To customize the buttons, do the
following:* – not *To customize the buttons:*. Skip the introduction when the heading
already says everything.

A one-step procedure is a single bulleted item, not a numbered list of one.

Sub-steps use lowercase letters, then lowercase Roman numerals. A step that has sub-steps
ends with a colon or period, like any introduction.

**Order within a complex step:** describe the action → give the command → explain the
placeholders → explain the command if needed → show the output if needed → explain the
result in a separate paragraph.

**Rules for steps:**

- Start with an imperative verb; write complete sentences; keep verb forms parallel.
- State the location before the action: *In the Google Cloud console, go to the
  **Monitoring** page* – not the reverse. Restate the context at the start of each
  procedure, even if it's unchanged from the last one.
- State the goal before the action: *To start a new document, click **File > New >
  Document***. If that framing makes a required step look optional, use the colon form:
  *Start a new document: click **File > New > Document***.
- State the result after the action, in the same paragraph: *Click **Run**. The query
  results appear after the query runs.* Don't announce a dialog in one step and then
  re-describe it in the next.
- Lead an optional step with *Optional:* – not *(Optional)*.
- Combine sequential menu selections into one step with `>`: *Click **File > New >
  Document***. Don't stretch this to mixed element types.
- Include the `Enter` keypress in the step that needs it, not as its own step.
- Don't document keyboard shortcuts as the primary path.
- Don't introduce a command with *run the following command* – say what the command does.
- When there's more than one way, document one: prefer the keyboard-accessible path, then
  the shortest, then the language your audience knows best. If you must document several,
  separate them by page, heading, or tab.
- Don't repeat a procedure – link to it.
- Tell readers what they need before they start; limit interruptions; one decision per step.
- Avoid tables mid-procedure.

## Tables

Use a table when each item carries three or more related pieces of data. One item that's a
single unit belongs in a list; a pair of data belongs in a description list.

Don't use tables for page layout, code snippets, single-column data, or long
one-dimensional lists split into columns. Avoid them inside numbered procedures.

- Introduce every table with a complete sentence – many screen readers don't preannounce
  tables. Refer to position: *the following table*.
- Never put a table in the middle of a sentence.
- Sentence case everywhere: headings, cells, captions.
- Concise column headings, no terminal punctuation.
- `th` for the first row and first column only; add `scope` for accessibility.
- Never merge cells; no `colspan` or `rowspan`. No styling on the table element, and never
  use color or font alone to signal a header.
- Sort rows logically, or alphabetically if there's no logical order. Split long or
  multi-header tables.
- Caption only when the document has several tables in proximity: `<b>Table 1.</b>
  Description`, sentence case, no terminal period. Refer to it by number – *as shown in
  table 2* – with *table* lowercase mid-sentence.
- Any image or symbol in a cell needs descriptive alt text.

## Notices

Use sparingly. Several notices in a row means the content needs restructuring. If you're
unsure, write it as body text first and see whether it still needs setting off.

| Type | Meaning |
|---|---|
| Note | Useful aside or tip; the reader still succeeds if they skip it |
| Caution | Proceed carefully |
| Warning | Don't do this, or it's irreversible – data loss, cost, security exposure |
| Success | A successful action or error-free status; interactive content only |

Create a note only when all three hold: the information is relevant but not necessary;
interrupting here doesn't derail the reader; and it isn't just a continuation of the
surrounding text.

Never use a note for a cross-reference, a prerequisite, a step the reader should have taken
earlier, a full procedural step, expected results, or anything required for success.

## Links and cross-references

Every link is a decision and a chance to lose the reader. Prefer giving the information in
place when it's a definition, a brief concept, or two steps. Link rather than reproduce
someone else's standards.

Don't duplicate links on a page, except when linking to a specific section, when the page
is very long, or when there are genuinely multiple entry points.

**Link text** is either the exact page title or a descriptive phrase capitalized as part of
the sentence. Put the important words first; keep it short; don't reuse the same text for
different targets. It must make sense read out of context – screen reader users jump link
to link.

- Recommended: For more information, see Load balancing and scaling.
- Not recommended: See this blog post. / Want more? Click here! / For more information, see
  this document.

Don't use a URL as link text. Include both the long form and the abbreviation when the text
has one: *Google Kubernetes Engine (GKE)*. Include the descriptive noun with a code
element: *the `gcloud instances create` command with the `--hostname` flag*.

**Introductions:** *For more information, see X* or *For more information about Y, see X*.
Use *about*, never *on*. Use *see*, not *read* or *check out*. Add the *about* clause
whenever the link text alone doesn't explain why you're sending the reader there.

**Explain unexpected behavior:** downloads (name the file type), mailto links, on-page
jumps (*see the X section of this document*), and links to a section on another page. Don't
force links to open in a new tab; if one must, say so in the link text.

## Images and alt text

Introduce every image with a complete sentence – colon if it immediately precedes the
image, period otherwise. Screenshots that directly follow the procedural text describing
the UI need no introduction.

**Alt text** is required on every `img`, even if empty. Omitting the attribute makes some
screen readers read the filename aloud. Use `alt=""` for decorative images and for images
that only restate adjacent text – UI screenshots showing how to fill in fields, icons,
ornamental images.

Write alt text as a full sentence or noun phrase, under 155 characters, with punctuation
(screen readers pause on it). Don't start with *Image of* or *Photo of*. Avoid all-caps.
Keep it consistent for repeated images. Consider context, not just content. If the image
carries more than 155 characters' worth of information, summarize in `alt` and give the
full description in the body text.

**Figure captions** are optional. Format: `<b>Figure 1.</b> Description.` Complete
sentences, always end-punctuated. Refer to figures by number (*as shown in figure 1*), not
by position. Don't use a caption as a substitute for alt text.

**Figure descriptions** carry in text whatever the image conveys – new information must
never appear only in an image. Avoid embedding explanatory text in graphics; it breaks
accessibility, search, and localization. When text in an image is unavoidable, keep it
brief, sentence case, no new abbreviations, full product names.

Prefer SVG to PNG. Never use images of text, code, or terminal output.

## Numbers

Spell out zero through nine; use numerals for 10 and above. Spell out a number that starts
a sentence, or rearrange the sentence. Spell out a number immediately followed by a
numeral: *fifteen 100,000-byte files*. Spell out casual approximations: *thousands of
combinations*, *a million songs*.

Always numerals, even below 10: version numbers; technical quantities (memory, disk,
queries, limits); page, chapter, and step numbers; prices; numbers without units; negative
numbers; fractions; percentages; dimensions; decimals; measurements; numbers in a range;
and any number below 10 sharing a sentence with a number above 9.

Ordinals are always words: *first*, *fifth*, *forty-third*.

Decimals: leading zero below one (`0.3 inches`); treat as plural even at 1.0 (`1.0 inches`).
Fractions: prefer decimals; hyphenate spelled-out fractions (*two-fifths*).

Percentages: numeral plus `%`, no space – `40%`. Spell out both if the percentage starts a
sentence.

Ranges: hyphen, no spaces – `2012-2016`. (With units, repeat the unit and use *to*.)

Digit grouping: commas every three digits left of the decimal, including four-digit
numbers (`2,000`); nothing to the right of the decimal. Period for the decimal point.

Currency: `$10,000`, `$0.006653`. Make the currency unambiguous – `US$10` when it could be
read otherwise.

Dimensions: numerals with a lowercase `x`, no spaces – `192x192`.

Avoid Roman numerals except for sub-sub-steps.

## Dates and times

Spell out months and days of the week; give the full four-digit year: *January 19, 2017*;
*Tuesday, April 27, 2021*. No comma between a bare month and year: *January 2017*. A full
date mid-sentence takes a comma after the year: *The January 19, 2017, release of...*

Three-letter abbreviations are acceptable where space is tight (*Mon, Sep 3, 2018*) – but
abbreviate the whole date, not part of it, and do it consistently across the document.

Never numeric dates with slashes – `04/05/09` means three different dates in three parts of
the world. If a numeric date is unavoidable, use ISO 8601: `2017-04-15`. In invented
examples, pick a day above 12 so the order is self-evident.

Times: 12-hour clock unless the product uses 24-hour. Capitalize `AM` and `PM` with a space
before them. Drop `:00` from round hours – `3 PM`, `3:45 PM`. Hyphen, no spaces, in ranges:
`5-10 minutes`. Date before time: *May 4, 2009, at 6 PM*.

Time zones: avoid unless necessary. When required, spell out the region and give the offset
in parentheses – *US and Canadian Pacific Standard Time (UTC-8)*. Never abbreviate the zone
name. Prefer telling readers the time is local to them.

Avoid seasons – they invert across hemispheres. Use months, quarters, or temperature:
*During warmer months*, not *During summer months*.

## Units of measurement

Nonbreaking space between number and unit: `64&nbsp;GB`, `25&nbsp;mm`. No space for
currency, percent, or degrees of an angle: `$10`, `65%`, `180°`. Temperature takes a
nonbreaking space before the degree symbol and none between symbol and scale:
`50&nbsp;&deg;C`. Kelvin drops the degree symbol: `300&nbsp;K`.

In a range, repeat the unit and join with *to* – a hyphen reads as a minus sign:
*-40 °C to 85 °C*.

Hyphenate multiplied units: *5 vCPU-hours*. Don't hyphenate number-plus-abbreviated-unit
before a noun: *200 GB disk*.

Use *per*, not a slash, when space permits: *requests per day*. Shorten to *p* only in
established rate abbreviations: *Gbps*, *MBps*.

Match the byte system to the technology you're documenting: decimal `kB`/`MB`/`GB` versus
binary `KiB`/`MiB`/`GiB`. Don't write one when you mean the other.

Lowercase `k` for thousands is acceptable with no space and an explicit noun: *55k download
operations*.

## Footnotes

Avoid them – they're poor for accessibility and localization. Use a cross-reference, a
note, or a parenthetical instead. If unavoidable, use a superscript number and place
footnotes immediately after a table.

## Mathematical notation

Italicize variables, never operators. Use HTML entities for operators (`&minus;`, `&times;`,
`&ne;`, `&le;`) rather than keyboard characters, with nonbreaking spaces on both sides:
`<i>a</i>&nbsp;&minus;&nbsp;<i>b</i>`. Don't use an asterisk for multiplication in text.
Keep short expressions inline. Don't put a space between a base and its exponent.

## Filenames

Lowercase, hyphens (not underscores – search engines read hyphens as word breaks), standard
ASCII only, no generic names like `document1.html`. Stay consistent with an existing
directory's convention even if it conflicts with this.

Refer to files in code font with the word *file*: *the `pg_hba.conf` file*. Name file types
formally – *a PNG file*, not *a .png file*.

## HTML, Markdown, and semantic tagging

Either format is fine; follow whatever the project already uses. Markdown is easier to read
and write; HTML is more expressive, especially for semantic tagging and special characters.

Use elements for their semantics, not their appearance: `em` for emphasis and `i` for
non-emphasis italics; `strong` for importance and `b` for visual weight; `cite` for titles
of standalone works; `p` plus CSS for spacing, never `br`; heading elements only for
hierarchy, never to change type size; CSS, never tables, for layout.

Two-space indentation, no tabs, lowercase elements and attributes, no trailing whitespace,
80-character lines – except `meta` elements and long URLs, which can't break.
