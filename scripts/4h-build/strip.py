#!/usr/bin/env python3
"""Strip the Jump$tart-only content from a copy, for the 4-H build.

Part of the two-step 4-H build. Run this FIRST, then `rebrand.py`.
See previous-context.md ("Maintaining the 4-H version").

The 4-H edition deliberately does NOT carry:
  - the three modules taken from the official Jump$tart Grades 1-4
    sequence (opportunity-costs, investing-tomorrow, money-tales)
  - the Resources screen listing official Jump$tart materials
  - the Grades 1-4 reframe of the landing page and module library

app.js handles the last two automatically: the landing page, module
library, and Resources route all key off whether ANY module carries an
`officialLesson` tag. Removing the tags here is what flips the whole app
back to its general layout, so there is no separate 4-H app.js to
maintain.

Usage:
    python3 scripts/4h-build/strip.py /path/to/4h/working/copy
"""
import re
import sys

DEFAULT_ROOT = "/home/user/money-ready-copy"

# Modules that came from the official Jump$tart sequence.
DROP = ["opportunity-costs", "investing-tomorrow", "money-tales"]


def drop_module(src, module_id):
    """Remove one `{ ... }` module object from the MODULES array."""
    marker = '    id: "%s",' % module_id
    idx = src.find(marker)
    if idx < 0:
        print("  module not found (already removed?):", module_id)
        return src
    start = src.rfind("  {", 0, idx)
    depth, i = 0, start
    while i < len(src):
        if src[i] == "{":
            depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0:
                break
        i += 1
    end = i + 1
    while end < len(src) and src[end] == ",":
        end += 1
    while end < len(src) and src[end] in "\r\n":
        end += 1
        if end < len(src) and src[end] not in "\r\n":
            break
    print("  removed module:", module_id)
    return src[:start] + src[end:]


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ROOT
    data = root + "/assets/js/data.js"
    lessons = root + "/assets/js/lessons.js"

    src = open(data, encoding="utf-8").read()

    for mid in DROP:
        src = drop_module(src, mid)

    # Removing these tags is what makes app.js fall back to the general
    # layout: flat module list, no Resources tab, no Grades 1-4 framing.
    before = src
    src = re.sub(r"^\s*officialLesson: .*\n", "", src, flags=re.M)
    src = re.sub(r"^\s*officialMaterials: \[[^\]]*\],\n", "", src, flags=re.M)
    if src != before:
        print("  removed officialLesson / officialMaterials tags")

    # Two modules were re-tagged to single grades for the Jump$tart
    # sequence; restore their original wider bands.
    for old, new in [
        ('    id: "needs-vs-wants",\n    title: "Needs vs. Wants",\n    emoji: "\U0001f9fa",\n    gradeBand: "Grade 1",',
         '    id: "needs-vs-wants",\n    title: "Needs vs. Wants",\n    emoji: "\U0001f9fa",\n    gradeBand: "Grades 2–5",'),
        ('    id: "save-or-spend",\n    title: "Save or Spend?",\n    emoji: "\U0001f437",\n    gradeBand: "Grade 3",',
         '    id: "save-or-spend",\n    title: "Save or Spend?",\n    emoji: "\U0001f437",\n    gradeBand: "Grades 3–6",'),
    ]:
        if old in src:
            src = src.replace(old, new)
            print("  restored original grade band")

    # The helper cites the official Grade 1-4 lessons, which this edition
    # no longer contains. Make the source labels generic.
    for old, new in [
        ("Jump$tart Teen Teach-In · Grade 1 Needs and Wants; Grade 3 Saving and Spending",
         "Financial literacy curriculum · spending and saving"),
        ("Jump$tart Teen Teach-In · Grade 3 Saving and Spending",
         "Financial literacy curriculum · spending and saving"),
        ("Jump$tart Teen Teach-In · Grade 4 Investing in Tomorrow",
         "Financial literacy curriculum · saving and investing"),
        ("Jump$tart Teen Teach-In · Grade 2 Making Financial Choices and Opportunity Costs",
         "Financial literacy curriculum · choices and opportunity cost"),
        ("Jump$tart Clearinghouse · credit and debt resources",
         "Financial literacy curriculum · credit and debt"),
        ("Jump$tart Clearinghouse · earning income resources",
         "Financial literacy curriculum · earning income"),
        ("Jump$tart Clearinghouse · fraud and risk resources",
         "Financial literacy curriculum · fraud and risk"),
        ("Jump$tart Clearinghouse · banking resources",
         "Financial literacy curriculum · banking"),
    ]:
        src = src.replace(old, new)

    open(data, "w", encoding="utf-8").write(src)

    # Drop the lesson packs belonging to the removed modules.
    lsrc = open(lessons, encoding="utf-8").read()
    for mid in DROP:
        pat = re.compile(r'  "%s": \{.*?\n  \},\n' % re.escape(mid), re.S)
        lsrc, n = pat.subn("", lsrc)
        if n:
            print("  removed lesson pack:", mid)
    open(lessons, "w", encoding="utf-8").write(lsrc)

    print("done")


if __name__ == "__main__":
    main()
