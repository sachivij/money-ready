/*
 * app.js — Money Ready Virginia Interactive Toolkit
 * -----------------------------------------------------------------
 * A single-page app with a tiny hash router. No frameworks, no
 * external requests — privacy-safe and works offline.
 *
 * Screens:
 *   #/               Landing page
 *   #/module/:id     Lesson transformation
 *   #/challenge/:id  Student challenge + reveal
 *   #/prep           Teen volunteer prep (any topic, age, length)
 *   #/resources      What each official resource is
 *   #/builder        Toolkit builder (guided packet workflow)
 *   #/helper         Standards-grounded helper (retrieval only)
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
  // There is no "who's using the toolkit?" question any more. Picking a
  // path in the home page chart quietly remembers the role on this device,
  // so the students-reached count knows who started the activity.
  // ================================================================
  var ROLE_KEY = "moneyReady.accountType.v1";
  // In-memory fallback for when localStorage is unavailable.
  var roleMemory = "";

  function getRole() {
    try { return localStorage.getItem(ROLE_KEY) || roleMemory; } catch (e) { return roleMemory; }
  }
  function setRole(id) {
    roleMemory = id;
    try { localStorage.setItem(ROLE_KEY, id); } catch (e) {}
  }
  function roleDef(id) {
    var r = ACCOUNT_TYPES.filter(function (a) { return a.id === (id || getRole()); })[0];
    return r || null;
  }

  // ================================================================
  // STUDENTS REACHED (spec 09)
  // Before a volunteer or teacher uses something — builds a plan or
  // opens an on-screen game — ask how many students will
  // take part. An answer is required to continue; "Go back" leaves without
  // counting. Organizations (picked on the home page chart) aren't asked.
  // Anyone who never picked a path counts as a volunteer, the main user.
  // reach.js sends the count.
  // ================================================================
  function askStudents(kind, item, onDone) {
    var role = getRole() || "volunteer";
    if ((role !== "volunteer" && role !== "school") || Reach.alreadyCounted(kind, item)) return onDone();

    var old = document.getElementById("studentsOverlay");
    if (old) old.remove();
    var el = document.createElement("div");
    el.className = "role-overlay";
    el.id = "studentsOverlay";
    el.innerHTML =
      '<form class="role-modal students-modal" role="dialog" aria-modal="true" aria-labelledby="studentsTitle" novalidate>' +
        '<div class="eyebrow">Before you start</div>' +
        '<h2 id="studentsTitle">How many students will be participating in this activity?</h2>' +
        '<label class="students-field"><span class="sr-only">Number of students</span>' +
          '<input id="studentsInput" type="number" inputmode="numeric" min="1" max="' + Reach.MAX_STUDENTS +
            '" step="1" placeholder="e.g. 24" required aria-describedby="studentsHint"></label>' +
        '<p id="studentsHint" class="students-hint" aria-live="polite">Enter a whole number from 1 to ' + Reach.MAX_STUDENTS + ".</p>" +
        '<div class="students-actions">' +
          '<button type="submit" class="btn btn-primary btn-lg" id="studentsGo" disabled>Continue →</button>' +
          '<button type="button" class="btn btn-ghost" id="studentsBack">Go back</button>' +
        "</div>" +
        '<p class="role-note">🔒 We count how many students Money Ready reaches. Only this number and the activity are sent to ' +
          "the project team — never names or anything about your students.</p>" +
      "</form>";
    document.body.appendChild(el);
    var input = el.querySelector("#studentsInput");
    var go = el.querySelector("#studentsGo");
    var hint = el.querySelector("#studentsHint");
    input.addEventListener("input", function () {
      var ok = Reach.parseStudents(input.value) !== null;
      go.disabled = !ok;
      hint.classList.toggle("bad", !ok && input.value !== "");
    });
    el.querySelector("form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var n = Reach.parseStudents(input.value);
      if (n === null) { hint.classList.add("bad"); input.focus(); return; }
      Reach.record(kind, item, n, role);
      el.remove();
      onDone();
    });
    function back() {
      el.remove();
      if (history.length > 1) history.back(); else location.hash = "#/";
    }
    el.querySelector("#studentsBack").addEventListener("click", back);
    el.addEventListener("keydown", function (ev) { if (ev.key === "Escape") back(); });
    input.focus();
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
          navGuide("📚", "Resources", "#/resources",
            "I want to know what the official materials are",
            "A short explanation of each official Teen Teach-In lesson, the partner programs, and the trusted sources the toolkit uses.") +
          navGuide("💪", "Volunteer Prep", "#/prep",
            "I'm nervous and want to practice first",
            "Pick any topic, age group and length. Get a script to say out loud, vocabulary, timed steps, answers to questions students ask, and a practice run.") +
          navGuide("🎲", "Games", "#/games",
            "I need an activity, and there may be no screens",
            GAME_FORMATS.length + " games you can drop into any topic. " + unpluggedGames() + " of them need no technology at all.") +
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
              "aggregate counts only: when a volunteer or teacher starts an activity, the site sends just the number of " +
              "students and which activity, so the team can count students reached.</p>" +
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
      more: [["💪", "Practice first", "#/prep"], ["📚", "See the resources", "#/resources"]] },
    { role: "school", want: "I want a workshop for my class",
      main: ["🛠️", "Plan a class workshop", "#/builder"],
      more: [["📚", "See the resources", "#/resources"]] },
    { role: "organization", want: "I run the program",
      main: ["📚", "See the official resources", "#/resources"],
      more: [["🛠️", "Plan a workshop", "#/builder"]] },
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
        '<a href="#/builder">🎤 Workshop happening right now?</a>' +
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

  function metaRow(k, v) {
    return '<li><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + "</span></li>";
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
        esc(m.title) + "</div>" +
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
            '<a class="btn btn-secondary" href="#/builder?topic=' + m.id + '">Build a workshop on this</a>' +
            '<a class="btn btn-ghost" href="#/prep?topic=' + m.id + '">Volunteer prep</a>' +
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
  // TEEN VOLUNTEER PREP
  // ================================================================
  // Any module or extra topic, for any age group and length. Answers to
  // questions come only from the Standards Helper's cited entries
  // (Jump$tart materials first, then named government sources).
  var PREP_LENGTHS = [20, 30, 40, 45];

  // Spread `total` minutes over steps in proportion to `weights`, at
  // least 2 minutes each, adding up exactly.
  function spreadMinutes(weights, total) {
    var sum = weights.reduce(function (x, y) { return x + y; }, 0) || 1;
    var mins = weights.map(function (w) { return Math.max(2, Math.floor(w * total / sum)); });
    var left = total - mins.reduce(function (x, y) { return x + y; }, 0);
    // Hand out (or take back) the rest, biggest steps first.
    var order = weights.map(function (w, i) { return i; }).sort(function (x, y) { return weights[y] - weights[x]; });
    for (var i = 0; left !== 0 && i < 200; i++) {
      var k = order[i % order.length];
      if (left > 0) { mins[k]++; left--; } else if (mins[k] > 2) { mins[k]--; left++; }
    }
    return mins;
  }

  // The timed steps for a topic: [{ text, min }].
  function prepSteps(t, total) {
    var steps;
    if (t.prep && t.prep.steps) {
      steps = t.prep.steps.map(function (x) {
        var m = /\((\d+)\s*min\)\s*$/.exec(x);
        return { text: x.replace(/\s*\(\d+\s*min\)\s*$/, ""), w: m ? Number(m[1]) : 5 };
      });
    } else {
      var pack = t.pack || {};
      var games = (pack.bestGames || []).map(function (id) {
        var g = GAME_FORMATS.filter(function (x) { return x.id === id; })[0];
        return g ? g.name : "";
      }).filter(Boolean);
      steps = [
        { text: "Hook: " + (pack.hook || t.prep.openingScript), w: 3 },
        { text: "Mini-lesson: " + (pack.miniLesson || t.summary), w: 5 },
      ];
      if (pack.guidedPractice) steps.push({ text: "Practice together: " + pack.guidedPractice, w: 4 });
      steps.push({ text: "Activity: play " + (games.length ? games.join(" or ") : "a quick class vote") +
        " (see Games for how to run it)", w: 10 });
      steps.push({ text: "Reveal and discuss: " + t.reveal.keyConcept, w: 4 });
      steps.push({ text: "Exit question and take-home card: " + t.takeHome.title, w: 3 });
    }
    var mins = spreadMinutes(steps.map(function (s) { return s.w; }), total);
    return steps.map(function (s, i) { return { text: s.text, min: mins[i] }; });
  }

  // Where a topic's facts come from, for the line under the plan.
  function prepSources(t) {
    if (t.officialLesson) return "Jump$tart Teen Teach-In · " + t.officialLesson;
    if (t.extraTopic) return t.sources.map(function (k) { return KB_SRC[k] ? KB_SRC[k][0] : ""; }).filter(Boolean).join("; ");
    return "Money Ready module, written from Jump$tart topics (pending review)";
  }

  function kbAnswerCard(f) {
    return '<div class="card mt-2"><h3 style="font-size:1.02rem">' + esc(f.q) + "</h3>" +
      '<div class="helper-answer">' + esc(f.a) + "</div>" + sourceLine(f) + "</div>";
  }

  function renderPrep(query) {
    var gradeNames = Object.keys(GRADE_PROFILES);
    var state = {
      topic: findTopic(query && query.topic) ? query.topic : (officialModules()[0] || MODULES[0]).id,
      grade: gradeNames.filter(function (k) { return GRADE_PROFILES[k].id === (query && query.grade); })[0] || "Grades 3–5",
      len: PREP_LENGTHS.indexOf(Number(query && query.len)) >= 0 ? Number(query.len) : 30,
    };
    var core = officialModules();
    var others = MODULES.filter(function (m) { return core.indexOf(m) < 0; });
    function opt(t) { return '<option value="' + t.id + '">' + t.emoji + " " + esc(t.title) + "</option>"; }

    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Volunteer prep</div>' +
        '<div class="eyebrow">Teen volunteer prep</div><h1>Everything you need to teach with confidence</h1>' +
        '<p class="muted" style="max-width:66ch">Pick any topic, the age of your students, and how long you have. You get a script, ' +
          "vocabulary, a timed plan, tips for that age, and answers to questions students ask. Every answer names its source: " +
          "Jump$tart materials first, then trusted U.S. government sources.</p>" +
      "</div>" +
      '<section class="section tight"><div class="wrap"><div class="grid grid-2 prep-layout">' +
        '<div class="card prep-controls">' +
          '<div class="field"><label for="pFind">Find a topic</label>' +
            '<input id="pFind" placeholder="e.g. taxes, coins, scams" autocomplete="off" />' +
            '<div id="pFindMsg" class="muted" style="font-size:.82rem;margin-top:4px" aria-live="polite"></div></div>' +
          '<div class="field"><label for="pTopic">Or choose one</label><select id="pTopic">' +
            (core.length ? '<optgroup label="Official Teen Teach-In lessons">' + core.map(opt).join("") + "</optgroup>" : "") +
            '<optgroup label="More workshop topics">' + others.map(opt).join("") + "</optgroup>" +
            '<optgroup label="More topics (from trusted sources)">' + EXTRA_TOPICS.map(opt).join("") + "</optgroup>" +
          "</select></div>" +
          '<div class="field"><label for="pAge">Age group</label><select id="pAge">' +
            gradeNames.map(function (g) { return "<option>" + esc(g) + "</option>"; }).join("") +
          "</select></div>" +
          '<div class="field"><label>Workshop length</label><div class="chips-select" id="pLen">' +
            PREP_LENGTHS.map(function (l) { return '<button type="button" class="chip-toggle" data-len="' + l + '">' + l + " min</button>"; }).join("") +
          "</div></div>" +
          '<a class="btn btn-primary btn-block" id="practiceBtn" href="#/">▶ Practice the game</a>' +
          '<p class="muted" style="font-size:.8rem;margin:8px 0 0">Practice runs the game on this screen for the age group you picked. Nothing is counted or sent.</p>' +
        "</div>" +
        '<div id="prepContent"></div>' +
      "</div></div></section>";

    var topicSel = document.getElementById("pTopic");
    var ageSel = document.getElementById("pAge");
    var lenWrap = document.getElementById("pLen");

    function fillPrep() {
      var t = findTopic(state.topic);
      var p = t.prep;
      var prof = GRADE_PROFILES[state.grade];
      topicSel.value = t.id;
      ageSel.value = state.grade;
      lenWrap.querySelectorAll(".chip-toggle").forEach(function (b) {
        b.classList.toggle("on", Number(b.getAttribute("data-len")) === state.len);
      });
      document.getElementById("practiceBtn").setAttribute("href",
        "#/game?topic=" + encodeURIComponent(t.id) + "&grade=" + prof.id + "&solo=1");
      // Keep the link shareable without re-rendering the page.
      try { history.replaceState(null, "", "#/prep?topic=" + t.id + "&grade=" + prof.id + "&len=" + state.len); } catch (e) {}

      var steps = prepSteps(t, state.len);
      var vocab = p.vocab.slice(0, prof.vocabCount);
      var prompts = (p.discussionPrompts || [t.reveal.discussionPrompt]);
      var related = searchKB(t.title + " " + (t.tags || []).join(" ") + " " +
        p.vocab.map(function (v) { return v.term; }).join(" ")).slice(0, 3);

      document.getElementById("prepContent").innerHTML =
        '<div class="card"><div class="eyebrow">' + t.emoji + " " + esc(t.title) + " · " + esc(state.grade) + " · " + state.len + " min</div>" +
          '<p class="muted" style="margin:4px 0 12px">' + esc(t.objective || t.summary) + "</p>" +
          '<div class="eyebrow">Opening script — say this out loud</div>' +
          '<div class="script-box">' + esc(p.openingScript) + "</div>" +
          (prof.pictureBased ? '<p class="muted mt-1" style="font-size:.88rem">🖼️ For this age, hold up a picture or act it out while you say it.</p>' : "") +
        "</div>" +
        '<div class="grid grid-2 mt-3">' +
          '<div class="card"><div class="eyebrow">Key vocabulary (' + vocab.length + " for this age)</div>" +
            vocab.map(function (v) { return '<div class="vocab-item"><strong>' + esc(v.term) + "</strong> — " + esc(v.def) + "</div>"; }).join("") +
          "</div>" +
          '<div class="card"><div class="eyebrow">Timed plan · ' + state.len + " min</div><ol class=\"numbered\">" +
            steps.map(function (s) { return "<li>" + esc(s.text) + " <strong>(" + s.min + " min)</strong></li>"; }).join("") +
          "</ol></div>" +
        "</div>" +
        '<div class="card mt-3"><div class="eyebrow">Teaching ' + esc(state.grade) + "</div>" +
          '<p class="muted" style="margin:4px 0 8px">' + esc(prof.readingLevel) + " " + esc(prof.attention) + "</p>" +
          '<ul class="privacy-list">' +
            prof.delivery.concat(prof.language).map(function (d) { return '<li><span class="ok">✓</span><span>' + esc(d) + "</span></li>"; }).join("") +
            '<li><span class="ok">👀</span><span>' + esc(prof.watchFor) + "</span></li>" +
          "</ul></div>" +
        '<div class="grid grid-2 mt-3">' +
          '<div class="card"><div class="eyebrow">Discussion prompts</div><ul class="privacy-list">' +
            prompts.map(function (d) { return '<li><span class="ok">💬</span><span>' + esc(d) + "</span></li>"; }).join("") +
          "</ul></div>" +
          '<div class="card"><div class="eyebrow">Take-home</div>' +
            "<p style=\"margin:4px 0\"><strong>" + esc(t.takeHome.title) + "</strong></p>" +
            '<p class="muted" style="margin:0 0 10px">Family question: ' + esc(t.takeHome.familyQuestion) + "</p>" +
            (p.printables ? p.printables.map(function (x) { return '<span class="chip" style="font-size:.85rem;margin:0 6px 6px 0;display:inline-block">🖨 ' + esc(x) + "</span>"; }).join("") : "") +
            (moduleById(t.id) ? '<div class="mt-2"><a class="btn btn-secondary" href="#/take-home/' + t.id + '">Open take-home card →</a></div>' : "") +
          "</div>" +
        "</div>" +
        '<div class="card mt-3"><div class="eyebrow">Questions students might ask</div>' +
          (related.length
            ? related.map(function (r) { return kbAnswerCard(r.f); }).join("")
            : '<p class="muted mb-0">No ready answers for this topic yet. Use the box below.</p>') +
        "</div>" +
        '<div class="card mt-3"><div class="eyebrow">Ask your own question</div>' +
          '<div class="flex gap wrap-flex" style="margin-top:6px"><input id="pAsk" style="flex:1;min-width:200px" placeholder="e.g. What is a deductible?" />' +
          '<button type="button" class="btn btn-primary" id="pAskBtn">Get answer</button></div>' +
          '<div id="pAns"></div>' +
        "</div>" +
        '<p class="muted mt-2" style="font-size:.82rem">📚 Facts for this topic: ' + esc(prepSources(t)) +
          ". Educational only · pending review by Virginia Jump$tart.</p>";

      function ask() {
        var q = document.getElementById("pAsk").value;
        var res = searchKB(q);
        document.getElementById("pAns").innerHTML = res.length
          ? kbAnswerCard(res[0].f)
          : '<div class="card mt-2"><p class="muted mb-0">🤔 There\'s no sourced answer for that yet, so this won\'t guess. ' +
            "Tell students it's a great question and you'll find out, or look it up together on consumerfinance.gov.</p></div>";
      }
      document.getElementById("pAskBtn").addEventListener("click", ask);
      document.getElementById("pAsk").addEventListener("keydown", function (e) { if (e.key === "Enter") ask(); });
    }

    topicSel.addEventListener("change", function () { state.topic = topicSel.value; fillPrep(); });
    ageSel.addEventListener("change", function () { state.grade = ageSel.value; fillPrep(); });
    lenWrap.querySelectorAll(".chip-toggle").forEach(function (b) {
      b.addEventListener("click", function () { state.len = Number(b.getAttribute("data-len")); fillPrep(); });
    });
    var find = document.getElementById("pFind");
    find.addEventListener("input", function () {
      var msg = document.getElementById("pFindMsg");
      if (!find.value.trim()) { msg.textContent = ""; return; }
      var hits = searchTopics(find.value);
      if (!hits.length) {
        msg.textContent = "No topic for that yet. Pick one below, or ask it as a question further down.";
        return;
      }
      msg.textContent = "Showing: " + hits[0].title + (hits.length > 1 ? " (also: " + hits.slice(1, 3).map(function (h) { return h.title; }).join(", ") + ")" : "");
      if (hits[0].id !== state.topic) { state.topic = hits[0].id; fillPrep(); }
    });
    fillPrep();
    wireNav();
  }

  // ---- Helper matching (shared by the Standards Helper and Volunteer Prep)
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

  function searchKB(query) {
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

    function answer(query) {
      var results = searchKB(query);
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

  // What each kind of official material is, in a sentence.
  var KIT_ABOUT = {
    "Presentation": "Slides the teen volunteer shows to the class.",
    "Toolkit": "The volunteer's guide: what to say, what to do, and how long each part takes.",
    "Worksheet": "A page students fill in during or after the lesson.",
    "Vocab Check": "A short check that students know the new words.",
    "Website Link": "An online version of the story to read together.",
  };

  // Resources only explains what each resource is. It deliberately has no
  // games or challenges; those live in the Workshop Builder and Games.
  function renderResources() {
    var core = officialModules();
    var partners = [
      { name: "Greenlight", what: "Money app and learning materials for families." },
      { name: "Take Charge Today", what: "Free classroom lesson plans and activities." },
      { name: "Sheila Bair's \"Money Tales\"", what: "Illustrated story series about money decisions." },
      { name: "EVERFI's \"Vault: Understanding Money\"", what: "Digital financial-literacy course for elementary students." },
      { name: "Banzai", what: "Interactive, real-life financial-literacy scenarios." },
    ];
    function item(ico, name, what, extra) {
      return '<li class="packet-item"><div class="ico">' + ico + '</div><div class="txt"><strong>' +
        esc(name) + "</strong><span>" + esc(what) + "</span>" + (extra || "") + "</div></li>";
    }
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · Resources</div>' +
        '<div class="eyebrow">Resources</div>' +
        "<h1>What each resource is</h1>" +
        '<p class="muted" style="max-width:66ch">The official Teen Teach-In sequence is written for <strong>elementary ' +
          "students in Grades 1–4</strong>, taught by teen volunteers. Here is what each official lesson covers, what " +
          "comes in its kit, and the other sources this toolkit relies on. Download the official materials from Jump$tart.</p>" +
        '<a class="btn btn-primary mt-2" href="' + TTI_URL + '" target="_blank" rel="noopener">Open the official resources page ↗</a>' +
      "</div>" +
      '<section class="section tight"><div class="wrap" style="max-width:900px">' +
        "<h2>Official Teen Teach-In lessons</h2>" +
        '<p class="muted">One lesson per grade, plus two story lessons that work across Grades 1–4.</p>' +
        '<div class="grid mt-2" style="gap:16px">' +
          core.map(function (m) {
            return '<div class="card"><div class="flex items-center gap" style="margin-bottom:6px">' +
                '<span style="font-size:1.8rem">' + m.emoji + "</span>" +
                "<div><h3 style=\"margin:0\">" + esc(m.title) + "</h3>" +
                '<span class="muted" style="font-size:.85rem">' + esc(m.officialLesson) + "</span></div></div>" +
              "<p style=\"margin:6px 0 10px\">" + esc(m.summary) + "</p>" +
              '<ul class="mc-meta">' +
                metaRow("Big idea", m.keyConcept) +
                (m.officialMaterials || []).map(function (k) { return metaRow(k, KIT_ABOUT[k] || ""); }).join("") +
              "</ul>" +
              '<a class="btn btn-ghost" style="padding-left:0" href="#/prep?topic=' + m.id + '">Prepare to teach it →</a>' +
            "</div>";
          }).join("") +
        "</div>" +
        '<h2 class="mt-4">Partner resources</h2>' +
        '<p class="muted">Other programs listed on the official resources page.</p>' +
        '<ul class="packet-list mt-2">' +
          partners.map(function (p) { return item("🔗", p.name, p.what); }).join("") +
        "</ul>" +
        '<h2 class="mt-4">Trusted sources for other topics</h2>' +
        '<p class="muted">When a question or topic goes beyond the Jump$tart lessons, Volunteer Prep and the Standards Helper ' +
          "answer only from these public sources, and every answer names its source.</p>" +
        '<ul class="packet-list mt-2">' +
          Object.keys(KB_SRC).map(function (k) {
            return item("🏛️", KB_SRC[k][0], KB_SRC_ABOUT[k] || "", '<span class="muted" style="display:block;font-size:.8rem">' + esc(KB_SRC[k][1]) + "</span>");
          }).join("") +
        "</ul>" +
        '<div class="callout mt-3"><div class="ico">📌</div><div><strong>Where this toolkit fits.</strong> ' +
          "The official materials are the curriculum. This toolkit helps volunteers deliver them. It does not replace " +
          "or reproduce the official presentations, toolkits, or worksheets, and all of it is pending review and approval.</div></div>" +
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
        '<p class="muted center mt-3" style="font-size:.88rem">🔒 Scores are never saved or sent — the game runs only on this screen.</p>' +
      "</div></section>";
    wireNav();
    askStudents("game", g.id, function () {
      PLAY_ENGINES[g.play.engine](document.getElementById("playRoot"), g);
    });
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
    // Two choices. Old links with "shared" or "personal" open as devices.
    var dev = query.dev === "devices" || query.dev === "shared" || query.dev === "personal" ? "devices" : "none";
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
          [["none", "🙌 No devices"], ["devices", "📺 Devices (a screen and/or students' devices)"]].map(function (d) {
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
      askStudents("builder", choices.topic, function () { showBuilt(choices); });
    }
    function showBuilt(choices) {
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

        (m.extraTopic && plan.topicGame
          ? '<div class="callout mt-3"><div class="ico">🏛️</div><div><strong>Not a Jump$tart module.</strong> ' +
            "Every fact in this workshop's game comes from a trusted U.S. government consumer-education source: " +
            esc(plan.topicGame.sources.map(function (x) { return x.name + " (" + x.url + ")"; }).join("; ")) + ".</div></div>"
          : "") +

        // The game for this topic, up front: every round and answer.
        topicGameCard(plan) +

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
        '<div class="eyebrow mt-4">Run of show: what to say and do, minute by minute</div>' +
        '<p class="muted" style="font-size:.9rem;margin:0 0 8px">🗣 <strong>Say</strong> lines are word for word, so you can read them straight off the page. ' +
          "✋ <strong>Do</strong> steps go in order.</p>" +
        plan.steps.map(function (s) {
          return '<div class="plan-step"><div class="plan-time">' + s.minutes + " min</div>" +
            "<div><h4>" + esc(s.name) + '</h4><p class="muted" style="font-size:.92rem">' + esc(s.what) + "</p>" +
            (s.script ? '<div class="script-box mt-1" style="font-size:.9rem"><strong>Say this:</strong> ' + esc(s.script) + "</div>" : "") +
            (s.say && s.say.length ? '<div class="script-box mt-1 say-box"><strong>🗣 Say</strong>' +
              s.say.map(function (l) { return "<p>“" + esc(l) + "”</p>"; }).join("") + "</div>" : "") +
            (s.do && s.do.length ? '<div class="do-box mt-1"><strong>✋ Do</strong><ol>' +
              s.do.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ol></div>" : "") +
            (s.rounds ? '<div class="round-script mt-1"><strong>🎮 Round by round</strong>' + s.rounds.map(function (r, i) {
                return '<div class="rs-round"><div class="rs-n">Round ' + (i + 1) + "</div>" +
                  r.say.map(function (l) { return '<p class="rs-say">🗣 “' + esc(l) + "”</p>"; }).join("") +
                  r.do.map(function (l) { return '<p class="rs-do">✋ ' + esc(l) + "</p>"; }).join("") +
                  '<p class="rs-say rs-answer">🗣 Then say: “' + esc(r.answer) + "”</p></div>";
              }).join("") + "</div>" : "") +
            (s.how ? '<div class="apply-box mt-1" style="font-size:.86rem"><strong>💡 Tip:</strong> ' + esc(s.how) + "</div>" : "") +
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
    var qs = "?topic=" + plan.module.id + "&grade=" + plan.profile.id;
    var noScreen = plan.devices === "none";
    var main = plan.mainGame && !plan.mainGame.multiRound ? plan.mainGame : null;
    var srcNames = g.sources.map(function (x) { return x.name; });
    return '<div class="card mt-3 topic-game" style="box-shadow:none;border:2px solid var(--green)">' +
      '<div class="eyebrow">🎮 Your game for this topic · ' + (noScreen ? "no screen needed" : "ready to play") + "</div>" +
      '<h3 style="margin:4px 0">' + esc(g.title) + "</h3>" +
      // At a glance: what the game is, who it is for, how to run it.
      '<div class="game-facts">' +
        "<div><span>Topic</span><strong>" + esc(g.topic.title) + "</strong></div>" +
        "<div><span>Made for</span><strong>" + esc(plan.grade) + "</strong></div>" +
        "<div><span>Rounds</span><strong>" + g.rounds.length + " questions</strong></div>" +
        "<div><span>Style</span><strong>" + (noScreen
          ? (g.picture ? "Big picture cards you hold up" : "Answer cards + you read the questions")
          : (g.picture ? "Two big pictures, read aloud" : "Picture answers + why")) + "</strong></div>" +
        "<div><span>Run it as</span><strong>" + (main ? main.emoji + " " + esc(main.name) : "On screen or with the cards") + "</strong></div>" +
        (srcNames.length ? "<div><span>Facts from</span><strong>" + esc(srcNames.join("; ")) + "</strong></div>" : "") +
      "</div>" +
      '<p class="muted" style="font-size:.92rem;margin:10px 0 0"><strong>Students practice:</strong> ' + esc(g.topic.objective) +
        (noScreen
          ? " No screen needed: print the answer cards, hold them up (or tape one in each corner), and read each question from the script below. Students vote by pointing, moving, or raising hands."
          : " Put the game on the room's screen. Students vote with hands or on their own devices (the game shows a play-along link). " +
            "Tap an answer once for every vote you count, then Reveal: the screen shows the answer and how the class voted.") + "</p>" +
      '<div class="flex gap wrap-flex no-print mt-2">' +
        (noScreen
          ? '<a class="btn btn-primary" href="#/game-cards' + qs + '">🖨 Print the answer cards</a>'
          : '<a class="btn btn-primary" href="#/game' + qs + '">▶ Start the game on screen</a>' +
            '<a class="btn btn-secondary" href="#/game-cards' + qs + '">🖨 Print the answer cards (backup)</a>') +
        '<button class="btn btn-ghost" id="gameCards">⬇ Download the questions (text)</button>' +
      "</div>" +
      '<div class="eyebrow mt-3">What\'s in the game: every round, with the answer</div>' +
      '<div class="round-grid' + (g.picture ? " pic" : "") + '">' + g.rounds.map(function (r, i) {
        var s = roundSource(r, g.topic);
        return '<div class="round-card"><div class="round-n">Round ' + (i + 1) + "</div>" +
          '<div class="round-q">' + esc(r.q) + "</div>" +
          '<div class="round-opts">' + r.opts.map(function (o, k) {
            return '<span class="round-opt' + (k === r.best ? " ok" : "") + '"><span class="round-emoji" aria-hidden="true">' + o[0] + "</span>" +
              esc(o[1]) + (k === r.best ? ' <span class="round-tick" aria-label="right answer">✓</span>' : "") + "</span>";
          }).join("") + "</div>" +
          '<div class="round-why">' + (r.best < 0 ? "Any answer is OK. " : "") + esc(r.why) + "</div>" +
          (s ? '<div class="round-src">Source: ' + esc(s.name) + (s.url ? " · " + esc(s.url) : "") + "</div>" : "") +
          "</div>";
      }).join("") + "</div>" +
    "</div>";
  }

  // #/game-cards?topic=…&grade=… : printable answer cards for rooms with
  // no screen. One page per round with a big card for each answer, and an
  // answer key at the end, so the cards students see don't give it away.
  function renderGameCards(query) {
    var grade = /^(k2|35|68|912)$/.test(query.grade || "") ? query.grade : "35";
    var g = buildTopicGame(query.topic, grade);
    if (!g || !g.rounds.length) return renderNotFound();
    var gradeName = Object.keys(GRADE_PROFILES).filter(function (k) { return GRADE_PROFILES[k].id === grade; })[0];
    app.innerHTML =
      '<div class="wrap page-head no-print"><div class="breadcrumb"><a href="#/">Home</a> · ' +
        '<a href="#/builder?topic=' + encodeURIComponent(query.topic) + "&grade=" + encodeURIComponent(gradeName) + '&dev=none">Workshop builder</a> · Answer cards</div>' +
        '<div class="eyebrow">🖨 No screen needed · ' + esc(gradeName) + "</div>" +
        "<h1>Answer cards: " + esc(g.title.replace(/^\S+ /, "")) + "</h1>" +
        '<p class="muted" style="max-width:66ch">Print these (one page per round). For each round, read the question out loud, hold up the cards ' +
          "or tape one in each corner, and let students point or walk to their answer. The answer key is on the last page, just for you.</p>" +
        '<button class="btn btn-primary" onclick="window.print()">🖨 Print</button>' +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        g.rounds.map(function (r, i) {
          return '<div class="pcard-round"><div class="pcard-q"><span>Round ' + (i + 1) + "</span> " + esc(r.q) + "</div>" +
            '<div class="pcard-grid' + (r.opts.length === 2 ? " two" : "") + '">' + r.opts.map(function (o, k) {
              return '<div class="pcard">' + (g.picture ? "" : '<div class="pcard-letter">' + "ABCD".charAt(k) + "</div>") +
                '<div class="pcard-emoji" aria-hidden="true">' + o[0] + '</div><div class="pcard-word">' + esc(o[1]) + "</div></div>";
            }).join("") + "</div></div>";
        }).join("") +
        '<div class="pcard-round pcard-key"><h2>Answer key (for the volunteer)</h2><ol>' +
          g.rounds.map(function (r) {
            var s = roundSource(r, g.topic);
            return "<li><strong>" + esc(r.q) + "</strong><br>" +
              (r.best < 0 ? "Any answer is OK." : "Answer: " + r.opts[r.best][0] + " " + esc(r.opts[r.best][1]) + ".") + " " + esc(r.why) +
              (s ? '<br><span class="muted" style="font-size:.85rem">Source: ' + esc(s.name) + (s.url ? " · " + esc(s.url) : "") + "</span>" : "") + "</li>";
          }).join("") + "</ol></div>" +
      "</div></section>";
    wireNav();
  }

  // #/game?topic=<module or extra topic>&grade=<k2|35|68|912>
  function renderTopicGame(query) {
    var grade = /^(k2|35|68|912)$/.test(query.grade || "") ? query.grade : "35";
    var g = buildTopicGame(query.topic, grade);
    if (!g || !g.rounds.length) return renderNotFound();
    var gradeName = Object.keys(GRADE_PROFILES).filter(function (k) { return GRADE_PROFILES[k].id === grade; })[0];
    app.innerHTML =
      '<div class="wrap page-head"><div class="breadcrumb"><a href="#/">Home</a> · ' +
        '<a href="#/builder?topic=' + encodeURIComponent(query.topic) + "&grade=" + encodeURIComponent(gradeName) + '&dev=devices">Workshop builder</a> · Game</div>' +
        '<div class="eyebrow">' + g.topic.emoji + (query.solo === "1" ? " Play along" : " Play on screen") + " · " + esc(gradeName) + "</div>" +
        "<h1>" + esc(g.title.replace(/^\S+ /, "")) + "</h1>" +
        (g.topic.extraTopic ? '<p class="muted" style="max-width:66ch">Every round shows where its facts come from.</p>' : "") +
      "</div>" +
      '<section class="section tight"><div class="wrap">' +
        '<div id="playRoot" class="play-root"></div>' +
        '<p class="muted center mt-3" style="font-size:.88rem">🔒 Nothing is saved or sent anywhere. The game runs only on this screen.</p>' +
      "</div></section>";
    g.solo = query.solo === "1";
    if (!g.solo) g.playLink = location.href.split("#")[0] + "#/game?topic=" + encodeURIComponent(query.topic) + "&grade=" + grade + "&solo=1";
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
        "Virginia Jump$tart's Teen Teach-In–style workshops. " +
        "No personal data is collected. © " + new Date().getFullYear() + " · Built by a student volunteer.";
    }
    // active nav link
    var route = (location.hash || "#/").split("?")[0].replace("#/", "").split("/")[0];
    if (route === "play") route = "games";
    if (route === "game" || route === "game-cards") route = "builder";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-route") === route);
    });
    // close mobile menu
    var nl = document.getElementById("navLinks");
    if (nl) nl.classList.remove("open");
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
    var asking = document.getElementById("studentsOverlay");
    if (asking) asking.remove();
    window.scrollTo(0, 0);
    var raw = (location.hash || "#/").slice(1); // remove '#'
    var parts = raw.split("?");
    var path = parts[0].replace(/^\//, "");
    var query = parseQuery(parts[1]);
    var seg = path.split("/");

    switch (seg[0]) {
      case "": return renderHome();
      // The Modules tab was folded into Resources.
      case "modules": location.replace("#/resources"); return;
      // Only present when modules are tagged with official lessons.
      case "resources": return officialModules().length ? renderResources() : renderNotFound();
      case "games": return renderGames(query);
      case "play": return renderPlay(seg[1]);
      case "game": return renderTopicGame(query);
      case "game-cards": return renderGameCards(query);
      case "module": return renderModule(seg[1]);
      case "challenge": return renderChallenge(seg[1], query.practice === "1");
      // The Facilitator dashboard was folded into the builder's game.
      case "facilitator": return renderBuilderCombined(query);
      case "prep": return renderPrep(query);
      // Toolkit builder and lesson generator are now one page.
      case "builder":
      case "generator": return renderBuilderCombined(query);
      case "helper": return renderHelper();
      // The Impact tab was removed; old links land on the home page.
      case "impact": location.replace("#/"); return;
      case "take-home": return renderTakeHome(seg[1]);
      default: return renderNotFound();
    }
  }

  // Mobile menu toggle
  document.getElementById("navToggle").addEventListener("click", function () {
    document.getElementById("navLinks").classList.toggle("open");
  });
  window.addEventListener("hashchange", route);
  window.addEventListener("DOMContentLoaded", route);
  // In case DOMContentLoaded already fired
  if (document.readyState !== "loading") route();
})();
