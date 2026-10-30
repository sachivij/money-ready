/*
 * reach.js — counting students reached and workshops used (spec 09)
 * -----------------------------------------------------------------
 * When a teen volunteer or teacher builds a plan, starts a Facilitator
 * session, or opens an on-screen game, the site asks how many students
 * will take part (app.js shows the question). This file sends that count
 * to a private Google Sheet run by the project team.
 *
 * WHAT IS SENT — and nothing else:
 *   kind      "builder", "facilitator" or "game"
 *   item      the module or game id, e.g. "needs-vs-wants"
 *   students  the number typed in, 1–500
 *   role      "volunteer" or "school"
 *   site      the site's address, e.g. "money-ready.vercel.app"
 * No names, no emails, nothing about any student or volunteer.
 *
 * This is the one exception to "no external requests", agreed by the
 * owner on 2026-10-30. Sending only happens from the sites listed in
 * SEND_FROM, so local testing and Vercel previews never add rows. If the
 * sheet can't be reached (offline, a blocked school network), nothing
 * breaks — the count is simply lost.
 *
 * SETUP: follow docs/impact-sheet/README.md, then paste the web app
 * address it gives you into ENDPOINT below.
 */
var Reach = (function () {
  // The Google Apps Script web app address. Empty means "don't send".
  var ENDPOINT = "";
  // Only these sites send counts.
  var SEND_FROM = ["money-ready.vercel.app"];

  var KINDS = ["builder", "facilitator", "game"];
  var MAX_STUDENTS = 500;

  function enabled() {
    return !!ENDPOINT && SEND_FROM.indexOf(location.hostname) >= 0 && typeof fetch === "function";
  }

  // A whole number from 1 to MAX_STUDENTS, or null.
  function parseStudents(text) {
    var t = String(text == null ? "" : text).trim();
    if (!/^\d{1,3}$/.test(t)) return null;
    var n = Number(t);
    return n >= 1 && n <= MAX_STUDENTS ? n : null;
  }

  // Each workshop counts once per browser tab: rebuilding the same plan or
  // reloading the page doesn't count it again. sessionStorage clears when
  // the tab closes; private browsing falls back to memory.
  var COUNTED_KEY = "moneyReady.counted.v1";
  var countedMemory = {};
  function countedKey(kind, item) { return kind + ":" + (item || ""); }
  function alreadyCounted(kind, item) {
    var k = countedKey(kind, item);
    try {
      return !!JSON.parse(sessionStorage.getItem(COUNTED_KEY) || "{}")[k];
    } catch (e) { return !!countedMemory[k]; }
  }
  function markCounted(kind, item) {
    var k = countedKey(kind, item);
    try {
      var all = JSON.parse(sessionStorage.getItem(COUNTED_KEY) || "{}");
      all[k] = 1;
      sessionStorage.setItem(COUNTED_KEY, JSON.stringify(all));
    } catch (e) { countedMemory[k] = 1; }
  }

  function record(kind, item, students, role) {
    if (KINDS.indexOf(kind) < 0) return;
    markCounted(kind, item);
    if (!enabled()) return;
    var body = JSON.stringify({
      kind: kind,
      item: String(item || "").slice(0, 60),
      students: students,
      role: role,
      site: location.hostname,
    });
    try {
      // text/plain keeps this a "simple" request, which Apps Script accepts
      // without extra setup. The response can't be read (no-cors), and
      // doesn't need to be.
      fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: body,
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  return {
    parseStudents: parseStudents,
    alreadyCounted: alreadyCounted,
    record: record,
    enabled: enabled,
    MAX_STUDENTS: MAX_STUDENTS,
  };
})();
