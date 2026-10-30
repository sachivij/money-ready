# Spec 08: Workshop Builder makes playable games

**Status:** In progress (Owner: Sumeet)

## What to build
1. **A real game, not a list.** Every plan the Workshop Builder makes comes with a ready-to-play game for that topic and age group: a set of rounds (question, picture answers, the right answer and why). It plays on a screen at `#/game?topic=…&grade=…` and prints as cards for rooms with no devices.
2. **K–2 picture games.** For Grades K–2 the game uses two big picture answers, one short sentence per screen, and a "Hear it" button that reads the question aloud (the browser's own speech, nothing sent anywhere).
3. **Other topics from trusted sources.** Volunteers can also pick topics that aren't modules (coins, giving, taxes, insurance, identity safety, earning money, rising prices, starting a business). Every round cites its source, a named U.S. government consumer-education source like the Standards Helper's trusted tier. Content is pre-written and checked, never generated at run time.

## Done when
- Every module and every extra topic builds a plan and a playable game for every age group.
- A K–2 student can play a round without reading.
- Every round on an extra topic shows its source.

## Added after review
- **A full script for every step.** Each step of the run of show has 🗣 Say lines (word for word) and ✋ Do steps (in order), built from the module or topic content by `writeScripts()` in `lessons.js`. The main activity adds a round-by-round script: the question, the answers, how students vote, and the answer to read out. The downloaded plan includes all of it.
