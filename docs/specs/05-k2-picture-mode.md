# Spec 05: K–2 picture mode

**Status:** Done (2026-11-01)

## What to build
A "simple mode" for Grades K–2 across the whole site, not just the Workshop Builder:
- Bigger buttons
- Pictures or emoji for every answer
- One short sentence per screen
- Read-aloud friendly wording

Start with the Grade 1–2 modules and take-home cards.

## Done when
A K–2 student can answer a challenge without reading, and every K–2 screen passes a 5-second glance test.

## What shipped
- **Games** (PR #11): the Workshop Builder's K–2 games use two big pictures per round and read each question aloud.
- **Module pages**: a "🖼️ K–2 picture mode" switch. With it on, the page previews the picture rounds and its buttons open the picture challenge and picture take-home card. Grade 1 and Grade 2 modules start with it on; any module with picture rounds can turn it on. Links use `?k2=1` / `?k2=0`.
- **Student challenge** (`#/challenge/<id>?k2=1`): the module's picture rounds (`GAME_BANK[id].picture`), one per screen: one short question, two big picture buttons, a 🔊 button that reads it aloud, a star and a one-sentence "why", no timer.
- **Take-home cards** (`#/take-home/<id>?k2=1`): a big picture, one sentence to hear, two boxes to draw in, and a question for the grown-up. Written for needs-vs-wants, opportunity-costs, money-tales and save-or-spend (`takeHomeK2` on the module). The builder and Volunteer Prep link to the picture card when the grade is K–2.
