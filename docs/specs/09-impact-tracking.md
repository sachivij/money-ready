# Spec 09: Count students reached and workshops used

**Status:** In progress (Owner: Ridhi Poranki)

**Owner decision (2026-10-30):** Sachika agreed to relax the "no external
requests" constraint for this one purpose: sending anonymous counts to a
private Google Sheet. Everything else in the hard constraints still holds.

## What to build
- When a teen volunteer or teacher uses something — builds a plan in the
  Workshop Builder, starts a Facilitator session, or opens an on-screen
  game — the site asks "How many students will be participating in this
  activity?" They must answer (a whole number) to continue.
- Each answer counts as one workshop/activity used, plus that many
  students reached.
- The count is sent to a Google Apps Script attached to a Google Sheet that
  only Ridhi and Sachika can open. Only these fields are sent: what kind
  of thing was used, which module or game, the number of students, the
  role (volunteer or teacher), and which site sent it. No names, no
  emails, nothing about students.
- Organizations are not asked. Practice mode is not counted. Local testing
  and preview deployments do not send anything.
- If the sheet is unreachable (blocked school network, offline), the site
  works exactly as before.

## Done when
Using the live site adds a row to the private sheet, a Totals tab shows
students reached and workshops used, the privacy wording on the site says
what is sent, and the handover notes describe the changed constraint.
