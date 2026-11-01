#!/usr/bin/env node
/*
 * build-content.js: turns the plain content files in content/ into the
 * JavaScript file the site loads (spec 11).
 *
 *   content/sources/*.md  ->  approved source list (KB_SRC, KB_SRC_ABOUT)
 *   content/helper/*.md   ->  Standards Helper answers (FAQ_KNOWLEDGE)
 *   ...both written to       assets/js/helper-kb.js
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

var problems = [];
function problem(file, msg) { problems.push(path.relative(ROOT, file) + ": " + msg); }

// ---------------------------------------------------------------- reading

// Files in a folder, in name order. The number at the start of each name
// sets the order on the site; README.md and files starting with "_" (the
// templates) are skipped.
function listMd(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(function (f) { return /\.md$/i.test(f) && f !== "README.md" && f.charAt(0) !== "_"; })
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

// ---------------------------------------------------------------- writing

function js(v) { return JSON.stringify(v, null, 2); }
var KB_SRC = {}, KB_SRC_ABOUT = {};
sourceOrder.forEach(function (k) {
  if (sources[k].kind !== "trusted") return;
  KB_SRC[k] = [sources[k].name, sources[k].website];
  KB_SRC_ABOUT[k] = sources[k].about;
});

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

if (problems.length) {
  console.error("Content check found " + problems.length + " problem" + (problems.length > 1 ? "s" : "") + ":\n");
  problems.forEach(function (p) { console.error("  - " + p); });
  console.error("\nNothing was written. Fix the files above and try again.");
  process.exit(1);
}

var current = fs.existsSync(OUT_HELPER) ? fs.readFileSync(OUT_HELPER, "utf8") : "";
var check = process.argv.indexOf("--check") >= 0;
if (current === helperJs) {
  console.log("Content OK: " + answers.length + " helper answers, " + sourceOrder.length + " sources. assets/js/helper-kb.js is up to date.");
} else if (check) {
  console.error("Content OK, but assets/js/helper-kb.js is out of date. Run: node scripts/build-content.js");
  process.exit(1);
} else {
  fs.writeFileSync(OUT_HELPER, helperJs);
  console.log("Content OK: " + answers.length + " helper answers, " + sourceOrder.length + " sources. Wrote assets/js/helper-kb.js.");
}
