/*
 * lessons.js — The lesson generator, plus account types and grade settings
 * ------------------------------------------------------------------------
 * Kept separate from data.js so a student or educator can edit lessons
 * and games without touching module definitions or app logic.
 *
 * EDUCATIONAL ONLY. Built around existing financial-literacy topics.
 * Designed to support Teen Teach-In–style workshops.
 *
 * What lives here:
 *   ACCOUNT_TYPES  — who is viewing (volunteer, school, organization)
 *   the lesson generator (buildLessonPlan) and its helpers
 * Games (GAME_FORMATS) and lesson packs (LESSON_PACKS) are content now: edit
 * them in content/games/ and content/modules/ (see content/README.md).
 */

/* ===================================================================
   ACCOUNT TYPES
   Who is using the site. Only the students-reached count (reach.js)
   reads this, to send "volunteer" or "school" with the count.
   =================================================================== */
const ACCOUNT_TYPES = [
  { id: "volunteer", label: "Teen volunteer", emoji: "🙋", blurb: "I teach workshops as a student volunteer." },
  { id: "school", label: "School or teacher", emoji: "🍎", blurb: "We host workshops for our students." },
  { id: "organization", label: "Nonprofit organization", emoji: "🏛️", blurb: "We run or sponsor the program." },
];

/* GAME_FORMATS (the games) now live in content/games/, one file per game;
   scripts/build-content.js turns them into assets/js/content.js. */

/* LESSON_PACKS now live in each content/modules/ file under `lesson_pack`;
   scripts/build-content.js turns them into assets/js/content.js. */

/* ===================================================================
   GRADE PROFILES
   How delivery actually changes by age. The youngest band is
   picture-first: little reading, lots of showing, drawing, and moving.
   =================================================================== */
const GRADE_PROFILES = {
  "Grades K–2": {
    id: "k2",
    pictureBased: true,
    chunk: 5,
    vocabCount: 2,
    readingLevel: "Pre-reading to early reading — assume students cannot read your slides.",
    attention: "About 5 minutes per activity before they need to move.",
    delivery: [
      "Show pictures instead of words. If a slide has a sentence, read it out loud for them.",
      "Use your whole body — point, act it out, make faces. They copy what they see.",
      "Ask for answers with hands, thumbs, or by moving, not by writing.",
      "Repeat the key idea at least three times in three different ways.",
      "Name one idea for the whole session. Two is too many at this age.",
    ],
    language: [
      "Say 'things we must have' instead of 'necessities'.",
      "Say 'money you keep' instead of 'savings'.",
      "Use one short sentence at a time, then pause.",
    ],
    watchFor: "If they start wiggling, you have about 30 seconds before you lose the room — switch to a moving activity.",
  },
  "Grades 3–5": {
    id: "35",
    pictureBased: false,
    chunk: 8,
    vocabCount: 3,
    readingLevel: "Reading independently — short written prompts are fine.",
    attention: "About 8–10 minutes per activity.",
    delivery: [
      "They can read short prompts, but still read important text aloud.",
      "They love being right — build in a chance for everyone to succeed.",
      "Small groups work well now; give each person a job.",
      "Ask 'why do you think that?' after answers, not just 'is it right?'",
    ],
    language: [
      "You can use real terms — 'savings', 'budget', 'goal' — if you define them once.",
      "Use money amounts they recognize: allowance, birthday money, snack prices.",
    ],
    watchFor: "Watch for the confident kid answering everything. Call on quieter students by name.",
  },
  "Grades 6–8": {
    id: "68",
    pictureBased: false,
    chunk: 12,
    vocabCount: 3,
    readingLevel: "Full reading — written scenarios and worksheets work well.",
    attention: "About 12–15 minutes per activity.",
    delivery: [
      "They care what their friends think — let them discuss in pairs before sharing.",
      "Real numbers and real trade-offs land better than made-up ones.",
      "Do not talk down to them. Treat the content as genuinely useful.",
      "Debate works: give them a side to argue.",
    ],
    language: [
      "Use the real vocabulary throughout — interest, trade-off, net pay.",
      "Connect to things they actually spend on: games, food, clothes, phones.",
    ],
    watchFor: "Never ask what anyone's family earns or spends. Keep every example hypothetical.",
  },
  "Grades 9–12": {
    id: "912",
    pictureBased: false,
    chunk: 15,
    vocabCount: 4,
    readingLevel: "Full reading — realistic documents and figures are appropriate.",
    attention: "About 15–20 minutes per activity.",
    delivery: [
      "Lead with why it matters to them right now — jobs, cars, college, phones.",
      "Let them challenge you. Being questioned is a good sign.",
      "Use real-world documents: a pay stub layout, a loan offer, a price tag.",
      "Give them the actual math, not a simplified version.",
    ],
    language: [
      "Use the vocabulary an adult would use, and define it once.",
      "Be honest about the hard parts — debt, taxes, scams that work.",
    ],
    watchFor: "Some students already work or help with family bills. Never assume, never single anyone out.",
  },
};

/* ===================================================================
   DEVICE GUIDES
   What to actually do differently based on what's in the room.
   =================================================================== */
const DEVICE_GUIDES = {
  none: {
    label: "No devices at all",
    icon: "🙌",
    setup: [
      "Print the take-home cards and any item or scenario cards before you arrive.",
      "Clear enough floor space for students to move between four spots.",
      "Bring tape and a marker for labeling corners or areas.",
      "Write the key idea on the board where everyone can see it all session.",
    ],
    voting: "Students vote by moving — walking to a labeled corner, standing on one side of the room, or raising a hand on the count of three.",
    showing: "Read every scenario out loud, twice. Hold up printed cards so everyone can see.",
    results: "Count the students in each group out loud and write the numbers on the board. That is your class results chart.",
    backup: "This setup has no backup needed — nothing can fail on you.",
  },
  shared: {
    label: "One shared screen",
    icon: "📺",
    setup: [
      "Open the module on the shared screen before students arrive and test that it displays.",
      "Stand where you can see both the screen and the students' faces.",
      "Still print the take-home cards — those go home with students.",
      "Have a marker ready in case the screen fails.",
    ],
    voting: "Read the scenario off the screen, take a show of hands for each option, then tap the answer so the reveal does the teaching.",
    showing: "The screen shows the scenario and the reveal. Read it aloud anyway — do not assume everyone can see or read it.",
    results: "The class results bar chart appears on screen. Ask a student from each option to explain their thinking.",
    backup: "If the screen fails, switch to Four Corners — you have the scenario in your notes and it works with nothing.",
  },
  // The Workshop Builder offers two choices: no devices, or devices (a
  // screen in the room and/or students' own devices). Older links that
  // say "shared" or "personal" open as "devices".
  devices: {
    label: "Devices in the room",
    icon: "📺",
    setup: [
      "Open the plan's game on the room's screen (or your laptop) before students arrive and check it displays.",
      "If students have their own devices, write the play-along link on the board.",
      "Stand where you can see both the screen and the students' faces.",
      "Print the take-home cards, and the answer cards as a backup.",
    ],
    voting: "Read each round aloud. Students vote with hands, or on their own device with the play-along link. Tap one answer on the screen for every vote you count, then tap Reveal.",
    showing: "The screen shows the question and answer pictures. Read it aloud anyway — do not assume everyone can see or read it.",
    results: "The bars on the screen show how the class voted. Ask a student from each answer to explain their thinking.",
    backup: "If the screen fails, switch to the printed answer cards — the script has every question.",
  },
  personal: {
    label: "Students have devices",
    icon: "📱",
    setup: [
      "Confirm the room's wifi actually works before the session starts.",
      "Write the link and room code on the board where everyone can see it.",
      "Have a plan for students without a working device — pair them up.",
      "Print the take-home cards regardless.",
    ],
    voting: "Students open the link and vote on their own device. Give a 30-second warning before the timer ends.",
    showing: "Everyone sees the scenario on their own screen, but read it aloud too so nobody falls behind.",
    results: "Results update live. Point out that nobody can see who voted for what — it is anonymous.",
    backup: "Devices fail more often than anything else. Know which unplugged game you would switch to.",
  },
};

/* ===================================================================
   PICTURE-BASED ACTIVITIES (K–2)
   Swaps that need no reading at all.
   =================================================================== */
const PICTURE_ACTIVITIES = [
  {
    name: "Point to the picture",
    how: "Hold up two pictures. Ask the question out loud. Students point at their answer instead of saying or writing it.",
  },
  {
    name: "Thumbs up / thumbs down",
    how: "Say a statement out loud. Thumbs up means yes or need, thumbs down means no or want. Everyone answers at once, so nobody copies.",
  },
  {
    name: "Draw your answer",
    how: "Give each student paper. Instead of writing, they draw the thing they would choose. Then a few share their drawing.",
  },
  {
    name: "Act it out",
    how: "Two volunteers act out the choice while the class watches, then the class votes on what the characters should do.",
  },
  {
    name: "Sorting mat with pictures",
    how: "Two hoops or paper mats on the floor with a picture label on each. Students place picture cards into the right one.",
  },
  {
    name: "Move to the picture",
    how: "Tape a large picture in each corner. Students walk to the picture that matches their answer.",
  },
];

/* ===================================================================
   SETTINGS
   Where the workshop happens changes the setup and the energy level.
   =================================================================== */
const SETTINGS = {
  classroom: {
    label: "School classroom",
    icon: "🏫",
    tips: [
      "Ask the teacher to stay in the room. They know the students and keep the room settled.",
      "Find out the class's quiet signal before you start and use the same one.",
      "Check whether you can write on the board, and where the take-home cards should go at the end.",
    ],
    materials: [],
    energy: 0,
  },
  club: {
    label: "Club or after-school program",
    icon: "🍀",
    tips: [
      "Ages are often mixed. Pair an older student with a younger one so everyone can take part.",
      "Students arrive tired at the end of a school day. Open with something that gets them moving.",
      "There may be no board. Bring chart paper and tape so you can still write the key idea up.",
    ],
    materials: ["Chart paper and tape"],
    energy: 1,
  },
  library: {
    label: "Library or community room",
    icon: "📚",
    tips: [
      "The room may be shared or need to stay quiet. Check the noise rules with the staff before you plan loud games.",
      "Arrive early to move tables. Ask staff how the room should be left afterwards.",
      "People may drop in late. Keep a short welcome ready to catch them up.",
    ],
    materials: ["Chart paper and tape"],
    energy: -1,
  },
};

/* Class sizes offered in the builder, and what each one means for groups. */
const CLASS_SIZES = [
  { value: 10, label: "Up to 10 students" },
  { value: 20, label: "11–20 students" },
  { value: 30, label: "21–30 students" },
  { value: 40, label: "31 or more students" },
];

/* ===================================================================
   LESSON GENERATOR
   Assembles a complete, timed lesson plan from a module's core data,
   its lesson pack, and games that fit the room's device situation.
   =================================================================== */
function buildLessonPlan(moduleId, opts) {
  opts = opts || {};
  var minutes = Number(opts.minutes) || 30;
  var devices = opts.devices === "shared" || opts.devices === "personal" ? "devices" : opts.devices || "none"; // "none" | "devices"
  var grade = opts.grade || "Grades 3–5";
  var groupSize = opts.groupSize || "Whole class";
  var students = Number(opts.students) || 20;
  var settingId = SETTINGS[opts.setting] ? opts.setting : "classroom";
  var setting = SETTINGS[settingId];

  // A module, or one of the extra topics written from trusted sources.
  var mod = findTopic(moduleId);
  if (!mod) return null;
  var pack = LESSON_PACKS[moduleId] || mod.pack || {};

  // How this age group learns, and what the room's technology changes.
  var profile = GRADE_PROFILES[grade] || GRADE_PROFILES["Grades 3–5"];
  var deviceGuide = DEVICE_GUIDES[devices] || DEVICE_GUIDES.none;
  var picture = !!profile.pictureBased;

  // Which games are usable in this room?
  var allowed = devices === "none" ? ["none"]
    : ["none", "shared", "personal"];
  var usableGames = GAME_FORMATS.filter(function (g) {
    return allowed.indexOf(g.devices) >= 0;
  });

  // Rank every usable game by how well it fits this topic, age group,
  // group size, room and time, then take the best. A volunteer can swap
  // to another game (opts.game), and the plan rebuilds around it.
  var ranked = rankGames(usableGames, {
    bestGames: pack.bestGames || [],
    moduleId: moduleId,
    gradeId: profile.id,
    groupSize: groupSize,
    devices: devices,
    gameBudget: Math.max(minutes - 12, 8),
    students: students,
    settingEnergy: setting.energy,
  });
  // One game per plan. By default it is the topic's own rounds run as the
  // best-fitting format (Four Corners, Human Bar Graph...). A multi-round
  // game brings its own rounds, so it only takes over when the volunteer
  // picks it ("Change the game").
  var mainGame = null;
  for (var gi = 0; gi < ranked.length; gi++) {
    if (ranked[gi].id === opts.game) { mainGame = ranked[gi]; break; }
  }
  mainGame = mainGame || ranked.filter(function (g) { return !g.multiRound; })[0] || ranked[0];
  var alternatives = ranked.filter(function (g) { return g !== mainGame; }).slice(0, 3);

  // Build the timed sequence, scaled to the requested length.
  // `how` is the concrete do-this-now instruction, tailored to the grade
  // and to what technology is actually in the room.
  var steps = [];
  function add(name, mins, what, script, how) {
    steps.push({ id: steps.length, name: name, minutes: mins, what: what, script: script || "", how: how || "" });
  }

  var short = minutes <= 20;
  var long = minutes >= 45;
  var vocabList = ((mod.prep && mod.prep.vocab) || []).slice(0, profile.vocabCount);

  add("Welcome & hook", short ? 3 : 5,
    pack.hook || "Open with a question that connects the topic to the students' own lives.",
    mod.prep && mod.prep.openingScript,
    picture
      ? "Hold up an object or a picture rather than explaining. Ask the question out loud and let them answer by pointing or with thumbs up and down. Do not put any text on screen."
      : "Ask the question and wait a full five seconds before taking answers. The silence is uncomfortable but it gets more hands up.");

  add("Mini-lesson", short ? 4 : 7,
    pack.miniLesson || mod.summary,
    "",
    picture
      ? "Say the one big idea in a single short sentence, then say it again two more ways. Draw it on the board as a simple picture. No slides full of words — they cannot read them yet."
      : deviceGuide.showing);

  if (!short) {
    add("Key vocabulary", 4,
      "Teach the words students need: " + vocabList.map(function (v) { return v.term; }).join(", ") + ".",
      "",
      picture
        ? "Teach only " + profile.vocabCount + " words. For each one: say it, draw it, have the class say it back and make a hand motion for it. The motion is what they will remember."
        : "Say each word, give the plain-English meaning, then ask for an example from their own life before moving on.");
  }

  // The ready-to-play game for this topic and age group (game-bank.js).
  var topicGame = buildTopicGame(moduleId, profile.id);

  if (mainGame) {
    // The game's own version for this age group, when it has one.
    var fit = mainGame.levels && mainGame.levels[profile.id];
    var forGrade = fit ? "For " + grade + ": " + fit + " " : "";
    // Multi-round games bring their own rounds and cards, so the module's
    // unplugged swap and the room's voting method would contradict them.
    var swap = !mainGame.multiRound && devices === "none" && pack.unpluggedSwap;
    // Single-question formats get their questions from the topic game.
    var useRounds = !mainGame.multiRound && topicGame && topicGame.rounds.length;
    add("Main activity — " + mainGame.name, mainGame.minutes,
      mainGame.summary + (swap ? " " + pack.unpluggedSwap : "") +
        (useRounds ? " Questions: use the " + topicGame.rounds.length + " rounds of \"" + topicGame.title.replace(/^\S+ /, "") +
          "\" below" + (devices === "none" ? " (print the game cards)." : " (play them on screen).") : ""),
      "",
      mainGame.multiRound
        ? forGrade + "Full rules and printable cards: Games → " + mainGame.name + "."
        : (forGrade || (picture ? "Picture version: " + PICTURE_ACTIVITIES[0].how + " " : "")) + deviceGuide.voting);
  }

  add("Guided practice", short ? 4 : 6,
    pack.guidedPractice || "Work through an example together as a class.",
    "",
    picture
      ? "Do it together on the board with drawings, not words. Ask the class to tell you where each picture goes — you hold the marker, they make the decisions."
      : "Do the first one together, the second one in pairs, the third one on their own. Release it gradually.");

  if (long) {
    add("Extension", 6,
      pack.extension || "Give students a challenge that stretches the idea further.", "",
      picture ? "Give them paper and let them draw it. Drawing is how this age shows you what they understood." : "For students who finish early, ask them to explain it to someone who was not paying attention.");
  }

  add("Check for understanding", short ? 3 : 5,
    pack.checkUnderstanding || "Confirm every student can state the key idea.",
    "",
    picture
      ? "Ask the one big idea as a thumbs up or thumbs down question, or have them point to the right picture. Do not ask them to write anything."
      : "Ask every student to answer, not just volunteers — a quick go-round or a written exit ticket (no names on it).");

  add("Wrap-up & take-home", short ? 3 : 5,
    "Hand out the take-home card: \"" + (mod.takeHome && mod.takeHome.title) + "\". Family question: " +
    (mod.takeHome && mod.takeHome.familyQuestion),
    "",
    picture
      ? "Show the card and point to each box so they know what goes where. Tell them the drawing part is the homework — a grown-up can do the writing."
      : "Read the family question aloud and tell them who to ask at home. Say the one big idea one last time as they leave.");

  // Official Teen Teach-In lesson: follow the real deck's order instead.
  // Only for modules tagged officialLesson, so untagged editions never see it.
  var official = (typeof OFFICIAL_LESSONS !== "undefined" && mod.officialLesson && OFFICIAL_LESSONS[moduleId]) || null;
  var useOfficial = !!official && opts.official !== false;
  var officialActivity = null;
  if (useOfficial) {
    steps = official.steps.map(function (st, i) {
      var copy = { id: i, name: st.name, minutes: st.minutes, what: st.what, script: st.script || "", how: st.how || "", slides: st.slides || "" };
      if (st.activity) {
        officialActivity = copy;
        // A game picked with "Try a different main activity" replaces the deck's activity.
        if (opts.game && mainGame && mainGame.id === opts.game) {
          copy.name = "Main activity — " + mainGame.name;
          copy.what = mainGame.summary + " Use this lesson's ideas: " + official.bigIdea;
          copy.how = (picture ? "Picture version: " + PICTURE_ACTIVITIES[0].how + " " : "") + deviceGuide.voting;
          copy.slides = "";
        } else {
          copy.name = "Main activity — " + st.name;
        }
      }
      if (picture && i === 0) copy.how += " Grades K–2: say everything out loud and point to the pictures. Assume they can't read the slides.";
      return copy;
    });
    if (!(opts.game && mainGame && mainGame.id === opts.game)) mainGame = null;
    alternatives = ranked.slice(0, 2);
    vocabList = official.vocab;
  }

  // Fit the plan to the time actually available. A volunteer with a hard
  // 15-minute slot has 15 minutes, so scale the steps to match rather than
  // handing them a plan that overruns. Every step keeps at least 2 minutes,
  // or 1 when the slot is too short for that.
  var total = steps.reduce(function (sum, s) { return sum + s.minutes; }, 0);
  var floor = minutes >= steps.length * 2 ? 2 : 1;
  if (total > minutes) {
    var floorTotal = steps.length * floor;
    if (minutes > floorTotal) {
      // Shrink everything above the floor proportionally.
      var slack = total - floorTotal;
      var keep = minutes - floorTotal;
      steps.forEach(function (s) {
        s.minutes = floor + Math.round((s.minutes - floor) * (keep / slack));
      });
    } else {
      // Asked for less time than the plan's minimum — give every step the floor.
      steps.forEach(function (s) { s.minutes = floor; });
    }
  } else if (total < minutes && useOfficial) {
    // The official decks are paced as a whole, so a longer slot stretches
    // every step a little rather than only the activity.
    steps.forEach(function (s) { s.minutes = Math.round(s.minutes * minutes / total); });
  }
  // Rounding can leave the total a minute or two off; settle it on the main
  // activity (or the longest step) so the numbers add up to what the plan claims.
  total = steps.reduce(function (sum, s) { return sum + s.minutes; }, 0);
  var drift = total - minutes;
  if (drift > 0) {
    var longest = steps.slice().sort(function (a, b) { return b.minutes - a.minutes; })[0];
    if (longest && longest.minutes - drift >= floor) longest.minutes -= drift;
  } else if (drift < 0) {
    // A plan that comes in short gives the spare minutes to the main
    // activity (more rounds, more discussion), so it fills the slot exactly.
    var roomy = steps.filter(function (s) { return s.name.indexOf("Main activity") === 0; })[0] ||
      steps.filter(function (s) { return s.name === "Guided practice"; })[0] ||
      steps.slice().sort(function (a, b) { return b.minutes - a.minutes; })[0];
    if (roomy) roomy.minutes -= drift;
  }
  total = steps.reduce(function (sum, s) { return sum + s.minutes; }, 0);

  // The volunteer's own edits: `order` lists which built steps to keep,
  // in the order they want them. Minutes from removed steps go to the main
  // activity so the plan still fills the slot.
  var edited = false;
  if (opts.order && opts.order.length) {
    var kept = [];
    opts.order.forEach(function (i) {
      if (steps[i] && kept.indexOf(steps[i]) < 0) kept.push(steps[i]);
    });
    if (kept.length) {
      edited = true;
      var freed = total - kept.reduce(function (sum, s) { return sum + s.minutes; }, 0);
      if (freed > 0) {
        var target = kept.filter(function (s) { return s.name.indexOf("Main activity") === 0; })[0] ||
          kept.slice().sort(function (a, b) { return b.minutes - a.minutes; })[0];
        target.minutes += freed;
      }
      steps = kept;
    }
  }

  // Group-size guidance.
  var groupTips = {
    "Whole class": "Keep every activity as one group. Use call-and-response and whole-room movement so nobody hides at the back.",
    "Small groups": "Groups of three or four. Give each person a job — reader, recorder, reporter, timekeeper — or one student does everything.",
    "Pairs": "Pairs mean nobody sits out. Have partners agree on an answer before sharing, so the quiet one has already spoken once.",
    "One-on-one": "Go at their pace and let them lead. Ask more questions than you answer.",
  };

  // Word-for-word lines and step-by-step actions for every step.
  writeScripts(steps, {
    mod: mod, pack: pack, picture: picture, devices: devices, gradeId: profile.id,
    vocab: vocabList, mainGame: mainGame, topicGame: topicGame,
  });
  // Official-deck steps carry their own lines; show them as Say / Do too.
  steps.forEach(function (s) {
    if (!s.slides) return;
    if (!(s.say && s.say.length) && s.script) { s.say = [s.script]; s.script = ""; }
    if (!(s.do && s.do.length) && s.how) { s.do = [s.how]; s.how = ""; }
  });

  return {
    module: mod,
    pack: pack,
    grade: grade,
    groupSize: groupSize,
    groupTip: (groupTips[groupSize] || "") + groupCountTip(groupSize, students),
    students: students,
    setting: setting,
    settingId: settingId,
    edited: edited,
    official: useOfficial ? official : null,
    hasOfficial: !!official,
    vocab: vocabList,
    devices: devices,
    deviceGuide: deviceGuide,
    profile: profile,
    pictureBased: picture,
    pictureActivities: picture ? PICTURE_ACTIVITIES : [],
    requestedMinutes: minutes,
    totalMinutes: total,
    steps: steps,
    games: usableGames,
    mainGame: mainGame,
    alternatives: alternatives,
    topicGame: topicGame,
    materials: (useOfficial ? official.materials : []).concat(mainGame ? mainGame.materials : []).concat(
      devices === "none" ? [] : ["Screen or projector"]
    ).concat(["Printed take-home cards (" + (students + Math.ceil(students / 10)) + ", a few spares included)"])
     .concat(picture ? ["Picture cards or printed images", "Paper and crayons for drawing (" + students + " sets)"] : [])
     .concat(setting.materials),
  };
}

/* How many groups that size makes, as a sentence (or nothing). */
function groupCountTip(groupSize, students) {
  if (groupSize === "Small groups") {
    var g = Math.max(1, Math.round(students / 4));
    return " With about " + students + " students, that is about " + g + (g === 1 ? " group." : " groups.");
  }
  if (groupSize === "Pairs") {
    return " With about " + students + " students, that is about " + Math.ceil(students / 2) + " pairs" +
      (students % 2 ? ", so plan for one group of three." : ".");
  }
  return "";
}

/* ===================================================================
   SCRIPTS
   Gives every step `say` (lines to say out loud, word for word) and
   `do` (what to do, in order). Main activities using the topic game also
   get `rounds`: a say/do script for each round. Everything comes from the
   module or topic content, so editing the files in content/ updates it.
   =================================================================== */
function writeScripts(steps, c) {
  var mod = c.mod, pack = c.pack, pic = c.picture;
  var reveal = mod.reveal || {};
  var big = reveal.keyConcept || mod.title;
  // Pre-readers get the plain half of "Term — plain words" key concepts.
  if (pic && big.indexOf(" — ") > 0) big = big.split(" — ")[1];
  big = big.charAt(0).toUpperCase() + big.slice(1);
  var letters = "ABCD";
  function first(text) {
    var m = String(text || "").match(/^.*?[.!?](\s|$)/);
    return m ? m[0].trim() : String(text || "");
  }
  // How students answer in this room, as an instruction.
  var voteDo = pic
    ? "Students point to the picture they pick (or walk to it). Count the hands for each picture out loud."
    : c.devices === "none"
      ? "Students vote with their bodies: walk to a corner, or hold up 1–4 fingers on the count of three. Count each answer out loud."
      : "Students vote with hands (or on their own devices with the play-along link). Tap the answer on the screen once for every vote you count, then tap Reveal.";

  function roundScript(r, i) {
    var opts = r.opts.map(function (o, k) { return (pic ? "" : letters[k] + ": ") + o[1]; });
    var ans = r.best < 0 ? null : r.opts[r.best][1];
    return {
      say: [
        "Round " + (i + 1) + ". " + r.q,
        pic ? "Is it… " + opts.join("… or… ") + "?" : opts.join(". ") + ".",
        pic ? "Point to your answer in three, two, one… go!" : "Think for five seconds. Ready? Vote in three, two, one… go!",
      ],
      do: [voteDo, "Ask one student who picked each answer: \"Why did you pick that?\""],
      answer: (ans ? "The answer is " + ans + "! " : "Any answer is OK! ") + r.why,
    };
  }

  steps.forEach(function (s) {
    var n = s.name;
    if (n === "Welcome & hook") {
      s.say = [s.script || "Hi everyone! Today we're going to talk about " + mod.title.toLowerCase() + "."];
      s.script = "";
      s.do = [
        "Stand at the front where everyone can see you. Smile and wait for quiet before you start.",
        pack.hook || "Ask a question that connects the topic to their own lives.",
        pic ? "Take answers with thumbs up or down, or by pointing. No writing." : "Wait five full seconds, then take 2–3 answers.",
        "Say: \"Great thinking! That's exactly what we're talking about today.\"",
      ];
    } else if (n === "Mini-lesson") {
      var idea = pack.miniLesson || mod.summary;
      s.say = pic
        ? [first(idea), "Let's say it together: " + big + "!", "One more time, nice and loud: " + big + "!"]
        : [idea, "So here's the big idea for today: " + big + "."];
      s.do = [
        pic ? "Draw the idea as a simple picture on the board while you talk." : "Write the big idea on the board: \"" + big + "\".",
        "Ask: \"Who can say that back to me in their own words?\" Take 2 answers.",
        pic ? "Point to your drawing every time you say the big idea." : "Leave it on the board for the rest of the session.",
      ];
    } else if (n === "Key vocabulary") {
      s.say = c.vocab.map(function (v) {
        return pic
          ? "Our word is " + v.term + ". Say it with me: " + v.term + "! It means " + v.def.charAt(0).toLowerCase() + v.def.slice(1)
          : v.term + ": " + v.def + " Who can give me an example?";
      });
      s.do = pic
        ? ["For each word: say it, draw it on the board, and have the class say it back.", "Make up a hand motion for each word and have everyone copy it."]
        : ["Write each word on the board as you say it.", "Take one example from a student for each word before moving on."];
    } else if (n.indexOf("Main activity") === 0 && c.mainGame) {
      var g = c.mainGame;
      var rounds = c.topicGame && !g.multiRound ? c.topicGame.rounds : [];
      s.say = [
        "Now it's game time! We're going to play " + g.name + ".",
        rounds.length
          ? "I'll ask a question, you pick an answer, and then we'll find out the answer together. Ready?"
          : "Here's how it works. Listen carefully!",
      ];
      var level = g.levels && g.levels[c.gradeId];
      s.do = (level ? ["Make it fit this age group: " + level] : []).concat((g.howToPlay || []).map(function (h) {
        // The rounds below replace the module's single scenario.
        return rounds.length && /scenario/i.test(h) ? "Read the round's question and answers out loud (word for word below)." : h;
      }));
      if (rounds.length) {
        s.do.push("Use the " + rounds.length + " rounds below as the questions. After each vote, read the answer line out loud.");
        s.rounds = rounds.map(roundScript);
      }
      s.do.push("At the end, ask: \"" + ((g.debrief || [])[0] || "What did you learn from this game?") + "\"");
    } else if (n === "Guided practice") {
      if (!pic) {
        s.say = [
          "Let's think about one together. " + (reveal.discussionPrompt || "Who can give me an example from your own life?"),
          "Turn to a partner: what would you do, and why? You have 30 seconds.",
          "Remember our big idea: " + big + ".",
        ];
      } else {
        s.say = [
          "Let's do one together. I'll draw, and you tell me what to do.",
          "Remember our big idea: " + big + ".",
          reveal.discussionPrompt ? (pic ? first(reveal.discussionPrompt) : reveal.discussionPrompt) : "Who can give me an example?",
        ];
      }
      s.do = [
        pack.guidedPractice || "Work through an example together on the board.",
        pic ? "You hold the marker. Students give the answers by pointing or with thumbs." : "Do the first example together, the next one in pairs.",
        reveal.commonTrap ? "Watch for this mistake: " + reveal.commonTrap + "." : "Praise good reasons, not just right answers.",
      ];
    } else if (n === "Extension") {
      var ext = pack.extension || "Students explain today's idea to someone who missed it.";
      s.say = ["Here's a challenge for you: " + ext.replace(/^Students /, "").replace(/\.$/, "") + "."];
      s.do = [
        pic ? "Hand out paper and crayons. Walk around and ask each student to tell you about their drawing." : "Give them 4 minutes, then ask 2–3 students to share.",
        "Don't collect anything with names on it. Students keep their work.",
      ];
    } else if (n === "Check for understanding") {
      s.say = pic
        ? ["Thumbs up if this is true: " + big + "!", "Show me again: thumbs up if you will use this at home!"]
        : [
          "Quick check. Finish this sentence for your partner: \"Today I learned that…\"",
          reveal.applyIt || "Tell me one way you'll use this idea this week.",
          "Hold up one to five fingers: how sure do you feel about today's idea?",
        ];
      s.do = [
        pack.checkUnderstanding || "Make sure every student can say the big idea.",
        "Look around the whole room, not just the front. If lots of thumbs or fingers are low, say the big idea again with a new example.",
      ];
    } else if (n === "Wrap-up & take-home") {
      var th = mod.takeHome || {};
      s.say = [
        "You all did amazing today! Remember: " + big + ".",
        "This card is called \"" + (th.title || "Take-home") + "\". Take it home and ask a grown-up: \"" + (th.familyQuestion || "") + "\"",
        "Thank you for being such great money thinkers!",
      ];
      s.do = [
        "Hand out the take-home cards.",
        pic ? "Hold up a card and point to each box so they know what goes where. The drawing is their part; a grown-up can do the writing." : "Read the family question out loud once more.",
        "Thank the teacher. Leave the room as tidy as you found it.",
      ];
    }
  });
}

/* Modules a game suits: its own `topics`, plus any lesson pack that lists
   it in `bestGames`. Only modules that exist in this edition count. */
function gameTopics(g) {
  var ids = (g.topics || []).slice();
  Object.keys(LESSON_PACKS).forEach(function (mid) {
    if ((LESSON_PACKS[mid].bestGames || []).indexOf(g.id) >= 0 && ids.indexOf(mid) < 0) ids.push(mid);
  });
  return MODULES.filter(function (m) { return ids.indexOf(m.id) >= 0; });
}

/* Score games for a plan, best first. Ties keep the GAME_FORMATS order.
   ctx: { bestGames, moduleId, gradeId, groupSize, devices, gameBudget, students, settingEnergy } */
function rankGames(games, ctx) {
  // Discussion-heavy games ask too much of pre-readers; teens like them.
  var talky = ["story-circle", "two-truths-myth", "would-you-rather"];
  function score(g) {
    var s = 0;
    s += g.minutes <= ctx.gameBudget ? 3 : -5;
    var best = ctx.bestGames.indexOf(g.id);
    if (best >= 0) s += 6 - best;
    else if (g.topics && g.topics.indexOf(ctx.moduleId) >= 0) s += 4;
    // If the room has a screen, use it.
    if (ctx.devices !== "none" && g.devices !== "none") s += 2;
    if (ctx.gradeId === "k2") {
      if (g.energy === "High") s += 2;
      else if (g.energy === "Medium") s += 1;
      if (g.id === "story-circle" || g.id === "two-truths-myth") s -= 4;
    } else if (ctx.gradeId === "912") {
      if (talky.indexOf(g.id) >= 0) s += 1;
    }
    var grp = g.group || "";
    if (ctx.groupSize === "Whole class" && /whole class/i.test(grp)) s += 2;
    if (ctx.groupSize === "Small groups" && /groups|teams/i.test(grp)) s += 2;
    if (ctx.groupSize === "Pairs" && /pairs/i.test(grp)) s += 2;
    if (ctx.groupSize === "One-on-one") {
      if (/pairs/i.test(grp)) s += 1;
      if (/teams|groups of|circle/i.test(grp)) s -= 2;
    }
    // Big rooms need games everyone can do at once; small ones can sit in a circle.
    if (ctx.students >= 31) {
      if (g.id === "story-circle") s -= 3;
      if (/whole class/i.test(grp)) s += 1;
    } else if (ctx.students <= 10) {
      if (g.id === "story-circle") s += 1;
    }
    // Quiet rooms lose points for loud games; clubs gain them.
    if (ctx.settingEnergy < 0 && g.energy === "High") s -= 2;
    if (ctx.settingEnergy > 0 && g.energy === "High") s += 1;
    return s;
  }
  return games
    .map(function (g, i) { return { g: g, s: score(g), i: i }; })
    .sort(function (a, b) { return b.s - a.s || a.i - b.i; })
    .map(function (x) { return x.g; });
}

/* Plain-text game sheet for printing: rules, age versions, cards. */
function gameToText(g) {
  var names = [["k2", "Grades K–2"], ["35", "Grades 3–5"], ["68", "Grades 6–8"], ["912", "Grades 9–12"]];
  var lines = [
    "MONEY READY GAME SHEET",
    g.emoji + " " + g.name + " | " + g.minutes + " min | " + g.group + " | " +
      (g.devices === "none" ? "No devices needed" : "Uses a screen"),
    "",
    g.summary,
  ];
  if (g.reinforces) lines.push("", "REINFORCES: " + g.reinforces);
  var topics = gameTopics(g);
  if (topics.length) lines.push("FITS THESE TOPICS: " + topics.map(function (m) { return m.title; }).join(", "));
  lines.push("", "MATERIALS");
  g.materials.forEach(function (x) { lines.push("[ ] " + x); });
  lines.push("", "HOW TO PLAY");
  g.howToPlay.forEach(function (x, i) { lines.push((i + 1) + ". " + x); });
  lines.push("", "TEEN TIP: " + g.teenTip);
  if (g.levels) {
    lines.push("", "MAKE IT FIT YOUR AGE GROUP");
    names.forEach(function (n) { if (g.levels[n[0]]) lines.push("- " + n[1] + ": " + g.levels[n[0]]); });
  }
  if (g.debrief) {
    lines.push("", "QUESTIONS TO CLOSE WITH");
    g.debrief.forEach(function (q) { lines.push("- " + q); });
  }
  if (g.access) lines.push("", "EVERYONE CAN PLAY: " + g.access);
  if (g.cards) {
    lines.push("", "=".repeat(48), g.cards.title.toUpperCase(), "=".repeat(48), "Cut along the lines.");
    g.cards.items.forEach(function (c) { lines.push("", "- - - - - - - - - - - - - - - - - - - - - - - -", c); });
  }
  lines.push("", "Educational only. Not financial advice. No personal data collected.");
  return lines.join("\n");
}

/* Plain-text game cards for a topic game: one card per round, with the
   answer and source on the back, for rooms with no screen. */
function topicGameToText(game) {
  var lines = [
    "GAME CARDS: " + game.title.toUpperCase(),
    game.rounds.length + " rounds. Read the question aloud, students vote, then read the answer.",
  ];
  game.rounds.forEach(function (r, i) {
    var src = roundSource(r, game.topic);
    lines.push("", "- - - - - - - - - - - - - - - - - - - - - - - -", "ROUND " + (i + 1) + ": " + r.q);
    r.opts.forEach(function (o, k) { lines.push("  " + String.fromCharCode(65 + k) + ". " + o[0] + " " + o[1]); });
    lines.push("  ANSWER: " + (r.best < 0 ? "Any answer is OK." : String.fromCharCode(65 + r.best) + ". " + r.opts[r.best][1]) + " " + r.why);
    if (src) lines.push("  Source: " + src.name + (src.url ? " (" + src.url + ")" : ""));
  });
  return lines.join("\n");
}

/* Plain-text version of a whole plan and packet, for downloading. */
function planToText(plan, packet) {
  var m = plan.module;
  var lines = [
    "MONEY READY WORKSHOP PLAN",
    m.title + " | " + plan.grade + " | " + plan.totalMinutes + " min | " + plan.deviceGuide.label + " | " + plan.groupSize,
    "About " + plan.students + " students | " + plan.setting.label,
    "",
    "LEARNING OBJECTIVE: " + m.objective,
  ].concat(plan.official ? [
    "OFFICIAL LESSON: " + plan.official.deck + (plan.official.book ? " | Book: " + plan.official.book.title : ""),
    "BIG IDEA: " + plan.official.bigIdea,
  ] : []).concat([
    "",
    "RUN OF SHOW",
  ]);
  plan.steps.forEach(function (s) {
    lines.push("", s.minutes + " min  " + s.name + (s.slides ? "  [" + s.slides + "]" : ""), "  " + s.what);
    if (s.script) lines.push("  Say this: " + s.script);
    (s.say || []).forEach(function (l, i) { lines.push((i ? "           " : "  SAY:     ") + "\"" + l + "\""); });
    (s.do || []).forEach(function (l, i) { lines.push("  DO " + (i + 1) + ".    " + l); });
    (s.rounds || []).forEach(function (r, i) {
      lines.push("  ROUND " + (i + 1) + ":");
      r.say.forEach(function (l) { lines.push("    Say: \"" + l + "\""); });
      r.do.forEach(function (l) { lines.push("    Do:  " + l); });
      lines.push("    Then say: \"" + r.answer + "\"");
    });
    if (s.how) lines.push("  Tip: " + s.how);
  });
  lines.push("", "SETTING: " + plan.setting.label);
  plan.setting.tips.forEach(function (t) { lines.push("  - " + t); });
  lines.push("", "MATERIALS");
  plan.materials.forEach(function (x) { lines.push("[ ] " + x); });
  if (plan.topicGame && !(plan.mainGame && plan.mainGame.multiRound)) lines.push("", "=".repeat(48), topicGameToText(plan.topicGame));
  packet.forEach(function (it) {
    lines.push("", "=".repeat(48), it.title.toUpperCase(), "=".repeat(48), it.body);
  });
  lines.push("", "Educational only. Not financial advice. No personal data collected.");
  return lines.join("\n");
}

/* Build the full workshop packet — the pieces a volunteer needs around the
   lesson itself. Combined into the same builder as the lesson plan. */
function buildPacket(plan) {
  var m = plan.module;
  var grade = plan.grade;
  var picture = plan.pictureBased;
  var off = plan.official;
  var deckItem = off
    ? {
      ico: "🖼", title: "Official slide deck guide", sub: "Which slides go with each step of " + off.deck,
      body: "USE THE OFFICIAL DECK: " + off.deck + "\n(Teen Teach-In resources on jumpstart.org)\n" +
        (off.book ? "\nBOOK: " + off.book.title + (off.book.author ? " by " + off.book.author : "") + "\n" : "") +
        "\nBEFORE YOU PRESENT:\n  • Fill in the presenter slides with your names, grades, and a photo.\n  • Practice the speaker notes on each slide out loud.\n" +
        "\nSTEP BY STEP:\n" + plan.steps.map(function (s) {
          return "  " + s.minutes + " min — " + s.name + (s.slides ? " (" + s.slides + ")" : " (no slide; run it from this plan)");
        }).join("\n") +
        "\n\nVOCABULARY:\n" + off.vocab.map(function (v) { return "  " + v.term + ": " + v.def; }).join("\n") +
        "\n\nBIG IDEA:\n  " + off.bigIdea,
    }
    : null;
  return [
    deckItem || {
      ico: "🖼", title: "Lesson deck outline", sub: "Slides for " + m.title + " (" + grade + ")",
      body: "Slide 1 — Title: " + m.title +
        "\nSlide 2 — " + (picture ? "Big picture, no words. Ask the hook question out loud." : "Big question / hook") +
        "\nSlide 3 — Key vocabulary: " + ((m.prep && m.prep.vocab) || []).slice(0, plan.profile.vocabCount).map(function (v) { return v.term; }).join(", ") +
        (picture ? " (one picture per word, no definitions on screen)" : "") +
        "\nSlide 4 — Scenario challenge" + (picture ? " as a picture with the question read aloud" : "") +
        "\nSlide 5 — " + (plan.devices === "none" ? "Vote by moving to a corner (no slide needed)" : "Group vote") +
        "\nSlide 6 — Reveal: " + m.reveal.keyConcept +
        "\nSlide 7 — Discussion: " + m.reveal.discussionPrompt +
        "\nSlide 8 — Take-home + thank you",
    },
    {
      ico: "📝", title: "Practice notes", sub: "Opening script, timing, and delivery tips",
      body: "OPENING SCRIPT:\n" + (off ? off.steps[0].script : (m.prep && m.prep.openingScript)) +
        "\n\nRUN OF SHOW:\n" + plan.steps.map(function (s) { return "  " + s.minutes + " min — " + s.name; }).join("\n") +
        "\n\nDELIVERY FOR " + grade.toUpperCase() + ":\n" + plan.profile.delivery.map(function (d) { return "  • " + d; }).join("\n") +
        "\n\nWATCH FOR:\n  " + plan.profile.watchFor,
    },
    {
      ico: "✉️", title: "Parent letter", sub: "Friendly heads-up for families",
      body: "Dear Families,\n\nThis week your student took part in a short, fun financial-literacy workshop on \"" +
        m.title + "\" led by trained teen volunteers. The goal: " + m.objective.toLowerCase() +
        "\n\nAsk them about it! A take-home card came home with a simple family question. Everything is educational only and privacy-safe — no personal data is collected.\n\nWith appreciation,\nThe Money Ready volunteer team",
    },
    {
      ico: "🏫", title: "Administrator packet", sub: "One-page overview for school leaders",
      body: "MONEY READY — WORKSHOP OVERVIEW (proposed pilot, pending approval)\nTopic: " + m.title +
        "\nGrade band: " + grade + "\nLength: " + plan.totalMinutes + " min\nObjective: " + m.objective +
        "\nFormat: teen-led, interactive (challenge → vote → reveal → discuss → take-home)" +
        "\nTechnology required: " + plan.deviceGuide.label +
        (m.extraTopic && plan.topicGame ? "\nContent sources: " + plan.topicGame.sources.map(function (x) { return x.name; }).join("; ") : "") +
        "\nPrivacy: educational only; no student data collected.",
    },
    {
      ico: "✅", title: "Event checklist", sub: "Day-of run of show",
      body: "BEFORE:\n" + plan.deviceGuide.setup.map(function (x) { return "[ ] " + x; }).join("\n") +
        "\n[ ] Rehearse the opening script out loud\n[ ] " + (m.extraTopic ? "Open the topic game: " : "Load module: ") + m.title +
        "\nDURING:\n" + plan.steps.map(function (s) { return "[ ] " + s.name + " (" + s.minutes + " min)"; }).join("\n") +
        "\nAFTER:\n[ ] Thank the class and the teacher\n[ ] Note what went well on the reflection page",
    },
    {
      ico: "🗒", title: "Sign-up form", sub: "Volunteer roles (no personal data stored here)",
      body: "WORKSHOP SIGN-UP — " + m.title + " (" + grade + ")\nRole 1: Lead facilitator\nRole 2: Co-facilitator / vote counter\nRole 3: Materials + take-home cards\nRole 4: Timekeeper\n(Names collected offline by the coordinator, not stored in this app.)",
    },
    {
      ico: "🔄", title: "Post-event reflection", sub: "Quick, privacy-safe wrap-up",
      body: "REFLECTION (aggregate only — no names):\n- Students reached (count): ____\n- What worked well: ____\n- What to change next time: ____\n- Confidence check average (1–5): ____\n- One story worth sharing: ____",
    },
  ];
}
