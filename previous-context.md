# Previous context — handoff notes

Written at the end of a long build session, for whoever (or whatever) picks
this up next. It covers what this project is, how it is put together, the
decisions that are easy to accidentally undo, and what is still open.

Last updated 2026-10-04, after the PRD, specs and Workshop Builder phase 1
landed on `main`.

**Two people now build this app at the same time**, each with their own
Claude. Read the "Current state" and "Working together" sections first.

---

## What this is

**Money Ready** is a student-built prototype that turns financial-literacy
workshop content into live, interactive sessions. A teen volunteer runs a
workshop; students make decisions and vote instead of listening.

It exists in **two separate editions**, in two repos:

| Edition | Repo | Branding | Modules |
| --- | --- | --- | --- |
| Virginia Jump$tart | `sachivij/money-ready` | Jump$tart, Teen Teach-In | 13 |
| Loudoun 4-H | `sachivij/money-ready-4h` | Loudoun 4-H, 💵 mark | 10 |

Both deploy to Vercel automatically on push to `main`. There is no build
step — Vercel serves the files as they are.

**The owner is a 16-year-old student.** Explain things plainly, avoid
unexplained jargon, and do not assume command-line fluency. They work
mostly through the GitHub web UI and the live site.

---

## Current state (2026-10-04)

**Live site:** https://money-ready.vercel.app (deploys from `main`).
`scripts/audit.js` passes on `main` (`PROBLEMS: 0`, 13 modules).

**Planning docs**
- `docs/PRD.md`: problem, users, goals, roadmap, open questions.
- `docs/specs/`: one spec per roadmap item. `docs/specs/README.md` lists
  them with a Status and an **Owner**. Claim a spec there before building.

| # | Spec | State |
| --- | --- | --- |
| 01 | Workshop Builder | Phase 1 done (see below). Phase 2 next: "number of students" and "setting" inputs, remove/reorder steps. Owner: Sumeet. |
| 02 | Landing page "where do I go?" flow chart | Done. Chart sits in the home page hero (`pathChart()` in `app.js`); picking a path also sets the role. Owner: Ridhi Poranki. |
| 03 | Works on school computers | Not started. Needs a real Chromebook test. |
| 04 | 4-H edition, no clover | Already done earlier (💵 mark, see Decisions). Confirm on the 4-H site, then mark Done. |
| 05 | K–2 picture mode across the whole site | Not started. The builder already has a K–2 picture mode; this extends it to modules and take-home cards. |
| 06 | More games | Not started. |
| 07 | Volunteer/school matching ("like a dating profile") | Blocked on owner decisions: who sees profiles, what is allowed, coordinator approval. Must stay no-personal-data. |

**Workshop Builder phase 1 (PR #4, merged)**
- `rankGames()` in `lessons.js` scores games by topic (`bestGames` in each
  `LESSON_PACKS` entry), age group, group size, devices and time.
- `buildLessonPlan(moduleId, { minutes, grade, groupSize, devices, game })`:
  `game` overrides the main activity; the plan returns `alternatives`.
- Plans always total exactly the requested minutes (spare minutes go to the
  main activity). Verified for all 3,744 input combinations.
- `#/builder?topic=…&grade=…&min=…&group=…&dev=…&game=…` reopens a plan;
  "Copy link" and "Download plan" (`planToText()`) are on the plan.

**In progress: real Teen Teach-In lessons.** The owner wants the builder to
generate lessons from the official Jump$tart Teen Teach-In materials:
https://www.jumpstart.org/awareness/check-your-school/teen-teach-in/resources/
That page has, per grade: Grade 1 Needs and Wants (slides, parent toolkit),
Grade 2 Making Financial Choices and Opportunity Costs (slides, toolkit,
worksheet), Grade 3 Saving and Spending (slides, toolkit, worksheet), Grade 4
Investing in Tomorrow (slides, worksheet, vocabulary check), plus Ally's
Planet Zeee partner lesson. The files are .pptx/.docx and jumpstart.org is
blocked from the cloud sandbox, so the owner was asked to attach them. If
your environment can download them, start there: align the five modules
tagged `officialLesson` in `data.js` and their `LESSON_PACKS` to the real
slides and worksheets.

**Naming decision:** the page stays **Workshop Builder**. Do not rename it
to "Generator" (the old `#/generator` route still works as an alias).

---

## Working together

- Pull `main` before starting anything. Claim your spec in
  `docs/specs/README.md` (Owner + Status) and push that first.
- One branch per change, named `<name>/<spec-number>-<topic>`.
- The owner previously had changes pushed straight to `main`. With two
  builders, prefer a pull request per change and merge small and often;
  docs-only tweaks can still go straight to `main`.
- `assets/js/app.js` and `assets/js/lessons.js` are the shared hot spots.
  Merge `main` into your branch right before merging.
- Run `scripts/audit.js` before merging (see Testing).

---

## Hard constraints — do not break these

1. **No backend. No build step. No dependencies.** Plain HTML, CSS, and
   ES5-style JavaScript loaded with `<script>` tags. Anyone can open
   `index.html` from disk and the whole app works, offline.
2. **No external requests of any kind** — no CDN, no web fonts, no
   analytics. This is what makes the privacy claim true rather than
   aspirational, and it means the app cannot break because a third party
   did.
3. **Privacy-safe by design.** No names, no logins, no personal data,
   nothing sent anywhere. The only stored state is an account-type
   preference and anonymous confidence tallies, both in `localStorage` on
   the viewer's own device. Every `localStorage` access is wrapped in
   try/catch with an in-memory fallback, because private browsing throws.
4. **Everything is labelled as a proposal.** Status badges say "proposed
   pilot", "concept for discussion", "pending review and approval".
   Impact figures are all clearly marked as examples. Keep this posture —
   the project is not endorsed by Jump$tart or 4-H, and must not look like
   it is.
5. **The audience includes children in Grades 1–4.** Never add anything
   that collects data about them, and never ask students about family
   finances. Several lesson notes say this explicitly; keep them.

---

## File layout

```
index.html              Shell: header, nav, footer. Loads the four scripts.
assets/css/styles.css   All styling. Design tokens at the top.
assets/js/data.js       MODULES (the workshops), STATUS_BADGES,
                        IMPACT_EXAMPLE, FAQ_KNOWLEDGE. Content only.
assets/js/lessons.js    ACCOUNT_TYPES, IMPACT_METRICS, GAME_FORMATS,
                        GRADE_PROFILES, DEVICE_GUIDES, PICTURE_ACTIVITIES,
                        LESSON_PACKS, buildLessonPlan(), buildPacket().
assets/js/metrics.js    Privacy-safe aggregate counters in localStorage.
assets/js/app.js        Hash router + every screen. The only file with
                        rendering logic.
scripts/audit.js        End-to-end browser check (see Testing).
scripts/4h-build/       The two scripts that derive the 4-H edition.
```

Content lives in `data.js` and `lessons.js` **on purpose**, so a student or
educator can edit workshops without touching app logic. Keep that split.

---

## The mechanism that is easiest to break

`app.js` has **no 4-H-specific code**. Instead the layout keys off whether
any module carries an `officialLesson` tag:

| Tags present | Behaviour |
| --- | --- |
| yes (Jump$tart) | hero badges, module library split into Core Grades 1–4 / Extended Grades 5–12, Resources tab visible, elementary-focused copy |
| no (4-H) | the original general layout, one flat module list, Resources tab hidden and its route 404s |

This is why there is one `app.js` for both editions. Three places depend on
it — `renderHome()`, `renderModules()`, and `wireNav()` plus the
`resources` route. **If you add new Jump$tart-only UI, gate it the same
way** (`officialModules().length`), or the 4-H edition will start showing
Jump$tart content again. That has already happened once.

---

## Maintaining the 4-H version

The 4-H repo is **derived from this one**, not developed separately.

```bash
# 1. copy the shared files into a working copy
cp assets/js/app.js assets/js/data.js assets/js/lessons.js  <copy>/assets/js/
cp index.html <copy>/

# 2. remove the Jump$tart-only content
python3 scripts/4h-build/strip.py <copy>

# 3. rebrand
python3 scripts/4h-build/rebrand.py <copy>

# 4. test it, then commit the result into the money-ready-4h repo
```

Always re-run the audit against the 4-H copy afterwards. The rebrand is
string replacement, and a reworded sentence in `app.js` can silently stop
matching — which shows up as stray "Jump$tart" text on the 4-H site. Check
with:

```bash
grep -rn -i "jumpstart\|jump\$tart\|teen teach-in\|virginia" <copy>/index.html <copy>/assets/js/*.js
```

**Scope discipline:** the 4-H edition deliberately does **not** have the
official Grades 1–4 modules, the Resources screen, or the Grades 1–4
reframe. The owner was explicit about this. It *does* have the account
types, role-specific impact, games, and workshop builder. Do not sync
changes across editions without asking first.

---

## Testing

There is no unit-test suite, and that is a reasonable fit: the app is
almost entirely HTML built from template strings, so the failure mode is a
missing element rather than a thrown exception. `scripts/audit.js` drives a
real browser over every screen instead.

```bash
python3 -m http.server 8000 &
BASE=http://localhost:8000/index.html node scripts/audit.js
```

It should print `PROBLEMS: 0`. Run it against **both** editions after any
change to `app.js`, `data.js`, or `lessons.js`.

Worth also checking by hand when relevant, since the audit does not:
- the three account types each show the right impact metrics
- the builder with **Grades K–2** selected (picture mode) and each device option
- generated plans do not exceed the requested length
- mobile width — no horizontal scrolling
- private browsing, where `localStorage` throws

---

## Decisions worth knowing

**Three account types, not logins.** Volunteer / school / organization is a
view preference stored on the device. It changes only which impact metrics
are shown. It is deliberately not an account — no password, no server, no
personal data.

**Impact metrics per role** (`ACCOUNT_TYPES` in `lessons.js`):
- volunteer — 7 metrics
- school — 5 metrics, and the label reads **"Lessons completed"**
- organization — 7 metrics, four of them tagged "program-wide total", plus
  the measurement layer and the value-of-volunteer-time figure

**Games: ten of twelve need no devices.** This is a feature, not a
limitation. Elementary classrooms often have no student devices and
unreliable wifi, so a workshop must never depend on a screen. Keep that
ratio in mind when adding games.

**Grades K–2 switches the generated plan to picture mode**: no reading,
drawing and pointing instead of writing, two vocabulary words instead of
four, and a bank of picture activities. Driven by
`GRADE_PROFILES[...].pictureBased`.

**The toolkit builder and lesson generator are one page.** They used to be
two, asking for the same information. `#/generator` still routes to the
combined `#/builder` so old links work.

**The 4-H mark is a dollar bill 💵, not a clover.** The owner asked for
this specifically. The 4-H clover emblem is a federally protected mark
(18 U.S.C. §707) and using it needs clearance from the local 4-H or
Cooperative Extension office. Do not "fix" this back to a clover.

**Standards helper never guesses.** It retrieves from a small curated list
in `FAQ_KNOWLEDGE` and shows a source label. With no match it says so and
points to a trusted adult. Do not wire it to a model that free-forms
answers to children — the no-match fallback is the safety property.

---

## Environment notes

- `jumpstart.org` and `vercel.app` are **blocked by this sandbox's network
  policy**. The official Teen Teach-In resources had to be pasted in by the
  owner. You cannot fetch the live site to check a deploy; serve the repo
  files locally and test those instead.
- The owner's Mac runs **macOS 12**, which is below Claude Code's minimum
  of 13, so they cannot run it locally. Their Homebrew also sits in a
  non-standard prefix, so it builds everything from source. Both are why
  the workflow has been push-from-cloud.
- They have a local clone at
  `/Users/sachikavij/development/passion-project/moneyreadyapp/money-ready`.
  It only updates when they run `git pull`.

---

## Open items

- The 4-H Vercel project may not exist yet. The repo is correct, but nobody
  has confirmed a deployment is connected to it.
- The `claude/jumpstart-teen-teaching-app-tutqka` branch tracks `main` and
  carries no unique work; it can be deleted whenever convenient. Its
  Vercel preview is not the main site.
- Spec status lives in `docs/specs/README.md`; keep it current.

---

## Working with the owner

- They used to have changes pushed **straight to `main`**; with a second
  builder, use a pull request per change (see "Working together") and
  merge when they say so. Vercel deploys `main` in about 30 seconds and
  they check https://money-ready.vercel.app.
- They review by looking at the live site, so say what to click and remind
  them to hard-refresh (Cmd+Shift+R) — browsers cache this app hard.
- **Ask before carrying a change from one edition to the other.** Assuming
  they should stay in sync caused real rework once already.
