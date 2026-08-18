# Punctuation

Commas · Dashes · Hyphens and compounds · Colons · Semicolons · Periods and end
punctuation · Quotation marks · Slashes · Parentheses · Ellipses · Example introductions

## Commas

**Serial comma, always.** *Locations are divided into zones, regions, and multi-regions.*

Put a comma after an introductory word or phrase: *Finally, only groups that contain
parameters appear in this list.*

Two independent clauses joined by a coordinating conjunction (*and*, *but*, *or*, *nor*,
*for*, *so*, *yet*) take a comma before the conjunction, unless both clauses are very short:

- The libraries make feed creation easier, and they ensure that only valid feeds are produced.
- Type your ID and click **OK**. (both short – no comma)

An independent clause plus a dependent clause takes a comma only if the sentence could be
misread without one:

- Direct-access flags are plain variables and can be read directly. (no comma)
- The manager acknowledged the last team member who entered the room, and started the
  meeting. (comma prevents misreading)

Comma before *which* starting a nonrestrictive clause. Semicolon, period, or dash before a
conjunctive adverb (*however*, *otherwise*, *therefore*), comma after it. No comma before
*because* unless it starts a nonrestrictive clause.

## Dashes

**Project rule, replacing Google's.** Never use an em dash (`—`). Use an en dash (`–`)
with a space on each side for a break in the flow of a sentence – like this – and for
every other job Google's guide assigns to the em dash.

Google's own guidance is the opposite: an unspaced em dash, and no en dashes anywhere.
Project style outranks this guide, so the project rule is the rule. What matters most is
that a document never mixes the two characters.

Type an en dash as follows:

HTML
  `&ndash;`
macOS
  Press `Option+hyphen`.
Linux
  Press `Control+Shift+U`, release, type `2013`, and then press `Return`. Or press the
  Compose key followed by two hyphens and a period.
Windows
  Turn num lock on, hold down the left `Alt` key, and type `0150` on the numeric keypad.

Don't substitute a double hyphen (`--`).

Ranges keep the hyphen – `2012-2016`, `5-10 minutes` – unless the project decides
otherwise. Settle that question explicitly, because a half-adopted dash convention is
worse than either convention on its own.

Don't use a dash of any kind to separate an item from its description. Use a colon or a
period, or a description list:

- Recommended: Example: This is an example.
- Not recommended: Example - This is an example.

## Hyphens and compounds

Whether to hyphenate depends on position, readability, and convention. Check, in order:
the documentation you're working in, the word list, then Merriam-Webster.

**Prefixes:** generally closed – *infrastructure*, *megabyte*, *metadata*, *preprocessing*,
*pseudocode*, *semiconductor*. Hyphenate when:

- the prefix is *self* or *cross* – *self-managing*, *cross-region*
- the following word is capitalized or a number – *non-Google*, *post-2000*
- it prevents misreading – *de-energize*, *re-mark*, *re-sign*, *intra-index*
- the base term already has hyphens or spaces – *un-Google-like*
- consistency within the document requires it – *pre-processing*, *post-processing*

*non* is often hyphenated because it forms hard-to-parse words. Both patterns occur:
*noncurrent*, *nonempty*, *noninteractive*, *nonpublic*; *non-existence*, *non-integer*,
*non-key*, *non-negative*. Always hyphenate before a hyphenated compound: *non-KSA-based*.

**Compound nouns:** prefer the closed form – *webpage*, *hostname*, *tradeoff*,
*workaround*. The word list holds the exceptions (*multi-region*, *style sheet*).

**Compound modifiers before a noun:** hyphenate for clarity – *a well-designed app*,
*Android-specific techniques*. Hyphenate after *more* or *most* when it clarifies what
they modify: *edge locations with more-reliable internet links*. Avoid three-word compound
modifiers; move words after the noun instead – *test cases that are specific to the 2023
edition*, not *edition-2023-specific test cases*.

**Numbers and units:** hyphenate a number plus a spelled-out unit modifying a noun – *a
64-bit system*, *100,000-byte files*, *a five-minute wait*. Don't hyphenate when the unit
is abbreviated; use a nonbreaking space – *a 200 GB disk*. Hyphenate multiplied units:
*5 vCPU-hours*, *40 person-hours*.

**Suspended hyphens:** *one-, two-, or three-hour intervals*. A space can follow the
hyphen but never precede it.

## Colons

The text before a colon must stand alone as a complete sentence: *The fields are defined as
follows:* – not *The fields are:*.

Lowercase the first word after a colon, except for proper nouns, headings, quotations, and
text after a label such as *Note* or *Caution*.

## Semicolons

Avoid where possible. Legitimate uses: joining two closely related independent clauses;
before a conjunctive adverb (*therefore*) or phrase (*that is*) joining independent
clauses; separating series items that contain their own punctuation.

Note that some screen readers skip semicolons – the meaning must survive without them.

## Periods and end punctuation

End every complete sentence with a period unless it's a question. Exceptions live in lists
and headings.

- **Lists:** see `formatting.md`.
- **Headings and captions on figures:** no period on headings; captions do take end
  punctuation.
- **URLs:** don't end a sentence with a bare URL – the period looks like part of it.
  Rewrite, or put the URL on its own line with no period.
- **Quotation marks:** period goes inside, even when it isn't part of the quoted material – *you might say "Fixed typo."* No period if the quotation ends in a question or
  exclamation mark.
- **Parentheses:** period outside if the parenthetical closes a larger sentence; inside if
  the parentheses contain a complete standalone sentence.
- **Decimals:** a period, not a comma.
- **Abbreviations:** period after a shortened word, none after an acronym or initialism.

One space between sentences.

**Exclamation points:** avoid. Never in concept or reference documentation. Avoid in
procedures – use a period for completion steps (*The VM is created.*). Acceptable in blog
posts to convey enthusiasm, sparingly in tutorials to mark a milestone, and wherever syntax
requires them (`!=`) or a literal must match exactly. In Japanese and Korean especially,
they read as shouting.

## Quotation marks

Straight quotation marks and apostrophes, never curly – code requires straight marks,
automatic conversion makes mistakes, and the difference is nearly invisible in review.

Technical writing uses quotation marks rarely. Use them for:

- Titles of shorter works (articles, episodes) – unless the title is link text
- A section of a larger document you can't link to directly
- Direct citation of a person, slogan, or motto
- A term used metaphorically, when that use isn't already established in the domain

Full-length works take italics instead.

Commas and periods go inside the quotation marks. **Exception:** when the quotation marks
enclose a keyword or literal string, keep other punctuation outside so nothing extraneous
appears inside the literal. Better still, use code font and no quotation marks: *If you
enter `escape`, the program crashes.*

Single quotation marks only in code that requires them, and for a quotation nested inside
a quotation.

## Slashes

Avoid outside code.

- No slashes in dates.
- No slashes for alternatives – write *and* or *or*. Avoid *and/or*; usually *and* implies
  *or*, and when it doesn't, spell out the options: *You can export raw events, processed
  events, or both.*
- No slashes in fractions – they're ambiguous. Use `0.75`, `75%`, or `¾`.
- No slash abbreviations – write *care of*, *with*, not *c/o*, *w/*.
- Forward slashes in paths and URLs (backslashes for Windows paths). Break a long URL after
  a slash; never insert a hyphen to break it.

## Parentheses

Many readers skip parentheses entirely, so don't put important information there. Consider
whether commas, dashes, or a separate sentence would work better. Keep mid-sentence
parentheticals short.

Prefer an en dash or *such as* when introducing an example at the end of a sentence: *Enter
a name for the instance – for example, `my-instance-99`.* Parentheses are fine for a short
mid-sentence example: *Enter a six-digit hex number (for example, `228B22`), and then click
**OK**.*

Don't use parentheses for optional plurals.

## Ellipses

Generally don't use them. Never as suspension points (*The answer is ... wait for it ...*).
Omit them from UI element names: a button labeled **Save ...** is documented as **Save**.

Acceptable in quoted text to mark an omission, but not at the start or end of the
quotation. Three periods, one space before and after, no space after if punctuation
immediately follows. Four dots when the omission spans a sentence boundary.

For omitted code, use a comment in the sample's language – not an ellipsis. For omitted
command output, use three periods on their own line.

## Example introductions

| Position | Approach |
|---|---|
| End of sentence | Set it off with a comma, parentheses, or an en dash: *Choose a strong encryption algorithm, such as AES-256.* *You can monitor various metrics – for example, CPU utilization and active connections.* Never a semicolon. |
| Middle of sentence | Keep it short; set it off with dashes, commas, or parentheses: *Enter a six-digit hex number (for example, `228B22`), and then click **OK**.* |
| Long example | Make it a separate sentence: *For example, you could tag instances by environment with `env:prod`.* |
