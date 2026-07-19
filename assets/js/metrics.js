/*
 * metrics.js — Privacy-safe, aggregate-only impact metrics
 * -------------------------------------------------------------
 * PRIVACY PROMISE (privacy-safe by design):
 *   • No names, logins, emails, or any personal data are collected.
 *   • Nothing is sent to any server. There is no backend.
 *   • Data lives ONLY in this browser's localStorage on the leader's
 *     own device, and can be cleared with one button.
 *   • We store COUNTS ONLY — e.g. "8 students answered", "5 felt
 *     confident" — never who answered what.
 *
 * A session record looks like:
 *   {
 *     id, workshopId, workshopTitle,
 *     dateISO,                // date only, no precise time needed
 *     participants,           // a headcount the leader optionally enters
 *     quiz: { correct, total },
 *     polls: [{ prompt, tallies: {optionText: count} }],
 *     confidence: { counts: [c1,c2,c3,c4,c5] } // taps per level 1..5
 *   }
 */

const Metrics = (() => {
  const KEY = "moneyReady.sessions.v1";

  function loadAll() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(sessions) {
    try {
      localStorage.setItem(KEY, JSON.stringify(sessions));
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveSession(session) {
    const all = loadAll();
    all.push(session);
    saveAll(all);
    return session;
  }

  function clearAll() {
    localStorage.removeItem(KEY);
  }

  // Roll every saved session up into simple, shareable totals.
  function summary() {
    const all = loadAll();
    const s = {
      sessions: all.length,
      participants: 0,
      workshopsRun: {},
      quizCorrect: 0,
      quizTotal: 0,
      confidenceCounts: [0, 0, 0, 0, 0], // levels 1..5
      confidenceResponses: 0,
    };
    all.forEach((rec) => {
      s.participants += Number(rec.participants) || 0;
      s.workshopsRun[rec.workshopTitle] =
        (s.workshopsRun[rec.workshopTitle] || 0) + 1;
      if (rec.quiz) {
        s.quizCorrect += rec.quiz.correct || 0;
        s.quizTotal += rec.quiz.total || 0;
      }
      if (rec.confidence && Array.isArray(rec.confidence.counts)) {
        rec.confidence.counts.forEach((c, i) => {
          s.confidenceCounts[i] += c || 0;
          s.confidenceResponses += c || 0;
        });
      }
    });
    s.quizPercent = s.quizTotal
      ? Math.round((s.quizCorrect / s.quizTotal) * 100)
      : null;
    // Average confidence on the 1..5 scale.
    let weighted = 0;
    s.confidenceCounts.forEach((c, i) => (weighted += c * (i + 1)));
    s.confidenceAvg = s.confidenceResponses
      ? Math.round((weighted / s.confidenceResponses) * 10) / 10
      : null;
    return s;
  }

  // A plain-text report a leader can copy into an email to Virginia
  // Jump$tart. Contains only aggregate numbers — no personal data.
  function textReport() {
    const s = summary();
    const lines = [];
    lines.push("Money Ready — Impact Summary (aggregate, no personal data)");
    lines.push("Generated on this device from local session records.");
    lines.push("");
    lines.push(`Workshops delivered: ${s.sessions}`);
    lines.push(`Total students reached: ${s.participants}`);
    if (Object.keys(s.workshopsRun).length) {
      lines.push("");
      lines.push("By workshop:");
      Object.entries(s.workshopsRun).forEach(([t, n]) =>
        lines.push(`  • ${t}: ${n} session(s)`)
      );
    }
    if (s.quizPercent !== null) {
      lines.push("");
      lines.push(
        `Activity questions answered correctly: ${s.quizCorrect}/${s.quizTotal} (${s.quizPercent}%)`
      );
    }
    if (s.confidenceAvg !== null) {
      lines.push("");
      lines.push(
        `Student confidence (self-rated 1–5): average ${s.confidenceAvg} from ${s.confidenceResponses} anonymous responses`
      );
    }
    lines.push("");
    lines.push("Privacy note: no names, logins, or personal data were collected.");
    return lines.join("\n");
  }

  return { loadAll, saveSession, clearAll, summary, textReport };
})();
