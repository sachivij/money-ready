/*
 * data.js — Content for the Money Ready Virginia Interactive Toolkit
 * -----------------------------------------------------------------
 * The modules themselves now live in content/modules/ (one file each, see
 * content/README.md). What's left here: the status badges.
 *
 * EDUCATIONAL ONLY. Built around existing financial-literacy topics.
 * Nothing here collects or requires personal data.
 *
 * Each module (content/modules/) has:
 *   card fields  -> shown on the Module Library cards
 *   objective    -> the learning objective
 *   interactive  -> the interactive elements a static lesson becomes
 *   game_rounds  -> the rounds of its game (the builder's game and the
 *                   student challenge are the same game)
 *   reveal       -> key idea, common trap and discussion prompt, shown
 *                   on the game's end screen and in the volunteer prep
 *   takeHome     -> a fridge-friendly, printable take-home card
 *   prep         -> everything a teen volunteer needs to prep & practice
 */

// MODULES (the 13 modules) now lives in content/modules/, one file per
// module; scripts/build-content.js turns them into assets/js/content.js.

// Short status / disclaimer badges shown across the site.
const STATUS_BADGES = [
  "Proposed pilot",
  "Concept for discussion",
  "Student-led prototype",
  "Designed to support Teen Teach-In–style workshops",
  "Pending review and approval by Virginia Jump$tart",
  "Built around existing financial literacy topics",
  "Educational only",
  "Privacy-safe by design",
];
