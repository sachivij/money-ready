# Content

Everything the Standards Helper says lives here as small text files, one per answer. You can change it from the GitHub website without touching any code. Lessons, games and modules will move here too (see [spec 11](../docs/specs/11-content-files.md)).

| Folder | What's in it |
| --- | --- |
| `helper/` | One file per Standards Helper answer. |
| `sources/` | The approved sources. An answer can only cite a source listed here. |

## Add or change a helper answer (on the GitHub website)

1. Open the `content/helper/` folder on GitHub.
2. **To change an answer:** open its file, click the pencil, and edit it. **To add one:** open `_template.md`, copy its text, then click **Add file → Create new file**. Name the new file with the next number, like `103-what-is-a-paycheck.md`, and paste in the text.
3. Fill in the header (the lines between the two `---`) and write the answer below it.
4. Click **Commit changes…** and choose **Create a new branch and start a pull request**.
5. Wait about a minute. A check called **Content** runs. If it shows a red ✗, click **Details**. It names the file and says what to fix in plain English.
6. When it's green, open the Vercel **Preview** link on the pull request, ask the helper your question, and merge when you're happy. Nothing goes live until you merge.

## The header, line by line

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

The site can't read these files directly. A browser won't load extra files when `index.html` is opened from disk, and Vercel has no build step. So the **Content** GitHub Action runs `scripts/build-content.js` on every pull request and on every change to `main`. The script checks the files, writes `assets/js/helper-kb.js` and saves it back to the branch. Never edit `helper-kb.js` by hand, because the next run overwrites it.

To run it yourself: `node scripts/build-content.js`.

## Copyright

Write answers and summaries in your own words, and cite where they come from. Don't paste Jump$tart's slide decks or worksheets in here, because everything in this repo is published on the live site.
