/*
 * game-bank.js — Builds the games the Workshop Builder makes
 * ----------------------------------------------------------
 * The rounds themselves are content: edit them in content/modules/ and
 * content/extra-topics/ (`game_rounds`), never here.
 *
 * Every topic has two sets of rounds:
 *   picture -> Grades K–2. Two answers, each a big picture and one or two
 *              words. The question is one short sentence a volunteer (or
 *              the "Hear it" button) reads aloud. `why` is one sentence.
 *   rounds  -> Grades 3–12. Three or four answers with a picture each.
 *
 * Round shape: { q, opts: [[emoji, label], ...], best, why, src }
 *   best -> index of the right answer in opts (the game shuffles them)
 *   src  -> optional source key (content/sources/) naming where the fact comes
 *           from. Rounds on EXTRA_TOPICS always show a source.
 *
 * EXTRA_TOPICS are topics that aren't modules. Each one is written from a
 * named U.S. government consumer-education source (the same list the
 * Standards Helper uses), so a volunteer can teach it without guessing.
 * To add a topic: copy a file in content/extra-topics/, keep every fact general and stable (no
 * figures that change every year), and cite a KB_SRC key on every round.
 * Nothing here is fetched; it is all written in advance.
 *
 * Educational only. Never ask students about family money.
 */
// GAME_BANK (each topic's rounds) and EXTRA_TOPICS now live in content/:
// rounds sit in each content/modules/ and content/extra-topics/ file under
// `game_rounds`. scripts/build-content.js turns them into assets/js/content.js.

/* Every topic the builder can plan: modules first, then extra topics. */
function findTopic(id) {
  for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return MODULES[i];
  for (var j = 0; j < EXTRA_TOPICS.length; j++) if (EXTRA_TOPICS[j].id === id) return EXTRA_TOPICS[j];
  return null;
}

/* Where a round's fact comes from, as { name, url } or null. */
function roundSource(round, topic) {
  var key = round.src || (topic && topic.extraTopic && topic.sources[0]);
  if (key && KB_SRC[key]) return { name: KB_SRC[key][0], url: KB_SRC[key][1] };
  if (topic && topic.officialLesson) return { name: "Jump$tart Teen Teach-In · " + topic.officialLesson, url: "" };
  return null;
}

/* Build a game for a topic and age group. K–2 gets the picture rounds.
   `count` caps the rounds (the game repeats nothing). Returns null when
   the topic has no rounds. */
function buildTopicGame(topicId, gradeId, count) {
  var topic = findTopic(topicId);
  var bank = GAME_BANK[topicId];
  if (!topic || !bank) return null;
  var picture = gradeId === "k2";
  var rounds = (picture ? bank.picture : bank.rounds) || [];
  if (count) rounds = rounds.slice(0, count);
  // Most rounds are written with the right answer first. Rotate the
  // answers so printed cards don't always have the answer in spot A.
  rounds = rounds.map(function (r, i) {
    var n = r.opts.length, shift = i % n;
    var opts = r.opts.slice(shift).concat(r.opts.slice(0, shift));
    var copy = {};
    for (var k in r) copy[k] = r[k];
    copy.opts = opts;
    copy.best = r.best < 0 ? r.best : (r.best - shift + n) % n;
    return copy;
  });
  return {
    topic: topic,
    picture: picture,
    title: topic.emoji + " " + topic.title + (picture ? " Picture Game" : " Showdown"),
    rounds: rounds,
    sources: rounds.map(function (r) { return roundSource(r, topic); })
      .filter(function (s, i, all) {
        return s && all.map(function (x) { return x && x.name; }).indexOf(s.name) === i;
      }),
  };
}

/* Find topics matching words a volunteer typed ("taxes", "lemonade"). */
function searchTopics(text) {
  var q = " " + String(text || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ") + " ";
  if (!q.trim()) return [];
  function has(phrase) {
    var p = phrase.toLowerCase();
    return q.indexOf(" " + p + " ") >= 0 || q.indexOf(" " + p + "s ") >= 0 || q.indexOf(" " + p.replace(/s$/, "") + " ") >= 0;
  }
  var all = MODULES.concat(EXTRA_TOPICS);
  return all.filter(function (t) {
    var words = (t.tags || []).concat(t.title.toLowerCase().split(/[^a-z]+/).filter(function (w) { return w.length > 4; }));
    return words.some(has);
  });
}
