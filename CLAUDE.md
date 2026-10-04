# Money Ready: notes for Claude

Two people (each with their own Claude) build this app at the same time. Read these before changing anything:

1. `previous-context.md` (start with "Current state" and "Working together"): what the app is, the two editions (this repo and `sachivij/money-ready-4h`), hard constraints (no backend, no build step, no external requests, privacy-safe) and decisions that are easy to undo by accident.
2. `docs/PRD.md`: goals, users, roadmap.
3. `docs/specs/`: one spec per roadmap item. `docs/specs/README.md` lists them with a status and an owner.

## Working alongside someone else

- Before starting, pull the latest `main` and check `docs/specs/README.md`. Only pick a spec nobody owns.
- Claim it first: set its Owner and Status in `docs/specs/README.md` and push that to `main`, so the other person sees it.
- Do the work on its own branch (`<name>/<spec-number>-<short-topic>`) and open a pull request into `main`. Docs-only tweaks can go straight to `main`.
- Keep pull requests small and merge often, so the two people rarely edit the same lines. `assets/js/app.js` and `assets/js/lessons.js` are shared hot spots; merge `main` into your branch before opening the PR.
- When a spec is done, set its status to Done in the same pull request.

## Decisions already made

- The page stays named **Workshop Builder** (not "Generator").
- The production site is https://money-ready.vercel.app (deploys from `main`).
