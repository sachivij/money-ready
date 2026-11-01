#!/usr/bin/env node
/*
 * build-content.js: turns the plain content files in content/ into the
 * JavaScript file the site loads (spec 11).
 *
 *   content/sources/*.md            approved source list    -> assets/js/helper-kb.js
 *   content/helper/*.md             Standards Helper answers -> assets/js/helper-kb.js
 *   content/modules/*.yaml          modules, their lesson packs and game rounds
 *   content/extra-topics/*.yaml     topics that aren't modules, with game rounds
 *   content/games/*.yaml            the game formats (Budget Bingo, ...)
 *   content/official-lessons/*.yaml the official Teen Teach-In lessons, step by step
 *                                   ...these four             -> assets/js/content.js
 *
 * The site never reads content/ itself: browsers block loading extra files
 * when index.html is opened from disk, and Vercel has no build step. A
 * GitHub Action (.github/workflows/content.yml) runs this script and saves
 * the result, so the site keeps working offline exactly as before.
 *
 * Usage:
 *   node scripts/build-content.js           check the files and write the JS
 *   node scripts/build-content.js --check   check only; fail if the JS is out of date
 *
 * Plain Node, no packages. Every problem is reported with the file name and
 * a plain-English explanation, and nothing is written while any remain.
 */
"use strict";
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var CONTENT = path.join(ROOT, "content");
var OUT_HELPER = path.join(ROOT, "assets", "js", "helper-kb.js");
var OUT_CONTENT = path.join(ROOT, "assets", "js", "content.js");
var YAML = require("./lib/yaml-lite.js");

var problems = [];
function problem(file, msg) { problems.push(path.relative(ROOT, file) + ": " + msg); }

// ---------------------------------------------------------------- reading

// Files in a folder, in name order. The number at the start of each name
// sets the order on the site; README.md and files starting with "_" (the
// templates) are skipped.
function listMd(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  var re = ext === "yaml" ? /\.ya?ml$/i : /\.md$/i;
  return fs.readdirSync(dir)
    .filter(function (f) { return re.test(f) && f !== "README.md" && f.charAt(0) !== "_"; })
    .sort()
    .map(function (f) { return path.join(dir, f); });
}

// A content file is a header between two "---" lines (one "name: value" per
// line) followed by the body text.
function readMd(file) {
  var text = fs.readFileSync(file, "utf8").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  var m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!m) { problem(file, 'must start with a header between two "---" lines.'); return null; }
  var head = {};
  m[1].split("\n").forEach(function (line, i) {
    if (!line.trim() || /^\s*#/.test(line)) return;
    var at = line.indexOf(":");
    if (at < 1) { problem(file, "header line " + (i + 2) + ' needs to look like "name: value" (got "' + line.trim() + '").'); return; }
    var key = line.slice(0, at).trim().toLowerCase();
    if (head[key] !== undefined) problem(file, '"' + key + '" appears twice in the header.');
    head[key] = line.slice(at + 1).trim();
  });
  // Body: lines that wrap are joined with a space; a blank line keeps a paragraph break.
  var body = m[2].trim().split(/\n\s*\n/).map(function (p) {
    return p.split("\n").map(function (l) { return l.trim(); }).join(" ");
  }).join("\n\n");
  return { head: head, body: body };
}

function need(file, head, key, what) {
  if (!head[key]) { problem(file, 'is missing "' + key + ':" (' + what + ").");
    return ""; }
  return head[key];
}
var KNOWN = {
  sources: ["key", "name", "website", "kind"],
  helper: ["question", "tags", "source", "cites", "source_name", "url", "approved_by", "approved_on"],
};
function noStrangers(file, head, kind) {
  Object.keys(head).forEach(function (k) {
    if (KNOWN[kind].indexOf(k) < 0) problem(file, 'has an unknown header line "' + k + ':". Allowed: ' + KNOWN[kind].join(", ") + ".");
  });
}

// ---------------------------------------------------------------- sources

var KINDS = ["jumpstart", "trusted", "toolkit"];
var sources = {};       // key -> { name, website, kind, about }
var sourceOrder = [];

listMd(path.join(CONTENT, "sources")).forEach(function (file) {
  var d = readMd(file); if (!d) return;
  noStrangers(file, d.head, "sources");
  var key = need(file, d.head, "key", "a short id other files use to cite this source, like cfpb");
  var s = {
    name: need(file, d.head, "name", "the full name shown to readers"),
    website: need(file, d.head, "website", "the source's website, like consumerfinance.gov"),
    kind: need(file, d.head, "kind", "jumpstart, trusted or toolkit"),
    about: d.body,
  };
  if (s.kind && KINDS.indexOf(s.kind) < 0) problem(file, 'kind must be one of ' + KINDS.join(", ") + ' (got "' + s.kind + '").');
  if (s.kind === "trusted" && !s.about) problem(file, "needs one line below the header saying what this source is (shown on the Resources page).");
  if (key && !/^[a-zA-Z0-9-]+$/.test(key)) problem(file, 'key "' + key + '" can only use letters, numbers and dashes.');
  if (key && sources[key]) problem(file, 'key "' + key + '" is already used by another source.');
  if (key) { sources[key] = s; sourceOrder.push(key); }
});

// ---------------------------------------------------------------- helper answers

// Bare common words pull in unrelated questions (see helper-kb notes in
// previous-context.md). Use a longer phrase instead, like "credit card".
var TOO_COMMON = ["account", "bank", "buy", "card", "cost", "get", "how", "make", "money", "pay", "plan", "price", "what"];
var DATE = /^\d{4}-\d{2}-\d{2}$/;

var answers = [];
var seenQ = {};
listMd(path.join(CONTENT, "helper")).forEach(function (file) {
  var d = readMd(file); if (!d) return;
  var h = d.head;
  noStrangers(file, h, "helper");
  var q = need(file, h, "question", "the question as a student might ask it");
  var tags = need(file, h, "tags", "comma-separated phrases a question must contain to match").split(",")
    .map(function (t) { return t.trim().toLowerCase(); }).filter(Boolean);
  var srcKey = need(file, h, "source", "the key of an approved source in content/sources/");
  need(file, h, "approved_by", "who approved this answer");
  var on = need(file, h, "approved_on", "the date it was approved, like 2026-11-01");
  if (on && !DATE.test(on)) problem(file, 'approved_on must look like 2026-11-01 (got "' + on + '").');
  if (!d.body) problem(file, "has no answer text below the header.");
  tags.forEach(function (t) { if (TOO_COMMON.indexOf(t) >= 0) problem(file, 'tag "' + t + '" is too common and will match unrelated questions. Use a longer phrase.'); });
  if (q) {
    var k = q.toLowerCase();
    if (seenQ[k]) problem(file, "asks the same question as " + seenQ[k] + ".");
    seenQ[k] = path.relative(ROOT, file);
  }

  var src = sources[srcKey];
  if (srcKey && !src) { problem(file, 'source "' + srcKey + '" is not on the approved list (content/sources/). Add the source there first, or use one that is.'); return; }
  if (!src) return;
  var entry = { q: q, a: d.body, tags: tags };
  if (src.kind === "trusted") {
    if (h.cites) problem(file, '"cites:" is only for Jump$tart sources. For this source, use "source_name:" or "url:" if you need to change what is shown.');
    entry.tier = "trusted";
    entry.source = h.source_name || src.name;
    entry.url = h.url || src.website;
  } else {
    if (!h.cites) problem(file, 'needs "cites:" saying which ' + src.name + " material it comes from, like: Grade 3 Saving and Spending");
    if (h.source_name || h.url) problem(file, '"source_name:" and "url:" are only for trusted sources; use "cites:" instead.');
    entry.source = src.name + " · " + (h.cites || "");
  }
  answers.push(entry);
});

// ---------------------------------------------------------------- lessons, games, modules

// Trusted sources, for checking `src` on game rounds (and written to helper-kb.js).
var KB_SRC = {}, KB_SRC_ABOUT = {};
sourceOrder.forEach(function (k) {
  if (sources[k].kind !== "trusted") return;
  KB_SRC[k] = [sources[k].name, sources[k].website];
  KB_SRC_ABOUT[k] = sources[k].about;
});


function readYaml(file) {
  try { return YAML.parse(fs.readFileSync(file, "utf8")); } catch (e) {
    problem(file, (e.line ? e.message : "couldn't be read (" + e.message + ")") + " Tip: indent with 2 spaces, and put text that starts with a quote, bracket or number in double quotes.");
    return null;
  }
}
var META = ["approved_by", "approved_on"];
function checkMeta(file, d) {
  if (!d.approved_by) problem(file, 'is missing "approved_by:" (who approved this content).');
  if (!d.approved_on) problem(file, 'is missing "approved_on:" (the date it was approved, like 2026-11-01).');
  else if (!DATE.test(String(d.approved_on))) problem(file, 'approved_on must look like 2026-11-01 (got "' + d.approved_on + '").');
}
// Copy `d` without some fields, keeping the order of the rest.
function without(d, drop) {
  var o = {};
  Object.keys(d).forEach(function (k) { if (drop.indexOf(k) < 0) o[k] = d[k]; });
  return o;
}
function fields(file, d, required, optional, what) {
  required.forEach(function (k) {
    if (d[k] === undefined || d[k] === null || d[k] === "") problem(file, 'is missing "' + k + ':"' + (what ? " in " + what : "") + ".");
  });
  Object.keys(d).forEach(function (k) {
    if (required.indexOf(k) < 0 && optional.indexOf(k) < 0) problem(file, 'has an unknown field "' + k + ':"' + (what ? " in " + what : "") + ". Check the spelling; allowed: " + required.concat(optional).join(", ") + ".");
  });
}
function isList(file, v, what) {
  if (!Array.isArray(v)) { problem(file, what + " should be a list (lines starting with \"- \")."); return false; }
  return true;
}

var MODULE_FIELDS = ["id", "title", "emoji", "gradeBand", "minutes", "keyConcept", "activityType", "color", "materials", "summary", "objective", "interactive", "challenge", "reveal", "takeHome", "prep"];
var MODULE_OPTIONAL = ["officialLesson", "officialMaterials", "takeHomeK2", "lesson_pack", "game_rounds"];
var PACK_FIELDS = ["bestGames", "hook", "miniLesson", "guidedPractice", "checkUnderstanding", "extension", "unpluggedSwap", "commonQuestions"];
var EXTRA_FIELDS = ["id", "title", "emoji", "sources", "tags", "summary", "objective", "reveal", "takeHome", "prep", "pack", "game_rounds"];
var GAME_FIELDS = ["id", "name", "emoji", "devices", "minutes", "group", "energy", "materials", "summary", "howToPlay", "teenTip", "reinforces", "levels", "debrief", "access"];
var GAME_OPTIONAL = ["cards", "multiRound", "topics", "play"];
var DEVICES = ["none", "shared", "personal"];
var OFFICIAL_FIELDS = ["module", "deck", "book", "bigIdea", "vocab", "materials", "steps"];
var STEP_FIELDS = ["name", "minutes", "slides", "what", "script", "how"];

var MODULES = [], LESSON_PACKS = {}, GAME_BANK = {}, EXTRA_TOPICS = [], GAME_FORMATS = [], OFFICIAL_LESSONS = {};
var topicIds = {}, gameIds = {}, packRefs = [];

function checkRounds(file, gr, needSrc) {
  if (!gr || typeof gr !== "object" || Array.isArray(gr)) { problem(file, '"game_rounds:" needs "picture:" (Grades K–2) and "rounds:" (Grades 3–12) lists.'); return; }
  fields(file, gr, ["picture", "rounds"], [], "game_rounds");
  ["picture", "rounds"].forEach(function (set) {
    if (!gr[set] || !isList(file, gr[set], "game_rounds " + set)) return;
    gr[set].forEach(function (r, i) {
      var where = "game_rounds " + set + " round " + (i + 1);
      if (!r || typeof r !== "object") { problem(file, where + " should have q, opts, best and why."); return; }
      fields(file, r, ["q", "opts", "why"], ["best", "src"], where);
      if (r.best === undefined) problem(file, where + ": is missing \"best:\".");
      if (!Array.isArray(r.opts) || r.opts.length < 2) problem(file, where + ": opts needs at least two answers, each like [\"🐷\", \"Save it\"].");
      else {
        r.opts.forEach(function (o, j) { if (!Array.isArray(o) || o.length !== 2) problem(file, where + ': answer ' + (j + 1) + ' should be a picture and a label, like ["🐷", "Save it"].'); });
        if (typeof r.best !== "number" || r.best < -1 || r.best >= r.opts.length || r.best % 1) problem(file, where + ": best must be the number of the right answer, counting from 0 (0 to " + (r.opts.length - 1) + "), or -1 if any answer is OK.");
      }
      if (r.src !== undefined && !KB_SRC[r.src]) problem(file, where + ': src "' + r.src + '" is not a trusted source in content/sources/.');
      if (needSrc && !r.src) problem(file, where + ": needs a src (extra topics always cite a trusted source).");
    });
  });
}
function addTopic(file, id) {
  if (!id) return;
  if (!/^[a-z0-9-]+$/.test(id)) problem(file, 'id "' + id + '" can only use small letters, numbers and dashes.');
  if (topicIds[id]) problem(file, 'id "' + id + '" is already used by ' + topicIds[id] + ".");
  topicIds[id] = path.relative(ROOT, file);
}

listMd(path.join(CONTENT, "modules"), "yaml").forEach(function (file) {
  var d = readYaml(file); if (!d) return;
  checkMeta(file, d);
  var m = without(d, META);
  fields(file, m, MODULE_FIELDS, MODULE_OPTIONAL);
  addTopic(file, m.id);
  if (m.challenge && Array.isArray(m.challenge.options) && (typeof m.challenge.best !== "number" || m.challenge.best < 0 || m.challenge.best >= m.challenge.options.length))
    problem(file, "challenge best must be the number of the right option, counting from 0.");
  if (m.lesson_pack) {
    fields(file, m.lesson_pack, PACK_FIELDS, [], "lesson_pack");
    packRefs.push([file, m.lesson_pack.bestGames]);
    LESSON_PACKS[m.id] = m.lesson_pack;
  }
  if (m.game_rounds) { checkRounds(file, m.game_rounds, false); GAME_BANK[m.id] = m.game_rounds; }
  MODULES.push(without(m, ["lesson_pack", "game_rounds"]));
});

listMd(path.join(CONTENT, "extra-topics"), "yaml").forEach(function (file) {
  var d = readYaml(file); if (!d) return;
  checkMeta(file, d);
  var t = without(d, META);
  fields(file, t, EXTRA_FIELDS, []);
  addTopic(file, t.id);
  if (isList(file, t.sources || [], "sources")) (t.sources || []).forEach(function (k) {
    if (!KB_SRC[k]) problem(file, 'source "' + k + '" is not a trusted source in content/sources/.');
  });
  if (t.pack) packRefs.push([file, t.pack.bestGames]);
  if (t.game_rounds) { checkRounds(file, t.game_rounds, true); GAME_BANK[t.id] = t.game_rounds; }
  var out = {};
  Object.keys(t).forEach(function (k) {
    if (k === "game_rounds") return;
    out[k] = t[k];
    if (k === "emoji") out.extraTopic = true;
  });
  EXTRA_TOPICS.push(out);
});

listMd(path.join(CONTENT, "games"), "yaml").forEach(function (file) {
  var d = readYaml(file); if (!d) return;
  checkMeta(file, d);
  var g = without(d, META);
  fields(file, g, GAME_FIELDS, GAME_OPTIONAL);
  if (g.id) {
    if (gameIds[g.id]) problem(file, 'id "' + g.id + '" is already used by ' + gameIds[g.id] + ".");
    gameIds[g.id] = path.relative(ROOT, file);
  }
  if (g.devices && DEVICES.indexOf(g.devices) < 0) problem(file, "devices must be one of " + DEVICES.join(", ") + ' (got "' + g.devices + '").');
  if (g.minutes !== undefined && typeof g.minutes !== "number") problem(file, "minutes must be a number.");
  GAME_FORMATS.push(g);
});

listMd(path.join(CONTENT, "official-lessons"), "yaml").forEach(function (file) {
  var d = readYaml(file); if (!d) return;
  checkMeta(file, d);
  var o = without(d, META);
  fields(file, o, OFFICIAL_FIELDS, []);
  if (o.steps && isList(file, o.steps, "steps")) o.steps.forEach(function (st, i) {
    fields(file, st || {}, STEP_FIELDS, ["activity"], "step " + (i + 1));
    if (st && typeof st.minutes !== "number") problem(file, "step " + (i + 1) + ": minutes must be a number.");
  });
  if (o.module) {
    var mod = MODULES.filter(function (m) { return m.id === o.module; })[0];
    if (!mod) problem(file, 'module "' + o.module + '" doesn\'t match any module id in content/modules/.');
    if (OFFICIAL_LESSONS[o.module]) problem(file, 'there is already an official lesson for module "' + o.module + '".');
    OFFICIAL_LESSONS[o.module] = without(o, ["module"]);
  }
});

packRefs.forEach(function (r) {
  (r[1] || []).forEach(function (id) {
    if (!gameIds[id]) problem(r[0], 'bestGames lists "' + id + '", which isn\'t a game id in content/games/.');
  });
});

// ---------------------------------------------------------------- writing

function js(v) { return JSON.stringify(v, null, 2); }

var helperJs =
  "/*\n" +
  " * helper-kb.js: Standards Helper answers and the approved source list.\n" +
  " *\n" +
  " * GENERATED FILE. Do not edit it by hand: your change will be overwritten.\n" +
  " * Edit the files in content/helper/ and content/sources/ instead; a GitHub\n" +
  " * Action runs scripts/build-content.js and rewrites this file.\n" +
  " */\n" +
  "// Trusted (non-Jump$tart) sources: key -> [name, website].\n" +
  "var KB_SRC = " + js(KB_SRC) + ";\n" +
  "// One line on what each source is, shown on the Resources page.\n" +
  "var KB_SRC_ABOUT = " + js(KB_SRC_ABOUT) + ";\n" +
  "// The answers, in file order. Jump$tart answers have no tier.\n" +
  "var FAQ_KNOWLEDGE = " + js(answers) + ";\n";

var contentJs =
  "/*\n" +
  " * content.js: modules, lesson packs, games, game rounds, extra topics and\n" +
  " * the official Teen Teach-In lessons.\n" +
  " *\n" +
  " * GENERATED FILE. Do not edit it by hand: your change will be overwritten.\n" +
  " * Edit the files in content/ instead (see content/README.md); a GitHub\n" +
  " * Action runs scripts/build-content.js and rewrites this file.\n" +
  " */\n" +
  "var MODULES = " + js(MODULES) + ";\n" +
  "var LESSON_PACKS = " + js(LESSON_PACKS) + ";\n" +
  "var GAME_BANK = " + js(GAME_BANK) + ";\n" +
  "var EXTRA_TOPICS = " + js(EXTRA_TOPICS) + ";\n" +
  "var GAME_FORMATS = " + js(GAME_FORMATS) + ";\n" +
  "var OFFICIAL_LESSONS = " + js(OFFICIAL_LESSONS) + ";\n";

if (problems.length) {
  console.error("Content check found " + problems.length + " problem" + (problems.length > 1 ? "s" : "") + ":\n");
  problems.forEach(function (p) { console.error("  - " + p); });
  console.error("\nNothing was written. Fix the files above and try again.");
  process.exit(1);
}

var check = process.argv.indexOf("--check") >= 0;
var stale = [];
[[OUT_HELPER, helperJs], [OUT_CONTENT, contentJs]].forEach(function (o) {
  var current = fs.existsSync(o[0]) ? fs.readFileSync(o[0], "utf8") : "";
  if (current === o[1]) return;
  stale.push(path.relative(ROOT, o[0]));
  if (!check) fs.writeFileSync(o[0], o[1]);
});
var summary = "Content OK: " + answers.length + " helper answers, " + sourceOrder.length + " sources, " + MODULES.length + " modules, " +
  EXTRA_TOPICS.length + " extra topics, " + GAME_FORMATS.length + " games, " + Object.keys(OFFICIAL_LESSONS).length + " official lessons.";
if (!stale.length) console.log(summary + " Generated files are up to date.");
else if (check) { console.error(summary + " But these are out of date: " + stale.join(", ") + ". Run: node scripts/build-content.js"); process.exit(1); }
else console.log(summary + " Wrote " + stale.join(", ") + ".");
