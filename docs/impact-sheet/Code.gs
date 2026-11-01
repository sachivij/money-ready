/**
 * Money Ready — students reached and workshops used (spec 09)
 *
 * Paste this whole file into the Apps Script editor of the private Google
 * Sheet (Extensions → Apps Script). See README.md in this folder.
 *
 * The website sends one small message each time a volunteer or teacher
 * starts something: { kind, item, students, role, site }. This script
 * checks it and adds one row to the "Log" tab. The "Totals" tab adds the
 * rows up. No names or emails ever arrive here.
 */

var KINDS = ["builder", "facilitator", "game"];
var ROLES = ["volunteer", "school"];
var MAX_STUDENTS = 500;

// Run this once from the editor (select "setup", press Run) to create the
// Log and Totals tabs with their headings and formulas.
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = ss.getSheetByName("Log") || ss.insertSheet("Log");
  log.clear();
  log.appendRow(["When", "Kind", "Module or game", "Students", "Role", "Site"]);
  log.setFrozenRows(1);
  log.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm");

  var totals = ss.getSheetByName("Totals") || ss.insertSheet("Totals", 0);
  totals.clear();
  totals.getRange("A1:B1").setValues([["Measure", "Total"]]).setFontWeight("bold");
  totals.getRange("A2:B9").setFormulas([
    ['="Students reached"', "=SUM(Log!D2:D)"],
    ['="Workshops / activities used"', "=COUNTA(Log!A2:A)"],
    ['="  …built in the Workshop Builder"', '=COUNTIF(Log!B2:B,"builder")'],
    ['="  …run with the Facilitator"', '=COUNTIF(Log!B2:B,"facilitator")'],
    ['="  …on-screen games played"', '=COUNTIF(Log!B2:B,"game")'],
    ['="Started by teen volunteers"', '=COUNTIF(Log!E2:E,"volunteer")'],
    ['="Started by teachers / schools"', '=COUNTIF(Log!E2:E,"school")'],
    ['="Students reached this month"', '=SUMIFS(Log!D2:D,Log!A2:A,">="&EOMONTH(TODAY(),-1)+1)'],
  ]);
  totals.autoResizeColumns(1, 2);
}

// The website calls this. It only ever adds a row; it can't read or change
// anything else in the sheet.
function doPost(e) {
  var d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply("bad");
  }
  var students = Number(d.students);
  var item = String(d.item || "");
  var site = String(d.site || "");
  // Ignore anything that isn't exactly what the site sends.
  if (KINDS.indexOf(d.kind) < 0) return reply("bad");
  if (ROLES.indexOf(d.role) < 0) return reply("bad");
  if (!(students >= 1 && students <= MAX_STUDENTS && Math.floor(students) === students)) return reply("bad");
  if (!/^[a-z0-9-]{0,60}$/.test(item)) return reply("bad");
  if (!/^[a-z0-9.-]{1,60}$/.test(site)) return reply("bad");

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var log = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
    log.appendRow([new Date(), d.kind, item, students, d.role, site]);
  } finally {
    lock.releaseLock();
  }
  return reply("ok");
}

function reply(text) {
  return ContentService.createTextOutput(text);
}
