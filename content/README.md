# Content

All of the app's teaching content lives here as plain text files: modules, lessons, games and Standards Helper answers. You can change any of it from the GitHub website without touching code. See [spec 11](../docs/specs/11-content-files.md).

| Folder | What's in it | Format |
| --- | --- | --- |
| `modules/` | One file per module (workshop): the card, the reveal (key idea, common trap, discussion prompt), take-home card and volunteer prep. Each file also holds the module's `lesson_pack` (the extra teaching the Workshop Builder adds) and its `game_rounds` (the questions for the builder's game and the module's student challenge, which are the same game). | YAML |
| `extra-topics/` | Topics that aren't modules (coins, insurance, taxes and so on), each written from a trusted source, with its `game_rounds`. | YAML |
| `games/` | One file per game format (Four Corners, Budget Relay and so on): how to play, a version per age group, printable cards. | YAML |
| `official-lessons/` | The official Jump$tart Teen Teach-In lessons, step by step, following each slide deck. | YAML |
| `helper/` | One file per Standards Helper answer. | Markdown |
| `sources/` | The approved sources. Answers and extra-topic rounds can only cite a source listed here. | Markdown |
| `watch/` | Written by the weekly Jump$tart check. Don't edit it. | |

The number at the start of each file name sets the order on the site. Files starting with `_` are templates and never appear.

## Add or change a helper answer (on the GitHub website)

1. Open the `content/helper/` folder on GitHub.
2. **To change an answer:** open its file, click the pencil, and edit it. **To add one:** open `_template.md`, copy its text, then click **Add file → Create new file**. Name the new file with the next number, like `103-what-is-a-paycheck.md`, and paste in the text.
3. Fill in the header (the lines between the two `---`) and write the answer below it.
4. Click **Commit changes…** and choose **Create a new branch and start a pull request**.
5. Wait about a minute. A check called **Content** runs. If it shows a red ✗, click **Details**. It names the file and says what to fix in plain English.
6. When it's green, open the Vercel **Preview** link on the pull request, ask the helper your question, and merge when you're happy. Nothing goes live until you merge.

## Example: bringing in a new Jump$tart resource

Say Jump$tart adds a new deck, "Grade 2: Earning Income", to the [Teen Teach-In resources page](https://www.jumpstart.org/awareness/check-your-school/teen-teach-in/resources/).

1. **You hear about it.** On Monday the **Jump$tart watch** opens a GitHub issue that lists the new file with a link.
2. **Download it.** Claude's cloud sessions can't reach jumpstart.org, so download the deck yourself and attach it in the Money Ready project with a note like "add this".
3. **Claude writes the content files** on a new branch and opens a pull request. For example, `content/helper/103-what-is-income.md`:

   ```
   ---
   question: What is income?
   tags: income, earn money, earning money, paycheck
   source: jumpstart-teen-teach-in
   cites: Grade 2 Earning Income
   approved_by: Sumeet
   approved_on: 2026-11-08
   ---
   Income is money you receive, usually for doing work. Kids might earn it from chores or small jobs; adults usually earn a paycheck from a job.
   ```

   The deck itself never goes in the repo; only our own short summary and where it came from.
4. **The Content check runs.** Green means every file names an approved source and an approver.
5. **You review.** Open the Vercel Preview link on the pull request, ask the helper "what is income?", and read the answer.
6. **You merge.** Within a minute or two the live site answers the new question.

A new official lesson works the same way. Claude adds a file to `official-lessons/` (and the module it belongs to, if it's a new topic), the check runs, and you review it on the preview and merge.

## Editing a module, game, topic or lesson (the YAML files)

These files are YAML: "name: value" lines, indented with **2 spaces** to show what belongs to what. Open a file on GitHub and click the pencil to edit it. Most edits are just changing the words after a colon. For example, in `modules/04-needs-vs-wants.yaml`:

```yaml
title: Needs vs. Wants
minutes: 30
summary: Students sort everyday items into needs and wants.
materials: ["Picture cards", "Sorting mat"]
game_rounds:
  rounds:
    - q: You have $10. Which should you buy first?
      opts:
        - ["🥪", "A sandwich for lunch"]
        - ["🌟", "A new sticker pack"]
      best: 0
      why: Lunch is a need. Stickers are a want.
```

The rules that matter:

- **Indent with spaces, never tabs.** Things inside a group sit 2 spaces further in, like `rounds:` under `game_rounds:`.
- **A list** is one item per line starting with `- `. A short list can go on one line: `["one", "two"]`.
- **Counting starts at 0.** `best: 0` means the first option is right, `best: 1` the second. In a game round, `best: -1` means any answer is OK.
- **Use double quotes** around text that starts with a quote, a bracket, `- ` or `#`, or that is only a number or true/false: `"42"`.
- **Text over several lines** goes after `|-`, indented 2 more spaces than its name.
- Lines starting with `#` are notes for editors and are ignored.
- Every file needs `approved_by:` and `approved_on:` at the top. Update them when you change the content.

**A game round** (in `game_rounds`, under `picture:` for Grades K–2 or `rounds:` for Grades 3–12):

```yaml
    - q: Which one do we need?
      opts:
        - ["💧", "Water"]
        - ["🍭", "Candy"]
      best: 0
      why: We need water to live. Candy is a want.
      src: cfpbKids
```

Each answer in `opts` is a picture and a label. `src` (optional on modules, required on extra topics) is a source `key` from `sources/`. Keep facts general and stable, never figures that change every year, and never ask students about family money.

**A game** (`games/`): `devices` is `none` (fully unplugged), `shared` (one screen at the front) or `personal` (students' own devices). `levels` has one version per age group: `k2`, `35`, `68` and `912`. A module's `lesson_pack` → `bestGames` lists the game ids that suit it best, strongest first.

**An official lesson** (`official-lessons/`): `module` is the id of the module it belongs to. Each step has a `name`, its `minutes`, the deck `slides` it uses, `what` happens, a short `script` and `how` to run it. Mark the hands-on step a volunteer may swap for a game with `activity: true`. The Workshop Builder only uses it when the module has an `officialLesson` line.

**To add a new one**, copy an existing file in the same folder, give the copy the next number and a new `id`, and change the content. If something is wrong, the Content check names the file and the line.

## The helper answer header, line by line

```
---
question: What is a paycheck?
tags: paycheck, pay stub, take-home pay
source: dol
approved_by: Sumeet
approved_on: 2026-11-01
---
The answer, in a few short sentences.
```

- **question**: the question as a student might ask it. It also appears on the site.
- **tags**: phrases separated by commas. A student's question has to contain one of these phrases (as whole words) to get this answer. Use specific phrases like `credit card`. A bare common word like `card`, `account` or `money` pulls in unrelated questions, so the check rejects the commonest ones. When two answers' tags overlap, the longer phrase wins.
- **source**: the `key` of a source in `sources/`, like `cfpb`, `ftc` or `jumpstart-teen-teach-in`.
- **cites**: Jump$tart sources only. Says which material the answer comes from, like `Grade 3 Saving and Spending`.
- **source_name** and **url** (optional, trusted sources only): replace the source's usual name or website under this one answer.
- **approved_by** and **approved_on**: who approved this answer, and the date, like `2026-11-01`.

Jump$tart answers are shown first. Answers from a `trusted` source (U.S. government or state regulator consumer-education sites) cover what Jump$tart doesn't, and the site labels them "not from Jump$tart".

## Add a new approved source

Copy `sources/_template.md` into a new numbered file in `sources/`. The `kind` is `jumpstart` for Jump$tart material, `trusted` for a public U.S. government or regulator source, or `toolkit` for notes about this app. Trusted sources appear on the Resources page, in file order.

## How it reaches the site

The site can't read these files directly. A browser won't load extra files when `index.html` is opened from disk, and Vercel has no build step. So the **Content** GitHub Action runs `scripts/build-content.js` on every pull request and on every change to `main`. The script checks the files, writes `assets/js/content.js` and `assets/js/helper-kb.js`, and saves them back to the branch. Never edit those two files by hand, because the next run overwrites them.

To run it yourself: `node scripts/build-content.js`.

## Copyright

Write answers and summaries in your own words, and cite where they come from. Don't paste Jump$tart's slide decks or worksheets in here, because everything in this repo is published on the live site.
