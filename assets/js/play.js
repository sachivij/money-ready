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

  // ================================================================
  // TOPIC QUIZ — the game the Workshop Builder makes for a topic.
  // `game` comes from buildTopicGame() (game-bank.js). The class votes
  // any way the room allows; the volunteer counts the votes on screen and
  // reveals the right one (this replaced the Facilitator dashboard). K–2 games show two big
  // pictures and read every question aloud with the browser's own voice.
  // ================================================================
  function speak(text) {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) { /* no voice on this device; the volunteer reads aloud */ }
  }
  var canSpeak = typeof window !== "undefined" && !!window.speechSynthesis;

  // Two ways to play:
  //   class (default) — on the room's screen. The volunteer taps an answer
  //     once for every vote counted in the room, then taps Reveal; bars show
  //     the real split. The end screen has a counts-only class summary.
  //   solo (game.solo) — one student on their own device: tap an answer
  //     and see if it's right.
  function quiz(root, game) {
    var pic = game.picture;
    var solo = !!game.solo;
    var order, i, stars, votes;

    function src(r) {
      var s = roundSource(r, game.topic);
      return s ? '<div class="helper-source qz-src">' + (s.url ? "🏛️" : "📚") + " <span>Source: " + esc(s.name) +
        (s.url ? " · " + esc(s.url) : "") + "</span></div>" : "";
    }
    function hear(text) {
      return canSpeak ? '<button class="btn btn-secondary qz-hear" data-say="' + esc(text) + '" aria-label="Hear it">🔊 Hear it</button>' : "";
    }
    function wireHear() {
      root.querySelectorAll("[data-say]").forEach(function (b) {
        b.addEventListener("click", function () { speak(b.getAttribute("data-say")); });
      });
    }
    function sum(v) { return v.reduce(function (a, b) { return a + b; }, 0); }

    function intro() {
      root.innerHTML =
        '<div class="play-panel center' + (pic ? " qz-pic" : "") + '"><div class="qz-hero" aria-hidden="true">' + esc(game.topic.emoji) + "</div>" +
        "<h2>" + esc(game.title) + "</h2>" +
        '<p class="muted">' + game.rounds.length + " rounds" + (pic ? " · two big pictures each time, read aloud" : "") + "</p>" +
        '<ol class="numbered qz-how">' +
          (solo
            ? "<li>Read the question" + (pic ? " or tap 🔊." : ".") + "</li><li>Tap your answer.</li><li>See if you're right and why. ⭐ for each right answer.</li>"
            : "<li>" + (pic ? "Tap 🔊 or read the question out loud." : "Read the question out loud.") + "</li>" +
              "<li>Students vote: " + (pic ? "point, walk to a picture, or raise hands" : "hands, corners, thumbs") +
                (game.playLink ? ", or on their own device" : "") + ".</li>" +
              "<li>Tap an answer once for <strong>every vote</strong> you count. Made a mistake? Tap ↩ Undo.</li>" +
              "<li>Tap <strong>Reveal</strong> to see the answer and how the class voted.</li>") +
        "</ol>" +
        (!solo && game.playLink
          ? '<div class="qz-link"><strong>📱 Students with devices can play along:</strong><div class="play-link">' + esc(game.playLink) + "</div>" +
            '<span class="muted" style="font-size:.82rem">Their taps stay on their own device, so still count their votes here (ask them to raise hands).</span></div>'
          : "") +
        '<button class="btn btn-primary btn-lg mt-2" id="qzGo">▶ Start</button></div>';
      document.getElementById("qzGo").addEventListener("click", function () {
        order = shuffle(game.rounds).map(function (r) {
          // Shuffle each round's answers once, so counting doesn't jump around.
          return { r: r, opts: shuffle(r.opts.map(function (o, k) { return { e: o[0], t: o[1], k: k }; })) };
        });
        votes = order.map(function (x) { return x.r.opts.map(function () { return 0; }); });
        i = 0; stars = 0;
        ask();
      });
    }

    function ask() {
      var x = order[i], r = x.r, v = votes[i], n = sum(v), undo = [];
      function draw() {
        n = sum(v);
        root.innerHTML =
          '<div class="play-panel' + (pic ? " qz-pic" : "") + '">' +
          '<div class="eyebrow">Round ' + (i + 1) + " of " + order.length + ' · <span aria-label="' + stars + ' stars">⭐ ' + stars + "</span>" +
            (solo ? "" : ' · <span id="qzCount">' + n + " vote" + (n === 1 ? "" : "s") + " counted</span>") + "</div>" +
          '<div class="qz-q"><h2>' + esc(r.q) + "</h2>" + hear(r.q) + "</div>" +
          '<div class="qz-opts' + (x.opts.length === 2 ? " two" : "") + '">' +
            x.opts.map(function (o) {
              return '<button class="qz-opt" data-k="' + o.k + '" aria-label="' + esc(o.t) + (solo ? "" : ", " + v[o.k] + " votes") + '">' +
                '<span class="qz-emoji" aria-hidden="true">' + o.e + '</span><span class="qz-label">' + esc(o.t) + "</span>" +
                (solo ? "" : '<span class="qz-votes">' + (v[o.k] ? v[o.k] + (v[o.k] === 1 ? " vote" : " votes") : "tap to count") + "</span>") +
                "</button>";
            }).join("") +
          "</div>" +
          (solo ? "" :
            '<div class="flex gap wrap-flex mt-3" style="justify-content:center">' +
              '<button class="btn btn-secondary" id="qzUndo"' + (undo.length ? "" : " disabled") + ">↩ Undo</button>" +
              '<button class="btn btn-primary btn-lg" id="qzReveal">Reveal the answer →</button></div>') +
          "</div>";
        root.querySelectorAll(".qz-opt").forEach(function (b) {
          b.addEventListener("click", function () {
            var k = Number(b.getAttribute("data-k"));
            if (solo) { v[k] = 1; return answer(); }
            v[k]++; undo.push(k); draw();
            var again = root.querySelector('.qz-opt[data-k="' + k + '"]');
            if (again) again.focus();
          });
        });
        if (!solo) {
          document.getElementById("qzUndo").addEventListener("click", function () {
            if (undo.length) { v[undo.pop()]--; draw(); }
          });
          document.getElementById("qzReveal").addEventListener("click", answer);
        }
        wireHear();
      }
      draw();
      if (pic) speak(r.q);
      root.querySelector(".qz-opt").focus();
    }

    function answer() {
      var x = order[i], r = x.r, v = votes[i], n = sum(v);
      var any = r.best < 0;
      var top = v.indexOf(Math.max.apply(null, v));
      // Solo: right if they tapped it. Class: right if the most votes went to it.
      var right = any ? true : n ? v[r.best] === v[top] : null;
      if (right) stars++;
      var last = i >= order.length - 1;
      var best = any ? null : r.opts[r.best];
      var head = any ? "Any answer is OK!"
        : right === null ? "Here's the answer:"
        : right ? (solo ? "Yes! That's right." : "Yes! Most of the class got it.")
        : (solo ? "Not quite. The answer is:" : "Good try! The answer is:");
      root.innerHTML =
        '<div class="play-panel' + (pic ? " qz-pic" : "") + '">' +
        '<div class="eyebrow">Round ' + (i + 1) + " of " + order.length + " · ⭐ " + stars + "</div>" +
        '<div class="ib-result ' + (right === false ? "no" : "ok") + ' qz-result" role="status">' +
          '<div class="qz-big" aria-hidden="true">' + (right === false ? "🤔" : "🎉") + "</div>" +
          "<strong>" + esc(head) + "</strong>" +
          (best ? '<div class="qz-answer"><span class="qz-emoji" aria-hidden="true">' + best[0] + "</span> " + esc(best[1]) + "</div>" : "") +
          "<p>" + esc(r.why) + "</p>" + hear(r.why) +
        "</div>" +
        (!solo && n
          ? '<div class="qz-bars" aria-label="How the class voted">' + x.opts.map(function (o) {
              var pct = Math.round((v[o.k] / n) * 100);
              var ok = any || o.k === r.best;
              return '<div class="result-bar"><div class="rb-top"><span>' + o.e + " " + esc(o.t) + (ok && !any ? " ✓" : "") + "</span><span>" +
                v[o.k] + " · " + pct + '%</span></div><div class="rb-track"><div class="rb-fill ' + (ok ? "best" : "other") +
                '" style="width:' + Math.max(pct, 2) + '%"></div></div></div>';
            }).join("") + "</div>"
          : "") +
        src(r) +
        '<div class="center mt-3"><button class="btn btn-primary btn-lg" id="qzNext">' + (last ? "See our stars →" : "Next round →") + "</button></div></div>";
      wireHear();
      if (pic) speak((right ? "Yes! " : "") + r.why);
      document.getElementById("qzNext").addEventListener("click", function () {
        if (last) return finish();
        i++;
        ask();
      });
      document.getElementById("qzNext").focus();
    }

    // Counts-only summary of how the class voted, for the volunteer's notes.
    function summary() {
      var lines = ["Money Ready game summary (counts only, no names)", game.title.replace(/^\S+ /, ""), ""];
      order.forEach(function (x, k) {
        var v = votes[k], n = sum(v), r = x.r;
        lines.push("Round " + (k + 1) + ": " + r.q);
        lines.push(n ? "  " + n + " votes, " + Math.round(((r.best < 0 ? n : v[r.best]) / n) * 100) + "% picked " +
          (r.best < 0 ? "an answer (any is OK)" : '"' + r.opts[r.best][1] + '"') : "  No votes counted");
      });
      return lines.join("\n");
    }

    function finish() {
      var srcs = game.sources || [];
      var counted = !solo && votes.some(function (v) { return sum(v) > 0; });
      root.innerHTML =
        '<div class="play-panel center' + (pic ? " qz-pic" : "") + '"><div class="qz-hero" aria-hidden="true">' +
          new Array(stars + 1).join("⭐") + (stars ? "" : "🌱") + "</div>" +
        "<h2>" + (solo ? "You got " : "We got ") + stars + " of " + order.length + " stars!</h2>" +
        '<p class="muted">What we learned:</p>' +
        '<ul class="play-list" style="text-align:left;max-width:560px;margin:0 auto">' +
          order.map(function (x) { return "<li>" + esc(x.r.why) + "</li>"; }).join("") + "</ul>" +
        (counted
          ? '<details class="mt-2" style="text-align:left;max-width:560px;margin-left:auto;margin-right:auto"><summary style="cursor:pointer;font-weight:700">How the class voted (counts only)</summary>' +
            '<pre id="qzSummary" class="qz-summary">' + esc(summary()) + "</pre>" +
            '<button class="btn btn-secondary" id="qzCopy">📋 Copy summary</button> <span id="qzCopied" class="muted" style="font-size:.85rem"></span></details>'
          : "") +
        (srcs.length ? '<p class="muted mt-2" style="font-size:.88rem">Sources: ' +
          srcs.map(function (s) { return esc(s.name) + (s.url ? " (" + esc(s.url) + ")" : ""); }).join("; ") + "</p>" : "") +
        '<div class="flex gap wrap-flex mt-3" style="justify-content:center">' +
          '<button class="btn btn-primary" id="qzAgain">Play again</button></div></div>';
      if (pic) speak((solo ? "You got " : "We got ") + stars + " stars!");
      var copy = document.getElementById("qzCopy");
      if (copy) copy.addEventListener("click", function () {
        var done = function (ok) { document.getElementById("qzCopied").textContent = ok ? "Copied!" : "Select the text above to copy it."; };
        try { navigator.clipboard.writeText(summary()).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
      });
      document.getElementById("qzAgain").addEventListener("click", intro);
      document.getElementById("qzAgain").focus();
    }

    intro();
  }

  return { "savings-quest": savingsQuest, inbox: inbox, quiz: quiz };
})();
