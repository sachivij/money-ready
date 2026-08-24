/*
 * app.js — Money Ready Virginia Interactive Toolkit
 * -----------------------------------------------------------------
 * A single-page app with a tiny hash router. No frameworks, no
 * external requests — privacy-safe and works offline.
 *
 * Screens:
 *   #/               Landing page
 *   #/modules        Module library (10 cards)
 *   #/module/:id     Lesson transformation
 *   #/challenge/:id  Student challenge + reveal
 *   #/facilitator    Facilitator dashboard
 *   #/prep           Teen volunteer prep
 *   #/builder        Toolkit builder (guided packet workflow)
 *   #/portal         Request-a-volunteer / partner portal
 *   #/helper         Standards-grounded helper (retrieval only)
 *   #/impact         Impact snapshot + measurement layer
 *   #/take-home/:id  Printable take-home card
 */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var timers = []; // intervals/timeouts to clear on navigation

  // ---------- small helpers ----------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function moduleById(id) {
    return MODULES.filter(function (m) { return m.id === id; })[0] || null;
  }
  function clearTimers() {
    timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    timers = [];
  }
  function roomCode() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var s = "";
    for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return "PLAY-" + s;
  }
  function download(filename, text) {
    var blob = new Blob([text], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }
  // Copy text to clipboard, with a fallback for browsers/contexts where the
  // async Clipboard API is unavailable (e.g. some mobile or file:// pages).
  function copyText(text, done) {
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.top = "-1000px";
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else { fallback(); }
  }
  // Show a text summary on-screen with Copy + Download. This works on every
  // device, including phones where an automatic download is blocked.
  function showExitSummary(text, id) {
    var out = document.getElementById("exitOut");
    if (!out) return;
    out.innerHTML =
      '<div class="card"><div class="eyebrow">Exit-ticket summary <span class="pill-note">aggregate only</span></div>' +
        '<pre id="exitText" style="white-space:pre-wrap;font-family:inherit;background:var(--cream-2);padding:16px;border-radius:12px;margin:0 0 12px;font-size:.9rem">' + esc(text) + "</pre>" +
        '<div class="flex gap wrap-flex no-print">' +
          '<button class="btn btn-primary" id="copyExit">📋 Copy summary</button>' +
          '<button class="btn btn-secondary" id="dlExit">⬇ Download .txt</button>' +
        "</div>" +
        '<div id="copyMsg" class="muted mt-1" style="font-size:.85rem"></div>' +
      "</div>";
    document.getElementById("copyExit").addEventListener("click", function () {
      copyText(text, function (ok) {
        document.getElementById("copyMsg").textContent = ok
          ? "Copied! Paste it into an email or doc."
          : "Couldn't auto-copy — select the text above and copy it manually.";
      });
    });
    document.getElementById("dlExit").addEventListener("click", function () {
      download("exit-ticket-" + id + ".txt", text);
    });
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Status badge strip markup (reused).
  function badgeStrip() {
    return '<div class="status-strip"><div class="wrap">' +
      '<span class="label">Status:</span>' +
      STATUS_BADGES.map(function (b, i) {
        var cls = i === 0 ? "" : (i % 3 === 1 ? " amber" : (i % 3 === 2 ? " blue" : " gray"));
        return '<span class="badge' + cls + '">' + esc(b) + "</span>";
      }).join("") +
      "</div></div>";
  }

  // ================================================================
  // ACCOUNT TYPE (volunteer / school / organization)
  // Stored on this device only — it is a view preference, not a login.
  // No password, no personal data, nothing sent anywhere.
  // ================================================================
  var ROLE_KEY = "moneyReady.accountType.v1";
  // In-memory fallback so the choice still sticks for the session when
  // localStorage is unavailable — private browsing, or a browser set to
  // block site data. Without this the picker reappears on every page.
  var roleMemory = "";

  function getRole() {
    try { return localStorage.getItem(ROLE_KEY) || roleMemory; } catch (e) { return roleMemory; }
  }
  function setRole(id) {
    roleMemory = id;
    try { localStorage.setItem(ROLE_KEY, id); } catch (e) {}
    updateRoleChip();
  }
  function roleDef(id) {
    var r = ACCOUNT_TYPES.filter(function (a) { return a.id === (id || getRole()); })[0];
    return r || null;
  }
  function updateRoleChip() {
    var lab = document.getElementById("roleChipLabel");
    if (!lab) return;
    var r = roleDef();
    lab.textContent = r ? r.label : "Choose role";
    var chip = document.getElementById("roleChip");
    if (chip) chip.firstChild.nodeValue = (r ? r.emoji : "👤") + " ";
  }

  // The picker. `force` shows it even if a role is already chosen.
  function showRolePicker(force) {
    if (!force && getRole()) return;
    var current = getRole();
    var el = document.createElement("div");
    el.className = "role-overlay";
    el.id = "roleOverlay";
    el.innerHTML =
      '<div class="role-modal" role="dialog" aria-modal="true" aria-label="Choose your account type">' +
        '<div class="eyebrow">Welcome to Money Ready</div>' +
        "<h2>Who's using the toolkit?</h2>" +
        '<p class="muted" style="margin-bottom:0">Everything in the toolkit is the same for everyone — this only changes which ' +
          "impact numbers you see, so each group gets the view that's useful to them. You can switch anytime.</p>" +
        '<div class="role-options">' +
          ACCOUNT_TYPES.map(function (a) {
            return '<button class="role-option' + (a.id === current ? " on" : "") + '" data-role="' + a.id + '">' +
              '<span class="ro-emoji">' + a.emoji + "</span>" +
              '<span class="ro-name">' + esc(a.label) + "</span>" +
              '<span class="ro-blurb">' + esc(a.blurb) + "</span></button>";
          }).join("") +
        "</div>" +
        '<p class="role-note">🔒 This is a view preference saved on this device only — not an account. ' +
          "There is no password and no personal information is collected.</p>" +
      "</div>";
    document.body.appendChild(el);
    el.querySelectorAll(".role-option").forEach(function (b) {
      b.addEventListener("click", function () {
        setRole(b.getAttribute("data-role"));
        el.remove();
        route(); // re-render so the impact view matches
      });
    });
    // Clicking the dim background closes only if a role already exists.
    el.addEventListener("click", function (ev) {
      if (ev.target === el && getRole()) el.remove();
    });
  }

  // ================================================================
  // LANDING
  // ================================================================
  function renderHome() {
    // When modules are tagged with an official Teen Teach-In lesson, the site
    // leads with that Grades 1–4 sequence. Builds without those tags (the
    // Loudoun 4-H edition) fall back to the general layout automatically.
    var official = officialModules();
    var elementary = official.length > 0;
    var featured = elementary ? official : MODULES.slice(0, 6);
    app.innerHTML =
      // Hero
      '<section class="hero"><div class="wrap hero-grid">' +
        "<div>" +
          '<div class="eyebrow">Money Ready · Virginia Interactive Toolkit</div>' +
          "<h1>Turn financial literacy lessons into " +
            '<span class="hl">live, student-led learning moments.</span></h1>' +
          '<p class="sub">A proposed student-led pilot that helps Virginia Jump$tart make ' +
            "Teen Teach-In and workshop content more interactive, practical, and measurable.</p>" +
          (elementary ?
            '<div class="badge-row" style="margin-bottom:18px">' +
              '<span class="badge">👧 Built for Grades 1–4</span>' +
              '<span class="badge amber">🙋 Taught by teen volunteers</span>' +
              '<span class="badge blue">🙌 Works without devices</span>' +
            "</div>" : "") +
          '<div class="hero-cta">' +
            '<a class="btn btn-primary btn-lg" href="#/modules">See Example Modules</a>' +
            '<a class="btn btn-secondary btn-lg" href="#/facilitator">View Workshop Flow</a>' +
          "</div>" +
          '<p class="muted" style="font-size:.85rem">Educational only · Privacy-safe by design · ' +
            "Pending review and approval by Virginia Jump$tart</p>" +
        "</div>" +
        '<div class="hero-art">' +
          miniCard("🎮", "Live scenario challenge", "Students vote on their own device or a shared screen") +
          miniCard("📊", "Instant class results", "See how the room answered, then discuss") +
          miniCard("🧑‍🏫", "Confident teen volunteers", "Opening scripts, vocab, and practice mode") +
          miniCard("🔒", "Privacy-safe metrics", "Aggregate only — no names, no logins") +
        "</div>" +
      "</div></section>" +
      badgeStrip() +

      // Why interactive learning
      '<section class="section"><div class="wrap">' +
        '<div class="center" style="max-width:680px;margin:0 auto 36px">' +
          '<div class="eyebrow">Why interactive learning</div>' +
          "<h2>" + (elementary
            ? "Young students remember what they do — not what they sit through"
            : "Students remember what they do — not what they sit through") + "</h2>" +
          '<p class="muted">' + (elementary
            ? "A first grader will not sit still for a lecture about money. This toolkit turns the same approved topics into decisions elementary students make, argue about, and take home to their families."
            : "Traditional workshops ask students to listen. This toolkit turns the same approved topics into decisions students make, debate, and take home.") + "</p>" +
        "</div>" +
        '<div class="grid grid-3">' +
          feature("green", "🙋", "Active, not passive", "Every module has a decision to make and a vote to cast, so students participate instead of just listening.") +
          feature("amber", "💪", "Confidence for volunteers", "Say-this-out-loud scripts and a practice mode mean teen volunteers always know what comes next.") +
          feature("blue", "🔁", "Repeatable by design", "A consistent flow — challenge, vote, reveal, discuss, take home — that works for any topic or grade.") +
        "</div>" +
        '<div class="grid grid-2 mt-3">' +
          '<a class="card feature green" href="#/games" style="text-decoration:none;color:inherit">' +
            '<div class="ico">🙌</div><h3>Games that need no devices</h3>' +
            '<p class="muted mb-0">Nine of our twelve games run with zero screens — just movement, cards, and conversation. ' +
            "A workshop should never fail because the wifi did.</p></a>" +
          '<a class="card feature amber" href="#/generator" style="text-decoration:none;color:inherit">' +
            '<div class="ico">✨</div><h3>Lesson generator</h3>' +
            '<p class="muted mb-0">Pick a topic, age, length, and what technology you actually have — get a timed plan ' +
            "with matching games, ready to print.</p></a>" +
        "</div>" +
      "</div></section>" +

      // How the toolkit works
      '<section class="section" style="background:var(--white);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">' +
        '<div class="center" style="margin-bottom:34px"><div class="eyebrow">How the toolkit works</div>' +
          "<h2>One simple flow, every session</h2></div>" +
        '<div class="steps">' +
          howStep(1, "Pick a module", elementary ? "Choose the official Grade 1–4 lesson you're teaching, or any module from the wider library." : "Choose a topic and grade band from the library of ready-made workshops.") +
          howStep(2, "Run the challenge", "Students face a real-life money scenario and vote — on a shared screen, or by walking to a corner of the room.") +
          howStep(3, "Reveal & discuss", "Show the best answer, the key concept, and the common trap, then talk it through.") +
          howStep(4, "Take it home", "Students leave with a fridge-friendly card that keeps the money talk going with family.") +
        "</div>" +
      "</div></section>" +

      // Sample modules
      '<section class="section"><div class="wrap">' +
        '<div class="flex items-center wrap-flex" style="justify-content:space-between;margin-bottom:24px">' +
          "<div><div class=\"eyebrow\">Sample modules</div>" +
            "<h2>" + (elementary ? "The Grades 1–4 Teen Teach-In sequence" : "Ready-made, standards-based topics") + "</h2>" +
            (elementary ? '<p class="muted mb-0" style="max-width:52ch">Every official lesson, with the interactive layer added. More modules cover older students.</p>' : "") +
            "</div>" +
          '<a class="btn btn-secondary" href="#/modules">See all ' + MODULES.length + " modules →</a>" +
        "</div>" +
        '<div class="grid module-grid">' +
          featured.map(function (m, i) { return moduleCard(m, i + 1); }).join("") +
        "</div>" +
      "</div></section>" +

      // Built for teen volunteers
      '<section class="section" style="background:var(--cream-2)"><div class="wrap">' +
        '<div class="grid grid-2" style="align-items:center;gap:40px">' +
          "<div><div class=\"eyebrow\">Built for teen volunteers</div>" +
            "<h2>" + (elementary ? "So a nervous first-timer can walk into a classroom of second graders and teach" : "So a nervous first-timer can teach with confidence") + "</h2>" +
            '<ul class="privacy-list mt-2">' +
              liOk("A friendly opening script for every module — never wonder what to say") +
              liOk("Key vocabulary in plain, kid-ready language") +
              liOk("Step-by-step activity timing so the session runs itself") +
              liOk("Practice mode to rehearse before the real thing") +
            "</ul>" +
            '<a class="btn btn-primary mt-3" href="#/prep">Open volunteer prep</a>' +
          "</div>" +
          '<div class="card"><div class="eyebrow">Preview</div>' +
            '<div class="script-box">"Hi everyone! I\'m a teen volunteer and today we\'re money ' +
              "detectives. Our big question: what's the difference between something you NEED and " +
              "something you just WANT?\"</div>" +
            '<p class="muted mt-2" style="font-size:.85rem;margin-bottom:0">Opening script · Needs vs. Wants</p>' +
          "</div>" +
        "</div>" +
      "</div></section>" +

      // Privacy-safe by design
      '<section class="section"><div class="wrap">' +
        '<div class="callout">' +
          '<div class="ico">🔒</div>' +
          "<div><h3 style=\"margin-bottom:8px\">Privacy-safe by design</h3>" +
            '<p class="mb-0 muted">This prototype is built to protect students from the ground up. ' +
              "It collects <strong>no names, no logins, and no personal data</strong>. Impact numbers are " +
              "aggregate counts only, and there is no backend server — nothing to leak.</p>" +
            '<a class="btn btn-ghost" style="padding-left:0" href="#/impact">See how impact is measured →</a>' +
          "</div>" +
        "</div>" +
      "</div></section>" +

      // Pilot plan
      '<section class="section" style="background:var(--white);border-top:1px solid var(--line)"><div class="wrap">' +
        '<div class="center" style="margin-bottom:30px"><div class="eyebrow">Pilot plan</div>' +
          "<h2>A practical, repeatable model to test with real workshops</h2></div>" +
        '<div class="timeline" style="max-width:820px;margin:0 auto">' +
          tl("Phase 1", "Review & align", "Share this prototype with Virginia Jump$tart leadership; align modules to approved standards and resources.") +
          tl("Phase 2", "Small pilot", elementary ? "Run 2–3 Teen Teach-In workshops in Grade 1–4 classrooms with teen volunteers, using one or two modules." : "Run 2–3 Teen Teach-In–style workshops with teen volunteers using one or two modules.") +
          tl("Phase 3", "Measure", "Collect privacy-safe, aggregate feedback: participation, confidence, and facilitator notes.") +
          tl("Phase 4", "Refine & repeat", "Improve modules from what we learn, then expand to more schools and partners.") +
        "</div>" +
        '<p class="center muted mt-3" style="font-size:.85rem">This is a concept for discussion — a proposed pilot, ' +
          "pending review and approval by Virginia Jump$tart.</p>" +
      "</div></section>" +

      // Audiences
      '<section class="section"><div class="wrap center">' +
        '<div class="eyebrow">Designed to feel right for everyone in the room</div>' +
        "<h2 style=\"margin-bottom:20px\">Warm, credible, and educator-friendly</h2>" +
        '<div class="badge-row" style="justify-content:center;max-width:760px;margin:0 auto">' +
          ["Virginia Jump$tart leadership", elementary ? "Elementary teachers" : "Teachers", "High school volunteers",
           elementary ? "Grades 1–4 students" : "Elementary & middle students",
           "Parents & families", "Libraries", "Community partners", "Potential sponsors"]
            .map(function (a) { return '<span class="badge gray">' + esc(a) + "</span>"; }).join("") +
        "</div>" +
        '<div class="hero-cta" style="justify-content:center;margin-top:28px">' +
          '<a class="btn btn-primary btn-lg" href="#/modules">Explore the modules</a>' +
          '<a class="btn btn-secondary btn-lg" href="#/builder">Build a workshop packet</a>' +
        "</div>" +
      "</div></section>";
    wireNav();
  }
  function miniCard(e, t, s) {
    return '<div class="mini-card"><div class="emoji-badge">' + e + "</div><div><strong>" +
      esc(t) + "</strong><span>" + esc(s) + "</span></div></div>";
  }
  function feature(color, ico, t, body) {
    return '<div class="card feature ' + color + '"><div class="ico">' + ico + "</div>" +
      "<h3>" + esc(t) + "</h3><p class=\"muted mb-0\">" + esc(body) + "</p></div>";
  }
  function howStep(n, t, body) {
    return '<div class="step"><div class="num">' + n + "</div><h3>" + esc(t) +
      '</h3><p class="muted mb-0">' + esc(body) + "</p></div>";
  }
  function liOk(t) { return '<li><span class="ok">✓</span><span>' + esc(t) + "</span></li>"; }
  function tl(phase, t, body) {
    return '<div class="tl-item"><div class="tl-phase">' + esc(phase) + '</div>' +
      '<div class="card"><h3 style="margin-bottom:4px">' + esc(t) + '</h3>' +
      '<p class="muted mb-0">' + esc(body) + "</p></div></div>";
  }

  // ================================================================
  // MODULE LIBRARY
  // ================================================================
  function moduleCard(m, n) {
    return '<a class="card module-card c-' + m.color + '" href="#/module/' + m.id + '">' +
      '<div class="mc-top"><span class="mc-emoji">' + m.emoji + "</span>" +
        '<span class="mc-num">' + (n < 10 ? "0" + n : n) + "</span></div>" +
      "<h3>" + esc(m.title) + "</h3>" +
      (m.officialLesson ? '<div class="badge amber" style="margin-bottom:8px">⭐ Official Teen Teach-In lesson</div>' : "") +
      '<p class="mc-summary">' + esc(m.summary) + "</p>" +
      '<ul class="mc-meta">' +
        metaRow("Grade band", m.gradeBand) +
        metaRow("Length", m.minutes + " min") +
        metaRow("Key concept", m.keyConcept) +
        metaRow("Activity", m.activityType) +
        (m.officialMaterials ? metaRow("Official kit", m.officialMaterials.join(", ")) : "") +
      "</ul>" +
      '<div class="mc-materials">' +
        m.materials.map(function (x) { return '<span class="chip">' + esc(x) + "</span>"; }).join("") +
      "</div></a>";
  }
  function metaRow(k, v) {
    return '<li><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + "</span></li>";
  }
  function renderModules() {
    // The library splits in two: the official Teen Teach-In sequence for
    // Grades 1–4, and an extended set for older students that goes beyond
    // the official program.
    var core = officialModules();
    var extended = MODULES.filter(function (m) { return !m.officialLesson; });

    // No official lessons tagged (the Loudoun 4-H edition): show one flat
    // list rather than an empty "core sequence" section.
    if (!core.length) {
      app.innerHTML =
        '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Module library</div>' +
          '<div class="eyebrow">Module library</div>' +
          "<h1>" + MODULES.length + " ready-made, interactive modules</h1>" +
          '<p class="muted" style="max-width:62ch">Each is built around an existing financial-literacy topic and ' +
            "follows the same repeatable flow. Grade bands and lengths are starting points you can adjust.</p>" +
        "</div>" +
        badgeStrip() +
        '<section class="section tight"><div class="wrap"><div class="grid module-grid">' +
          MODULES.map(function (m, i) { return moduleCard(m, i + 1); }).join("") +
        "</div></div></section>";
      wireNav();
      return;
    }

    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Module library</div>' +
        '<div class="eyebrow">Module library</div>' +
        "<h1>" + MODULES.length + " ready-made, interactive modules</h1>" +
        '<p class="muted" style="max-width:62ch">Each follows the same repeatable flow — challenge, vote, reveal, ' +
          "discuss, take home. Grade bands and lengths are starting points you can adjust.</p>" +
      "</div>" +
      badgeStrip() +

      // Core: the official Grades 1–4 sequence
      '<section class="section tight"><div class="wrap">' +
        '<div class="flex items-center wrap-flex gap" style="justify-content:space-between;margin-bottom:6px">' +
          "<div><div class=\"eyebrow\">Core sequence</div>" +
            "<h2 style=\"margin-bottom:4px\">⭐ Teen Teach-In · Grades 1–4</h2></div>" +
          '<span class="badge">' + core.length + " official lessons</span>" +
        "</div>" +
        '<p class="muted" style="max-width:62ch;margin-bottom:20px">These line up with the official Teen Teach-In ' +
          "lessons taught by teen volunteers in elementary classrooms. Each official lesson has its own presentation, " +
          "toolkit, or worksheet — this adds the live, interactive layer on top. " +
          '<a href="#/resources">See the official resources →</a></p>' +
        '<div class="grid module-grid">' +
          core.map(function (m, i) { return moduleCard(m, i + 1); }).join("") +
        "</div>" +
      "</div></section>" +

      // Extended: older students, beyond the official program
      '<section class="section tight" style="background:var(--cream-2);border-top:1px solid var(--line)"><div class="wrap">' +
        '<div class="flex items-center wrap-flex gap" style="justify-content:space-between;margin-bottom:6px">' +
          "<div><div class=\"eyebrow\">Extended library</div>" +
            "<h2 style=\"margin-bottom:4px\">📚 For older students · Grades 5–12</h2></div>" +
          '<span class="badge gray">' + extended.length + " additional modules</span>" +
        "</div>" +
        '<p class="muted" style="max-width:62ch;margin-bottom:20px">These go <strong>beyond the official Teen Teach-In ' +
          "program</strong>, covering topics for middle and high school students — budgeting, credit, paychecks, scams, " +
          "banking, college costs, and investing. Useful for older audiences, library programs, or a future expansion " +
          "of the pilot. They are not part of the Grades 1–4 sequence.</p>" +
        '<div class="grid module-grid">' +
          extended.map(function (m, i) { return moduleCard(m, i + 1); }).join("") +
        "</div>" +
      "</div></section>";
    wireNav();
  }

  // ================================================================
  // LESSON TRANSFORMATION (module detail)
  // ================================================================
  function renderModule(id) {
    var m = moduleById(id);
    if (!m) return renderNotFound();
    var staticItems = ["Read the topic aloud", "Show a definition slide", "Ask if there are questions",
      "Hand out a worksheet", "Move on to the next topic"];
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · ' +
        '<a href="#/modules">Modules</a> · ' + esc(m.title) + "</div>" +
        '<div class="flex items-center gap wrap-flex">' +
          '<span style="font-size:2.4rem">' + m.emoji + "</span>" +
          "<div><div class=\"eyebrow\">Lesson transformation</div><h1 style=\"margin-bottom:2px\">" + esc(m.title) + "</h1>" +
          '<span class="badge gray">' + esc(m.gradeBand) + '</span> <span class="badge gray">' + m.minutes + ' min</span></div>' +
        "</div>" +
        '<div class="card mt-3" style="border-left:5px solid var(--green)">' +
          "<strong>Learning objective:</strong> " + esc(m.objective) + "</div>" +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        "<h2 class=\"center\" style=\"margin-bottom:8px\">From static lesson to live learning moment</h2>" +
        '<p class="center muted" style="margin-bottom:28px">Same approved content — delivered as decisions students make.</p>' +
        '<div class="transform-grid">' +
          '<div class="transform-col"><h4>😴 Static lesson</h4><ul class="static-list">' +
            staticItems.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
          "</ul></div>" +
          '<div class="transform-arrow">➜</div>' +
          '<div class="transform-col"><h4>⚡ Interactive module</h4><ul class="interactive-list">' +
            m.interactive.map(function (s) { return "<li>✦ " + esc(s) + "</li>"; }).join("") +
          "</ul></div>" +
        "</div>" +
        '<div class="hero-cta" style="justify-content:center;margin-top:32px">' +
          '<a class="btn btn-primary btn-lg" href="#/challenge/' + m.id + '">▶ Run the student challenge</a>' +
          '<a class="btn btn-secondary" href="#/prep?topic=' + m.id + '">Volunteer prep</a>' +
          '<a class="btn btn-secondary" href="#/take-home/' + m.id + '">Take-home card</a>' +
        "</div>" +
      "</div></section>";
    wireNav();
  }

  // ================================================================
  // STUDENT CHALLENGE + REVEAL
  // ================================================================
  function renderChallenge(id, practice) {
    var m = moduleById(id);
    if (!m) return renderNotFound();
    var c = m.challenge;
    var code = roomCode();
    var teamScore = 40;
    var answered = false;

    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · ' +
        '<a href="#/module/' + m.id + '">' + esc(m.title) + "</a> · Student challenge" +
        (practice ? ' · <span class="pill-note">Practice mode</span>' : "") + "</div></div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div class="challenge-stage" id="stage">' +
          '<div class="challenge-topbar">' +
            '<span class="pill"><span class="lab">Round</span>' + c.round + "</span>" +
            '<span class="pill room-code"><span class="lab">Room</span>' + code + "</span>" +
            '<span class="pill"><span class="lab">Module</span>' + esc(m.title) + "</span>" +
            '<span class="timer-ring">⏱ <span id="timeLeft">' + c.timerSeconds + "</span>s</span>" +
          "</div>" +
          '<div class="timer-bar"><div class="timer-fill" id="timerFill"></div></div>' +
          '<div class="challenge-q">' + esc(c.scenario) + "</div>" +
          '<div class="answers" id="answers">' +
            c.options.map(function (opt, i) {
              var key = String.fromCharCode(65 + i);
              return '<button class="answer-btn" data-i="' + i + '">' +
                '<span class="key">' + key + "</span><span>" + esc(opt) + "</span></button>";
            }).join("") +
          "</div>" +
          '<div class="challenge-foot">' +
            '<span class="muted" style="color:#bcd2cd;font-size:.85rem">Students answer on a shared screen or their own device — no login, no names.</span>' +
            '<span class="team-score">🏆 Team score (optional): <span id="teamScore">' + teamScore + "</span></span>" +
          "</div>" +
        "</div>" +
        '<div id="revealSlot"></div>' +
      "</div></section>";

    // Timer
    var total = c.timerSeconds, left = total;
    var fill = document.getElementById("timerFill");
    var timeLeftEl = document.getElementById("timeLeft");
    fill.style.width = "100%";
    var tick = setInterval(function () {
      left--;
      timeLeftEl.textContent = Math.max(left, 0);
      var pct = Math.max(left / total, 0) * 100;
      fill.style.width = pct + "%";
      if (pct < 30) fill.classList.add("low");
      if (left <= 0) { clearInterval(tick); if (!answered) lockIn(-1); }
    }, 1000);
    timers.push(tick);

    function lockIn(chosen) {
      if (answered) return;
      answered = true;
      clearInterval(tick);
      var btns = document.querySelectorAll("#answers .answer-btn");
      btns.forEach(function (b) {
        var i = Number(b.getAttribute("data-i"));
        b.disabled = true;
        if (i === c.best) b.classList.add("correct");
        else if (i === chosen) b.classList.add("wrong");
      });
      if (chosen === c.best) {
        teamScore += 10;
        document.getElementById("teamScore").textContent = teamScore;
      }
      showReveal(m, chosen);
    }

    document.querySelectorAll("#answers .answer-btn").forEach(function (b) {
      b.addEventListener("click", function () { lockIn(Number(b.getAttribute("data-i"))); });
    });
    wireNav();
  }

  function showReveal(m, chosen) {
    var r = m.reveal;
    var correct = chosen === m.challenge.best;
    var slot = document.getElementById("revealSlot");
    slot.innerHTML =
      '<div class="reveal mt-3" id="reveal">' +
        '<div class="reveal-hero">' +
          '<div class="tick">' + (correct ? "🎉" : "💡") + "</div>" +
          "<h2>" + (correct ? "Nice — that's the strongest answer!" : "Great thinking — here's the strongest answer") + "</h2>" +
          '<p class="mb-0" style="opacity:.9">Every answer helps the discussion. Let\'s see why this one works.</p>' +
        "</div>" +
        '<div class="reveal-body">' +
          revealRow("Best answer", esc(r.bestAnswer)) +
          revealRow("Why it works", esc(r.why)) +
          revealRow("Key concept", '<span class="reveal-tag">' + esc(r.keyConcept) + "</span>") +
          '<div class="reveal-row trap"><div class="rk">Common trap</div><div>⚠️ ' + esc(r.commonTrap) + "</div></div>" +
          revealRow("Discuss", "<strong>" + esc(r.discussionPrompt) + "</strong>") +
          '<div class="reveal-row"><div class="rk">Apply it</div><div class="apply-box">🎯 ' + esc(r.applyIt) + "</div></div>" +
          confidenceRow(m) +
          '<div class="flex gap wrap-flex mt-2 no-print">' +
            '<a class="btn btn-primary" href="#/take-home/' + m.id + '">Get the take-home card</a>' +
            '<a class="btn btn-secondary" href="#/facilitator">Open facilitator dashboard</a>' +
            '<a class="btn btn-ghost" href="#/modules">Back to modules</a>' +
          "</div>" +
        "</div>" +
      "</div>";
    var reveal = document.getElementById("reveal");
    reveal.scrollIntoView({ behavior: "smooth", block: "start" });
    wireConfidence(m);
  }
  function revealRow(k, v) {
    return '<div class="reveal-row"><div class="rk">' + esc(k) + "</div><div>" + v + "</div></div>";
  }
  function confidenceRow(m) {
    return '<div class="reveal-row"><div class="rk">Confidence check</div><div>' +
      '<p class="muted" style="margin-bottom:8px;font-size:.9rem">Anonymous & optional — tap how sure you feel now (helps us improve; no names stored).</p>' +
      '<div class="chips-select" id="confidence">' +
        [1, 2, 3, 4, 5].map(function (n) {
          return '<button class="chip-toggle" data-n="' + n + '">' +
            (["😳 1", "🙁 2", "😐 3", "🙂 4", "😄 5"][n - 1]) + "</button>";
        }).join("") +
      '</div><div id="confThanks" class="muted mt-1" style="font-size:.85rem"></div></div></div>';
  }
  function wireConfidence(m) {
    var wrap = document.getElementById("confidence");
    if (!wrap) return;
    wrap.querySelectorAll(".chip-toggle").forEach(function (b) {
      b.addEventListener("click", function () {
        wrap.querySelectorAll(".chip-toggle").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        var n = Number(b.getAttribute("data-n"));
        // Record privacy-safe, aggregate-only (a single anonymous tap).
        var counts = [0, 0, 0, 0, 0]; counts[n - 1] = 1;
        Metrics.saveSession({
          id: "conf-" + Date.now(),
          workshopId: m.id, workshopTitle: m.title,
          dateISO: new Date().toISOString().slice(0, 10),
          participants: 0,
          confidence: { counts: counts },
        });
        document.getElementById("confThanks").textContent =
          "Thanks! Recorded anonymously on this device only.";
      });
    });
  }

  // ================================================================
  // FACILITATOR DASHBOARD
  // ================================================================
  function renderFacilitator() {
    var current = MODULES[0];
    var code = roomCode();
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Facilitator dashboard</div>' +
        '<div class="eyebrow">Facilitator dashboard</div>' +
        "<h1>Run the session from one screen</h1>" +
        '<p class="muted"><span class="pill-note">Demo data</span> Numbers below are simulated to show the live workshop flow. ' +
          "No student data is collected.</p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap"><div class="dash-grid">' +
        // Left column
        "<div>" +
          '<div class="card">' +
            '<div class="flex items-center wrap-flex gap" style="justify-content:space-between">' +
              "<div><div class=\"eyebrow\">Current module</div>" +
                '<select id="modSelect" style="font-size:1.1rem;font-weight:700;border:none;padding:6px 0;background:transparent">' +
                  MODULES.map(function (m) { return '<option value="' + m.id + '">' + m.emoji + " " + esc(m.title) + "</option>"; }).join("") +
                "</select></div>" +
              '<div class="center"><div class="eyebrow">Room code</div>' +
                '<div style="font-size:1.4rem;font-weight:800;letter-spacing:.15em">' + code + "</div></div>" +
            "</div>" +
            '<div class="flex items-center gap mt-2" style="justify-content:space-between">' +
              '<div class="dash-stat"><span class="live-dot"></span> <span class="muted">Students joined</span> ' +
                '<span class="big" id="joined">0</span></div>' +
              '<div class="toggle-row" id="modeToggle">' +
                '<button class="btn btn-primary" data-mode="shared">📺 Shared screen</button>' +
                '<button class="btn btn-secondary" data-mode="hotseat">🎤 Hotseat</button>' +
              "</div>" +
            "</div>" +
          "</div>" +

          '<div class="card mt-3"><div class="eyebrow">Class response results <span class="pill-note">live demo</span></div>' +
            '<div id="results"></div>' +
          "</div>" +
        "</div>" +

        // Right column
        "<div>" +
          '<div class="card" style="background:var(--green-soft);border-color:rgba(31,157,107,.25)">' +
            '<div class="eyebrow">Suggested discussion prompt</div>' +
            '<p id="prompt" style="font-size:1.15rem;font-weight:700;margin-bottom:0"></p>' +
          "</div>" +
          '<div class="card mt-3"><div class="eyebrow">Session controls</div>' +
            '<p class="muted" style="font-size:.9rem">Step: <strong id="stepName">—</strong></p>' +
            '<button class="btn btn-primary btn-block" id="nextBtn">Next activity →</button>' +
            '<button class="btn btn-secondary btn-block mt-2" id="dlBtn">📋 Generate exit-ticket summary</button>' +
            '<p class="muted mt-2" style="font-size:.8rem;margin-bottom:0">Summary is aggregate only — no names, no personal data.</p>' +
          "</div>" +
          '<div id="exitOut" class="mt-3"></div>' +
          '<div class="card mt-3"><div class="eyebrow">Mode</div><p id="modeLabel" class="mb-0">' +
            "📺 <strong>Shared screen</strong> — one projected view the whole class answers together.</p></div>" +
        "</div>" +
      "</div></div></section>";

    var joinedEl = document.getElementById("joined");
    var joined = 0, target = 18 + Math.floor(Math.random() * 10);
    var join = setInterval(function () {
      if (joined < target) { joined += 1; joinedEl.textContent = joined; }
      else clearInterval(join);
    }, 180);
    timers.push(join);

    function refresh() {
      var m = moduleById(document.getElementById("modSelect").value);
      document.getElementById("prompt").textContent = m.reveal.discussionPrompt;
      // demo response distribution, best answer leading
      var opts = m.challenge.options, best = m.challenge.best;
      var demo = opts.map(function (_, i) { return i === best ? 46 + Math.floor(Math.random() * 20) : 6 + Math.floor(Math.random() * 22); });
      var sum = demo.reduce(function (a, b) { return a + b; }, 0);
      document.getElementById("results").innerHTML = opts.map(function (opt, i) {
        var pct = Math.round((demo[i] / sum) * 100);
        return '<div class="result-bar"><div class="rb-top"><span>' + String.fromCharCode(65 + i) + ". " + esc(opt) +
          "</span><span>" + pct + '%</span></div><div class="rb-track"><div class="rb-fill ' +
          (i === best ? "best" : "other") + '" style="width:' + Math.max(pct, 8) + '%">' + (i === best ? "Best" : "") + "</div></div></div>";
      }).join("");
      // steps
      stepIndex = 0;
      document.getElementById("stepName").textContent = m.prep.steps[0];
    }
    var stepIndex = 0;
    document.getElementById("modSelect").addEventListener("change", refresh);
    document.getElementById("nextBtn").addEventListener("click", function () {
      var m = moduleById(document.getElementById("modSelect").value);
      stepIndex = (stepIndex + 1) % m.prep.steps.length;
      document.getElementById("stepName").textContent = m.prep.steps[stepIndex];
    });
    document.getElementById("dlBtn").addEventListener("click", function () {
      var m = moduleById(document.getElementById("modSelect").value);
      var txt = "Money Ready — Exit Ticket Summary (EXAMPLE / aggregate only)\n" +
        "Module: " + m.title + "\nRoom: " + code + "\n\n" +
        "Students joined: " + joined + "\n" +
        "Key concept: " + m.reveal.keyConcept + "\n" +
        "Discussion prompt: " + m.reveal.discussionPrompt + "\n" +
        "Apply it: " + m.reveal.applyIt + "\n\n" +
        "Privacy note: no names, logins, or personal data collected. Demo figures.\n";
      showExitSummary(txt, m.id);
    });
    document.getElementById("modeToggle").querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll("#modeToggle button").forEach(function (x) { x.className = "btn btn-secondary"; });
        b.className = "btn btn-primary";
        var shared = b.getAttribute("data-mode") === "shared";
        document.getElementById("modeLabel").innerHTML = shared
          ? "📺 <strong>Shared screen</strong> — one projected view the whole class answers together."
          : "🎤 <strong>Hotseat</strong> — one student at a time answers on the main screen while the class coaches.";
      });
    });
    refresh();
    wireNav();
  }

  // ================================================================
  // TEEN VOLUNTEER PREP
  // ================================================================
  function renderPrep(query) {
    var topic = (query && query.topic) || MODULES[0].id;
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Volunteer prep</div>' +
        '<div class="eyebrow">Teen volunteer prep</div><h1>Everything you need to teach with confidence</h1>' +
        '<p class="muted">Pick a topic and you\'ll get a script, vocabulary, timed steps, prompts, printables, and a practice run.</p>' +
      "</div>" +
      '<section class="section tight"><div class="wrap"><div class="grid grid-2" style="grid-template-columns:320px 1fr;align-items:start">' +
        // Controls
        '<div class="card">' +
          '<div class="field"><label for="pTopic">Choose topic</label><select id="pTopic">' +
            MODULES.map(function (m) { return '<option value="' + m.id + '"' + (m.id === topic ? " selected" : "") + ">" + m.emoji + " " + esc(m.title) + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label for="pAge">Select age group</label><select id="pAge"><option>Elementary (K–5)</option><option>Middle (6–8)</option><option>High school (9–12)</option></select></div>' +
          '<div class="field"><label>Select workshop length</label><div class="chips-select" id="pLen">' +
            ["20 min", "30 min", "40 min", "45 min"].map(function (l, i) { return '<button class="chip-toggle' + (i === 1 ? " on" : "") + '" data-len="' + l + '">' + l + "</button>"; }).join("") +
          "</div></div>" +
          '<a class="btn btn-primary btn-block" id="practiceBtn" href="#/challenge/' + topic + '?practice=1">▶ Launch practice mode</a>' +
        "</div>" +
        // Content
        '<div id="prepContent"></div>' +
      "</div></div></section>";

    function fillPrep() {
      var m = moduleById(document.getElementById("pTopic").value);
      var p = m.prep;
      document.getElementById("practiceBtn").setAttribute("href", "#/challenge/" + m.id + "?practice=1");
      document.getElementById("prepContent").innerHTML =
        '<div class="card"><div class="eyebrow">Opening script — say this out loud</div>' +
          '<div class="script-box">' + esc(p.openingScript) + "</div></div>" +
        '<div class="grid grid-2 mt-3">' +
          '<div class="card"><div class="eyebrow">Key vocabulary</div>' +
            p.vocab.map(function (v) { return '<div class="vocab-item"><strong>' + esc(v.term) + "</strong> — " + esc(v.def) + "</div>"; }).join("") +
          "</div>" +
          '<div class="card"><div class="eyebrow">Activity steps</div><ol class="numbered">' +
            p.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
          "</ol></div>" +
        "</div>" +
        '<div class="grid grid-2 mt-3">' +
          '<div class="card"><div class="eyebrow">Discussion prompts</div><ul class="privacy-list">' +
            p.discussionPrompts.map(function (d) { return "<li><span class=\"ok\">💬</span><span>" + esc(d) + "</span></li>"; }).join("") +
          "</ul></div>" +
          '<div class="card"><div class="eyebrow">Printables</div>' +
            p.printables.map(function (x) { return '<span class="chip" style="font-size:.85rem;margin:0 6px 6px 0;display:inline-block">🖨 ' + esc(x) + "</span>"; }).join("") +
            '<div class="mt-2"><a class="btn btn-secondary" href="#/take-home/' + m.id + '">Open take-home card →</a></div>' +
          "</div>" +
        "</div>";
    }
    document.getElementById("pTopic").addEventListener("change", fillPrep);
    document.getElementById("pLen").querySelectorAll(".chip-toggle").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll("#pLen .chip-toggle").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
      });
    });
    fillPrep();
    wireNav();
  }

  // ================================================================
  // TOOLKIT BUILDER (guided packet workflow)
  // ================================================================
  function renderBuilder() {
    var GRADES = ["Grades K–2", "Grades 3–5", "Grades 6–8", "Grades 9–12"];
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Toolkit builder</div>' +
        '<div class="eyebrow">Toolkit builder · guided workflow</div>' +
        "<h1>Build a full workshop packet in one place</h1>" +
        '<p class="muted" style="max-width:64ch">Choose a topic and grade, and the toolkit assembles a ready-to-run ' +
          "packet — everything a teen volunteer needs from prep to reflection. <span class=\"pill-note\">Prototype: templates generate on your device</span></p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div class="card"><div class="grid grid-2" style="grid-template-columns:1fr 1fr">' +
          '<div class="field"><label for="bTopic">Topic</label><select id="bTopic">' +
            MODULES.map(function (m) { return '<option value="' + m.id + '">' + m.emoji + " " + esc(m.title) + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label for="bGrade">Grade band</label><select id="bGrade">' +
            GRADES.map(function (g) { return "<option>" + g + "</option>"; }).join("") +
          "</select></div>" +
        "</div>" +
        '<button class="btn btn-primary" id="genBtn">✨ Assemble packet</button></div>' +
        '<div id="packetOut" class="mt-3"></div>' +
      "</div></section>";

    function packetItems(m, grade) {
      return [
        { ico: "🖼", t: "Lesson deck outline", s: "Slides for " + m.title + " (" + grade + ")",
          body: "Slide 1 — Title: " + m.title + "\nSlide 2 — Big question / hook\nSlide 3 — Key vocabulary: " +
            m.prep.vocab.map(function (v) { return v.term; }).join(", ") + "\nSlide 4 — Scenario challenge\nSlide 5 — Group vote\nSlide 6 — Reveal: " +
            m.reveal.keyConcept + "\nSlide 7 — Discussion: " + m.reveal.discussionPrompt + "\nSlide 8 — Take-home + thank you" },
        { ico: "📝", t: "Practice notes", s: "Opening script + timed steps",
          body: "OPENING SCRIPT:\n" + m.prep.openingScript + "\n\nSTEPS:\n- " + m.prep.steps.join("\n- ") },
        { ico: "✉️", t: "Parent letter", s: "Friendly heads-up for families",
          body: "Dear Families,\n\nThis week your student took part in a short, fun financial-literacy workshop on \"" +
            m.title + "\" led by trained teen volunteers with Virginia Jump$tart. The goal: " + m.objective.toLowerCase() +
            "\n\nAsk them about it! A take-home card came with a simple family question. Everything is educational only and privacy-safe — no personal data is collected.\n\nWith appreciation,\nThe Money Ready volunteer team" },
        { ico: "🏫", t: "Administrator packet", s: "One-page overview for school leaders",
          body: "MONEY READY — WORKSHOP OVERVIEW (proposed pilot, pending Jump$tart approval)\nTopic: " + m.title +
            "\nGrade band: " + grade + "\nLength: " + m.minutes + " min\nObjective: " + m.objective +
            "\nFormat: teen-led, interactive (challenge → vote → reveal → discuss → take-home)\nPrivacy: educational only; no student data collected." },
        { ico: "✅", t: "Event checklist", s: "Day-of run of show",
          body: "BEFORE:\n[ ] Confirm room + screen/projector\n[ ] Load module: " + m.title + "\n[ ] Print take-home cards\n[ ] Rehearse opening script\nDURING:\n[ ] Welcome + big question\n[ ] Run challenge + vote\n[ ] Reveal + discussion\n[ ] Hand out take-home cards\nAFTER:\n[ ] Thank the class + teacher\n[ ] Note what went well (reflection page)" },
        { ico: "🗒", t: "Sign-up form", s: "Volunteer roles (no personal data required to view)",
          body: "TEEN TEACH-IN SIGN-UP — " + m.title + "\nRole 1: Lead facilitator\nRole 2: Co-facilitator / vote counter\nRole 3: Materials + take-home cards\nRole 4: Timekeeper\n(Names collected offline by the coordinator, not stored in this app.)" },
        { ico: "🔄", t: "Post-event reflection", s: "Quick, privacy-safe wrap-up",
          body: "REFLECTION (aggregate only — no names):\n- Students reached (count): ____\n- What worked well: ____\n- What to change next time: ____\n- Confidence check average (1–5): ____\n- One story worth sharing: ____" },
      ];
    }

    document.getElementById("genBtn").addEventListener("click", function () {
      var m = moduleById(document.getElementById("bTopic").value);
      var grade = document.getElementById("bGrade").value;
      var items = packetItems(m, grade);
      document.getElementById("packetOut").innerHTML =
        '<div class="card"><div class="flex items-center wrap-flex" style="justify-content:space-between">' +
          "<div><div class=\"eyebrow\">Assembled packet</div><h3 style=\"margin-bottom:0\">" + m.emoji + " " + esc(m.title) + " — " + esc(grade) + "</h3></div>" +
          '<button class="btn btn-secondary no-print" id="printPacket">🖨 Print / save all</button>' +
        "</div>" +
        '<ul class="packet-list mt-2">' +
          items.map(function (it, i) {
            return '<li class="packet-item"><div class="ico">' + it.ico + '</div><div class="txt"><strong>' +
              esc(it.t) + "</strong><span>" + esc(it.s) + '</span></div>' +
              '<button class="btn btn-ghost no-print" data-i="' + i + '">View</button></li>' +
              '<li id="body-' + i + '" class="hidden"><pre style="white-space:pre-wrap;background:var(--cream-2);padding:16px;border-radius:12px;font-family:inherit;margin:0 0 6px">' +
              esc(it.body) + "</pre></li>";
          }).join("") +
        "</ul></div>";
      document.querySelectorAll("#packetOut .packet-item .btn-ghost").forEach(function (b) {
        b.addEventListener("click", function () {
          var body = document.getElementById("body-" + b.getAttribute("data-i"));
          body.classList.toggle("hidden");
          b.textContent = body.classList.contains("hidden") ? "View" : "Hide";
        });
      });
      document.getElementById("printPacket").addEventListener("click", function () {
        document.querySelectorAll("#packetOut [id^='body-']").forEach(function (x) { x.classList.remove("hidden"); });
        window.print();
      });
      document.getElementById("packetOut").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    wireNav();
  }

  // ================================================================
  // REQUEST / PARTNER PORTAL
  // ================================================================
  function renderPortal() {
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Request &amp; partner portal</div>' +
        '<div class="eyebrow">Request a volunteer · offer support</div>' +
        "<h1>Connect schools, teen volunteers, and community partners</h1>" +
        '<p class="muted" style="max-width:64ch">A lightweight way for teachers to request a workshop and for partners to ' +
          "offer help. <span class=\"pill-note\">Prototype: nothing is sent anywhere — your entry becomes a copy-ready summary you can email.</span></p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap"><div class="grid grid-2">' +
        // Request
        '<div class="card"><h3>🍎 Request a volunteer</h3><p class="muted" style="font-size:.9rem">For teachers &amp; school partners.</p>' +
          '<div class="field"><label>Topic</label><select id="rTopic">' +
            MODULES.map(function (m) { return "<option>" + esc(m.title) + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label>Grade band</label><select id="rGrade"><option>Grades K–2</option><option>Grades 3–5</option><option>Grades 6–8</option><option>Grades 9–12</option></select></div>' +
          '<div class="field"><label>Format</label><select id="rFormat"><option>In-class workshop</option><option>Teen Teach-In event</option><option>Library / after-school</option><option>Assembly</option></select></div>' +
          '<div class="field"><label>General location (city / county — no address)</label><input id="rLoc" placeholder="e.g. Richmond" /></div>' +
          '<button class="btn btn-primary btn-block" id="rBtn">Create request summary</button>' +
          '<div id="rOut"></div>' +
        "</div>" +
        // Offer
        '<div class="card"><h3>🤝 Offer support</h3><p class="muted" style="font-size:.9rem">For coalition partners &amp; financial institutions.</p>' +
          '<div class="field"><label>Organization type</label><select id="oType"><option>Financial institution</option><option>Nonprofit / coalition partner</option><option>Library</option><option>Employer / sponsor</option></select></div>' +
          '<div class="field"><label>How you can help</label><div class="chips-select" id="oHelp">' +
            ["Classroom support", "Judging help", "Workshop facilitation", "Materials / printing", "Sponsorship"].map(function (h) { return '<button class="chip-toggle" data-h="' + esc(h) + '">' + esc(h) + "</button>"; }).join("") +
          "</div></div>" +
          '<div class="field"><label>General location (city / county)</label><input id="oLoc" placeholder="e.g. Fairfax County" /></div>' +
          '<button class="btn btn-primary btn-block" id="oBtn">Create offer summary</button>' +
          '<div id="oOut"></div>' +
        "</div>" +
      "</div>" +
      '<div class="callout mt-3"><div class="ico">🔒</div><div><strong>Privacy note.</strong> ' +
        "This prototype has no server and stores nothing. It only builds a text summary you can copy into an email " +
        "to a coordinator. Please don't enter student names or personal details.</div></div>" +
      "</div></section>";

    document.getElementById("rBtn").addEventListener("click", function () {
      var s = "VOLUNTEER REQUEST (draft — copy into an email)\n" +
        "Topic: " + document.getElementById("rTopic").value + "\n" +
        "Grade band: " + document.getElementById("rGrade").value + "\n" +
        "Format: " + document.getElementById("rFormat").value + "\n" +
        "Location: " + (document.getElementById("rLoc").value || "—") + "\n";
      showSummary("rOut", s);
    });
    var helpSel = {};
    document.getElementById("oHelp").querySelectorAll(".chip-toggle").forEach(function (b) {
      b.addEventListener("click", function () {
        b.classList.toggle("on");
        helpSel[b.getAttribute("data-h")] = b.classList.contains("on");
      });
    });
    document.getElementById("oBtn").addEventListener("click", function () {
      var help = Object.keys(helpSel).filter(function (k) { return helpSel[k]; });
      var s = "PARTNER OFFER (draft — copy into an email)\n" +
        "Organization type: " + document.getElementById("oType").value + "\n" +
        "Can help with: " + (help.length ? help.join(", ") : "—") + "\n" +
        "Location: " + (document.getElementById("oLoc").value || "—") + "\n";
      showSummary("oOut", s);
    });
    function showSummary(id, text) {
      document.getElementById(id).innerHTML =
        '<div class="apply-box mt-2"><strong>Copy this summary:</strong>' +
        '<pre style="white-space:pre-wrap;font-family:inherit;margin:8px 0 0">' + esc(text) + "</pre></div>";
    }
    wireNav();
  }

  // ================================================================
  // STANDARDS-GROUNDED HELPER (retrieval only)
  // ================================================================
  function renderHelper() {
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Standards helper</div>' +
        '<div class="eyebrow">Standards-grounded helper</div>' +
        "<h1>Quick answers — only from approved resources</h1>" +
        '<p class="muted" style="max-width:66ch">Ask a financial-literacy question and this helper looks up a plain-English ' +
          "answer from a small set of approved-style resources, always with a source. " +
          "<strong>It does not freestyle or make things up.</strong> " +
          "<span class=\"pill-note\">Prototype: example resource set, pending Jump$tart review</span></p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap" style="max-width:760px">' +
        '<div class="card">' +
          '<div class="field" style="margin-bottom:8px"><label for="q">Your question</label>' +
            '<input id="q" placeholder="e.g. What is the difference between a need and a want?" /></div>' +
          '<button class="btn btn-primary" id="askBtn">Look up answer</button>' +
          '<div class="suggested-q">' +
            FAQ_KNOWLEDGE.slice(0, 5).map(function (f) { return '<button class="chip-toggle" data-q="' + esc(f.q) + '">' + esc(f.q) + "</button>"; }).join("") +
          "</div>" +
        "</div>" +
        '<div id="ans" class="mt-3"></div>' +
        '<div class="callout mt-3"><div class="ico">🛡️</div><div><strong>How this stays safe.</strong> ' +
          "The helper only retrieves from the approved list above — if it doesn't have a grounded answer, it says so and " +
          "points you to a trusted adult or the Virginia Jump$tart / National Standards resources, rather than guessing.</div></div>" +
      "</div></section>";

    function search(query) {
      var q = query.toLowerCase();
      var scored = FAQ_KNOWLEDGE.map(function (f) {
        var score = 0;
        f.tags.forEach(function (t) { if (q.indexOf(t) >= 0) score += 2; });
        f.q.toLowerCase().split(/\W+/).forEach(function (w) { if (w.length > 3 && q.indexOf(w) >= 0) score += 1; });
        return { f: f, score: score };
      }).filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score; });
      return scored;
    }
    function answer(query) {
      var results = search(query);
      var out = document.getElementById("ans");
      if (!results.length) {
        out.innerHTML = '<div class="card"><h3>🤔 I don\'t have a grounded answer for that yet</h3>' +
          '<p class="muted">To stay safe, this helper only answers from its approved example resources — it won\'t guess. ' +
          "Try one of the suggested questions above, or ask a teacher or trusted adult. A full version would draw on the " +
          "National Standards and chapter-approved Virginia Jump$tart resources.</p></div>";
        return;
      }
      var top = results[0].f;
      out.innerHTML =
        '<div class="card"><div class="eyebrow">Answer</div><h3>' + esc(top.q) + "</h3>" +
          '<div class="helper-answer">' + esc(top.a) + "</div>" +
          '<div class="helper-source">📚 <span>Source: ' + esc(top.source) + "</span></div>" +
          '<p class="muted mt-2" style="font-size:.82rem;margin-bottom:0">Educational only · not financial advice · pending review.</p>' +
        "</div>" +
        (results.length > 1 ? '<div class="card mt-2"><div class="eyebrow">Related</div><div class="suggested-q">' +
          results.slice(1, 4).map(function (r) { return '<button class="chip-toggle" data-q="' + esc(r.f.q) + '">' + esc(r.f.q) + "</button>"; }).join("") + "</div></div>" : "");
      out.querySelectorAll("[data-q]").forEach(function (b) {
        b.addEventListener("click", function () { document.getElementById("q").value = b.getAttribute("data-q"); answer(b.getAttribute("data-q")); });
      });
      out.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    document.getElementById("askBtn").addEventListener("click", function () { answer(document.getElementById("q").value); });
    document.getElementById("q").addEventListener("keydown", function (e) { if (e.key === "Enter") answer(this.value); });
    document.querySelectorAll(".suggested-q [data-q]").forEach(function (b) {
      b.addEventListener("click", function () { document.getElementById("q").value = b.getAttribute("data-q"); answer(b.getAttribute("data-q")); });
    });
    wireNav();
  }

  // ================================================================
  // IMPACT SNAPSHOT + MEASUREMENT LAYER
  // ================================================================
  // Build the metric cards this account type should see.
  function roleMetricCards(role, x) {
    // With no account type chosen yet, fall back to the volunteer view.
    // Listing every metric would show both "Workshops delivered" and
    // "Workshops received" — the same number under two contradictory labels.
    var ids = (role && role.metrics) || ACCOUNT_TYPES[0].metrics;
    var programWide = (role && role.programWide) || [];
    return ids.map(function (id) {
      var def = IMPACT_METRICS[id];
      if (!def) return "";
      var raw = x[def.key];
      var val = (def.prefix || "") + raw + (def.suffix || "");
      var wide = programWide.indexOf(id) >= 0;
      return '<div class="card metric-card"><div class="m-num">' + esc(val) + "</div>" +
        '<div class="m-lab">' + esc(def.label) +
        (wide ? '<br><span class="pill-note" style="margin-top:6px;display:inline-block">program-wide total</span>' : "") +
        "</div></div>";
    }).join("");
  }

  function renderImpact() {
    var x = IMPACT_EXAMPLE;
    var local = Metrics.summary();
    var role = roleDef();
    var roleId = role ? role.id : "";
    var showVolunteerValue = roleId === "organization"; // organizations only
    var showProgramDetail = !!(role && role.showMeasurementLayer); // organizations
    // Value of donated volunteer time = hours x estimated hourly value.
    var volunteerValue = Math.round(x.volunteerHours * x.volunteerHourValue);
    var volunteerValueStr = "$" + volunteerValue.toLocaleString();
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Impact snapshot</div>' +
        '<div class="eyebrow">Impact snapshot &amp; measurement layer</div>' +
        "<h1>Simple, privacy-safe metrics a pilot could report</h1>" +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div class="example-flag" style="margin-bottom:22px">⚠️ <span><strong>Example / placeholder figures.</strong> ' +
          "Every number in this section is illustrative — a mock-up of what a pilot could measure. These are not real results.</span></div>" +
        // Metrics chosen by account type. Everything else on this page is
        // identical for every account type.
        '<div class="role-banner" style="margin-bottom:20px">' +
          "<span>" + (role ? role.emoji : "👤") + "</span>" +
          "<span>Showing the <strong>" + esc(role ? role.label : "general") + "</strong> view — " +
            (role ? role.metrics.length : 0) + " measures chosen for this audience.</span>" +
          '<button class="btn btn-ghost no-print" id="switchRole" style="margin-left:auto;padding:6px 10px">Switch view</button>' +
        "</div>" +
        '<div class="grid grid-4">' + roleMetricCards(role, x) + "</div>" +

        // Spotlight: money saved through the value of volunteer hours.
        // Shown to volunteers (it's their hours) and organizations (it's a
        // sponsor-facing figure); schools asked for neither.
        (showVolunteerValue ?
        '<div class="card mt-3" style="border-left:5px solid var(--amber);background:linear-gradient(120deg,#fff,var(--amber-soft))">' +
          '<div class="eyebrow">Value of volunteer time <span class="pill-note">example</span></div>' +
          '<div class="flex items-center wrap-flex" style="gap:16px">' +
            '<div class="m-num" style="font-size:2.8rem;color:#b5760f">' + volunteerValueStr + "</div>" +
            '<div><strong>saved through ' + x.volunteerHours + " donated volunteer hours</strong>" +
              '<div class="muted" style="font-size:.9rem">The workshops would have cost this much to deliver with paid staff — teen volunteers provide it for free.</div></div>' +
          "</div>" +
          '<p class="muted" style="font-size:.82rem;margin:10px 0 0">Estimated as ' + x.volunteerHours +
            " volunteer hours × ~$" + x.volunteerHourValue + '/hour (a common "value of volunteer time" figure). Illustrative placeholder.</p>' +
        "</div>" : "") +

        // Program-level detail: organizations only.
        (showProgramDetail ?
        '<div class="grid grid-2 mt-3">' +
          '<div class="card"><div class="eyebrow">Measurement layer <span class="pill-note">example</span></div>' +
            '<ul class="mc-meta" style="font-size:.95rem">' +
              metaRow("Volunteer hours", x.volunteerHours) +
              metaRow("Value of volunteer time", volunteerValueStr) +
              metaRow("Schools reached", x.schoolsReached) +
              metaRow("Teen Teach-In participation", x.teenTeachInParticipation + " volunteers") +
              metaRow("Workshop attendance", x.workshopAttendance + "%") +
            "</ul></div>" +
          '<div class="card"><div class="eyebrow">Top concepts learned <span class="pill-note">example</span></div>' +
            x.topConcepts.map(function (c) { return '<span class="badge" style="margin:0 6px 6px 0">🏅 ' + esc(c) + "</span>"; }).join("") +
            '<div class="eyebrow mt-3">Sponsor-visible outcomes</div><ul class="privacy-list">' +
            x.sponsorOutcomes.map(function (o) { return "<li><span class=\"ok\">★</span><span>" + esc(o) + "</span></li>"; }).join("") +
            "</ul></div>" +
        "</div>" : "") +

        // Live on-device panel (real, privacy-safe)
        '<div class="card mt-3" style="border-left:5px solid var(--teal)">' +
          '<div class="eyebrow">Live on this device <span class="badge gray">real · privacy-safe</span></div>' +
          (local.confidenceResponses || local.sessions
            ? "<p>From anonymous confidence taps recorded on <strong>this device only</strong>: " +
              "<strong>" + local.confidenceResponses + "</strong> response(s)" +
              (local.confidenceAvg ? ", average confidence <strong>" + local.confidenceAvg + "/5</strong>" : "") + "." +
              '</p><div class="flex gap wrap-flex no-print"><button class="btn btn-secondary" id="expBtn">⬇ Export summary</button>' +
              '<button class="btn btn-ghost" id="clrBtn">Clear this device\'s data</button></div>'
            : '<p class="muted mb-0">No on-device data yet. Try a module\'s confidence check (after the reveal) and it will show up here — ' +
              "stored only in this browser, never sent anywhere.</p>") +
        "</div>" +

        '<div class="callout mt-3"><div class="ico">🔒</div><div><strong>Privacy-safe by design.</strong> ' +
          "Real metrics are aggregate counts only — no names, no logins, no personal data, no tracking. Everything a " +
          "volunteer records stays on their own device unless they choose to copy a summary.</div></div>" +
      "</div></section>";

    var sw = document.getElementById("switchRole");
    if (sw) sw.addEventListener("click", function () { showRolePicker(true); });
    var exp = document.getElementById("expBtn");
    if (exp) exp.addEventListener("click", function () { download("money-ready-impact.txt", Metrics.textReport()); });
    var clr = document.getElementById("clrBtn");
    if (clr) clr.addEventListener("click", function () { Metrics.clearAll(); renderImpact(); });
    wireNav();
  }
  function metric(num, lab) {
    return '<div class="card metric-card"><div class="m-num">' + esc(num) + '</div><div class="m-lab">' + esc(lab) + "</div></div>";
  }

  // ================================================================
  // TAKE-HOME CARD (printable)
  // ================================================================
  function renderTakeHome(id) {
    var m = moduleById(id);
    if (!m) return renderNotFound();
    var t = m.takeHome;
    app.innerHTML =
      '<div class="wrap page-head no-print"><div class="breadcrumb"><a href="#/">Home</a> · ' +
        '<a href="#/module/' + m.id + '">' + esc(m.title) + "</a> · Take-home card</div>" +
        '<div class="flex items-center wrap-flex gap" style="justify-content:space-between">' +
          "<div><div class=\"eyebrow\">Take-home activity</div><h1 style=\"margin-bottom:0\">Fridge-friendly & printable</h1></div>" +
          '<button class="btn btn-primary" onclick="window.print()">🖨 Print this card</button>' +
        "</div>" +
        '<p class="muted mt-2">This should feel like a warm conversation starter — not homework.</p>' +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div class="takehome">' +
          '<div class="th-head"><div style="font-size:2.4rem">' + m.emoji + "</div>" +
            '<div class="th-title">' + esc(t.title) + "</div>" +
            '<div class="muted" style="font-size:.85rem">A Money Ready · Virginia moment · ' + esc(m.title) + "</div></div>" +
          '<div class="th-prompt">' + esc(t.prompt) + "</div>" +
          '<div class="th-boxes">' +
            t.boxes.map(function (b) { return '<div class="th-box"><div class="th-box-lab">' + esc(b) +
              '</div><div class="th-line"></div><div class="th-line"></div></div>'; }).join("") +
          "</div>" +
          '<div class="th-family"><div class="eyebrow">Talk about it together</div>' +
            '<div class="q">' + esc(t.familyQuestion) + "</div></div>" +
          '<div class="th-foot">Educational only · Privacy-safe · No personal information needed · ' +
            "A proposed Virginia Jump$tart pilot, pending review</div>" +
        "</div>" +
      "</div></section>";
    wireNav();
  }

  // ================================================================
  // OFFICIAL RESOURCES
  // Everything here points back to the official Jump$tart Teen Teach-In
  // resources page rather than copying their materials. Links go to that
  // page so the source of truth stays theirs.
  // ================================================================
  var TTI_URL = "https://www.jumpstart.org/awareness/check-your-school/teen-teach-in/resources/";

  // The official lessons, in grade order (the story lessons span Grades 1–4
  // and sort last).
  function officialModules() {
    return MODULES.filter(function (m) { return m.officialLesson; })
      .sort(function (a, b) {
        function gradeOf(m) {
          var match = /Grade (\d)/.exec(m.officialLesson || "");
          return match ? Number(match[1]) : 99;
        }
        return gradeOf(a) - gradeOf(b);
      });
  }

  function renderResources() {
    var core = officialModules();
    var partners = [
      { name: "Greenlight", what: "Money app and learning materials for families." },
      { name: "Take Charge Today", what: "Free classroom lesson plans and activities." },
      { name: "Sheila Bair's \"Money Tales\"", what: "Illustrated story series about money decisions." },
      { name: "EVERFI's \"Vault: Understanding Money\"", what: "Digital financial-literacy course for elementary students." },
      { name: "Banzai", what: "Interactive, real-life financial-literacy scenarios." },
    ];
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Official resources</div>' +
        '<div class="eyebrow">Official Teen Teach-In resources</div>' +
        "<h1>What this toolkit is built around</h1>" +
        '<p class="muted" style="max-width:66ch">The official Teen Teach-In sequence is written for <strong>elementary ' +
          "students in Grades 1–4</strong>, taught by teen volunteers. The modules below line up with those lessons. " +
          "This toolkit adds the interactive layer — it does not replace the official presentations, toolkits, and worksheets.</p>" +
        '<a class="btn btn-primary mt-2" href="' + TTI_URL + '" target="_blank" rel="noopener">Open the official resources page ↗</a>' +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<h2>The Grades 1–4 sequence</h2>' +
        '<p class="muted">Each official lesson comes with its own materials. Download those from the resources page above; ' +
          "the module here gives you the live challenge, reveal, discussion, and take-home card to go with it.</p>" +
        '<div class="grid module-grid mt-2">' +
          core.map(function (m, i) { return moduleCard(m, i + 1); }).join("") +
        "</div>" +
        '<h2 class="mt-4">Partner resources</h2>' +
        '<p class="muted">Additional programs listed on the official resources page.</p>' +
        '<ul class="packet-list mt-2">' +
          partners.map(function (p) {
            return '<li class="packet-item"><div class="ico">🔗</div><div class="txt"><strong>' +
              esc(p.name) + "</strong><span>" + esc(p.what) + "</span></div></li>";
          }).join("") +
        "</ul>" +
        '<div class="callout mt-3"><div class="ico">📌</div><div><strong>Where this toolkit fits.</strong> ' +
          "The official materials are the curriculum. This prototype is the delivery layer on top of them — turning each " +
          "lesson into a live challenge students vote on, with a reveal, discussion prompt, and a take-home card. " +
          "Nothing here replaces or reproduces the official presentations, toolkits, or worksheets, and all of it is " +
          "pending review and approval.</div></div>" +
        '<div class="grid grid-2 mt-3">' +
          '<div class="card"><div class="eyebrow">Extended library</div>' +
            "<p>Beyond the official Grades 1–4 sequence, this toolkit includes " + (MODULES.length - core.length) +
            " more modules covering budgeting, credit, paychecks, scams, banking, college costs, and investing for older students.</p>" +
            '<a class="btn btn-secondary" href="#/modules">See all ' + MODULES.length + " modules →</a></div>" +
          '<div class="card"><div class="eyebrow">Run it without screens</div>' +
            "<p>Ten of the twelve games in this toolkit need no devices at all — useful for elementary classrooms, " +
            "libraries, and anywhere the wifi can't be trusted.</p>" +
            '<a class="btn btn-secondary" href="#/games?devices=none">Unplugged games →</a></div>' +
        "</div>" +
      "</div></section>";
    wireNav();
  }

  // ================================================================
  // GAMES LIBRARY
  // ================================================================
  function renderGames(query) {
    var filter = (query && query.devices) || "all";
    function matches(g) {
      if (filter === "all") return true;
      if (filter === "none") return g.devices === "none";
      return g.devices !== "none";
    }
    var shown = GAME_FORMATS.filter(matches);
    var noDeviceCount = GAME_FORMATS.filter(function (g) { return g.devices === "none"; }).length;

    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Games</div>' +
        '<div class="eyebrow">Game library</div>' +
        "<h1>Games students play — with or without devices</h1>" +
        '<p class="muted" style="max-width:66ch"><strong>' + noDeviceCount + " of these " + GAME_FORMATS.length +
          " games need no technology at all</strong> — just you, the students, and maybe some paper. " +
          "The rest use one shared screen at the front of the room. Both kinds are here on purpose: young classrooms " +
          "rarely have student devices, but a projector is often available. " +
          "Every game works with any module — you plug in that topic's items, scenario, or vocabulary.</p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div class="filter-row">' +
          gameFilterBtn("all", "All games", filter) +
          gameFilterBtn("none", "🙌 No devices needed", filter) +
          gameFilterBtn("screen", "📺 Uses a screen", filter) +
        "</div>" +
        '<div class="grid game-grid">' +
          shown.map(gameCard).join("") +
        "</div>" +
        '<div class="callout mt-3"><div class="ico">💡</div><div><strong>Why unplugged games matter.</strong> ' +
          "Not every classroom, library, or after-school room has working screens or reliable wifi — and younger students " +
          "often engage more when they're moving and talking. A workshop should never depend on technology to succeed.</div></div>" +
      "</div></section>";
    wireNav();
  }
  function gameFilterBtn(val, label, current) {
    return '<a class="btn ' + (current === val ? "btn-primary" : "btn-secondary") +
      '" href="#/games?devices=' + val + '">' + esc(label) + "</a>";
  }
  function gameCard(g) {
    var devLabel = g.devices === "none" ? "No devices needed"
      : g.devices === "shared" ? "One shared screen" : "Own device";
    return '<div class="card game-card dev-' + g.devices + '">' +
      '<div class="g-top"><span class="g-emoji">' + g.emoji + "</span><h3 style=\"margin:0\">" + esc(g.name) + "</h3></div>" +
      '<p class="muted mb-0" style="font-size:.92rem">' + esc(g.summary) + "</p>" +
      '<div class="game-meta">' +
        '<span class="badge ' + (g.devices === "none" ? "no-device-badge" : "gray") + '">' +
          (g.devices === "none" ? "🙌 " : "📺 ") + esc(devLabel) + "</span>" +
        '<span class="badge gray">⏱ ' + g.minutes + " min</span>" +
        '<span class="badge gray">' + esc(g.group) + "</span>" +
        '<span class="badge gray">Energy: ' + esc(g.energy) + "</span>" +
      "</div>" +
      '<div class="mt-2"><strong style="font-size:.88rem">Materials:</strong> ' +
        '<span class="muted" style="font-size:.88rem">' + esc(g.materials.join(", ")) + "</span></div>" +
      '<details class="mt-2"><summary style="cursor:pointer;font-weight:700;font-size:.9rem">How to play</summary>' +
        '<ol class="numbered mt-1">' + g.howToPlay.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        '<div class="script-box" style="font-size:.9rem;margin-top:10px"><strong>Teen tip:</strong> ' + esc(g.teenTip) + "</div>" +
      "</details>" +
    "</div>";
  }

  // ================================================================
  // LESSON GENERATOR
  // ================================================================
  function renderGenerator() {
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Lesson generator</div>' +
        '<div class="eyebrow">Lesson generator</div>' +
        "<h1>Build a lesson that fits your room</h1>" +
        '<p class="muted" style="max-width:64ch">Tell it your topic, age group, how long you have, and what technology is ' +
          "actually available — it writes a timed plan with matching games. Choose <em>no devices</em> and every activity " +
          "works with nothing but paper and people.</p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div class="card"><div class="grid grid-2">' +
          '<div class="field"><label for="gTopic">Topic</label><select id="gTopic">' +
            MODULES.map(function (m) { return '<option value="' + m.id + '">' + m.emoji + " " + esc(m.title) + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label for="gGrade">Age group</label><select id="gGrade">' +
            ["Grades K–2", "Grades 3–5", "Grades 6–8", "Grades 9–12"].map(function (g) { return "<option>" + g + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label for="gMin">How long do you have?</label><select id="gMin">' +
            ["15", "20", "30", "40", "45", "60"].map(function (n) {
              return '<option value="' + n + '"' + (n === "30" ? " selected" : "") + ">" + n + " minutes</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label for="gGroup">Group size</label><select id="gGroup">' +
            ["Whole class", "Small groups", "Pairs", "One-on-one"].map(function (g) { return "<option>" + g + "</option>"; }).join("") +
          "</select></div>" +
        "</div>" +
        '<div class="field"><label>What technology is available?</label><div class="chips-select" id="gDev">' +
          '<button class="chip-toggle on" data-dev="none">🙌 No devices at all</button>' +
          '<button class="chip-toggle" data-dev="shared">📺 One shared screen</button>' +
          '<button class="chip-toggle" data-dev="personal">📱 Students have devices</button>' +
        "</div></div>" +
        '<button class="btn btn-primary" id="genLesson">✨ Generate lesson plan</button></div>' +
        '<div id="planOut" class="mt-3"></div>' +
      "</div></section>";

    var dev = "none";
    document.getElementById("gDev").querySelectorAll(".chip-toggle").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll("#gDev .chip-toggle").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        dev = b.getAttribute("data-dev");
      });
    });
    document.getElementById("genLesson").addEventListener("click", function () {
      var plan = buildLessonPlan(document.getElementById("gTopic").value, {
        minutes: Number(document.getElementById("gMin").value),
        grade: document.getElementById("gGrade").value,
        groupSize: document.getElementById("gGroup").value,
        devices: dev,
      });
      renderPlan(plan);
    });
    wireNav();
  }

  function renderPlan(plan) {
    if (!plan) return;
    var m = plan.module;
    var out = document.getElementById("planOut");
    var devLabel = plan.devices === "none" ? "🙌 No devices needed"
      : plan.devices === "shared" ? "📺 One shared screen" : "📱 Students have devices";
    out.innerHTML =
      '<div class="card">' +
        '<div class="flex items-center wrap-flex" style="justify-content:space-between;gap:12px">' +
          "<div><div class=\"eyebrow\">Your lesson plan</div>" +
            '<h2 style="margin-bottom:6px">' + m.emoji + " " + esc(m.title) + "</h2>" +
            '<div class="badge-row">' +
              '<span class="badge">' + esc(plan.grade) + "</span>" +
              '<span class="badge gray">⏱ ' + plan.totalMinutes + " min total</span>" +
              '<span class="badge ' + (plan.devices === "none" ? "no-device-badge" : "blue") + '">' + devLabel + "</span>" +
              '<span class="badge gray">' + esc(plan.groupSize) + "</span>" +
            "</div></div>" +
          '<button class="btn btn-secondary no-print" onclick="window.print()">🖨 Print plan</button>' +
        "</div>" +
        '<div class="card mt-3" style="border-left:5px solid var(--green);box-shadow:none">' +
          "<strong>Learning objective:</strong> " + esc(m.objective) + "</div>" +
        '<div class="eyebrow mt-3">Run of show</div>' +
        plan.steps.map(function (s) {
          return '<div class="plan-step"><div class="plan-time">' + s.minutes + " min</div>" +
            "<div><h4>" + esc(s.name) + "</h4><p>" + esc(s.what) + "</p>" +
            (s.script ? '<div class="script-box mt-1" style="font-size:.9rem">' + esc(s.script) + "</div>" : "") +
            "</div></div>";
        }).join("") +
        '<div class="grid grid-2 mt-3">' +
          '<div class="card" style="box-shadow:none"><div class="eyebrow">Materials to bring</div><ul class="privacy-list">' +
            plan.materials.map(function (mm) { return '<li><span class="ok">□</span><span>' + esc(mm) + "</span></li>"; }).join("") +
          "</ul></div>" +
          '<div class="card" style="box-shadow:none"><div class="eyebrow">Questions students actually ask</div>' +
            ((plan.pack.commonQuestions || []).map(function (q) {
              return '<div class="vocab-item"><strong>' + esc(q.q) + "</strong><br><span class=\"muted\" style=\"font-size:.9rem\">" + esc(q.a) + "</span></div>";
            }).join("") || '<p class="muted mb-0">—</p>') +
          "</div>" +
        "</div>" +
        '<div class="flex gap wrap-flex mt-3 no-print">' +
          '<a class="btn btn-primary" href="#/take-home/' + m.id + '">Take-home card</a>' +
          '<a class="btn btn-secondary" href="#/games?devices=' + (plan.devices === "none" ? "none" : "all") + '">Browse games</a>' +
          '<a class="btn btn-ghost" href="#/prep?topic=' + m.id + '">Full volunteer prep</a>' +
        "</div>" +
      "</div>";
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderNotFound() {
    app.innerHTML = '<section class="section"><div class="wrap center">' +
      "<h1>Page not found</h1><p class=\"muted\">That link doesn't match a screen.</p>" +
      '<a class="btn btn-primary" href="#/">Back to home</a></div></section>';
    wireNav();
  }

  // ---------- nav wiring ----------
  function wireNav() {
    // footer badges + disclaimer (once)
    var fb = document.getElementById("footerBadges");
    if (fb && !fb.childNodes.length) {
      fb.innerHTML = STATUS_BADGES.map(function (b) { return '<span class="badge">' + esc(b) + "</span>"; }).join("");
    }
    var fd = document.getElementById("footerDisclaimer");
    if (fd) {
      fd.textContent = "Money Ready Virginia Interactive Toolkit is a student-led prototype and concept for discussion. " +
        "It is educational only, is not financial advice, and is designed to support — pending review and approval — " +
        "Virginia Jump$tart's Teen Teach-In–style workshops. All impact figures shown as examples are placeholders. " +
        "No personal data is collected. © " + new Date().getFullYear() + " · Built by a student volunteer.";
    }
    // active nav link
    var route = (location.hash || "#/").split("?")[0].replace("#/", "").split("/")[0];
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-route") === route);
    });
    // close mobile menu
    var nl = document.getElementById("navLinks");
    if (nl) nl.classList.remove("open");
    // keep the header account chip current
    updateRoleChip();
    // Hide the Resources link on builds with no official lessons tagged.
    var resLink = document.querySelector('.nav-links a[data-route="resources"]');
    if (resLink) resLink.style.display = officialModules().length ? "" : "none";
  }

  // ---------- router ----------
  function parseQuery(qs) {
    var out = {};
    (qs || "").split("&").forEach(function (p) {
      if (!p) return;
      var kv = p.split("=");
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
    });
    return out;
  }
  function route() {
    clearTimers();
    window.scrollTo(0, 0);
    var raw = (location.hash || "#/").slice(1); // remove '#'
    var parts = raw.split("?");
    var path = parts[0].replace(/^\//, "");
    var query = parseQuery(parts[1]);
    var seg = path.split("/");

    switch (seg[0]) {
      case "": return renderHome();
      case "modules": return renderModules();
      // Only present when modules are tagged with official lessons.
      case "resources": return officialModules().length ? renderResources() : renderNotFound();
      case "games": return renderGames(query);
      case "generator": return renderGenerator();
      case "module": return renderModule(seg[1]);
      case "challenge": return renderChallenge(seg[1], query.practice === "1");
      case "facilitator": return renderFacilitator();
      case "prep": return renderPrep(query);
      case "builder": return renderBuilder();
      case "portal": return renderPortal();
      case "helper": return renderHelper();
      case "impact": return renderImpact();
      case "take-home": return renderTakeHome(seg[1]);
      default: return renderNotFound();
    }
  }

  // Mobile menu toggle
  document.getElementById("navToggle").addEventListener("click", function () {
    document.getElementById("navLinks").classList.toggle("open");
  });
  // Account type chip in the header
  var chipBtn = document.getElementById("roleChip");
  if (chipBtn) chipBtn.addEventListener("click", function () { showRolePicker(true); });

  // First visit: ask who's using the toolkit before anything else.
  function start() {
    route();
    showRolePicker(false);
  }
  window.addEventListener("hashchange", route);
  window.addEventListener("DOMContentLoaded", start);
  // In case DOMContentLoaded already fired
  if (document.readyState !== "loading") start();
})();
