/*
 * data.js — Content for the Money Ready Virginia Interactive Toolkit
 * -----------------------------------------------------------------
 * The modules themselves now live in content/modules/ (one file each, see
 * content/README.md). What's left here: status badges and the example
 * impact figures.
 *
 * EDUCATIONAL ONLY. Built around existing financial-literacy topics.
 * Nothing here collects or requires personal data.
 *
 * Each module (content/modules/) has:
 *   card fields  -> shown on the Module Library cards
 *   objective    -> the learning objective
 *   interactive  -> the interactive elements a static lesson becomes
 *   challenge    -> a Student Challenge scenario (4 options, best answer)
 *   reveal       -> the satisfying Reveal after students answer
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

// Impact snapshot & measurement layer — EXAMPLE / PLACEHOLDER numbers only,
// clearly labeled everywhere in the UI. These illustrate what a pilot COULD
// measure; they are NOT real results. All measures are aggregate and
// privacy-safe by design (no names, no logins, no personal data).
const IMPACT_EXAMPLE = {
  // Core impact snapshot
  studentsReached: 240,
  workshopsDelivered: 12,
  volunteersTrained: 18,
  participationRate: 92, // %
  confidenceImprovement: 34, // percentage-point gain, self-rated pre/post
  topConcepts: ["Needs vs. Wants", "Saving early", "Spotting scams"],
  facilitatorFeedback: 4.6, // out of 5
  repeatabilityScore: 88, // %

  // Measurement layer (volunteer hours, reach, participation, sponsor-visible)
  volunteerHours: 96,
  // "Value of volunteer time": what those donated hours would have cost to
  // pay for. Estimated as volunteerHours x volunteerHourValue. The rate below
  // is an illustrative national estimate for the value of a volunteer hour
  // (Independent Sector publishes ~$33/hr); replace with the current figure.
  volunteerHourValue: 33.49,
  schoolsReached: 7,
  teenTeachInParticipation: 34, // teen volunteers who took part
  workshopAttendance: 92, // % of registered who attended
  knowledgeCheckGain: 41, // pre/post knowledge check, percentage-point gain
  sponsorOutcomes: [
    "Every dollar of sponsorship reached ~13 students (example ratio)",
    "7 partner schools engaged across the region",
    "96 documented teen-volunteer service hours",
  ],
};

// The Standards Helper knowledge base (FAQ_KNOWLEDGE) lives in helper-kb.js.
