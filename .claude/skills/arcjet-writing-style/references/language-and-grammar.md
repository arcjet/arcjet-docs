# Language and grammar

Person and voice · Tense · Pronouns · Articles · Possessives · Plurals · Abbreviations ·
Capitalization · Product names · Jargon · Anthropomorphism · Prescriptive word choice ·
Reference verbs

## Person

Address the reader as *you*; assume the reader is the one doing the task. Use *user* only
for the user of the software the reader is building.

| Recommended | Not recommended |
|---|---|
| The following sections describe how you can create a website. | ...how we can create a website. |
| Consider adding a description to your table. | Let's add a description to our table. |
| This document shows you how to develop an app. | This document shows the user how to develop an app. |

For instructions, use the imperative – the *you* is implied: *Click Submit*. Imperative in
running text is fine once you've established who's addressed, but consider whether it
should be a formal procedure instead.

Use third person for what the software or an end user does. In API documentation, state
facts about programming elements in third person and address the reader as *you* when
telling them what to do.

First-person plural (*we*, *our*, *us*) is acceptable for the organization authoring the
document, provided the antecedent is unmistakable: *Example Organization provides A and B,
but we don't provide C.* Otherwise avoid first person, except in FAQ questions and
signed commentary.

Identify who *you* is – developer, administrator, operator – and hold it constant. State
it explicitly near the top when it isn't obvious.

## Voice

Active voice by default: the grammatical subject performs the action.

- Recommended: Send a query to the service. The server sends an acknowledgment.
- Not recommended: The service is queried, and an acknowledgment is sent.

Naming the actor with *by* is worse than recasting. Passive is fine to emphasize an object
(*The file is saved*), to de-emphasize the actor (*Over 50 conflicts were found in the
file* – better than accusing the reader of creating them), or when responsibility is
irrelevant (*The database was purged in January*).

## Tense

Present tense for general behavior. Future tense only for something that genuinely happens
later:

- Recommended: Add the filename to the backup list. The file will be archived the next time
  the backup process runs.
- Recommended (asynchronous delivery): A message is sent that will notify any subscribers.

Never use future tense for how a product will work after a future release. Avoid
hypothetical *would*: *If you send an unsubscribe message, the server removes you from the
list*, not *the server would then remove you*.

## Pronouns

Every pronoun needs an unmistakable antecedent.

- Recommended: If you type text in the field, the text doesn't change.
- Not recommended: If you type text in the field, it doesn't change.

Follow demonstratives with a noun: *Set this value to true*, not *Set this to true*.

Gender-neutral: use singular *they*. Never *he/she*, *(s)he*, or a generic *he*.

*That* introduces a restrictive clause, no comma: *The echidna that has a long snout is
furry* (one particular echidna). *Which* introduces a nonrestrictive clause, preceded by a
comma: *The echidna, which has a long snout, is furry* (all echidnas). Use *who* for
people; *that* is acceptable if you're unsure. *Whose* works for people, animals, and
things.

Don't drop relative pronouns: *the rules that you previously defined*.

## Articles

Include *a*, *an*, and *the*, including in headings – dropping them for brevity hurts
comprehension and translation. *Create a VM instance*, not *Create VM instance*.

Don't put *the* before a product name unless the name modifies something else. Do use
*the* before tool and API names: *the Transcoder API*, *the `gcloud` CLI*, *the Cloud
Datastore options page*.

*A* or *an* follows sound, not spelling – including for abbreviations, based on how your
audience pronounces them.

## Prepositions

A preposition at the end of a sentence is fine. *See the client library documentation for
the language you're interacting with* beats *...the language with which you're
interacting.* Include prepositions that add clarity; drop the ones that don't.

## Possessives

Singular nouns, including those ending in *s*: add *'s* – *each vector's record*, *the
storage class's quota*. Plural nouns ending in *s*: apostrophe only – *the models'
capabilities*. Plural nouns not ending in *s*: *'s*.

If a possessive reads awkwardly, rewrite: *Analyze the business data*, not *Analyze the
businesses' data*. *The rule that the Federal Trade Commission (FTC) issued*, not *The
Federal Trade Commission's (FTC's) rule*.

Never form a possessive from a product, feature, or trademark when describing function:
*monitor Google Search performance* or *the performance of Google Search*, not *Google
Search's performance*. Company names can take *'s* when not used as a trademark.

Never form a possessive from a code item. Attach it to the following noun: *the
`wordCount` method's return value*, or rewrite: *the value returned by the `wordCount`
method*.

## Plurals

Standard US English plurals. Never form a plural with *'s* – it collides with possessives
and contractions, and it mistranslates.

Abbreviations pluralize as ordinary words: *APIs*, *IDEs*. Add *es* after *s*, *sh*, *ch*,
or *x*: *OSes*, *BMXes*. Don't pluralize a unit abbreviation after a number: *64 GB*, not
*64 GBs*. Spell out the unit in singular only for one: *0 degrees*, *0.5 degrees*, *1
degree*, *15 degrees*.

Match plurality between spelled-out term and abbreviation: *virtual machines (VMs)*.

Use a plural after *one or more* and a singular after *more than one*: *If one or more
tests fail...*; *You can create more than one instance*.

Never use parenthetical optional plurals: write *To find your API key* or use *one or more*,
not *key(s)* or *child(ren)*.

Don't manually pluralize class names – add a noun: *`Intent` objects*, not *`Intent`s*.

## Abbreviations

Acronyms are pronounced as words (*NATO*, *scuba*); initialisms are spelled out letter by
letter (*CIA*, *PR*); shortened words are fragments, sometimes with a period (*Dr.*,
*etc.*, *min*). Calling them all *acronyms* is fine in practice. Short forms of words
(*app*, *demo*, *sync*) aren't abbreviations and take no period.

Spell out on first mention with the abbreviation in parentheses, and italicize both:
*Establish* Border Gateway Protocol *(*BGP*) sessions...* Capitalize the spelled-out form
only if it's independently a proper noun – *data manipulation language (DML)*, not *Data
Manipulation Language (DML)*. If the first mention is in a heading, define it in the first
paragraph below. Include the abbreviation in link text.

Don't abbreviate terms peripheral to the document's topic. Don't spell out an abbreviation
when the expansion doesn't help (*PDF*). Rarely need expansion: AI, API, DVD, HTML, PC,
RAM, REST, URL, USB, file formats, units of measurement.

Periods: none in acronyms and initialisms; one at the end of a shortened word, except date
and time abbreviations; none after country, US state, or DC abbreviations.

Don't use *i.e.* or *e.g.* – write *that is* and *for example*. Don't use internet slang
(*tl;dr*, *ymmv*, *RTFM*). Don't use abbreviations as verbs: *Use SSH to log in*, not *ssh
into*. Don't use *10x* for *10 times*.

## Capitalization

Standard American English. Don't capitalize for emphasis. Don't rely on a capitalization
difference to carry meaning (a reader new to Kubernetes won't catch *Pod* vs. *pod*).
Avoid all-caps and camel case except in official names or in code.

Sentence case for: titles and headings, captions, image labels and callouts, list items,
every element of a table, glossary definitions. Glossary and index terms are lowercase
unless independently capitalized. No period at the end of a title or heading.

After a colon, lowercase – unless what follows is a proper noun, a heading, a quotation, or
text after a label such as *Note* or *Caution*.

When a hyphenated word starts a sentence or heading, capitalize only the first element
unless a later element is a proper noun.

In references to a title or heading from a document that follows this guide, use sentence
case even if the original used title case. Retain original capitalization for outside works.

Don't name casing styles – *camel case*, *snake case* don't localize and aren't
standardized. Describe the requirement and show an example: *no spaces between words, first
letter of each word capitalized – for example, `AssertionAccount`.*

## Product and feature names

Follow the official capitalization of every brand, product, service, and community-defined
term. Google product names are title case; if an official name starts lowercase, keep it
lowercase even at the start of a sentence – or better, rewrite so it isn't first.

Feature names are generally lowercase unless officially capitalized. Match a UI label when
you're referring to one.

Use the full trademarked product name; don't abbreviate except to match a UI label. Once
you've established the product, it's often better to talk about the general concept (*a
service mesh*) than to repeat the name.

Don't use product or feature names as verbs.

## Jargon

Jargon is a specialized group's figurative shorthand (*swim lane*, *out-of-the-box*,
*break-glass procedure*) or a vague overloaded term (*solution*, *support*, *workload*).
It blocks readers outside the group and translates badly.

Before using a term, ask:

- **Can you write around it?** *When the project is finished, review what worked* instead of
  *Hold a post-mortem.*
- **Is there a more specific term?** *affected area* for *blast radius*, *import* for
  *ingest*, *ready-made* for *off-the-shelf*.
- **Used once?** Describe it in plain language and put the jargon in parentheses, or link
  to a definition.
- **Used throughout?** Define it briefly in parentheses at first use: *a* cold standby *(a
  redundant system identical to the primary)*.
- **In a command or code sample?** Use the term only in direct reference to the code, in
  code font, and make the referent explicit.

Retain jargon when readers search for it – SEO is a legitimate reason.

## Anthropomorphism

Don't give software human qualities. It's imprecise and hard to translate.

| Recommended | Not recommended |
|---|---|
| A Delimiter object specifies where to split a string. | A Delimiter object tells the splitter where a string should be broken. |
| The PC detects a new device. | The PC sees a new device. |

## Prescriptive word choice

Write prescriptive documentation: recommend a path rather than listing options. Choose the
auxiliary verb that says exactly what you mean.

| Situation | Use |
|---|---|
| Action is required | *must*, or a plain imperative |
| Action is recommended | *We recommend...* (*should* is acceptable for widely recognized practice) |
| Action is optional | *can* |
| Outcome is expected | describe it: *The process returns 10 items.* |
| Outcome is possible | *might*, *can* |

Avoid *should* generally – the reader can't tell whether it's required. For states,
replace *The value should be true* with the specific meaning: *You must set the value to
true*, or *The server sets the value to true*, or *If the value is false, follow these
steps*.

## Verbs in reference documentation

Describe what a method does, not what the developer does with it – third person, with the
*-s*: *tasks.insert: Creates a new task on the specified task list*, not *Create a new
task*.
