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
        await p.evaluate(() => { const b = document.querySelector('#qzNext') || document.querySelector('.qz-opt'); if (b) b.click(); });
      }
      if (!(await p.$('#qzAgain'))) probs.push('game ' + id + ' ' + grade + ': never reached the end screen');
      const extra = await p.evaluate(x => !!findTopic(x).extraTopic, id);
      if (extra && (await p.$eval('#playRoot', e => e.textContent)).indexOf('Sources:') < 0) probs.push('game ' + id + ': extra topic shows no sources');
    }
  }
  // The plan shows every round of the topic's game, and extra topics say where facts come from.
  await go('#/builder?topic=insurance-basics&grade=Grades%206%E2%80%938&min=30&group=Whole%20class&dev=none');
  await p.waitForTimeout(150);
  const shown = await p.$$eval('#planOut .round-card', e => e.length);
  if (shown < 4) probs.push('builder: plan shows ' + shown + ' game rounds (want every round)');
  if ((await p.$eval('#planOut', e => e.textContent)).indexOf('Not a Jump$tart module') < 0) probs.push('builder: extra topic plan has no source note');
  // No devices: no screen game, printable answer cards instead.
  if (await p.$('#planOut a[href^="#/game?"]')) probs.push('builder: no-device plan offers an on-screen game');
  if (!(await p.$('#planOut a[href^="#/game-cards?"]'))) probs.push('builder: no-device plan has no printable answer cards');
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

  console.log('modules tested:', ids.length);
  console.log('PROBLEMS:', probs.length);
  probs.forEach(x => console.log(' • ' + x));
  await br.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
