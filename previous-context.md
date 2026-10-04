# Previous context — handoff notes

Written at the end of a long build session, for whoever (or whatever) picks
this up next. It covers what this project is, how it is put together, the
decisions that are easy to accidentally undo, and what is still open.

Last updated against `main` @ `c6fb254`.

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

- `docs/specs/` on the `claude/workshop-builder-specs` branch contains a
  PRD and seven specs written by the owner. Items 01–05 appear to be built;
  **`06-more-games.md` and `07-matching.md` were not reviewed** and may be
  outstanding. Read them before starting new feature work.
- The 4-H Vercel project may not exist yet. The repo is correct, but nobody
  has confirmed a deployment is connected to it.
- The `claude/jumpstart-teen-teaching-app-tutqka` branch tracks `main` and
  carries no unique work; it can be deleted whenever convenient.
- Module content is grounded in the standard financial-literacy topic areas
  and the Teen Teach-In structure. If the owner supplies the actual
  Jump$tart materials, the modules and the helper's source labels should be
  aligned to them.

---

## Working with the owner

- They asked for changes to be pushed **straight to `main`** on the
  Jump$tart repo — no pull request. Vercel then deploys in about 30
  seconds and they check the live site.
- Push to the feature branch as well, to keep it from drifting.
- They review by looking at the live site, so say what to click and remind
  them to hard-refresh (Cmd+Shift+R) — browsers cache this app hard.
- **Ask before carrying a change from one edition to the other.** Assuming
  they should stay in sync caused real rework once already.
