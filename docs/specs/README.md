# Implementation specs

To claim a spec, put your name in Owner and push to `main` before you start. Each spec turns one roadmap item from the [PRD](../PRD.md) into buildable work. We build them in this order.

| # | Spec | Status | Owner |
| --- | --- | --- | --- |
| 01 | [Workshop builder: smarter, shareable plans](01-workshop-builder.md) | Phases 1–3 done (official lessons in phase 3) | Sumeet |
| 02 | [Landing page "where do I go?" flow chart](02-landing-flow-chart.md) | Done | Ridhi Poranki |
| 03 | [Works on school computers](03-school-computers.md) | Not started | |
| 04 | [4-H edition: remove the clover](04-4h-branding.md) | Done (💵 mark, confirmed on the 4-H site 2026-10-30) | Sumeet |
| 05 | [K–2 picture mode](05-k2-picture-mode.md) | Done (K–2 games, module pages, picture challenge, picture take-home cards) | Sumeet |
| 06 | [More games](06-more-games.md) | Done | Ridhi Poranki |
| 07 | [Volunteer and school matching](07-matching.md) | Needs decisions | |
| 08 | [Builder makes playable games, incl. other topics](08-generated-games.md) | Done | Sumeet |
| 09 | [Count students reached and workshops used](09-impact-tracking.md) | Done | Ridhi Poranki |
| 10 | [Students join the game live on their own devices](10-live-join.md) | Needs decisions | Sumeet |
| 11 | [Content lives in plain files, not in the code](11-content-files.md) | In progress (helper answers done; lessons, games, modules next) | Sumeet |

Ground rules for every spec: plain HTML/CSS/JS, no backend, no personal data, works offline, content stays editable without code: helper answers and sources live in `content/` (spec 11; `assets/js/helper-kb.js` is generated from them), the rest is still in `assets/js/data.js`, `lessons.js`, `official-lessons.js` and `game-bank.js` until spec 11 moves it.
