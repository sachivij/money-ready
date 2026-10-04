# Money Ready: Product Requirements (PRD)

**Owner:** Sumeet · **Status:** Draft · **Last updated:** October 4, 2026

## 1. Problem

Financial literacy lessons for young students are often a slide deck and a lecture. Teen volunteers who teach them (for example in Virginia Jump$tart's Teen Teach-In) are often nervous first-timers, and elementary students tune out quickly. Schools and the nonprofit also have little evidence of what students actually learned.

## 2. Product summary

Money Ready is a free, static web app that turns existing financial literacy topics into a repeatable, interactive workshop: **pick a module, run a live challenge, students vote, reveal the answer, discuss, send a take-home card.** It needs no accounts, no backend, and no personal data, and it works offline. A sister edition for Loudoun 4-H lives in a separate repo.

## 3. Target users

| User | What they need |
| --- | --- |
| **Teen volunteer** (primary) | A ready lesson, a script, and games so they can teach with confidence |
| **Students, Grades 1–4** (primary audience) | Short, hands-on, picture-friendly activities |
| **Teacher / school** | An easy way to request a workshop and see what students got out of it |
| **Nonprofit organizer** (Jump$tart, 4-H) | Repeatable content and program-wide impact numbers |

## 4. Goals

1. A first-time teen volunteer can prepare and teach a lesson in under 30 minutes of prep.
2. Every student participates (votes, moves, sorts), not just listens.
3. Lessons are repeatable across any topic and classroom setup, including classrooms with no devices.
4. Impact can be measured without collecting any personal data.

## 5. Current features (what exists today)

- **Module library:** the official Grades 1–4 Teen Teach-In sequence plus extended modules for Grades 5–12 (Needs vs. Wants, Budget Battle, Save or Spend?, Credit Climb, Paycheck Puzzle, Smart Shopping, Fraud & Red Flags, Banking Basics, College Cost Choices, Investing Mythbusters).
- **Live challenge and reveal:** timer, room code, A–D answers, team score, best answer with discussion prompt.
- **Games library:** 12 formats (Four Corners, Human Bar Graph, Red Flag / Green Flag, Speed Round, etc.), many needing no devices, plus picture-based options for young kids.
- **Workshop builder / generator:** assembles a lesson plan and packet (deck outline, parent letter, checklist, sign-up form) from a module, time, and device setup.
- **Facilitator dashboard and volunteer prep:** script, vocabulary, timed steps, practice mode.
- **Role picker:** volunteer, school, or organization, each seeing different impact metrics.
- **Request / partner portal, standards helper, impact snapshot, take-home cards.**

## 6. Roadmap

**Next (near term)**
- **Landing page flow chart:** a simple "if you're looking for this, go here" guide on the first page so each user finds their path fast.
- **School computer check:** test the site on typical school computers and browsers (Chromebooks, filtered networks) and fix anything blocked.
- **4-H edition branding:** remove the clover from the 4-H version.
- **Rename "Toolkit builder" to "Generator"** everywhere so the name matches what it does.

**Later**
- **K–2 mode:** more pictures, less text, larger buttons, read-aloud friendly wording.
- **More games**, especially no-device and picture-based ones.
- **Real lesson generation:** generate a full lesson from criteria (grade, topic, length, number of students, device setup), not just assemble existing pieces.
- **Matching like a dating profile:** volunteers and schools each create a simple profile (grades, topics, availability, location) and see suggested matches.

## 7. Non-goals (for now)

- No student accounts, logins, or personal data.
- No backend or paid hosting; stays a static site (GitHub Pages).
- Not financial advice, and not a replacement for approved curriculum.

## 8. Open questions

1. **Matching:** what goes on a profile, and who sees it? Can this work with no backend and no personal data, or does it need a sign-up and approval step?
2. **Lesson generation:** should it stay rule-based (offline, predictable) or use AI? If AI, who reviews the output before a volunteer teaches it?
3. **School computers:** which devices and browsers must we support, and are there blocked sites or features to avoid?
4. **K–2:** is this a separate set of modules or a "simple mode" toggle on existing ones?
5. **4-H edition:** what replaces the clover, and should both editions share one codebase?
6. Approval: what does Virginia Jump$tart need to see before an official pilot?

## 9. Success measures

- Workshops delivered and students reached per term.
- Student participation rate (target: 90%+ answer at least one challenge).
- Average student confidence change, before vs. after (anonymous taps).
- Volunteer confidence and teacher feedback scores (target: 4/5 or higher).
- Repeatability: share of volunteers who teach a second workshop.
