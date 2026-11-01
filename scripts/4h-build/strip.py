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

It works on the copy's content/ folder (spec 11), then runs
scripts/build-content.js in the copy to regenerate assets/js/content.js
and helper-kb.js. The copy needs content/ and scripts/ as well as assets/.

Usage:
    python3 scripts/4h-build/strip.py /path/to/4h/working/copy
"""
import os
import re
import shutil
import subprocess
import sys

DEFAULT_ROOT = "/home/user/money-ready-copy"

# Modules that came from the official Jump$tart sequence.
DROP = ["opportunity-costs", "investing-tomorrow", "money-tales"]


def drop_key(src, key):
    """Remove a `key:` line from a content YAML file, plus any lines indented under it."""
    out, skipping, ind = [], False, 0
    for line in src.split("\n"):
        stripped = line.lstrip(" ")
        this_ind = len(line) - len(stripped)
        if skipping:
            if stripped and this_ind > ind:
                continue
            skipping = False
        if re.match(r"%s:( |$)" % re.escape(key), stripped):
            skipping, ind = True, this_ind
            continue
        out.append(line)
    return "\n".join(out)


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ROOT
    content = os.path.join(root, "content")
    modules = os.path.join(content, "modules")

    # 1. Drop the modules that came from the official Jump$tart sequence
    #    (their lesson packs and game rounds live in the same file).
    for name in sorted(os.listdir(modules)):
        mid = re.sub(r"^\d+-|\.ya?ml$", "", name)
        if mid in DROP:
            os.remove(os.path.join(modules, name))
            print("  removed module:", mid)

    # 2. The official Teen Teach-In lessons are Jump$tart-only.
    official = os.path.join(content, "official-lessons")
    if os.path.isdir(official):
        shutil.rmtree(official)
        print("  removed content/official-lessons/")

    # 3. Removing these tags is what makes app.js fall back to the general
    #    layout: flat module list, no Resources tab, no Grades 1-4 framing.
    #    Two modules were re-tagged to single grades for the Jump$tart
    #    sequence; restore their original wider bands.
    bands = {"needs-vs-wants": ("Grade 1", "Grades 2–5"), "save-or-spend": ("Grade 3", "Grades 3–6")}
    for name in sorted(os.listdir(modules)):
        path = os.path.join(modules, name)
        src = open(path, encoding="utf-8").read()
        new = drop_key(drop_key(src, "officialLesson"), "officialMaterials")
        mid = re.sub(r"^\d+-|\.ya?ml$", "", name)
        if mid in bands:
            old_band, new_band = bands[mid]
            new = new.replace("\ngradeBand: %s\n" % old_band, "\ngradeBand: %s\n" % new_band)
        if new != src:
            open(path, "w", encoding="utf-8").write(new)
            print("  updated:", name)

    # 4. Rebuild assets/js/content.js and helper-kb.js from the trimmed content.
    subprocess.check_call(["node", os.path.join(root, "scripts", "build-content.js")])
    print("done")


if __name__ == "__main__":
    main()
