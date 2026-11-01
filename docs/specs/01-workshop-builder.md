# Spec 01: Workshop builder, smarter and shareable

**PRD item:** "make the website actually generate lessons based on criteria". The page keeps the name **Workshop Builder**.
**Screen:** `#/builder` (old `#/generator` links also open it). Code: `renderBuilderCombined()` and `renderPlan()` in `assets/js/app.js`, `buildLessonPlan()` and `buildPacket()` in `assets/js/lessons.js`.

## Problem today

The builder asks the right questions (topic, age group, length, group size, technology), but the answers barely change the main activity:

- **Same game every time.** Every topic, grade and device setup gets Four Corners (or Human Bar Graph under 20 minutes). Picking "One shared screen" never uses the Live Vote game, and group size is ignored.
- **Long plans come up short.** Asking for 60 minutes produces a 56-minute plan.
- **Plans can't be shared or reopened.** Refreshing the page or sending the link loses the choices.
- **No file to keep.** The packet can only be printed, not saved.

## Goals

1. The main activity fits the topic, age group, group size and technology.
2. The plan always adds up to exactly the time asked for.
3. A volunteer can send a link that reopens the same plan.
4. A volunteer can download the whole plan and packet as a file.

## Phase 1 (built)

### 1. Pick the activity by fit, not list order
Score every usable game and pick the highest:

| Signal | Rule |
| --- | --- |
| Technology | Only games the room supports. If the room has a screen, screen games get a bonus so the setup is actually used. |
| Topic | Each topic lists the games that suit it best (`bestGames` in its lesson pack). Big bonus. |
| Age group | K–2 favors high-energy, moving games and avoids discussion-heavy ones (Story Circle, Two Truths). 9–12 favors debate and discussion. |
| Group size | Games whose `group` matches the chosen size get a bonus (pairs, small groups, whole class). |
| Time | The game must fit in the time left after the core steps. |

The second activity (45+ minutes) is the best-scoring game that is different from the first.

### 2. Swap the activity
Under the main activity, show "Try a different activity" with the next two best fits. Picking one rebuilds the plan with that game.

### 3. Exact timing
If the plan is shorter than requested, add the leftover minutes to the main activity and discussion (main activity first). Total must equal the requested minutes for every combination of inputs.

### 4. Shareable link
Building a plan updates the address to `#/builder?topic=…&grade=…&min=…&group=…&dev=…` (plus `&game=…` after a swap). Opening that link fills in the form and builds the plan automatically. A "Copy link" button copies it.

### 5. Download
A "Download plan" button saves one `.txt` file with the run of show, materials and every packet item.

## Phase 2 (built)
- "How many students?" (up to 10, 11–20, 21–30, 31+) and "Where is it?" (school classroom, club or after-school program, library or community room). Class size sets take-home card counts, group and pair counts, and favors whole-class games in big rooms. Setting adds setup tips and materials, and quiet rooms lose points for loud games.
- ↑ ↓ ✕ on each run-of-show step. Minutes from a removed step go to the main activity so the plan still fills the slot. Edits are saved in the link (`&order=…`), and "Undo my step changes" resets them.

## Acceptance checks
- For every topic × age group × length × technology × group size, the plan total equals the requested minutes.
- Different topics produce different main activities (at least 5 distinct main games across the 13 topics at 30 minutes, no devices).
- "One shared screen" with Grades 3–5 or older picks a screen game when one fits.
- Reloading a shared link shows the same plan.
- Works offline and stores nothing.
