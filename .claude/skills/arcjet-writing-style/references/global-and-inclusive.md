# Accessibility, inclusion, and global audiences

Accessibility · Inclusive language · Global audiences · Excessive claims · Timeless
documentation · Example names and reserved values · Third-party content

## Accessibility

Roughly 15% of the world has an accessibility need. Documentation written for accessibility
reads better for everyone.

**General**

- Ensure everything – tabs, buttons, interactive elements – is reachable by keyboard alone.
- Test with a screen reader; it doubles as a self-edit.
- Use semantic HTML and native elements over custom styling. Screen readers announce text
  modifications, so don't add formatting that carries no meaning.
- Don't force line breaks inside sentences or paragraphs; they break on resize and at large
  text sizes.
- Avoid camel case and all-caps – some screen readers read capitals letter by letter, and
  some languages are unicase.
- Not all punctuation is read aloud. The meaning must survive without it, which is another
  reason to avoid exclamation points, question marks, and semicolons.
- Never `&` for *and* in headings, body text, navigation, or contents.

**Ease of reading**

- Break up walls of text with paragraphs, headings, and lists.
- Under 26 words per sentence.
- Define acronyms on first use and again if usage is sparse.
- Parallel structure for parallel things.
- Put the distinguishing information in the first sentence of a paragraph.
- Avoid double negatives and exceptions to exceptions: *You can continue without a path*,
  not *A missing path won't prevent you from continuing.*
- Left-align. Never center or justify.

**Headings** – hierarchy unbroken, no skipped levels, no empty headings, real heading
elements, one `h1`, CSS for appearance.

**Links** – meaningful out of context; never *click here* or *read this document*; use
*see*; explain unexpected behavior; avoid adjacent links or separate them with a character.

**Images** – `alt` on every image, empty when decorative; never introduce new information
only in an image; never images of text, code, or terminal output; SVG over PNG.

**Video** – captions, transcripts, or descriptions; captions translatable; nothing that
flickers or flashes.

**Tables** – introduce in the preceding text; `th` for first row and column only; `scope`
where relevant; `headers` and unique IDs for multiple header rows; never merged cells;
avoid tables mid-procedure; no information carried by an image or symbol without alt text.

**Interactive elements** – introduce in the text before them.

**Forms** – `label` on every input, placed outside the field; error messages that say what
went wrong and how to fix it.

**Custom CSS and JavaScript** – 4.5:1 contrast for text; never `visibility:hidden` or
`display:none` for content; avoid mouseover-only interactions, or pair them with focus and
blur handlers; keep visual order consistent with DOM order.

**Rendering test.** The document must convey everything without sound, without images,
without color, without punctuation, using only sound, using only a keyboard, and under
magnification. Never let color, size, or position be the only carrier of meaning – pair a
color or icon state change with a text label change.

**Directional language.** Not *above*, *below*, *left-hand side*. In a document, use
*earlier*, *preceding*, *following*: *In the preceding diagram...*. In a UI, name the
element (*Click ☰ **Menu***) or provide a screenshot.

## Inclusive language

**Gendered language.** *person-hours*, not *man-hours*. *humanity*, not *mankind*. Singular
*they*.

**Ableist language.** Not *crazy*, *insane*, *sanity check*, *blind to*, *cripple*, *dumb*,
*dummy variable*.

| Recommended | Not recommended |
|---|---|
| Give everything a final check for completeness. | Give everything a final sanity-check. |
| There are some baffling outliers in the data. | There are some crazy outliers in the data. |
| It slows down the service. | It cripples the service. |
| Replace the placeholder in this example. | Replace the dummy variable in this example. |

**Graphic and metaphorical language.** Prefer the precise term: *If the connection doesn't
respond, check for errors*, not *If the connection hangs*. *Point to **File**, and then
click **New***, not *Hover over **File**, and hit **New***. Don't build explanations on
metaphors like *pets versus cattle*. Where an industry term has a specific technical
meaning with no accurate synonym (*terminate*, *execute*), use it.

**Divisive framing.** Avoid *native speakers* / *non-native speakers*, *first-class
citizen*, *native feature*. Usually the document doesn't need the distinction at all.

**Replacing established non-inclusive terms.** When replacing outright would confuse
readers, name the old term once in parentheses and use the replacement thereafter:

> To make sure that administrators get the notification, add them to an allowlist
> (sometimes called a *whitelist*).

Often rewriting is better than substituting: *You can allow requests from a range of IP
addresses...*, rather than *You can allowlist a range of IP addresses...*.

**Non-inclusive terms inside code.** When the term is a name or keyword you can't change,
minimize it rather than propagating it. Refer to it once, in code font, in parentheses if
possible – *creates a parent node (which is named `master` in the file)*; *start the replica
by using the `START SLAVE` statement* – and use the preferred term (*parent node*,
*replica*) everywhere else. Never use such a term outside code font.

**Disability and accessibility.** Research how the communities you're writing about prefer
to be described.

- Don't call people without disabilities *normal* or *healthy*. Use *nondisabled person*,
  *sighted person*, *hearing person*, *neurotypical person*.
- Avoid terms that erase personhood – not *the disabled*, *a quadriplegic*. Use *people with
  disabilities*, *a quadriplegic person*. Note that many autistic, blind, and Deaf people
  prefer identity-first language; follow community preference over a blanket rule.
- Avoid judgment and pity: not *victim of*, *suffering from*, *wheelchair-bound*. Use
  *experiencing*, *living with*, *uses a wheelchair*.
- Avoid euphemisms: not *physically challenged*, *special*, *differently abled*,
  *handi-capable*.

**Diverse examples.** Vary names, ages, and locations. Avoid US-specific holidays, sports,
and cultural practices. For older adults, use *older adults* or *aging population*, not
*the elderly*, *seniors*, or *80 years young*. Watch for stereotypes in which personas get
which job roles.

## Global audiences and translation

Three distinct things: *localization* adapts a product to a country (currency, units);
*translation* converts language; *internationalization* designs to minimize localization
effort.

**Simplify.**

- Simple words: *start* not *commence*, *so* not *consequently*, *use* not *utilize* or
  *leverage*. (These are fine in their special senses – *utilizes up to 100% of the
  available CPU*.)
- One word instead of a phrase: *some* or *many*, not *a number of*.
- Short sentences. English is compact; a long English sentence becomes longer in
  translation, which hurts comprehension, breaks layouts, and raises cost.
- Avoid phrasal verbs where a single verb exists: *This document uses the following terms*,
  not *makes use of*. Some have no good substitute – *set up*, *log in*, *sign in*.
- No more than two nouns modifying another noun: *a cloud-native DevSecOps pipeline in a
  hybrid environment*, not *a hybrid cloud-native DevSecOps pipeline*.
- Place *only* immediately before what it modifies: *Request only one token*.

**Use words in their primary sense.** Don't use the same word to mean different things,
and especially don't use a word as both noun and verb nearby. Watch *once*, *while*, *as*,
*since*.

**Keep helper words.** Conversational English drops *then*, *that*, *of*, and relative
pronouns; translation needs them.

| Recommended | Not recommended |
|---|---|
| If the attribute key is not found, then the default value is returned. | If the attribute key is not found, the default value is returned. |
| ...and assumes that you have the following knowledge: | ...and assumes you have the following knowledge: |
| Identify all of the datasets. | Identify all the datasets. |
| Start the profiler, and then run the app. | Start the profiler, then run the app. |
| You can update the rules that you previously defined. | ...the rules you previously defined. |

Repeat a word when the redundancy prevents ambiguity: *creates both IAM segmentation and
network segmentation*, not *both IAM and network segmentation*.

**Clarify antecedents.** Translators often work on disconnected strings. Replace an
ambiguous pronoun with the noun: *If you use the term* green beer *in an ad, then make sure
that the ad is targeted*, not *...that it's targeted*.

**Be consistent.** Use exactly the same term, with the same capitalization, for the same
concept everywhere – different names read as different concepts and multiply translation
cost. Use standardized phrasing for recurring moves (introducing links, output, samples).
Standard subject-verb-object order, subject and verb early, conditional clause first,
parallel list items, consistent formatting.

**Avoid.** Colloquialisms and idioms (*ballpark figure*, *back burner*, *hang in there*),
humor, culturally specific references, seasons, and unnecessary negative constructions.
Define abbreviations. Use unambiguous date formats. Use screenshots sparingly – images
aren't translated, so no new information can live only in them.

## Excessive claims

An excessive claim asserts something about performance, cost, or security that the reader
can't verify, that a single incident would falsify, or that reads as subjective or
disparaging – especially about third-party products. Judge it against what might be true in
future, not just today.

- Avoid superlatives: *best*, *simplest*, *fastest*, *never*, *always*. Use *ensure* and
  *guarantee* only where something truly is guaranteed.
- Cite the source of any specific performance claim.
- Security features *help with* security or are *designed for* security. A product that
  "is secure" is falsified the day someone compromises it.
- A claim about a competitor can be wrong today through misunderstanding and wrong tomorrow
  through their next release.

| Recommended | Not recommended |
|---|---|
| Our product distributes datasets in memory across a cluster, and therefore it can be faster for this scenario than ExampleCorp's product. For more information, see Performance comparison. | Our product is faster than ExampleCorp's product. |
| Using our security product is part of an overall strategy that helps prevent account takeovers from phishing attacks. | Our security product prevents account takeovers from phishing attacks. |

## Timeless documentation

Document how the product works now – not how it changed, not how it might change. Words
that anchor text to a moment go stale and mislead.

Avoid in product and reference documentation: *as of this writing*, *currently*, *does not
yet*, *eventually*, *existing*, *future*, *in the future*, *latest*, *new*, *newer*, *now*,
*old*, *older*, *presently*, *at present*, *soon*.

| Recommended | Not recommended |
|---|---|
| These subcommands let you interact with HTTP load balancing. | These new subcommands let you... |
| The following command-line options aren't supported: | ...aren't currently supported: |
| The emulator supports the following filters: | The emulator now supports the following filters: |

*Currently* is implied by the documentation existing at all. If you need *new*, anchor it:
*The January 14, 2021 release includes a new resource panel.*

Time-stamped content – release notes, blog posts, press releases – is exempt. *Soon* is also
fine in procedures describing a state change: *The VM goes offline soon after you send the
shutdown command.*

**Never pre-announce.** Don't document future features or products, however innocuously,
without legal approval.

## Example names and reserved values

Never use real domains, email addresses, names, phone numbers, project names, or anything
personally identifiable.

| Kind | Use |
|---|---|
| Domains | `example.com`, `example.org`, `example.net` (IANA-reserved) |
| Email | A reserved domain plus an example name – `dana@example.com`; generic addresses like `support@example.net` are fine |
| Given names | Alex, Amal, Ariel, Bola, Charlie, Cruz, Dana, Dani, Hao, Ira, Izumi, Jie, Kai, Kalani, Kim, Kiran, Lee, Lucian, Luka, Mahan, Noam, Nur, Quinn, Raha, Rosario, Sasha, Tal, Taylor, Tristan, Yuri |
| Surnames | An initial after the given name – Quinn N., Dana A. |
| Companies | Example Organization; differentiate with Enterprise Example Organization, Startup Example Organization |
| Phone numbers | US numbers in `800-555-0100` through `800-555-0199` |
| IPv4 | `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` (RFC 5737) |
| IPv6 | The RFC 3849 range |

Use singular *they* for example people and avoid specifying gender unless it matters. Watch
for stereotypes in which personas get which roles. Don't use Alice and Bob unless you're
documenting a specification that uses them; if you do, stay within that cast.

Format real phone numbers with nonbreaking hyphens (`&#8209;`) so they don't wrap:
`415‑555‑0132`. International numbers take a plus sign and country code: `+1‑415‑555‑0132`.
Extensions follow the number: `415‑555‑0132, extension 987`.

## Third-party content

Don't copy from other sources – it risks copyright infringement. Paraphrase and link
instead. This covers text, images, code, logos, and speech.

Treat as unsafe to reuse: third-party documentation, websites, books, blogs, videos, images,
and podcasts; dictionaries, encyclopedias, and Wikipedia; open source project documentation
(licenses vary widely); and GitHub content (licenses vary per user). When in doubt, don't.

| Recommended | Not recommended |
|---|---|
| A recovery point objective (RPO), which is the maximum acceptable length of time during which data might be lost from your app due to a major incident. | Recovery Point Objective (RPO): "RPO is the maximum targeted period in which data (transactions) might be lost..." (Wikipedia) |
