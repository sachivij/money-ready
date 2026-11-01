# Spec 11: Content lives in plain files, not in the code

**Status:** In progress. Helper answers, sources and the weekly Jump$tart watch are done; lessons, games and modules next (Owner: Sumeet)

## The problem
Every lesson, official Teen Teach-In step, game round and Standards Helper answer is typed straight into JavaScript files (`data.js`, `lessons.js`, `official-lessons.js`, `game-bank.js`, `helper-kb.js`, about 300 KB of content mixed in with code). To add or fix one answer you have to edit code, and one missing comma can break the whole site. It is also hard to see where each piece came from and who approved it.

## What we want
1. Adding approved material means adding or editing a small, readable file in GitHub, with no code.
2. Every piece of content says where it came from and who approved it.
3. Nothing reaches the live site until a person approves it.
4. The hard rules still hold: no backend, no external requests, works offline from `index.html` on disk, no build step on Vercel.

## Proposed approach

### 1. A `content/` folder, one file per thing
```
content/
  modules/needs-vs-wants.md          a lesson module
  official-lessons/grade-1-needs-wants.md   one Teen Teach-In deck, step by step
  games/budget-bingo.md              a game and its rounds
  helper/what-is-a-credit-score.md   one Standards Helper answer
  sources.md                         the approved source list (Jump$tart, CFPB, FDIC ...)
```
Each file is Markdown with a short header at the top, so it reads like a normal document on GitHub and can be edited in the browser. Example helper answer:

```
---
id: what-is-a-credit-score
tags: credit score, credit report
grades: 6-12
source: cfpb
url: https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/
approved_by: Sumeet
approved_on: 2026-11-01
---
A credit score is a number that shows lenders how likely you are to pay back money you borrow ...
```

Every file must have `source`, `url`, `approved_by` and `approved_on`. `source` must be one of the names in `content/sources.md`, so only approved sources can be cited.

### 2. A robot turns the files into what the site already loads
A small script (`scripts/build-content.js`, plain Node, no packages) reads `content/`, checks every file, and writes the JS file the app already loads, in the same shape as today (for the helper: `assets/js/helper-kb.js`, now marked as generated). Keeping one generated file per content type means `index.html`, `app.js` and the 4-H build scripts don't change. A GitHub Action runs it automatically on every pull request and on every change to `main`, and saves the result back into the repo.

Why not have the site read the Markdown directly? Browsers refuse to load separate files when `index.html` is opened from disk, so offline use would break. Doing the conversion in GitHub keeps the site exactly as it is: still plain files, still no build step on Vercel, still works offline. Vercel just serves the updated `content.js`.

The checks fail the pull request (with a plain message naming the file and the problem) if a file is missing its source or approval, cites a source that isn't on the approved list, has a broken header, or duplicates an id. `scripts/audit.js` still runs on the result.

### 3. How new approved material gets in
- **By hand (the main way).** Open `content/helper/` on GitHub, copy an existing file, change it, and choose "Create a new branch and start a pull request". The checks run; the Vercel preview shows the change; merge when happy. A ready-to-copy template sits in each folder.
- **With Claude.** Attach the new Jump$tart deck or link in the project; Claude writes the content files and opens a pull request. Same review.
- **"Something new was posted" alert (optional).** A weekly GitHub Action looks at the Jump$tart Teen Teach-In resources page and opens a GitHub issue when the list of files changes. It never puts anything on the site by itself: slide decks still need a person to turn them into lessons and approve them. GitHub's own servers can usually reach jumpstart.org even though Claude's cloud sessions cannot; if Jump$tart blocks it too, we drop this part.

### 4. Approval
Approval is the pull request: nothing goes live until someone merges it into `main`. The `approved_by` line records who signed off on that piece. Later we can require that a named reviewer (for example a Jump$tart contact) approves pull requests that touch `content/` (a GitHub "CODEOWNERS" rule, one line).

### 5. What about copyright?
We store our own summaries plus a link to the original, as `official-lessons.js` already does. We do not put Jump$tart's slide decks or worksheets in the repo, since everything in it is served publicly by Vercel.

## Moving the existing content (after the owner agrees)
One content type per pull request, smallest first, so Ridhi and Sumeet rarely clash:
1. Standards Helper answers and the source list (`helper-kb.js`).
2. Official Teen Teach-In lessons (`official-lessons.js`).
3. Games and game rounds (`game-bank.js`).
4. Modules and lesson packs (`data.js`, `lessons.js`).

Each step: convert, check the generated file matches the old data exactly (same items, same text), delete the old content from the JS file, and test the site in a browser. The 4-H build scripts (`scripts/4h-build/`) get updated to work on `content/` in the same step, so the 4-H edition can drop or swap whole files instead of editing code.

## Decisions
- 2026-11-01, Sumeet: go ahead with Markdown files and the GitHub Action, migrating in the order above, **plus** the weekly Jump$tart alert.
- Still open: who approves content. Just Sumeet for now; a Jump$tart contact could be added later as a required reviewer on `content/`.

## What's built (step 1)
- `content/sources/` (22 sources) and `content/helper/` (102 answers), with templates (`_template.md`) and a plain-English guide in `content/README.md`. The existing answers are marked `approved_by: Sumeet`, `approved_on: 2026-10-30`, the day PR #8 that added them was merged.
- `scripts/build-content.js` checks the files and writes `assets/js/helper-kb.js`. The result was checked to be identical to the old hand-written file: same answers, tags, sources and order.
- `.github/workflows/content.yml` ("Content") runs it on every pull request and every change to `main` that touches content, and commits the rebuilt file back to the branch.
- `.github/workflows/jumpstart-watch.yml` ("Jump$tart watch") runs `scripts/watch-jumpstart.js` every Monday (or from the Actions tab). It saves the list of linked files to `content/watch/jumpstart-teen-teach-in.txt` and opens an issue when the list changes, or one issue if the page can't be read. The first run opens an issue listing today's resources.

## Done when
All content above lives in `content/`; the old JS files hold only code; a non-engineer can add a Standards Helper answer through the GitHub website and see it on the Vercel preview, with no code edits; a file missing its source or approval fails the check; the site still works offline from disk; `scripts/audit.js` passes; the 4-H build still works.
