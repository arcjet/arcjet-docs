#!/usr/bin/env python3
"""Language-aware code font consistency checking.

Two findings, both under the `code-font` category:

1. **Inconsistent** – an identifier appears in code font somewhere in the document and
   bare somewhere else. High confidence: the document has already decided the term is
   code, so every other occurrence should match.
2. **Unmarked** – an identifier-shaped token appears only in prose, never in code font.
   Lower confidence, reported as `code-font?`.

Language awareness matters because identifier conventions and reserved words differ.
`class`, `type`, `range`, `set`, `map`, `input`, `filter`, `object`, `string`, and `from`
are all keywords in some language and ordinary English in prose. Harvesting them as
identifiers would bury the real findings, so each fenced block's language supplies a
keyword stoplist, and unlabeled blocks are classified by heuristic.
"""

import re

# --- Language identification -------------------------------------------------

LANG_ALIASES = {
    "js": "js", "javascript": "js", "jsx": "js", "node": "js", "mjs": "js", "cjs": "js",
    "ts": "js", "typescript": "js", "tsx": "js",
    "py": "python", "python": "python", "python3": "python",
    "go": "go", "golang": "go",
    "rs": "rust", "rust": "rust",
    "java": "java", "kt": "java", "kotlin": "java",
    "rb": "ruby", "ruby": "ruby",
    "php": "php",
    "sh": "shell", "bash": "shell", "zsh": "shell", "shell": "shell",
    "console": "shell", "terminal": "shell", "shell-session": "shell",
    "sql": "sql",
    "json": "data", "yaml": "data", "yml": "data", "toml": "data", "hcl": "data",
    "html": "markup", "xml": "markup", "css": "markup", "scss": "markup",
    "c": "c", "cpp": "c", "c++": "c", "cs": "c", "csharp": "c",
}

KEYWORDS = {
    "js": """abstract async await break case catch class const constructor continue debugger
        default delete do else enum export extends false finally for from function get
        if implements import in instanceof interface let new null of package private
        protected public readonly return set static super switch this throw true try type
        typeof var void while with yield any boolean number string object symbol unknown
        never undefined require module exports console""",
    "python": """and as assert async await break class continue def del elif else except
        False finally for from global if import in is lambda None nonlocal not or pass
        raise return True try while with yield self cls print len range list dict set
        tuple str int float bool bytes type object input open filter map sum min max
        format id next iter super property staticmethod classmethod""",
    "go": """break case chan const continue default defer else fallthrough for func go goto
        if import interface map package range return select struct switch type var nil
        true false make new len cap append copy delete panic recover print string error
        int int64 float64 bool byte rune""",
    "rust": """as async await break const continue crate dyn else enum extern false fn for
        if impl in let loop match mod move mut pub ref return self Self static struct
        super trait true type unsafe use where while String Vec Option Some None Result
        Ok Err Box str usize isize u8 u32 u64 i32 i64 f64 bool char""",
    "java": """abstract assert boolean break byte case catch char class const continue
        default do double else enum extends final finally float for goto if implements
        import instanceof int interface long native new package private protected public
        return short static strictfp super switch synchronized this throw throws
        transient try void volatile while var record sealed String List Map Set
        Integer Object System""",
    "ruby": """alias and begin break case class def defined do else elsif end ensure false
        for if in module next nil not or redo rescue retry return self super then true
        undef unless until when while yield puts require attr_accessor""",
    "php": """abstract and array as break callable case catch class clone const continue
        declare default do echo else elseif empty enddeclare endfor endforeach endif
        endswitch endwhile enum extends final finally fn for foreach function global
        goto if implements include instanceof insteadof interface isset list match
        namespace new or print private protected public readonly require return static
        switch throw trait try unset use var while xor yield""",
    "shell": """alias awk bash cat cd chmod chown cp curl cut date dirname do done echo
        elif else esac eval exec exit export false fi find for function grep head if
        in kill less local ls mkdir mv printf pwd read return rm sed set sh sleep sort
        source sudo tail tar test then time touch tr true umask unset until wc while
        xargs cmd run""",
    "sql": """add all alter and any as asc between by case cast check column commit
        constraint create cross database default delete desc distinct drop else end
        exists foreign from full group having in index inner insert into is join key
        left like limit not null offset on or order outer primary references right
        rollback select set table then union unique update values view when where with""",
    "data": """true false null nil yes no on off name type kind value key id items
        version spec metadata apiVersion""",
    "markup": """a b body br class code div em h1 h2 h3 h4 h5 h6 head href html i id img
        input label li link meta name ol p pre script span src strong style table tbody
        td th thead title tr type ul var""",
    "c": """auto bool break case catch char class const continue default delete do double
        else enum explicit extern false float for friend goto if inline int long
        namespace new nullptr operator private protected public register return short
        signed sizeof static struct switch template this throw true try typedef typename
        union unsigned using virtual void volatile while string vector""",
}
KEYWORDS = {k: set(v.split()) for k, v in KEYWORDS.items()}

# Signatures for classifying a fenced block with no language label.
HEURISTICS = [
    ("python", re.compile(r"^\s*(?:def |class \w+[:(]|from \w+ import |import \w+$)", re.M)),
    ("js", re.compile(r"\b(?:const|let|var|=>|function|import .* from |require\()")),
    ("go", re.compile(r"^\s*(?:func |package |type \w+ struct)", re.M)),
    ("rust", re.compile(r"^\s*(?:fn |impl |let mut |use \w+::)", re.M)),
    ("java", re.compile(r"\b(?:public|private)\s+(?:static\s+)?(?:class|void|final)\b")),
    ("shell", re.compile(r"^\s*[$#>]\s|\b(?:sudo|npm|pip|curl|git|docker|kubectl)\b", re.M)),
    ("data", re.compile(r'^\s*[\w"-]+\s*:\s|^\s*\{\s*$', re.M)),
    ("sql", re.compile(r"\b(?:SELECT|INSERT INTO|CREATE TABLE|UPDATE)\b")),
    ("markup", re.compile(r"</?\w+[\s/>]")),
]

# Never demand code font for these, however they are shaped.
ALLOWLIST = {
    "javascript", "typescript", "coffeescript", "actionscript", "postscript",
    "github", "gitlab", "bitbucket", "sourceforge", "stackoverflow", "npmjs",
    "postgresql", "mysql", "mongodb", "sqlite", "mariadb", "clickhouse", "dynamodb",
    "graphql", "restful", "oauth", "openid", "jsonwebtoken", "webassembly", "websocket",
    "kubernetes", "openshift", "cloudflare", "powershell", "wordpress", "salesforce",
    "hubspot", "posthog", "sharepoint", "quickbooks", "mailchimp", "sendgrid",
    "macos", "ios", "ipados", "watchos", "tvos", "chromeos", "freebsd", "openbsd",
    "openai", "anthropic", "arcjet", "vercel", "netlify", "supabase", "planetscale",
    "nodejs", "denojs", "nextjs", "nuxtjs", "sveltekit", "fastapi", "sqlalchemy",
    "devops", "devsecops", "mlops", "finops", "gitops", "noops",
    "youtube", "linkedin", "paypal", "ebay", "airbnb", "shopify", "wordpad",
}

# Extensions and TLDs that make a dotted token a filename or domain, not an identifier.
NOT_IDENTIFIER_TAILS = {
    "com", "org", "net", "io", "dev", "app", "ai", "co", "gov", "edu", "sh", "so",
    "js", "ts", "jsx", "tsx", "py", "go", "rs", "rb", "php", "java", "kt", "c", "cpp",
    "html", "css", "scss", "json", "yaml", "yml", "toml", "md", "txt", "csv", "xml",
    "png", "jpg", "svg", "gif", "pdf", "zip", "tar", "gz", "log", "env", "lock", "sql",
}

FENCE = re.compile(r"^(\s*)(```+|~~~+)\s*([\w+#-]*)")
INLINE = re.compile(r"(`+)([^`]+?)\1")
HTML_CODE = re.compile(r"<(code|pre|kbd|var|samp)\b[^>]*>(.*?)</\1>", re.S | re.I)
LINK_URL = re.compile(r"\]\([^)]*\)|https?://\S+")
TOKEN = re.compile(r"[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*")


def classify(label, body):
    """Map a fence label to a canonical language, falling back to content heuristics."""
    canonical = LANG_ALIASES.get(label.strip().lower().lstrip("."))
    if canonical:
        return canonical
    for name, pattern in HEURISTICS:
        if pattern.search(body):
            return name
    return None


def is_identifier_shaped(token, seen_as_call=False):
    """True if the token's shape marks it as code rather than an English word.

    Requires a structural signal, so ordinary prose words never qualify no matter how
    often they appear inside code blocks.
    """
    if token.lower() in ALLOWLIST or len(token) < 3:
        return False
    if "." in token:
        head, _, tail = token.rpartition(".")
        if tail.lower() in NOT_IDENTIFIER_TAILS or not head:
            return False
        return True
    if "_" in token.strip("_"):
        return True
    if re.search(r"[a-z][A-Z]", token):                       # camelCase
        return True
    if re.match(r"^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)+$", token):  # PascalCase, 2+ humps
        return True
    return bool(seen_as_call)


def split_document(text):
    """Return (code_segments, prose_lines).

    code_segments is a list of (language, body). prose_lines is a list of
    (line_number, text) with inline code, HTML code elements, and link URLs blanked out.
    """
    html_code_spans = []

    def mask_html(m):
        html_code_spans.append(m.group(2))
        return " " * (m.end() - m.start())

    text = HTML_CODE.sub(mask_html, text)
    lines = text.split("\n")

    code_segments = [(None, span) for span in html_code_spans]
    prose_lines = []
    fence_marker = None
    fence_label = ""
    buffer = []

    for number, raw in enumerate(lines, start=1):
        fence = FENCE.match(raw)
        if fence and fence_marker is None:
            fence_marker, fence_label, buffer = fence.group(2), fence.group(3), []
            continue
        if fence_marker is not None:
            if (fence and fence.group(2)[0] == fence_marker[0]
                    and len(fence.group(2)) >= len(fence_marker)
                    and not fence.group(3)):
                body = "\n".join(buffer)
                code_segments.append((classify(fence_label, body), body))
                fence_marker, fence_label, buffer = None, "", []
            else:
                buffer.append(raw)
            continue
        if re.match(r"^(?: {4,}|\t)\S", raw):        # indented code block
            code_segments.append((None, raw))
            continue

        inline = []
        stripped = INLINE.sub(
            lambda m: (inline.append(m.group(2)), " " * (m.end() - m.start()))[1], raw)
        for span in inline:
            code_segments.append((None, span))
        prose_lines.append((number, LINK_URL.sub(" ", stripped)))

    if buffer:                                        # unterminated fence
        code_segments.append((classify(fence_label, "\n".join(buffer)), "\n".join(buffer)))
    return code_segments, prose_lines


def harvest(code_segments):
    """Collect identifiers that the document itself has already marked as code."""
    vocabulary = {}
    languages = set()
    for language, body in code_segments:
        if language:
            languages.add(language)
        stop = KEYWORDS.get(language, set())
        for match in TOKEN.finditer(body):
            token = match.group(0)
            if token in stop or token.lower() in stop:
                continue
            called = body[match.end():match.end() + 1] == "("
            if "." in token:
                # Register the final segment too: prose usually writes protect(), not
                # aj.protect(), so the qualified form alone would miss it.
                tail = token.rpartition(".")[2]
                if is_identifier_shaped(tail):
                    vocabulary[tail] = False
                elif called and tail not in vocabulary:
                    vocabulary[tail] = True
            if is_identifier_shaped(token):
                vocabulary[token] = False        # shape alone marks it as code
            elif called and token not in vocabulary:
                # Qualifies only because the code calls it. A bare word like "tool" is
                # ordinary English in prose, so only flag it when written as "tool()".
                vocabulary[token] = True
    return vocabulary, languages


def check_code_font(text, include_unmarked=True):
    """Return findings as (line, column, category, message, match) tuples."""
    code_segments, prose_lines = split_document(text)
    vocabulary, languages = harvest(code_segments)
    all_stopwords = set().union(*KEYWORDS.values()) if KEYWORDS else set()

    findings = []
    for number, line in prose_lines:
        for match in TOKEN.finditer(line):
            token = match.group(0)
            called = line[match.end():match.end() + 1] == "("
            if token in vocabulary:
                if vocabulary[token] and not called:
                    continue
                findings.append((
                    number, match.start() + 1, "code-font",
                    f"'{token}' is in code font elsewhere in this document. "
                    "Use code font here too.", token))
            elif include_unmarked and is_identifier_shaped(token, seen_as_call=called):
                if token in all_stopwords or token.lower() in all_stopwords:
                    continue
                findings.append((
                    number, match.start() + 1, "code-font?",
                    f"'{token}' looks like a code identifier but never appears in code "
                    "font. Add backticks, or ignore if it's a product name.", token))
    return findings, languages
