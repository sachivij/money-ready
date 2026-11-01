#!/usr/bin/env node
/*
 * watch-jumpstart.js: notices when Jump$tart posts new Teen Teach-In material.
 *
 * Run weekly by .github/workflows/jumpstart-watch.yml. It reads the public
 * Teen Teach-In resources page, lists the files linked from it (slide decks,
 * PDFs, worksheets, videos), and compares that list with the one saved in
 * content/watch/jumpstart-teen-teach-in.txt from the last run.
 *
 * It NEVER changes what the site teaches. When the list changes it only
 * writes an issue text for the workflow to post, so a person can look at the
 * new material and turn it into content files through a pull request.
 *
 * Usage: node scripts/watch-jumpstart.js <file to write the issue text to>
 * Exit code 0 = ran fine (check "changed" in the output), 1 = couldn't read the page.
 * Plain Node 20, no packages.
 */
"use strict";
var fs = require("fs");
var path = require("path");

var PAGE = process.env.WATCH_PAGE || "https://www.jumpstart.org/awareness/check-your-school/teen-teach-in/resources/";
var SAVED = path.join(__dirname, "..", "content", "watch", "jumpstart-teen-teach-in.txt");
var issueFile = process.argv[2] || "issue.md";

// A link counts as "material" if it points at a file or a video.
var FILE = /\.(pdf|pptx?|docx?|xlsx?|zip|mp4|mov)(\?|#|$)/i;
var HOSTS = /(docs\.google\.com|drive\.google\.com|youtube\.com|youtu\.be|vimeo\.com|canva\.com|\/wp-content\/uploads\/)/i;

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, name + "=" + value + "\n");
  console.log(name + "=" + value);
}

function fail(why) {
  fs.writeFileSync(issueFile,
    "The weekly check couldn't read the Jump$tart Teen Teach-In resources page, so it can't tell whether anything new was posted.\n\n" +
    "- Page: " + PAGE + "\n- Problem: " + why + "\n\n" +
    "Check the page by hand. If Jump$tart has moved or blocked it, the check in `.github/workflows/jumpstart-watch.yml` needs updating or switching off.\n");
  setOutput("changed", "false");
  setOutput("failed", "true");
  console.error(why);
  process.exit(1);
}

function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&#0?38;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/&#8211;/g, "–").replace(/&#8217;/g, "’").replace(/&nbsp;/g, " ");
}

(async function () {
  var html;
  try {
    var res = await fetch(PAGE, { headers: { "User-Agent": "Mozilla/5.0 (money-ready weekly resource check; github.com/sachivij/money-ready)" } });
    if (!res.ok) fail("the page answered with HTTP " + res.status + ".");
    html = await res.text();
  } catch (e) {
    fail("couldn't connect (" + e.message + ").");
  }

  var found = {};
  var re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, m;
  while ((m = re.exec(html))) {
    var href = decode(m[1].trim());
    if (!FILE.test(href) && !HOSTS.test(href)) continue;
    try { href = new URL(href, PAGE).href; } catch (e) { continue; }
    var text = decode(m[2].replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
    if (!(href in found) || (!found[href] && text)) found[href] = text;
  }
  var now = Object.keys(found).sort();
  if (!now.length) fail("no slide decks, PDFs or videos were linked from the page. Its layout may have changed.");

  var first = !fs.existsSync(SAVED);
  var before = first ? [] : fs.readFileSync(SAVED, "utf8").split("\n").map(function (l) { return l.split("\t")[0].trim(); }).filter(Boolean);
  var added = now.filter(function (u) { return before.indexOf(u) < 0; });
  var removed = before.filter(function (u) { return now.indexOf(u) < 0; });

  fs.mkdirSync(path.dirname(SAVED), { recursive: true });
  fs.writeFileSync(SAVED, now.map(function (u) { return u + (found[u] ? "\t" + found[u] : ""); }).join("\n") + "\n");

  if (!first && !added.length && !removed.length) {
    setOutput("changed", "false");
    console.log("No change: " + now.length + " resources linked, same as last week.");
    return;
  }

  function line(u) { return "- [" + (found[u] || u.split("/").pop() || u) + "](" + u + ")"; }
  var body = first
    ? "The weekly Jump$tart check is now watching the Teen Teach-In resources page. These are the " + now.length + " resources linked from it today:\n\n" + now.map(line).join("\n") +
      "\n\nFrom now on, a new issue opens only when something is added or removed.\n"
    : "The Jump$tart Teen Teach-In resources page changed since last week.\n\n" +
      (added.length ? "**New (" + added.length + "):**\n" + added.map(line).join("\n") + "\n\n" : "") +
      (removed.length ? "**No longer listed (" + removed.length + "):**\n" + removed.map(function (u) { return "- " + u; }).join("\n") + "\n\n" : "") +
      "Nothing on the site has changed. To use new material, download it and attach it in the Money Ready project (or write the content files yourself, see `content/README.md`), then review and merge the pull request.\n";
  body += "\nPage: " + PAGE + "\n";
  fs.writeFileSync(issueFile, body);
  setOutput("changed", "true");
  setOutput("first", first ? "true" : "false");
})();
