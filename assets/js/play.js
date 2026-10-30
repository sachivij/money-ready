/*
 * play.js — on-screen versions of games
 * -------------------------------------
 * Each engine draws one game into a container. The words, events and
 * messages live with the game in GAME_FORMATS (lessons.js), so they can
 * be edited without touching this file. A game opts in with
 * `play: { engine: "<name>", ... }`; app.js serves it at #/play/<game id>.
 *
 * Nothing here is stored or sent anywhere. Scores live only on the screen
 * and disappear when the page changes.
 */
var PLAY_ENGINES = (function () {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function coins(n) { return n + (n === 1 ? " coin" : " coins"); }

  // ================================================================
  // SAVINGS QUEST
  // Each week: earn pay, choose how much to save, draw a Life Happens
  // card. Costs come from the wallet first, then the Save jar. Every
  // second week a jar of 5 or more earns 1 bonus coin per 5. What is
  // left in the wallet is spent on fun at the end of the week.
  // ================================================================
  function questWeek(st, save, ev, week, pay) {
    var out = { save: save, event: ev, raid: 0, unpaid: 0, bonus: 0, fun: 0 };
    var wallet = pay - save;
    st.jar += save;
    if (ev.amount > 0) wallet += ev.amount;
    if (ev.amount < 0) {
      var cost = -ev.amount;
      var fromWallet = Math.min(wallet, cost);
      wallet -= fromWallet;
      cost -= fromWallet;
      out.raid = Math.min(st.jar, cost);
      st.jar -= out.raid;
      out.unpaid = cost - out.raid;
      if (out.raid) st.raids++;
    }
    if (week % 2 === 0 && st.jar >= 5) {
      out.bonus = Math.floor(st.jar / 5);
      st.jar += out.bonus;
    }
    out.fun = wallet;
    st.fun += wallet;
    return out;
  }
  // The same cards played with a fixed saving amount, for comparison.
  function questSimulate(deck, save, pay) {
    var st = { jar: 0, fun: 0, raids: 0 };
    deck.forEach(function (ev, i) { questWeek(st, Math.min(save, pay), ev, i + 1, pay); });
    return st;
  }

  function savingsQuest(root, game) {
    var cfg = game.play;
    var weeks = cfg.weeks || 6;
    var pay = cfg.pay || 5;
    var st, deck, goal, save;

    function start(keepDeck) {
      st = { jar: 0, fun: 0, raids: 0, week: 1, log: [] };
      deck = keepDeck && deck ? deck : shuffle(cfg.events).slice(0, weeks);
      save = 3;
      if (goal) week(); else pickGoal();
    }

    function bar() {
      var pct = Math.min(100, Math.round((st.jar / goal.cost) * 100));
      return '<div class="pq-goal"><span class="pq-goal-emoji" aria-hidden="true">' + goal.emoji + "</span>" +
        "<div style=\"flex:1\"><strong>Goal: " + esc(goal.name) + " · " + coins(goal.cost) + "</strong>" +
        '<div class="pq-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + goal.cost + '" aria-valuenow="' + st.jar +
          '" aria-label="Save jar"><span style="width:' + pct + '%"></span></div>' +
        '<span class="muted" style="font-size:.9rem">🫙 Save jar: <strong>' + coins(st.jar) + "</strong> of " + goal.cost + "</span></div></div>";
    }

    function pickGoal() {
      root.innerHTML =
        '<div class="play-panel"><h2>What is the class saving for?</h2>' +
        '<p class="muted">Take a quick vote, then tap the goal.</p>' +
        '<div class="play-choices">' +
          cfg.goals.map(function (g, i) {
            return '<button class="play-choice" data-goal="' + i + '"><span class="pc-emoji" aria-hidden="true">' + g.emoji + "</span>" +
              "<strong>" + esc(g.name) + "</strong><span>" + coins(g.cost) + "</span></button>";
          }).join("") +
        "</div></div>";
      root.querySelectorAll("[data-goal]").forEach(function (b) {
        b.addEventListener("click", function () {
          goal = cfg.goals[Number(b.getAttribute("data-goal"))];
          week();
        });
      });
      focusFirst();
    }

    function week() {
      root.innerHTML =
        '<div class="play-panel">' + bar() +
        '<div class="eyebrow mt-3">Week ' + st.week + " of " + weeks + "</div>" +
        "<h2>You earned " + coins(pay) + " this week.</h2>" +
        '<p class="muted">How many go into the Save jar? The rest goes in your wallet for this week.</p>' +
        '<div class="pq-split">' +
          '<button class="btn btn-secondary pq-step" id="pqLess" aria-label="Save one less">−</button>' +
          '<div class="pq-split-out" aria-live="polite"><div><span class="pq-big" id="pqSave">' + save + '</span><span>🫙 Save</span></div>' +
            '<div><span class="pq-big" id="pqSpend">' + (pay - save) + "</span><span>👛 Wallet</span></div></div>" +
          '<button class="btn btn-secondary pq-step" id="pqMore" aria-label="Save one more">+</button>' +
        "</div>" +
        '<div class="center mt-3"><button class="btn btn-primary btn-lg" id="pqGo">Lock it in →</button></div></div>';
      function show() {
        document.getElementById("pqSave").textContent = save;
        document.getElementById("pqSpend").textContent = pay - save;
      }
      document.getElementById("pqLess").addEventListener("click", function () { if (save > 0) { save--; show(); } });
      document.getElementById("pqMore").addEventListener("click", function () { if (save < pay) { save++; show(); } });
      document.getElementById("pqGo").addEventListener("click", reveal);
      focusFirst("#pqGo");
    }

    function reveal() {
      var ev = deck[st.week - 1];
      var r = questWeek(st, save, ev, st.week, pay);
      st.log.push(r);
      var lines = ["🫙 You put " + coins(r.save) + " in the Save jar."];
      if (ev.amount > 0) lines.push("➕ You got " + coins(ev.amount) + " extra.");
      if (r.raid) lines.push("😬 Your wallet couldn't cover it, so " + coins(r.raid) + " came out of the Save jar.");
      if (r.unpaid) lines.push("🧾 You were still " + coins(r.unpaid) + " short — that's when people end up borrowing.");
      if (r.bonus) lines.push("🏦 Bank bonus! Your Save jar earned " + coins(r.bonus) + " of interest.");
      lines.push(r.fun ? "🎉 You spent the " + coins(r.fun) + " left in your wallet on fun." : "👛 Nothing left in the wallet for fun this week.");
      var last = st.week >= weeks;
      root.innerHTML =
        '<div class="play-panel">' + bar() +
        '<div class="eyebrow mt-3">Week ' + st.week + " · Life Happens</div>" +
        '<div class="pq-card" role="status"><span class="pc-emoji" aria-hidden="true">' + ev.emoji + "</span><p>" + esc(ev.text) + "</p></div>" +
        '<ul class="play-list">' + lines.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>" +
        '<div class="center mt-3"><button class="btn btn-primary btn-lg" id="pqNext">' + (last ? "See how we did →" : "Next week →") + "</button></div></div>";
      document.getElementById("pqNext").addEventListener("click", function () {
        if (last) return finish();
        st.week++;
        week();
      });
      focusFirst("#pqNext");
    }

    function finish() {
      var steady = questSimulate(deck, 3, pay);
      var made = st.jar >= goal.cost;
      var savedTotal = st.log.reduce(function (a, r) { return a + r.save; }, 0);
      root.innerHTML =
        '<div class="play-panel">' + bar() +
        '<h2 class="mt-3">' + (made ? "🎉 Goal reached!" : "Not quite there — " + coins(goal.cost - st.jar) + " to go.") + "</h2>" +
        '<div class="grid grid-2 mt-2">' +
          '<div class="pq-compare"><div class="eyebrow">Our class</div>' +
            "<p>Saved <strong>" + coins(savedTotal) + "</strong> over " + weeks + " weeks (" + Math.round((savedTotal / (pay * weeks)) * 100) + "% of pay)</p>" +
            "<p>🫙 Save jar: <strong>" + coins(st.jar) + "</strong><br>🎉 Spent on fun: <strong>" + coins(st.fun) + "</strong><br>😬 Times we raided the jar: <strong>" + st.raids + "</strong></p></div>" +
          '<div class="pq-compare"><div class="eyebrow">A steady saver (3 every week, same cards)</div>' +
            "<p>Saved <strong>" + coins(3 * weeks) + "</strong> (" + Math.round((3 / pay) * 100) + "% of pay)</p>" +
            "<p>🫙 Save jar: <strong>" + coins(steady.jar) + "</strong><br>🎉 Spent on fun: <strong>" + coins(steady.fun) + "</strong><br>😬 Times they raided the jar: <strong>" + steady.raids + "</strong></p></div>" +
        "</div>" +
        '<div class="script-box mt-2"><strong>Talk about it:</strong> ' + esc((game.debrief || []).join(" ")) + "</div>" +
        '<div class="flex gap wrap-flex mt-3" style="justify-content:center">' +
          '<button class="btn btn-primary" id="pqSame">Same cards, new strategy</button>' +
          '<button class="btn btn-secondary" id="pqNew">New game</button></div></div>';
      document.getElementById("pqSame").addEventListener("click", function () { start(true); });
      document.getElementById("pqNew").addEventListener("click", function () { goal = null; start(false); });
      focusFirst("#pqSame");
    }

    function focusFirst(sel) {
      var el = sel ? root.querySelector(sel) : root.querySelector("button");
      if (el && root.getAttribute("data-started")) el.focus();
      root.setAttribute("data-started", "1");
    }

    start(false);
  }

  // ================================================================
  // SCAM OR SAFE? INBOX
  // ================================================================
  function inbox(root, game) {
    var cfg = game.play;
    var clueById = {};
    cfg.clues.forEach(function (c) { clueById[c.id] = c; });
    var list, i, score;

    function pickLevel() {
      root.innerHTML =
        '<div class="play-panel"><h2>Who is playing?</h2>' +
        '<div class="play-choices">' +
          '<button class="play-choice" data-level="younger"><span class="pc-emoji" aria-hidden="true">🧒</span><strong>Younger</strong><span>Grades K–5 · short messages</span></button>' +
          '<button class="play-choice" data-level="older"><span class="pc-emoji" aria-hidden="true">🧑</span><strong>Older</strong><span>Grades 6–12 · trickier messages</span></button>' +
        "</div></div>";
      root.querySelectorAll("[data-level]").forEach(function (b) {
        b.addEventListener("click", function () {
          var lv = b.getAttribute("data-level");
          list = shuffle(cfg.messages.filter(function (m) { return m.level === lv; }));
          i = 0; score = 0;
          ask();
        });
      });
    }

    function phone(m) {
      return '<div class="ib-phone"><div class="ib-from">' + esc(m.from) + "</div>" +
        '<div class="ib-bubble">' + esc(m.text) + "</div></div>";
    }

    function ask() {
      var m = list[i];
      root.innerHTML =
        '<div class="play-panel"><div class="eyebrow">Message ' + (i + 1) + " of " + list.length + " · Score " + score + "</div>" +
        phone(m) +
        '<div class="ib-answers">' +
          '<button class="btn btn-lg ib-btn ib-scam" data-scam="1">✖ Scam</button>' +
          '<button class="btn btn-lg ib-btn ib-safe" data-scam="0">✔ Safe</button>' +
        "</div></div>";
      root.querySelectorAll("[data-scam]").forEach(function (b) {
        b.addEventListener("click", function () { answer(b.getAttribute("data-scam") === "1"); });
      });
      root.querySelector("[data-scam]").focus();
    }

    function answer(saidScam) {
      var m = list[i];
      var right = saidScam === m.scam;
      if (right) score++;
      var last = i >= list.length - 1;
      root.innerHTML =
        '<div class="play-panel"><div class="eyebrow">Message ' + (i + 1) + " of " + list.length + " · Score " + score + "</div>" +
        phone(m) +
        '<div class="ib-result ' + (right ? "ok" : "no") + '" role="status">' +
          "<strong>" + (right ? "✔ Right! " : "✖ Not quite. ") + "This one is " + (m.scam ? "a SCAM." : "SAFE.") + "</strong>" +
          "<p>" + esc(m.why) + "</p></div>" +
        '<div class="ib-clues" aria-label="Clues">' +
          cfg.clues.map(function (c) {
            var on = m.clues.indexOf(c.id) >= 0;
            return '<span class="ib-clue' + (on ? " on" : "") + '">' + (on ? "⚠ " : "") + esc(c.label) + "</span>";
          }).join("") +
        "</div>" +
        '<div class="center mt-3"><button class="btn btn-primary btn-lg" id="ibNext">' + (last ? "See my score →" : "Next message →") + "</button></div></div>";
      document.getElementById("ibNext").addEventListener("click", function () {
        if (last) return finish();
        i++;
        ask();
      });
      document.getElementById("ibNext").focus();
    }

    function finish() {
      root.innerHTML =
        '<div class="play-panel center"><h2>You got ' + score + " of " + list.length + " right.</h2>" +
        '<p class="muted">The four clues to remember:</p>' +
        '<ul class="play-list" style="text-align:left;max-width:520px;margin:0 auto">' +
          cfg.clues.map(function (c) { return "<li><strong>" + esc(c.label) + ":</strong> " + esc(c.tip) + "</li>"; }).join("") +
          "<li><strong>Not sure?</strong> Don't click or reply. Show a trusted adult.</li>" +
        "</ul>" +
        '<div class="flex gap wrap-flex mt-3" style="justify-content:center">' +
          '<button class="btn btn-primary" id="ibAgain">Play again</button></div></div>';
      document.getElementById("ibAgain").addEventListener("click", pickLevel);
      document.getElementById("ibAgain").focus();
    }

    pickLevel();
  }

  return { "savings-quest": savingsQuest, inbox: inbox };
})();
