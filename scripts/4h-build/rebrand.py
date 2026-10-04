#!/usr/bin/env python3
"""Rebrand a copy of this toolkit from Virginia Jump$tart to Loudoun 4-H.

Part of the two-step 4-H build. Run `strip.py` first, then this.
See previous-context.md ("Maintaining the 4-H version") for the full flow.

Ordered, explicit string replacements. Order matters: longer and more
specific phrases are replaced before the general ones, so that e.g.
"Virginia Jump$tart's Teen Teach-In-style" is handled before the bare
"Jump$tart" rule would mangle it.

Usage:
    python3 scripts/4h-build/rebrand.py /path/to/4h/working/copy
"""
import os
import sys

DEFAULT_ROOT = "/home/user/money-ready-copy"

FILES = [
    "index.html",
    "README.md",
    "assets/css/styles.css",
    "assets/js/app.js",
    "assets/js/data.js",
    "assets/js/lessons.js",
    "assets/js/metrics.js",
]

# (old, new) applied IN ORDER.
R = [
    # --- Resources screen ---------------------------------------------
    # The 4-H edition must not link to or imply the Jump$tart resources
    # page. In practice `strip.py` removes the officialLesson tags, which
    # hides this screen entirely, but these keep it correct either way.
    ('var TTI_URL = "https://www.jumpstart.org/awareness/check-your-school/teen-teach-in/resources/";',
     'var TTI_URL = "";  // 4-H edition: materials come from the local 4-H office'),
    ("Additional programs listed on the official resources page.",
     "Additional financial-literacy programs a 4-H leader may recommend."),
    ("⭐ Official Teens-as-Teachers lesson", "⭐ Core Grades 1–4 lesson"),
    ("Open the official resources page", "Ask your 4-H leader for materials"),

    # --- phrases split across lines or JS string concatenation ---------
    ("email to Virginia\n  // Jump$tart. Contains only aggregate numbers",
     "email to Loudoun 4-H.\n  // Contains only aggregate numbers"),
    ("designed to support Virginia Jump$tart's\n            Teen Teach-In–style workshops.",
     "designed to support Loudoun 4-H's\n            teen-led money workshops."),
    ("A proposed student-led pilot that helps Virginia Jump$tart make ",
     "A student-led prototype that makes Loudoun 4-H "),
    ("Teen Teach-In and workshop content more interactive, practical, and measurable.",
     "money workshops more interactive, practical, and measurable."),
    ("A proposed student-led pilot that helps Virginia Jump$tart make Teen Teach-In and workshop content more interactive, practical, and measurable.",
     "A student-led prototype that makes Loudoun 4-H money workshops more interactive, practical, and measurable."),

    # --- standards helper ---------------------------------------------
    ("the Virginia Jump$tart / National Standards resources",
     "the Loudoun 4-H and Cooperative Extension resources"),
    ("the National Standards and chapter-approved Virginia Jump$tart resources",
     "approved Loudoun 4-H and Cooperative Extension resources"),
    ("chapter-approved Virginia Jump$tart / National Standards content",
     "approved Loudoun 4-H / Cooperative Extension content"),

    # --- product name --------------------------------------------------
    ("Money Ready Virginia — Interactive Toolkit", "Money Ready — Loudoun 4-H Interactive Toolkit"),
    ("Money Ready Virginia Interactive Toolkit", "Money Ready — Loudoun 4-H Interactive Toolkit"),
    ("Money Ready · Virginia Interactive Toolkit", "Money Ready · Loudoun 4-H Interactive Toolkit"),
    ("Virginia Interactive Toolkit", "Loudoun 4-H · Interactive Toolkit"),

    ("National Standards for Personal Financial Education", "4-H financial literacy curriculum"),

    # --- organisation names --------------------------------------------
    ("Virginia Jump$tart's Teen Teach-In–style", "Loudoun 4-H's Teens-as-Teachers–style"),
    ("Virginia Jump$tart", "Loudoun 4-H"),
    ("Jump$tart", "Loudoun 4-H"),

    # --- programme names -----------------------------------------------
    ("TEEN TEACH-IN SIGN-UP", "4-H WORKSHOP SIGN-UP"),
    ("Teen Teach-In–style", "Teens-as-Teachers–style"),
    ("Teen Teach-In", "Teens-as-Teachers"),

    ("chapter-approved", "approved"),
    ("National Standards", "Cooperative Extension"),
    ("· Virginia moment", "· Loudoun 4-H moment"),

    # --- cleanup of redundancies the rules above can create -------------
    ("Loudoun 4-H's 4-H Teens-as-Teachers", "Loudoun 4-H's Teens-as-Teachers"),
    ("Loudoun 4-H · Interactive Toolkit · Interactive Toolkit", "Loudoun 4-H · Interactive Toolkit"),

    # --- header mark and favicon ---------------------------------------
    # The user asked for a dollar bill, explicitly NOT a clover: the 4-H
    # clover emblem is a protected mark and using it needs clearance from
    # the local 4-H / Cooperative Extension office.
    ("font-size='90'>\U0001f49a</text>", "font-size='90'>\U0001f4b5</text>"),
    ("class=\"logo\">$</span>", "class=\"logo\">\U0001f4b5</span>"),
]


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ROOT
    total = 0
    for rel in FILES:
        path = os.path.join(root, rel)
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            text = f.read()
        before, n = text, 0
        for old, new in R:
            c = text.count(old)
            if c:
                text = text.replace(old, new)
                n += c
        if text != before:
            with open(path, "w", encoding="utf-8") as f:
                f.write(text)
        print("%4d replacements  %s" % (n, rel))
        total += n
    print("done — %d replacements total" % total)


if __name__ == "__main__":
    main()
