# Code, commands, and UI

Code font · Code samples · Command-line syntax · Placeholders · Command output · UI
elements · Keyboard keys · API reference comments

## Code font in running text

Code font signals that text is meant literally, shows where the literal text starts and
stops, and separates the entity from the prose around it. HTML `code`; Markdown backticks.

**Use code font for:**

attribute names and values · class names · command output · command-line utility names
(`kubectl`, `gcloud`, `bq`) · data types · database rows and columns · defined constants ·
DNS record types · element names, HTML and XML (without angle brackets) · enum names ·
environment variables · filenames, extensions, paths, directories, folders · HTTP
content-type values · HTTP status codes · HTTP verbs · IAM role names · IP addresses ·
language keywords · method and function names · namespace aliases · package names · port
numbers · query parameter names and values · strings such as URLs or domain names used
inside commands and code · text the reader types · placeholder variables · UI elements
whose labels are generated from text the reader entered

**Keep in ordinary font:** product, service, and organization names; domain names in prose;
URLs the reader visits in a browser (better: make them descriptive links).

**Sometimes:**

- *Boolean values* – code font for the literal value (*returns `true`*), ordinary font for
  the evaluation of a condition (*If true, validates the certificate*).
- *Command-line utility names* – code font for the command, ordinary font for the project:
  *the options for the `curl` command are explained on the curl project website*.
- *Email addresses* – code font as computer input or output, ordinary font (and a link)
  as a way to contact someone.

Don't put quotation marks around code unless the quotation marks are part of the code.

**Code in UI elements:** an element that qualifies for code font and appears in the UI gets
both – *In the **Network** list, select **`my-net-2`***.

**Method names:** drop the class name unless it's needed to disambiguate – *call its `get`
method*, not *call its `animal.get` method*.

**HTTP status codes:** *an HTTP `400 Bad Request` status code*. Call it a *status code*,
never a *response code* or *error code*. Ranges: *an HTTP `2xx` status code* or *a status
code in the `200`-`299` range*, with the numbers in code font either way.

**Grammar of code elements:** don't inflect them and don't use them as English verbs or
nouns. Add a noun and inflect the noun.

| Recommended | Not recommended |
|---|---|
| The `ADDRESS` constant's value is defined in the `settings.h` file. | `ADDRESS`'s value is defined in `settings.h`. |
| To add the data, send a `POST` request. | `POST` the data. |
| You can't call the `close` method for a file before you call `open`. | `Close`ing the file requires you to have `open`ed it first. |
| Takes an array of `INT64` values and returns `BYTES` values. | Takes an ARRAY of INT64 and returns BYTES. |

Give technical keywords a qualifying noun: *the `example.yaml` file*, not *`example.yaml`*
by itself.

## Code samples

- Follow the language's own style guide for indentation – usually spaces, two per level.
- Wrap at 80 characters.
- Mark blocks as preformatted: `pre` in HTML, a fence or four-space indent in Markdown.
- Mark omissions with a comment in the sample's language – never `...` or `…`. A block
  containing an omission shouldn't be click-to-copy.
- Introduce with a sentence, colon if the sample follows immediately, period if other
  material intervenes or the last sentence isn't about the sample.

## Command-line syntax

**Best practices.** Link to the command reference in the text that introduces the command.
Use as few optional arguments as possible; let the reference carry the full list. Give a
click-to-copy example the reader doesn't need to edit – ideally only runnable code and
placeholders.

**Formatting.** Break lines over 80 characters before a hyphen, double hyphen, underscore,
or quotation mark, and indent continuation lines four spaces. Every line but the last needs
the continuation character: ` \` on Linux and Cloud Shell, ` ^` on Windows. Follow the
command with the placeholder explanations. End-punctuate documented options only when
they're complete sentences.

**Prompts.** Start each line with the prompt symbol when showing multiple input lines. Don't
show the working directory. Add a new prompt indicator when the context changes (local to
remote). The `$` is optional for a single line, but be consistent within a document. Put
input and output in separate blocks.

**Syntax conventions** – avoid all of these in click-to-copy examples, because the
characters break the command if the reader doesn't strip them:

| Notation | Meaning |
|---|---|
| `[FLAG]` | Optional; bracket each optional item separately |
| `{A\|B}` | Mutually exclusive – choose exactly one |
| `[FLAG ...]` | Argument can repeat |

Instead of bracket notation in a copyable example, do one of: drop the optional arguments
and link to the reference; give a separate code block per option; split the options into
separate task sections; or state plainly that the command contains optional arguments.

**Terminology.** In `gcloud`, a *flag* is any element other than the command or group name,
and a flag or command may take an *argument*; *option* is the safe catchall. In Linux,
commands take *options*, *parameters*, and *arguments*, plus metacharacters, globbing, and
redirection. Describe what the whole command does rather than naming every part, and don't
map `gcloud` nomenclature onto Linux nomenclature.

**Linux signals** are the one place where *kill*, *terminate*, *quit*, *suspend*, and
*stop* are the correct words – use each signal's own verb (`SIGKILL` kills, `SIGTERM`
terminates, `SIGINT` interrupts, `SIGSTOP` stops) and don't substitute synonyms.

## Placeholders

Placeholders stand for values the reader replaces, and for varying values in example
output. Give each a descriptive name; don't use `x` or a run of `x`s except where it's the
standard (HTTP status ranges).

**Format:** `UPPERCASE_WITH_UNDERSCORES`. Not `API-name`, `API_name`, `api_name`,
`apiName`. Never include possessives – no `MY_API_NAME` or `YOUR_API_NAME`. In HTML, wrap
in `var` inside `code`; in Markdown, `` *`PLACEHOLDER`* `` inline, or plain inside a fence.
Brackets, braces, and ellipses stay outside the `var` element.

**Explain on first use.** Repeat the explanation only in long documents, after several
other placeholders, or in documents readers won't read start to finish.

One placeholder:

> Replace `BUILD_ID` with the ID of the `WORKING` build that you copied in the preceding
> step.

Two or more – introduce with *Replace the following:*, list in order of appearance, colon
after each, description starting lowercase:

> Replace the following:
>
> - `ADMIN_PROJECT_ID`: the project that owns the reservation
> - `LOCATION`: the location of the reservation
> - `CONCURRENCY`: the maximum concurrency target

Introduce an example inside a description with an en dash or *such as* – *`ZONE`: a zone
close to your location – for example, `us-east1`*.

Placeholders in output follow the same pattern, introduced with *This output includes the
following values:*.

## Command output

Show output only when it earns its place – the reader needs to copy a value from it or
verify something in it.

Introduce with *The output is similar to the following:* or *The output is the following:*.
Customize when you want to point at something: *The output is similar to the following, in
which the `IP` column shows the address for each resource:*.

Mark omitted lines with `...` on its own line – three periods, not the ellipsis character.

## UI elements

State instructions in terms of what the reader accomplishes, not the widget: *Refresh the
page*, *Expand the **Advanced options** section*. Drop to widget level when the procedure
is genuinely about navigating the UI or the control is hard to find.

**Bold every UI element name** – buttons, menus, dialogs, windows, list items, anything with
a visible label. Don't bold a product or feature name unless it's labeling an on-screen
element. Give context for an element mentioned outside a procedure: *the **Current jobs**
section of the service console*.

Match on-screen capitalization, except that all-caps and inconsistently cased labels become
sentence case: *Click **Refresh***, not *Click **REFRESH***.

Don't verb UI labels:

| Recommended | Not recommended |
|---|---|
| In the **Name** field, enter an account name. | **Name** the account. |
| To save the settings, click **Save**. | **Save** the settings. |
| For **Service account ID**, enter a name. | Specify a **Service account ID**. |

**Terminology.** *Window* – an application window or a dockable module. *Page* – a web page
or a console subpage. *Dialog* – a small detached window (not *pop-up*). *Pane* or *panel* – a rectangular region inside a window (not *section*, *area*, or *column*). *Section* – a
labeled grouping of controls within a window or pane. *Menu bar* holds *menus*, which hold
*commands* (not *choices*, *menu items*, or *options*). *Navigation menu*, not *navigation
bar/pane/panel*. *Toolbar* holds buttons; one with a menu is a *menu button*. *Tab*,
*text box* (*field* in Google Cloud and Workspace), *list box*, *combo box*, *spin box*,
*checkbox*, *radio button*, *expander arrow*, *toggle*.

No slang: not *hamburger icon*, *zippy*, *expando*, *drop-down* (as a noun for *menu*).

**Angle brackets** abbreviate menu paths: *Select **View > Tools > Developer Tools***. Put a
nonbreaking space before each bracket, bold the whole sequence as one span, and wrap each
bracket in `<span aria-label="and then">` so screen readers don't say "greater than". Only
for menu items – don't chain different element types.

**Buttons and icons.** Refer to a button by its label: *Click **OK***, not *Click the "OK"
button*. For an icon button, show the icon and then the tooltip name: *Click ⋮ **Settings
and utilities***. Never the icon alone, and never *Click the bell icon*. Drop trailing
ellipses from labels: **Save ...** is documented as **Save**. If a button has no tooltip,
file a bug – tooltips are an accessibility requirement.

For hard-to-find elements, use the icon plus name, add context (*On the Cloud Run toolbar*),
or supply a screenshot. Never directional language.

**Verbs:** click, choose, drag, enable, enter, type, go to, hold the pointer over, press,
select, tap, turn on, turn off. Use *select* and *clear* for checkboxes rather than *check*
and *uncheck*; refer to state as *selected* or *not selected*. Don't use *toggle* as a verb.

**Prepositions:** *in* a dialog, field, list, menu, pane, or window; *on* a page, tab, or
toolbar.

## Keyboard keys

Use `kbd` in HTML, monospace elsewhere. Uppercase letter keys: `Control+S`, never
`Control+s`. Spell out modifier keys – Command, Control, Option, Shift – and never use
symbols. Spell out confusable characters: comma, hyphen, period, plus.

Refer to a key by name, adding *key* if it would otherwise be ambiguous: *Press `Esc`* or
*Press the `Esc` key*. Combination form is `MODIFIER+KEY`, with Shift in the middle:
`Control+Shift+?`.

Put the macOS shortcut in parentheses after the Windows and Linux one: *press `Control+C`
(or `Command+C` on macOS)*.

Use *press* for triggering an action and *enter* or *type* for entering text. Call it a
*keyboard shortcut* or a *key combination*. Use `code`, not `kbd`, when the key's value is
being entered as text.

## API reference comments

Phrase a method's main description in terms of what the method does – third person with the
*-s*: *Creates a new task on the specified task list*, not *Create a new task*.

In Android reference material, link the first mention of each API element (class, method,
constant, XML attribute) in a section, in code font; later mentions in the same section use
code font without the link. When a term is used as a concept rather than a class, don't
capitalize it and don't use code font – *the user interface for an activity* versus *the
`Activity` class*.
