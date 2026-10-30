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
    if (document.getElementById("roleOverlay")) return;
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
    // The page reads top to bottom as: where do I go (hero chart), how a
    // workshop works, every page explained, why it works, and the pilot
    // plan for organizers. The lessons themselves live on the Modules page.
    app.innerHTML =
      // Hero: what this is, and the "what do you want to do?" chart
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
          '<p class="muted" style="font-size:.85rem">Educational only · Privacy-safe by design · ' +
            "Pending review and approval by Virginia Jump$tart</p>" +
        "</div>" +
        '<div class="hero-art">' + pathChart() + "</div>" +
      "</div></section>" +

      // How a workshop works
      '<section class="section" style="background:var(--white);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">' +
        '<div class="center" style="margin-bottom:34px"><div class="eyebrow">How it works</div>' +
          "<h2>Every workshop follows the same four steps</h2></div>" +
        '<div class="steps">' +
          howStep(1, "Pick a module", elementary ? "Choose the official Grade 1–4 lesson you're teaching, or any module from the wider library." : "Choose a topic and grade band from the library of ready-made workshops.") +
          howStep(2, "Run the challenge", "Students face a real-life money scenario and vote — on a shared screen, or by walking to a corner of the room.") +
          howStep(3, "Reveal & discuss", "Show the best answer, the key concept, and the common trap, then talk it through.") +
          howStep(4, "Take it home", "Students leave with a fridge-friendly card that keeps the money talk going with family.") +
        "</div>" +
      "</div></section>" +

      // Every page, explained
      '<section class="section" style="background:var(--cream-2)"><div class="wrap">' +
        '<div class="center" style="margin-bottom:30px"><div class="eyebrow">Every page, explained</div>' +
          "<h2>Still not sure where to click?</h2>" +
          '<p class="muted" style="max-width:56ch;margin:0 auto">Find what you\'re trying to do, and go straight there.</p></div>' +
        '<div class="grid grid-2">' +
          navGuide("🛠️", "Workshop Builder", "#/builder",
            "I'm teaching a workshop and need to prepare",
            "Start here. Answer four questions and get a timed lesson plan plus the whole packet — parent letter, checklist, deck outline, everything.") +
          navGuide("📚", "Modules", "#/modules",
            "I want to see what topics are available",
            "Browse every ready-made workshop. Each shows the grade band, how long it takes, and what's included.") +
          navGuide("💪", "Volunteer Prep", "#/prep",
            "I'm nervous and want to practice first",
            "Opening scripts to say out loud, key vocabulary, timed steps, and a practice mode to rehearse before the real thing.") +
          navGuide("🎲", "Games", "#/games",
            "I need an activity, and there may be no screens",
            GAME_FORMATS.length + " games you can drop into any topic. " + unpluggedGames() + " of them need no technology at all.") +
          navGuide("🎤", "Facilitator", "#/facilitator",
            "The workshop is happening right now",
            "Your live dashboard during the session — current step, class results, discussion prompts, and the exit-ticket summary.") +
          navGuide("📊", "Impact", "#/impact",
            "I need numbers to share with someone",
            "Privacy-safe metrics you can report. What you see depends on whether you're a volunteer, a school, or an organization.") +
        "</div>" +
        '<p class="center muted mt-3" style="font-size:.88rem">Also here: ' +
          '<a href="#/helper">Standards Helper</a> for quick answers to financial-literacy questions.</p>' +
      "</div></section>" +

      // Why it works
      '<section class="section"><div class="wrap">' +
        '<div class="center" style="max-width:680px;margin:0 auto 36px">' +
          '<div class="eyebrow">Why it works</div>' +
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
          feature("blue", "🙌", "No screens needed", unpluggedGames() + " of our " + GAME_FORMATS.length + " games run with just movement, cards, and conversation. A workshop should never fail because the wifi did.") +
        "</div>" +
        '<div class="callout mt-3">' +
          '<div class="ico">🔒</div>' +
          "<div><h3 style=\"margin-bottom:8px\">Privacy-safe by design</h3>" +
            '<p class="mb-0 muted">This prototype is built to protect students from the ground up. ' +
              "It collects <strong>no names, no logins, and no personal data</strong>. Impact numbers are " +
              "aggregate counts only, and there is no backend server — nothing to leak.</p>" +
            '<a class="btn btn-ghost" style="padding-left:0" href="#/impact">See how impact is measured →</a>' +
          "</div>" +
        "</div>" +
      "</div></section>" +

      // Status, then the pilot plan for organizers
      badgeStrip() +
      '<section class="section" style="background:var(--white)"><div class="wrap">' +
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
      "</div></section>";
    // Picking a path in the chart also sets the role, so the Impact page
    // already matches. The link itself does the navigating.
    app.querySelectorAll(".path-chart [data-role]").forEach(function (a) {
      a.addEventListener("click", function () { setRole(a.getAttribute("data-role")); });
    });
    wireNav();
  }

  // "What do you want to do?" — one row per role in the role picker. Each
  // row has one main button that says what happens next, plus smaller
  // links. Top-down chart on desktop, stacked cards on phones.
  var PATHS = [
    { role: "volunteer", want: "I'm teaching a lesson",
      main: ["🛠️", "Build my lesson plan", "#/builder"],
      more: [["📚", "Browse the lessons", "#/modules"], ["💪", "Practice first", "#/prep"]] },
    { role: "school", want: "I want a workshop for my class",
      main: ["🛠️", "Plan a class workshop", "#/builder"],
      more: [["📚", "See the topics", "#/modules"]] },
    { role: "organization", want: "I run the program",
      main: ["📊", "See impact numbers", "#/impact"],
      more: [] },
  ];
  function pathChart() {
    var current = getRole();
    function link(l, role, cls) {
      return '<a class="' + cls + '" href="' + l[2] + '" data-role="' + role + '">' +
        '<span aria-hidden="true">' + l[0] + "</span> " + esc(l[1]) + " →</a>";
    }
    return '<nav class="path-chart" aria-label="What do you want to do?">' +
      '<div class="path-start"><span class="path-eyebrow">Start here</span>' +
        "<strong>What do you want to do?</strong></div>" +
      '<ol class="path-list">' +
        PATHS.map(function (p) {
          var r = roleDef(p.role);
          return '<li class="path-row' + (p.role === current ? " on" : "") + '">' +
            '<div class="path-who"><span class="emoji-badge" aria-hidden="true">' + (r ? r.emoji : "👤") + "</span>" +
              "<span><span class=\"path-role\">" + esc(r ? r.label : "") + "</span>" +
              "<strong>" + esc(p.want) + "</strong></span></div>" +
            '<div class="path-go">' + link(p.main, p.role, "path-main") +
              (p.more.length
                ? '<span class="path-more">or ' + p.more.map(function (l) { return link(l, p.role, "path-link"); }).join(" · ") + "</span>"
                : "") +
            "</div></li>";
        }).join("") +
      "</ol>" +
      '<div class="path-quick">' +
        '<a href="#/facilitator">🎤 Workshop happening right now?</a>' +
        '<a href="#/games">🎲 Just need a game?</a>' +
      "</div></nav>";
  }
  function feature(color, ico, t, body) {
    return '<div class="card feature ' + color + '"><div class="ico">' + ico + "</div>" +
      "<h3>" + esc(t) + "</h3><p class=\"muted mb-0\">" + esc(body) + "</p></div>";
  }
  function howStep(n, t, body) {
    return '<div class="step"><div class="num">' + n + "</div><h3>" + esc(t) +
      '</h3><p class="muted mb-0">' + esc(body) + "</p></div>";
  }
  // A card on the landing page that answers "which tab do I click?"
  function unpluggedGames() {
    return GAME_FORMATS.filter(function (g) { return g.devices === "none"; }).length;
  }
  function navGuide(ico, tab, href, want, does) {
    return '<a class="card" href="' + href + '" style="text-decoration:none;color:inherit;display:flex;gap:14px;align-items:flex-start">' +
      '<span style="font-size:1.8rem;flex:none">' + ico + "</span>" +
      "<span><strong style=\"display:block;font-size:1.05rem\">" + esc(want) + "</strong>" +
      '<span class="badge" style="margin:6px 0 8px">Go to ' + esc(tab) + " →</span>" +
      '<span class="muted" style="display:block;font-size:.9rem">' + esc(does) + "</span></span></a>";
  }
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
        (m.extraTopic && plan.topicGame
          ? '<div class="callout mt-3"><div class="ico">🏛️</div><div><strong>Not a Jump$tart module.</strong> ' +
            "Every fact in this workshop's game comes from a trusted U.S. government consumer-education source: " +
            esc(plan.topicGame.sources.map(function (x) { return x.name + " (" + x.url + ")"; }).join("; ")) + ".</div></div>"
          : "") +
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
  // STANDARDS-GROUNDED HELPER (retrieval only)
  // ================================================================
  function renderHelper() {
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Standards helper</div>' +
        '<div class="eyebrow">Standards-grounded helper</div>' +
        "<h1>Quick answers — always with a source</h1>" +
        '<p class="muted" style="max-width:66ch">Ask a financial-literacy question and this helper looks up a plain-English ' +
          "answer from Jump$tart resources, or from trusted U.S. government consumer-education sources (such as CFPB, FDIC, FTC, SEC, IRS, and " +
          "Federal Student Aid) for questions Jump$tart doesn't cover. Every answer shows its source underneath. " +
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
          "Every answer is written ahead of time from Jump$tart materials or a named government source — nothing is made up on the spot. " +
          "If it doesn't have a grounded answer, it says so and points you to a trusted adult rather than guessing.</div></div>" +
      "</div></section>";

    // ---- Matching -------------------------------------------------------
    // A question matches an entry only through the entry's topic `tags`.
    // Both sides are turned into word lists (lowercase, punctuation dropped,
    // plurals folded: "taxes" -> "tax", "needs" -> "need"), and a tag counts
    // only as whole words in a row. When tags overlap in the question, the
    // longer phrase wins and the shorter one is ignored, so "deposit
    // insurance" never also counts as "insurance" and "credit card" never
    // also counts as "credit". Entries with nothing left get no answer.
    function stem(w) {
      if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + "y";
      if (/(ss|x|ch|sh)es$/.test(w)) return w.slice(0, -2);
      if (w.length > 3 && /s$/.test(w) && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
      return w;
    }
    function words(text) {
      var t = text.toLowerCase()
        .replace(/401\s*\(?k\)?/g, "401k").replace(/403\s*\(?b\)?/g, "403b")
        .replace(/['\u2019]s\b/g, "").replace(/['\u2019]/g, "")
        .replace(/[^a-z0-9]+/g, " ").trim();
      return t ? t.split(" ").map(stem) : [];
    }
    // Words too common to say what a question is about; only used to break
    // ties between entries that matched the same tags.
    var STOP = ["what", "when", "where", "which", "while", "should", "would", "could", "about",
      "does", "difference", "between", "there", "their", "they", "this", "that", "with", "have",
      "your", "from", "work", "like", "much", "many", "some", "good", "best", "people", "really", "know"];
    var TAG_WORDS = FAQ_KNOWLEDGE.map(function (f) { return f.tags.map(words); });
    var Q_WORDS = FAQ_KNOWLEDGE.map(function (f) { return words(f.q); });

    function search(query) {
      var qw = words(query), matches = [];
      TAG_WORDS.forEach(function (tags, e) {
        tags.forEach(function (tw) {
          for (var i = 0; i + tw.length <= qw.length; i++) {
            var hit = tw.length > 0;
            for (var k = 0; k < tw.length && hit; k++) hit = qw[i + k] === tw[k];
            if (hit) matches.push({ e: e, start: i, end: i + tw.length });
          }
        });
      });
      // Drop a match when a longer match (from any entry) covers it.
      var kept = matches.filter(function (m) {
        return !matches.some(function (n) {
          return n.end - n.start > m.end - m.start && n.start <= m.start && n.end >= m.end;
        });
      });
      var byEntry = {};
      kept.forEach(function (m) {
        var b = byEntry[m.e] || (byEntry[m.e] = { covered: {}, tags: 0 });
        for (var i = m.start; i < m.end; i++) b.covered[i] = true;
        b.tags += 1;
      });
      var scored = Object.keys(byEntry).map(function (e) {
        var b = byEntry[e], score = Object.keys(b.covered).length * 10 + b.tags;
        Q_WORDS[e].forEach(function (w) {
          if (w.length > 3 && STOP.indexOf(w) < 0 && qw.indexOf(w) >= 0) score += 1;
        });
        return { f: FAQ_KNOWLEDGE[e], score: score, order: +e };
      });
      // Highest score first; on a tie, Jump$tart entries (listed first) win.
      scored.sort(function (a, b) { return b.score - a.score || a.order - b.order; });
      return scored;
    }
    function sourceLine(f) {
      if (f.tier === "trusted") {
        return '<div class="helper-source">🏛️ <span>Source: ' + esc(f.source) + " · " + esc(f.url) + "</span></div>" +
          '<p class="muted" style="font-size:.82rem;margin:4px 0 0">Jump$tart materials don\'t cover this question, ' +
          "so this answer comes from a trusted U.S. government consumer-education source.</p>";
      }
      return '<div class="helper-source">📚 <span>Source: ' + esc(f.source) + "</span></div>";
    }
    function answer(query) {
      var results = search(query);
      var out = document.getElementById("ans");
      if (!results.length) {
        out.innerHTML = '<div class="card"><h3>🤔 I don\'t have a grounded answer for that yet</h3>' +
          '<p class="muted">To stay safe, this helper only answers from its approved example resources — it won\'t guess. ' +
          "Try one of the suggested questions above, or ask a teacher or trusted adult. For money questions, " +
          "consumerfinance.gov (CFPB) is a good trusted place to look together.</p></div>";
        return;
      }
      var top = results[0].f;
      out.innerHTML =
        '<div class="card"><div class="eyebrow">Answer</div><h3>' + esc(top.q) + "</h3>" +
          '<div class="helper-answer">' + esc(top.a) + "</div>" +
          sourceLine(top) +
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
            "<p>" + unpluggedGames() + " of the " + GAME_FORMATS.length + " games in this toolkit need no devices at all — useful for elementary classrooms, " +
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
    var topic = query && moduleById(query.topic) ? query.topic : "";
    function matches(g) {
      if (topic && !gameTopics(g).some(function (m) { return m.id === topic; })) return false;
      if (filter === "all") return true;
      if (filter === "none") return g.devices === "none";
      return g.devices !== "none";
    }
    var shown = GAME_FORMATS.filter(matches);
    var noDeviceCount = unpluggedGames();
    var deepCount = GAME_FORMATS.filter(function (g) { return g.multiRound; }).length;

    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Games</div>' +
        '<div class="eyebrow">Game library</div>' +
        "<h1>Games students play — with or without devices</h1>" +
        '<p class="muted" style="max-width:66ch"><strong>' + noDeviceCount + " of these " + GAME_FORMATS.length +
          " games need no technology at all</strong> — just you, the students, and maybe some paper. " +
          "The rest use one shared screen at the front of the room. Both kinds are here on purpose: young classrooms " +
          "rarely have student devices, but a projector is often available.</p>" +
        '<p class="muted" style="max-width:66ch">The quick games work with any module — you plug in that topic\'s items, scenario, or vocabulary. ' +
          "The " + deepCount + " <strong>multi-round games</strong> go deeper: students live with the results of their choices over several rounds. " +
          "Every game has a version for each age group, sample cards, questions to close with, and a printable game sheet.</p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div class="filter-row">' +
          gameFilterBtn("all", "All games", filter, topic) +
          gameFilterBtn("none", "🙌 No devices needed", filter, topic) +
          gameFilterBtn("screen", "📺 Uses a screen", filter, topic) +
          '<label class="game-topic-filter"><span>Topic</span><select id="gameTopic">' +
            '<option value="">Any topic</option>' +
            MODULES.map(function (m) {
              return '<option value="' + m.id + '"' + (m.id === topic ? " selected" : "") + ">" + m.emoji + " " + esc(m.title) + "</option>";
            }).join("") +
          "</select></label>" +
        "</div>" +
        (shown.length
          ? '<div class="grid game-grid">' + shown.map(function (g) { return gameCard(g, topic); }).join("") + "</div>"
          : '<p class="muted">No games match both filters. Try "All games".</p>') +
        '<div class="callout mt-3"><div class="ico">💡</div><div><strong>Why unplugged games matter.</strong> ' +
          "Not every classroom, library, or after-school room has working screens or reliable wifi — and younger students " +
          "often engage more when they're moving and talking. A workshop should never depend on technology to succeed.</div></div>" +
      "</div></section>";
    document.getElementById("gameTopic").addEventListener("change", function () {
      location.hash = "#/games?devices=" + filter + (this.value ? "&topic=" + this.value : "");
    });
    app.querySelectorAll("[data-sheet]").forEach(function (b) {
      b.addEventListener("click", function () {
        var g = GAME_FORMATS.filter(function (x) { return x.id === b.getAttribute("data-sheet"); })[0];
        if (g) download("money-ready-game-" + g.id + ".txt", gameToText(g));
      });
    });
    wireNav();
  }
  function gameFilterBtn(val, label, current, topic) {
    return '<a class="btn ' + (current === val ? "btn-primary" : "btn-secondary") +
      '" href="#/games?devices=' + val + (topic ? "&topic=" + topic : "") + '">' + esc(label) + "</a>";
  }
  // An array, not an object: number-like keys ("35") would sort before "k2".
  var LEVEL_NAMES = [["k2", "Grades K–2"], ["35", "Grades 3–5"], ["68", "Grades 6–8"], ["912", "Grades 9–12"]];
  function gameCard(g, topic) {
    var devLabel = g.devices === "none" ? "No devices needed"
      : g.devices === "shared" ? "One shared screen" : "Own device";
    var topics = gameTopics(g);
    // Open the builder on this game, for the filtered topic or its first fit.
    var planTopic = topic || (topics[0] && topics[0].id);
    var planHref = planTopic
      ? "#/builder?topic=" + planTopic + "&game=" + g.id + "&dev=" + (g.devices === "none" ? "none" : g.devices) +
        "&min=" + (g.minutes > 15 ? "45" : "30")
      : "";
    return '<div class="card game-card dev-' + g.devices + '">' +
      '<div class="g-top"><span class="g-emoji">' + g.emoji + "</span><h3 style=\"margin:0\">" + esc(g.name) + "</h3></div>" +
      '<p class="muted mb-0" style="font-size:.92rem">' + esc(g.summary) + "</p>" +
      '<div class="game-meta">' +
        '<span class="badge ' + (g.devices === "none" ? "no-device-badge" : "gray") + '">' +
          (g.devices === "none" ? "🙌 " : "📺 ") + esc(devLabel) + "</span>" +
        '<span class="badge gray">⏱ ' + g.minutes + " min</span>" +
        '<span class="badge gray">' + esc(g.group) + "</span>" +
        '<span class="badge gray">Energy: ' + esc(g.energy) + "</span>" +
        (g.multiRound ? '<span class="badge amber">🔁 Multi-round</span>' : "") +
      "</div>" +
      (g.reinforces ? '<p style="font-size:.9rem;margin:0"><strong>Reinforces:</strong> ' + esc(g.reinforces) + "</p>" : "") +
      (topics.length
        ? '<div class="game-topics"><strong style="font-size:.88rem">Fits:</strong> ' + topics.map(function (m) {
            return '<a class="chip" href="#/module/' + m.id + '">' + m.emoji + " " + esc(m.title) + "</a>"; }).join("") + "</div>"
        : "") +
      '<div><strong style="font-size:.88rem">Materials:</strong> ' +
        '<span class="muted" style="font-size:.88rem">' + esc(g.materials.join(", ")) + "</span></div>" +
      '<details><summary style="cursor:pointer;font-weight:700;font-size:.9rem">How to play</summary>' +
        '<ol class="numbered mt-1">' + g.howToPlay.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        '<div class="script-box" style="font-size:.9rem;margin-top:10px"><strong>Teen tip:</strong> ' + esc(g.teenTip) + "</div>" +
      "</details>" +
      (g.levels
        ? '<details><summary style="cursor:pointer;font-weight:700;font-size:.9rem">Make it fit your age group</summary>' +
            '<dl class="game-levels">' + LEVEL_NAMES.filter(function (l) { return g.levels[l[0]]; }).map(function (l) {
              return "<dt>" + l[1] + "</dt><dd>" + esc(g.levels[l[0]]) + "</dd>"; }).join("") + "</dl>" +
          "</details>"
        : "") +
      (g.cards
        ? '<details><summary style="cursor:pointer;font-weight:700;font-size:.9rem">' + esc(g.cards.title) + "</summary>" +
            '<ol class="numbered mt-1" style="font-size:.9rem">' + g.cards.items.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ol>" +
          "</details>"
        : "") +
      (g.debrief || g.access
        ? '<details><summary style="cursor:pointer;font-weight:700;font-size:.9rem">Debrief and access</summary>' +
            (g.debrief ? '<ul class="privacy-list mt-1">' + g.debrief.map(function (q) {
              return '<li><span class="ok">💬</span><span>' + esc(q) + "</span></li>"; }).join("") + "</ul>" : "") +
            (g.access ? '<p class="muted" style="font-size:.9rem;margin:8px 0 0"><strong>Everyone can play:</strong> ' + esc(g.access) + "</p>" : "") +
          "</details>"
        : "") +
      '<div class="game-actions">' +
        (g.play && PLAY_ENGINES[g.play.engine] ? '<a class="btn btn-primary" href="#/play/' + g.id + '">▶ Play on screen</a>' : "") +
        (planHref ? '<a class="btn btn-secondary" href="' + planHref + '">🛠️ Plan a workshop with it</a>' : "") +
        '<button class="btn btn-ghost" data-sheet="' + g.id + '">⬇ Download game sheet</button>' +
      "</div>" +
    "</div>";
  }

  // On-screen games (engines in play.js). Content comes from GAME_FORMATS.
  function renderPlay(id) {
    var g = GAME_FORMATS.filter(function (x) { return x.id === id; })[0];
    if (!g || !g.play || !PLAY_ENGINES[g.play.engine]) return renderNotFound();
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · <a href="#/games">Games</a> · ' + esc(g.name) + "</div>" +
        '<div class="eyebrow">' + g.emoji + " Play on screen</div>" +
        "<h1>" + esc(g.name.replace(/ \(on screen\)$/, "")) + "</h1>" +
        '<p class="muted" style="max-width:66ch">' + esc(g.summary) + "</p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div id="playRoot" class="play-root"></div>' +
        '<p class="muted center mt-3" style="font-size:.88rem">🔒 Nothing is saved or sent anywhere — the game runs only on this screen.</p>' +
      "</div></section>";
    PLAY_ENGINES[g.play.engine](document.getElementById("playRoot"), g);
    wireNav();
  }

  // ================================================================
  // LESSON GENERATOR
  // ================================================================
  // ================================================================
  // WORKSHOP BUILDER
  // One page that produces both the timed lesson plan AND the full
  // packet (deck outline, parent letter, checklist, and the rest).
  // Replaces the separate lesson generator and toolkit builder.
  // ================================================================
  function renderBuilderCombined(query) {
    query = query || {};
    var dev = DEVICE_GUIDES[query.dev] ? query.dev : "none";
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Workshop builder</div>' +
        '<div class="eyebrow">Workshop builder</div>' +
        "<h1>Build your whole workshop in one place</h1>" +
        '<p class="muted" style="max-width:66ch">Answer four questions and you get a timed lesson plan <em>and</em> ' +
          "the full packet — deck outline, practice notes, parent letter, administrator overview, event checklist, " +
          "sign-up sheet, and reflection page. The plan changes based on what you pick: pick " +
          "<strong>Grades K–2</strong> and it becomes picture-based with almost no reading; pick " +
          "<strong>no devices</strong> and every activity works with paper and people.</p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div class="card"><div class="grid grid-2">' +
          '<div class="field"><label for="gTopic">1. Topic</label><select id="gTopic">' +
            '<optgroup label="Modules">' + MODULES.map(topicOption).join("") + "</optgroup>" +
            '<optgroup label="More topics (from trusted sources)">' + EXTRA_TOPICS.map(topicOption).join("") + "</optgroup>" +
          "</select>" +
          '<div class="topic-search"><input id="gFind" type="text" placeholder="Other topic? Try taxes, coins, insurance…" aria-label="Find a topic" />' +
            '<button class="btn btn-secondary" id="gFindBtn" type="button">Find</button></div>' +
          '<div id="gFindOut" class="muted" style="font-size:.85rem;margin-top:6px"></div></div>' +
          '<div class="field"><label for="gGrade">2. Age group</label><select id="gGrade">' +
            ["Grades K–2", "Grades 3–5", "Grades 6–8", "Grades 9–12"].map(function (g, i) {
              var on = query.grade ? g === query.grade : i === 1;
              return "<option" + (on ? " selected" : "") + ">" + g + "</option>"; }).join("") +
          '</select><span class="muted" style="font-size:.8rem">K–2 switches the whole plan to pictures and movement.</span></div>' +
          '<div class="field"><label for="gMin">3. How long do you have?</label><select id="gMin">' +
            ["15", "20", "30", "40", "45", "60"].map(function (n) {
              return '<option value="' + n + '"' + (n === (query.min || "30") ? " selected" : "") + ">" + n + " minutes</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label for="gGroup">4. Group size</label><select id="gGroup">' +
            ["Whole class", "Small groups", "Pairs", "One-on-one"].map(function (g) {
              return "<option" + (g === query.group ? " selected" : "") + ">" + g + "</option>"; }).join("") +
          "</select></div>" +
        "</div>" +
        '<div class="field"><label>What technology is actually in the room?</label><div class="chips-select" id="gDev">' +
          [["none", "🙌 No devices at all"], ["shared", "📺 One shared screen"], ["personal", "📱 Students have devices"]].map(function (d) {
            return '<button class="chip-toggle' + (d[0] === dev ? " on" : "") + '" data-dev="' + d[0] + '">' + d[1] + "</button>"; }).join("") +
        "</div></div>" +
        '<button class="btn btn-primary btn-lg" id="genLesson">✨ Build my workshop</button></div>' +
        '<div id="planOut" class="mt-3"></div>' +
      "</div></section>";

    function topicOption(m) {
      return '<option value="' + m.id + '"' + (m.id === query.topic ? " selected" : "") + ">" + m.emoji + " " + esc(m.title) + "</option>";
    }
    // Find a topic by typing. Only topics with checked content can match;
    // with no match it says so instead of making something up.
    function findTopicByText() {
      var text = document.getElementById("gFind").value;
      var out = document.getElementById("gFindOut");
      var hits = searchTopics(text);
      if (!text.trim()) { out.innerHTML = ""; return; }
      if (!hits.length) {
        out.innerHTML = "No checked content for \"" + esc(text) + "\" yet, so the builder won't invent a game for it. " +
          "Pick one of the topics in the list, or ask the team to add it (each new topic needs a named trusted source).";
        return;
      }
      out.innerHTML = "Found: " + hits.slice(0, 5).map(function (t) {
        return '<button class="chip-toggle" type="button" data-pick="' + t.id + '">' + t.emoji + " " + esc(t.title) + "</button>";
      }).join(" ");
      out.querySelectorAll("[data-pick]").forEach(function (b) {
        b.addEventListener("click", function () {
          document.getElementById("gTopic").value = b.getAttribute("data-pick");
          out.innerHTML = "";
          build();
        });
      });
    }
    document.getElementById("gFindBtn").addEventListener("click", findTopicByText);
    document.getElementById("gFind").addEventListener("keydown", function (e) { if (e.key === "Enter") findTopicByText(); });

    document.getElementById("gDev").querySelectorAll(".chip-toggle").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll("#gDev .chip-toggle").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        dev = b.getAttribute("data-dev");
      });
    });
    // Build from the form. `game` is set when the volunteer swaps the main
    // activity. The choices go into the address so the link reopens this plan.
    function build(game) {
      var choices = {
        topic: document.getElementById("gTopic").value,
        grade: document.getElementById("gGrade").value,
        min: document.getElementById("gMin").value,
        group: document.getElementById("gGroup").value,
        dev: dev,
      };
      if (game) choices.game = game;
      var plan = buildLessonPlan(choices.topic, {
        minutes: Number(choices.min),
        grade: choices.grade,
        groupSize: choices.group,
        devices: choices.dev,
        game: choices.game,
      });
      var hash = "#/builder?" + Object.keys(choices).map(function (k) {
        return k + "=" + encodeURIComponent(choices[k]);
      }).join("&");
      // replaceState changes the address without re-running the router.
      if (history.replaceState) history.replaceState(null, "", hash);
      renderPlan(plan, build);
    }
    document.getElementById("genLesson").addEventListener("click", function () { build(); });
    wireNav();
    if (query.topic && findTopic(query.topic)) build(query.game);
  }

  function renderPlan(plan, rebuild) {
    if (!plan) return;
    var m = plan.module;
    var out = document.getElementById("planOut");
    var packet = buildPacket(plan);

    out.innerHTML =
      '<div class="card">' +
        // Header
        '<div class="flex items-center wrap-flex" style="justify-content:space-between;gap:12px">' +
          "<div><div class=\"eyebrow\">Your workshop</div>" +
            '<h2 style="margin-bottom:6px">' + m.emoji + " " + esc(m.title) + "</h2>" +
            '<div class="badge-row">' +
              '<span class="badge">' + esc(plan.grade) + "</span>" +
              '<span class="badge gray">⏱ ' + plan.totalMinutes + " min</span>" +
              '<span class="badge ' + (plan.devices === "none" ? "no-device-badge" : "blue") + '">' +
                plan.deviceGuide.icon + " " + esc(plan.deviceGuide.label) + "</span>" +
              '<span class="badge gray">' + esc(plan.groupSize) + "</span>" +
              (plan.pictureBased ? '<span class="badge amber">🎨 Picture-based — very little reading</span>' : "") +
            "</div></div>" +
          '<div class="flex gap wrap-flex no-print">' +
            '<button class="btn btn-secondary" id="planCopy">🔗 Copy link</button>' +
            '<button class="btn btn-secondary" id="planDownload">⬇ Download plan</button>' +
            '<button class="btn btn-secondary" onclick="window.print()">🖨 Print everything</button>' +
          "</div>" +
        "</div>" +

        '<div class="card mt-3" style="border-left:5px solid var(--green);box-shadow:none">' +
          "<strong>Learning objective:</strong> " + esc(m.objective) + "</div>" +

        // K–2 picture banner
        (plan.pictureBased
          ? '<div class="callout mt-3"><div class="ico">🎨</div><div><strong>This plan is built for pre-readers.</strong> ' +
            "Assume students cannot read your slides. Everything below uses pictures, pointing, drawing, and movement instead of text. " +
            esc(plan.profile.watchFor) + "</div></div>"
          : "") +

        // Teaching this age group
        '<div class="grid grid-2 mt-3">' +
          '<div class="card" style="box-shadow:none"><div class="eyebrow">Teaching ' + esc(plan.grade) + "</div>" +
            '<p class="muted" style="font-size:.9rem;margin-bottom:8px"><strong>Attention span:</strong> ' + esc(plan.profile.attention) +
            "<br><strong>Reading:</strong> " + esc(plan.profile.readingLevel) + "</p>" +
            '<ul class="privacy-list">' + plan.profile.delivery.map(function (d) {
              return '<li><span class="ok">→</span><span>' + esc(d) + "</span></li>"; }).join("") + "</ul>" +
            '<div class="eyebrow mt-3">Words to use</div><ul class="privacy-list">' +
            plan.profile.language.map(function (l) { return '<li><span class="ok">💬</span><span>' + esc(l) + "</span></li>"; }).join("") +
            "</ul></div>" +
          '<div class="card" style="box-shadow:none"><div class="eyebrow">' + plan.deviceGuide.icon + " " + esc(plan.deviceGuide.label) + "</div>" +
            "<p style=\"font-size:.92rem\"><strong>Set up before you start:</strong></p>" +
            '<ul class="privacy-list">' + plan.deviceGuide.setup.map(function (s) {
              return '<li><span class="ok">□</span><span>' + esc(s) + "</span></li>"; }).join("") + "</ul>" +
            '<p class="muted mt-2" style="font-size:.9rem"><strong>How students answer:</strong> ' + esc(plan.deviceGuide.voting) +
            "<br><strong>Showing results:</strong> " + esc(plan.deviceGuide.results) +
            "<br><strong>If it fails:</strong> " + esc(plan.deviceGuide.backup) + "</p>" +
            (plan.groupTip ? '<div class="eyebrow mt-3">' + esc(plan.groupSize) + '</div><p class="muted" style="font-size:.9rem;margin:0">' + esc(plan.groupTip) + "</p>" : "") +
          "</div>" +
        "</div>" +

        // Run of show
        '<div class="eyebrow mt-4">Run of show — what to do, minute by minute</div>' +
        plan.steps.map(function (s) {
          return '<div class="plan-step"><div class="plan-time">' + s.minutes + " min</div>" +
            "<div><h4>" + esc(s.name) + "</h4><p>" + esc(s.what) + "</p>" +
            (s.script ? '<div class="script-box mt-1" style="font-size:.9rem"><strong>Say this:</strong> ' + esc(s.script) + "</div>" : "") +
            (s.how ? '<div class="apply-box mt-1" style="font-size:.9rem"><strong>How to run it:</strong> ' + esc(s.how) + "</div>" : "") +
            "</div></div>";
        }).join("") +

        // Swap the main activity for the next-best fits
        (plan.alternatives && plan.alternatives.length && rebuild
          ? '<div class="card mt-2 no-print" style="box-shadow:none"><div class="eyebrow">Try a different main activity</div>' +
            '<div class="flex gap wrap-flex">' + plan.alternatives.map(function (g) {
              return '<button class="btn btn-ghost" data-swap="' + g.id + '">' + g.emoji + " " + esc(g.name) +
                ' <span class="muted" style="font-size:.85rem">· ' + g.minutes + " min</span></button>"; }).join("") +
            "</div></div>"
          : "") +

        topicGameCard(plan) +

        // Picture activity bank for K–2
        (plan.pictureActivities.length
          ? '<div class="card mt-3" style="box-shadow:none;background:var(--amber-soft)">' +
            '<div class="eyebrow">Picture-based activities you can swap in anytime</div>' +
            plan.pictureActivities.map(function (a) {
              return '<div class="vocab-item"><strong>' + esc(a.name) + "</strong><br><span class=\"muted\" style=\"font-size:.9rem\">" +
                esc(a.how) + "</span></div>"; }).join("") + "</div>"
          : "") +

        // Materials + questions
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

        // The packet
        '<div class="eyebrow mt-4">Your workshop packet <span class="pill-note">generated for these choices</span></div>' +
        '<p class="muted" style="font-size:.92rem">Everything around the lesson itself. Tap any item to read it, or print the whole page.</p>' +
        '<ul class="packet-list mt-2">' +
          packet.map(function (it, i) {
            return '<li class="packet-item"><div class="ico">' + it.ico + '</div><div class="txt"><strong>' +
              esc(it.title) + "</strong><span>" + esc(it.sub) + '</span></div>' +
              '<button class="btn btn-ghost no-print" data-i="' + i + '">View</button></li>' +
              '<li id="pk-' + i + '" class="hidden"><pre style="white-space:pre-wrap;background:var(--cream-2);padding:16px;border-radius:12px;font-family:inherit;margin:0 0 6px;font-size:.88rem">' +
              esc(it.body) + "</pre></li>";
          }).join("") +
        "</ul>" +

        '<div class="flex gap wrap-flex mt-3 no-print">' +
          (m.extraTopic ? "" : '<a class="btn btn-primary" href="#/take-home/' + m.id + '">Take-home card</a>') +
          '<a class="btn btn-secondary" href="#/games?devices=' + (plan.devices === "none" ? "none" : "all") + '">Browse games</a>' +
          (m.extraTopic ? "" : '<a class="btn btn-ghost" href="#/prep?topic=' + m.id + '">Full volunteer prep</a>') +
        "</div>" +
      "</div>";

    out.querySelectorAll(".packet-item .btn-ghost").forEach(function (b) {
      b.addEventListener("click", function () {
        var body = document.getElementById("pk-" + b.getAttribute("data-i"));
        body.classList.toggle("hidden");
        b.textContent = body.classList.contains("hidden") ? "View" : "Hide";
      });
    });
    out.querySelectorAll("[data-swap]").forEach(function (b) {
      b.addEventListener("click", function () { rebuild(b.getAttribute("data-swap")); });
    });
    var copyBtn = document.getElementById("planCopy");
    copyBtn.addEventListener("click", function () {
      copyText(location.href, function (ok) {
        copyBtn.textContent = ok ? "✓ Link copied" : "Copy failed — use the address bar";
      });
    });
    var cardsBtn = document.getElementById("gameCards");
    if (cardsBtn) cardsBtn.addEventListener("click", function () {
      download("money-ready-game-" + m.id + "-" + plan.profile.id + ".txt", topicGameToText(plan.topicGame) +
        "\n\nEducational only. Not financial advice. No personal data collected.");
    });
    document.getElementById("planDownload").addEventListener("click", function () {
      download("money-ready-" + m.id + "-" + plan.totalMinutes + "min.txt", planToText(plan, packet));
    });
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  // The ready-to-play game in a plan: play it on screen, or print cards.
  function topicGameCard(plan) {
    var g = plan.topicGame;
    if (!g || !g.rounds.length) return "";
    var href = "#/game?topic=" + plan.module.id + "&grade=" + plan.profile.id;
    return '<div class="card mt-3" style="box-shadow:none;border:2px solid var(--green)">' +
      '<div class="eyebrow">🎮 Your game · ready to play</div>' +
      "<h3 style=\"margin:4px 0\">" + esc(g.title) + "</h3>" +
      '<p class="muted" style="font-size:.92rem">' + g.rounds.length + " rounds made for " + esc(plan.grade) + ". " +
        (g.picture
          ? "Two big pictures per round and almost no words. The screen can read each question out loud."
          : "Each round has picture answers, the right answer, and why.") +
        (plan.devices === "none" ? " No screen in the room? Download the game cards and read them out; students vote by moving or with hands." : "") +
      "</p>" +
      '<div class="flex gap wrap-flex no-print">' +
        '<a class="btn btn-primary" href="' + href + '">▶ Play on screen</a>' +
        '<button class="btn btn-secondary" id="gameCards">⬇ Download game cards</button>' +
      "</div>" +
      '<details class="mt-2"><summary style="cursor:pointer;font-weight:700">See all ' + g.rounds.length + " rounds and answers</summary>" +
        '<div class="mt-2">' + g.rounds.map(function (r, i) {
          var s = roundSource(r, g.topic);
          return '<div class="game-round"><strong>' + (i + 1) + ". " + esc(r.q) + "</strong><br>" +
            r.opts.map(function (o, k) {
              return '<span class="' + (k === r.best ? "opt-ok" : "") + '">' + o[0] + " " + esc(o[1]) + (k === r.best ? " ✓" : "") + "</span>";
            }).join(" &nbsp;·&nbsp; ") +
            '<br><span class="muted">' + esc(r.why) + "</span>" +
            (s ? '<br><span class="muted" style="font-size:.82rem">Source: ' + esc(s.name) + (s.url ? " · " + esc(s.url) : "") + "</span>" : "") +
            "</div>";
        }).join("") + "</div></details>" +
    "</div>";
  }

  // #/game?topic=<module or extra topic>&grade=<k2|35|68|912>
  function renderTopicGame(query) {
    var grade = /^(k2|35|68|912)$/.test(query.grade || "") ? query.grade : "35";
    var g = buildTopicGame(query.topic, grade);
    if (!g || !g.rounds.length) return renderNotFound();
    var gradeName = Object.keys(GRADE_PROFILES).filter(function (k) { return GRADE_PROFILES[k].id === grade; })[0];
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · ' +
        '<a href="#/builder?topic=' + encodeURIComponent(query.topic) + "&grade=" + encodeURIComponent(gradeName) + '">Workshop builder</a> · Game</div>' +
        '<div class="eyebrow">' + g.topic.emoji + " Play on screen · " + esc(gradeName) + "</div>" +
        "<h1>" + esc(g.title.replace(/^\S+ /, "")) + "</h1>" +
        (g.topic.extraTopic ? '<p class="muted" style="max-width:66ch">Every round shows where its facts come from.</p>' : "") +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div id="playRoot" class="play-root"></div>' +
        '<p class="muted center mt-3" style="font-size:.88rem">🔒 Nothing is saved or sent anywhere. The game runs only on this screen.</p>' +
      "</div></section>";
    PLAY_ENGINES.quiz(document.getElementById("playRoot"), g);
    wireNav();
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
    if (route === "play") route = "games";
    if (route === "game") route = "builder";
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
    // Stop a game reading aloud when the page changes.
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* no voice */ }
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
      case "play": return renderPlay(seg[1]);
      case "game": return renderTopicGame(query);
      case "module": return renderModule(seg[1]);
      case "challenge": return renderChallenge(seg[1], query.practice === "1");
      case "facilitator": return renderFacilitator();
      case "prep": return renderPrep(query);
      // Toolkit builder and lesson generator are now one page.
      case "builder":
      case "generator": return renderBuilderCombined(query);
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
  // The home page has its own role chart, so the picker waits until the
  // visitor opens another page (or taps the header chip). It never shows
  // once a role is set, whether by the picker or by the chart.
  function onHome() { return !location.hash || location.hash === "#/"; }
  function start() {
    route();
    if (!onHome()) showRolePicker(false);
  }
  window.addEventListener("hashchange", function () {
    route();
    if (!onHome()) showRolePicker(false);
  });
  window.addEventListener("DOMContentLoaded", start);
  // In case DOMContentLoaded already fired
  if (document.readyState !== "loading") start();
})();
