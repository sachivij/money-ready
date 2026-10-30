/*
 * audit.js — end-to-end check of every screen in the toolkit.
 *
 * Drives a real browser over the whole app: every module, every answer,
 * every generated plan, every form. Reports anything broken, plus any
 * JavaScript or console error on any page.
 *
 * It catches the class of bug that unit tests miss here, because this app
 * is almost entirely rendered HTML strings — a typo in a template shows up
 * as a missing element, not a thrown exception.
 *
 * Usage:
 *   cd <the repo>  &&  python3 -m http.server 8000 &
 *   BASE=http://localhost:8000/index.html node scripts/audit.js
 *
 * Needs Playwright. Exit code is 0 either way — read the PROBLEMS count.
 */
const PW = process.env.PLAYWRIGHT_PATH || 'playwright';
const { chromium } = require(PW);
const B = process.env.BASE || 'http://localhost:8000/index.html';

(async () => {
  const probs = [];
  const launch = {};
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const br = await chromium.launch(launch);
  const ctx = await br.newContext({ acceptDownloads: true });
  const p = await ctx.newPage();

  p.on('pageerror', e => probs.push('JS ERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') probs.push('CONSOLE: ' + m.text()); });

  const go = async h => { await p.goto(B + h, { waitUntil: 'networkidle' }); await p.waitForTimeout(110); };
  // Volunteers and teachers are asked how many students before they build a
  // plan or play an on-screen game (spec 09).
  const answerStudents = async () => {
    if (await p.$('#studentsInput')) {
      await p.fill('#studentsInput', '25');
      await p.click('#studentsGo');
      await p.waitForTimeout(40);
    }
  };
  const jsClick = async s => p.evaluate(x => {
    const e = document.querySelector(x); if (e) { e.click(); return 1; } return 0;
  }, s);

  await go('#/');
  // Pick an account type so the role picker does not sit over the page.
  await p.evaluate(() => localStorage.setItem('moneyReady.accountType.v1', 'volunteer'));
  await go('#/modules');
  const ids = await p.$$eval('.module-card', e => e.map(x => x.getAttribute('href').split('/').pop()));

  // --- every module: detail, all four answers, reveal, take-home -------
  for (const id of ids) {
    await go('#/module/' + id);
    if (!(await p.$('#app h1'))) probs.push('module ' + id + ': no h1');

    for (let i = 0; i < 4; i++) {
      await go('#/challenge/' + id);
      await jsClick('#answers .answer-btn[data-i="' + i + '"]');
      const ok = await p.waitForSelector('#reveal', { timeout: 2500 }).then(() => 1).catch(() => 0);
      if (!ok) { probs.push('challenge ' + id + ' ans' + i + ': no reveal'); continue; }
      const t = await p.$eval('#reveal', e => e.textContent);
      ['Best answer', 'Why it works', 'Key concept', 'Common trap', 'Discuss', 'Apply it']
        .forEach(k => { if (t.indexOf(k) < 0) probs.push('reveal ' + id + ': missing ' + k); });
      await jsClick('#confidence .chip-toggle[data-n="3"]');
    }

    await go('#/take-home/' + id);
    if ((await p.$$eval('.th-box', e => e.length)) !== 3) probs.push('take-home ' + id + ': wrong box count');
  }

  // --- the old Facilitator link opens the builder; the game counts votes ---
  await go('#/facilitator');
  if (!(await p.$('#genLesson'))) probs.push('facilitator: old link does not open the builder');
  await go('#/game?topic=needs-vs-wants&grade=35');
  await jsClick('#qzGo');
  await jsClick('.qz-opt');
  await jsClick('.qz-opt');
  await jsClick('.qz-opt:nth-child(2)');
  if ((await p.$eval('#qzCount', e => e.textContent)).indexOf('3 votes') < 0) probs.push('game: vote counting does not add up');
  await jsClick('#qzUndo');
  if ((await p.$eval('#qzCount', e => e.textContent)).indexOf('2 votes') < 0) probs.push('game: undo does not take a vote away');
  await jsClick('#qzReveal');
  if (!(await p.$('.qz-bars'))) probs.push('game: reveal does not show how the class voted');
  await go('#/game?topic=needs-vs-wants&grade=35&solo=1');
  await jsClick('#qzGo');
  await jsClick('.qz-opt');
  if (!(await p.$('#qzNext'))) probs.push('game: solo play does not answer on one tap');

  // --- volunteer prep: every topic --------------------------------------
  await go('#/prep');
  for (const id of ids) {
    await p.selectOption('#pTopic', id);
    await p.waitForTimeout(40);
    if (!(await p.$('#prepContent .script-box'))) probs.push('prep ' + id + ': no opening script');
  }

  // --- workshop builder: every topic ------------------------------------
  await go('#/builder');
  for (const id of ids) {
    await p.selectOption('#gTopic', id);
    await jsClick('#genLesson');
    await answerStudents();
    await p.waitForTimeout(60);
    const n = await p.$$eval('#planOut .packet-item', e => e.length);
    if (n !== 7) probs.push('builder ' + id + ': ' + n + ' packet items (want 7)');
    const st = await p.$$eval('#planOut .plan-step', e => e.length);
    if (st < 5) probs.push('builder ' + id + ': only ' + st + ' plan steps');
    if (!(await p.$('#planOut a[href^="#/game"]'))) probs.push('builder ' + id + ': no game in the plan');
  }

  // --- builder games: every topic (modules + extra topics) × age group ----
  const topicIds = await p.$$eval('#gTopic option', e => e.map(x => x.value));
  if (topicIds.length <= ids.length) probs.push('builder: no extra topics in the topic list');
  for (const id of topicIds) {
    for (const grade of ['k2', '35', '68', '912']) {
      await go('#/game?topic=' + id + '&grade=' + grade);
      if (!(await p.$('#qzGo'))) { probs.push('game ' + id + ' ' + grade + ': no start button'); continue; }
      await jsClick('#qzGo');
      if (grade === 'k2' && (await p.$$eval('.qz-opt', e => e.length)) !== 2) probs.push('game ' + id + ' k2: not two pictures');
      for (let i = 0; i < 30 && !(await p.$('#qzAgain')); i++) {
        await p.evaluate(() => {
          const n = document.querySelector('#qzNext'); if (n) return n.click();
          const o = document.querySelector('.qz-opt'); if (o) o.click();
          const r = document.querySelector('#qzReveal'); if (r) r.click();
        });
      }
      if (!(await p.$('#qzAgain'))) probs.push('game ' + id + ' ' + grade + ': never reached the end screen');
      const extra = await p.evaluate(x => !!findTopic(x).extraTopic, id);
      if (extra && (await p.$eval('#playRoot', e => e.textContent)).indexOf('Sources:') < 0) probs.push('game ' + id + ': extra topic shows no sources');
    }
  }
  // The plan shows every round of the topic's game, and extra topics say where facts come from.
  await go('#/builder?topic=insurance-basics&grade=Grades%206%E2%80%938&min=30&group=Whole%20class&dev=none');
  await p.waitForTimeout(150);
  await answerStudents();
  const shown = await p.$$eval('#planOut .round-card', e => e.length);
  if (shown < 4) probs.push('builder: plan shows ' + shown + ' game rounds (want every round)');
  if ((await p.$eval('#planOut', e => e.textContent)).indexOf('Not a Jump$tart module') < 0) probs.push('builder: extra topic plan has no source note');
  // No devices: no screen game, printable answer cards instead.
  if (await p.$('#planOut a[href^="#/game?"]')) probs.push('builder: no-device plan offers an on-screen game');
  if (!(await p.$('#planOut a[href^="#/game-cards?"]'))) probs.push('builder: no-device plan has no printable answer cards');
  await go('#/builder?topic=insurance-basics&grade=Grades%206%E2%80%938&min=30&group=Whole%20class&dev=devices');
  await p.waitForTimeout(150);
  await answerStudents();
  if (!(await p.$('#planOut a[href^="#/game?"]'))) probs.push('builder: devices plan has no on-screen game');
  if ((await p.$$eval('#gDev .chip-toggle', e => e.length)) !== 2) probs.push('builder: device question should have two choices');
  await go('#/game-cards?topic=needs-vs-wants&grade=k2');
  if ((await p.$$eval('.pcard-round', e => e.length)) < 5) probs.push('game cards: missing rounds or answer key');
  await go('#/builder');
  await p.fill('#gFind', 'how do taxes work');
  await jsClick('#gFindBtn');
  if (!(await p.$('#gFindOut [data-pick="taxes-community"]'))) probs.push('builder: topic search missed taxes');
  await p.fill('#gFind', 'zzz qqq');
  await jsClick('#gFindBtn');
  if ((await p.$eval('#gFindOut', e => e.textContent)).indexOf('No checked content') < 0) probs.push('builder: topic search must not invent topics');
  await go('#/game?topic=no-such-topic');
  if ((await p.$eval('#app', e => e.textContent)).indexOf('not found') < 0) probs.push('game: unknown topic not handled');

  // --- standards helper: a hit, and the no-match fallback -----------------
  await go('#/helper');
  await p.fill('#q', 'how do I spot a scam');
  await jsClick('#askBtn');
  if (!(await p.waitForSelector('#ans .helper-answer', { timeout: 1500 }).then(() => 1).catch(() => 0))) {
    probs.push('helper: no answer for a known question');
  }
  await p.fill('#q', 'zzz qqq 999');
  await jsClick('#askBtn');
  await p.waitForTimeout(120);
  if ((await p.$eval('#ans', e => e.textContent)).indexOf("don't have a grounded") < 0) {
    probs.push('helper: missing the no-match fallback (it must never guess)');
  }

  // --- games, impact, unknown route ---------------------------------------
  await go('#/games');
  if ((await p.$$eval('.game-card', e => e.length)) < 10) probs.push('games: too few game cards');

  // --- on-screen games: play each one to the end ---------------------------
  const playIds = await p.$$eval('.game-actions a[href^="#/play/"]', e => e.map(x => x.getAttribute('href').split('/').pop()));
  for (const id of playIds) {
    await go('#/play/' + id);
    await answerStudents();
    if (!(await p.$('#playRoot button'))) { probs.push('play ' + id + ': nothing to press'); continue; }
    // Press the main button on each screen (or the first choice) until
    // the game reaches its end screen.
    for (let i = 0; i < 40 && !(await p.$('#pqSame, #ibAgain')); i++) {
      await p.evaluate(() => {
        const r = document.getElementById('playRoot');
        const b = r && (r.querySelector('.btn-primary') || r.querySelector('button'));
        if (b) b.click();
      });
      await p.waitForTimeout(20);
    }
    if (!(await p.$('#pqSame, #ibAgain'))) probs.push('play ' + id + ': never reached the end screen');
  }
  await go('#/play/no-such-game');
  if ((await p.$eval('#app', e => e.textContent)).indexOf('not found') < 0) probs.push('play: unknown game not handled');

  await go('#/impact');
  if (!(await p.$('.metric-card'))) probs.push('impact: no metric cards');
  await go('#/no-such-page');
  if ((await p.$eval('#app', e => e.textContent)).indexOf('not found') < 0) {
    probs.push('router: unknown route not handled');
  }

  // --- students question: required, validated, not asked of organizations --
  await p.evaluate(() => sessionStorage.clear());
  await go('#/builder');
  await jsClick('#genLesson');
  if (!(await p.$('#studentsInput'))) probs.push('students: not asked before building a plan');
  for (const bad of ['', '0', '-3', '2.5', 'abc', '501']) {
    // Set the value directly: a number box won't let you type letters.
    await p.evaluate(v => {
      const i = document.getElementById('studentsInput');
      i.value = v; i.dispatchEvent(new Event('input'));
    }, bad);
    if (!(await p.$eval('#studentsGo', b => b.disabled))) probs.push('students: accepted "' + bad + '"');
  }
  await p.fill('#studentsInput', '30');
  await p.click('#studentsGo');
  await p.waitForTimeout(60);
  if (await p.$('#studentsInput')) probs.push('students: question did not close after a valid answer');
  if (!(await p.$('#planOut .plan-step'))) probs.push('students: plan not built after answering');
  await jsClick('#genLesson');
  await p.waitForTimeout(40);
  if (await p.$('#studentsInput')) probs.push('students: asked twice for the same plan in one tab');
  await p.evaluate(() => { sessionStorage.clear(); localStorage.setItem('moneyReady.accountType.v1', 'organization'); });
  await go('#/builder?topic=needs-vs-wants');
  if (await p.$('#studentsInput')) probs.push('students: organizations should not be asked');
  await p.evaluate(() => localStorage.setItem('moneyReady.accountType.v1', 'volunteer'));

  console.log('modules tested:', ids.length);
  console.log('PROBLEMS:', probs.length);
  probs.forEach(x => console.log(' • ' + x));
  await br.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
