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
  // plan, run the Facilitator, or play an on-screen game (spec 09).
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

  // --- facilitator dashboard -------------------------------------------
  await go('#/facilitator');
  if (!(await p.$('#studentsInput'))) probs.push('facilitator: no students question');
  await answerStudents();
  await p.waitForTimeout(500);
  await p.selectOption('#modSelect', ids[Math.min(4, ids.length - 1)]);
  await jsClick('#nextBtn');
  await jsClick('#modeToggle button[data-mode="hotseat"]');
  await jsClick('#dlBtn');
  if (!(await p.waitForSelector('#exitText', { timeout: 2000 }).then(() => 1).catch(() => 0))) {
    probs.push('facilitator: exit summary panel did not appear');
  }
  await jsClick('#copyExit');

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
  }

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
  await go('#/facilitator');
  if (await p.$('#studentsInput')) probs.push('students: organizations should not be asked');
  await p.evaluate(() => localStorage.setItem('moneyReady.accountType.v1', 'volunteer'));

  console.log('modules tested:', ids.length);
  console.log('PROBLEMS:', probs.length);
  probs.forEach(x => console.log(' • ' + x));
  await br.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
