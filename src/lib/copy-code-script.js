/**
 * Copy Code Script
 *
 * This is a clone of Expressive Code's client scripts for
 * interactivity in Starlight's <Code /> components.
 * This is used to manually attach the actions to the code
 * components rendered as slots inside React astro-islands
 * where these don't work by default.
 */
try {
  (() => {
    function a(e) {
      if (!e) return;
      let t = e.getAttribute("tabindex") !== null,
        n = e.scrollWidth > e.clientWidth;
      n && !t
        ? e.setAttribute("tabindex", "0")
        : !n && t && e.removeAttribute("tabindex");
    }
    var u = window.requestIdleCallback || ((e) => setTimeout(e, 1)),
      i = window.cancelIdleCallback || clearTimeout;
    function l(e) {
      let t = new Set(),
        n,
        r;
      return new ResizeObserver((c) => {
        c.forEach((o) => t.add(o.target)),
          n && clearTimeout(n),
          r && i(r),
          (n = setTimeout(() => {
            r && i(r),
              (r = u(() => {
                t.forEach((o) => e(o)), t.clear();
              }));
          }, 250));
      });
    }
    function d(e, t) {
      e.querySelectorAll?.(".expressive-code pre > code").forEach((n) => {
        let r = n.parentElement;
        r && t.observe(r);
      });
    }
    var s = l(a);
    d(document, s);
    var b = new MutationObserver((e) =>
      e.forEach((t) =>
        t.addedNodes.forEach((n) => {
          d(n, s);
        }),
      ),
    );
    b.observe(document.body, {
      childList: !0,
      subtree: !0,
    });
    document.addEventListener("astro:page-load", () => {
      d(document, s);
    });
  })();
} catch (e) {
  console.error("[EC] tabindex-js-module failed:", e);
}
try {
  (() => {
    function i(o) {
      let e = document.createElement("pre");
      Object.assign(e.style, {
        opacity: "0",
        pointerEvents: "none",
        position: "absolute",
        overflow: "hidden",
        left: "0",
        top: "0",
        width: "20px",
        height: "20px",
        webkitUserSelect: "auto",
        userSelect: "all",
      }),
        (e.ariaHidden = "true"),
        (e.textContent = o),
        document.body.appendChild(e);
      let a = document.createRange();
      a.selectNode(e);
      let n = getSelection();
      if (!n) return !1;
      n.removeAllRanges(), n.addRange(a);
      let r = !1;
      try {
        r = document.execCommand("copy");
      } finally {
        n.removeAllRanges(), document.body.removeChild(e);
      }
      return r;
    }
    async function l(o) {
      let e = o.currentTarget,
        a = e.dataset,
        n = !1,
        r = a.code.replace(
          /\u007f/g,
          `
`,
        );
      try {
        await navigator.clipboard.writeText(r), (n = !0);
      } catch {
        n = i(r);
      }
      if (!n || e.parentNode?.querySelector(".feedback")) return;
      let t = document.createElement("div");
      t.classList.add("feedback"),
        t.append(a.copied),
        e.before(t),
        t.offsetWidth,
        requestAnimationFrame(() => t?.classList.add("show"));
      let c = () => !t || t.classList.remove("show"),
        d = () => {
          !t ||
            parseFloat(getComputedStyle(t).opacity) > 0 ||
            (t.remove(), (t = void 0));
        };
      setTimeout(c, 1500),
        setTimeout(d, 2500),
        e.addEventListener("blur", c),
        t.addEventListener("transitioncancel", d),
        t.addEventListener("transitionend", d);
    }
    function s(o) {
      o.querySelectorAll?.(".expressive-code .copy button").forEach((e) =>
        e.addEventListener("click", l),
      );
    }
    s(document);
    var u = new MutationObserver((o) =>
      o.forEach((e) =>
        e.addedNodes.forEach((a) => {
          s(a);
        }),
      ),
    );
    u.observe(document.body, {
      childList: !0,
      subtree: !0,
    });
    document.addEventListener("astro:page-load", () => {
      s(document);
    });
  })();
} catch (e) {
  console.error("[EC] copy-js-module failed:", e);
}
