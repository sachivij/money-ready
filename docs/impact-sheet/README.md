# Setting up the private impact sheet (spec 09)

This connects the website to a Google Sheet that only you and Sachika can
see. Every time a teen volunteer or teacher builds a plan, starts the
Facilitator, or opens an on-screen game, the sheet gets one new row with
the number of students. The **Totals** tab adds everything up.

It takes about 10 minutes. You only do it once.

## What the sheet receives

One row per workshop or activity:

| When | Kind | Module or game | Students | Role | Site |
| --- | --- | --- | --- | --- | --- |
| 2026-11-03 10:15 | builder | needs-vs-wants | 24 | volunteer | money-ready.vercel.app |

Nothing else: no names, no emails, nothing about students.

## Steps

1. **Make the sheet.** Go to [sheets.new](https://sheets.new) while signed in
   to the Google account that should own it. Name it "Money Ready impact".
2. **Open the script editor.** In the sheet: **Extensions → Apps Script**.
3. **Paste the code.** Delete what's in `Code.gs`, then paste in everything
   from [`Code.gs`](Code.gs) in this folder. Press the 💾 save icon.
4. **Create the tabs.** At the top of the editor, pick **setup** in the
   function list and press **▶ Run**. Google will ask you to allow access
   to your spreadsheet: choose your account, then **Advanced → Go to
   (project name) → Allow**. This is your own script asking to edit your
   own sheet. Back in the sheet you'll now see **Totals** and **Log** tabs.
5. **Publish it as a web app.** In the editor: **Deploy → New deployment**.
   Click the ⚙️ next to "Select type" and choose **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone

   Press **Deploy**, then **copy the Web app URL** (it ends in `/exec`).

   "Anyone" means anyone can *send a number to* the script. It does **not**
   let anyone see the sheet; the sheet stays private.
6. **Share the sheet with Sachika only.** In the sheet, press **Share** and
   add her Google account as an Editor (or Viewer). Leave "General access"
   on **Restricted**.
7. **Connect the website.** Open `assets/js/reach.js` and paste the URL
   between the quotes on this line:

   ```js
   var ENDPOINT = "";
   ```

   Or send the URL to whoever is building with Claude and ask them to put it in.
   Once that change is on `main`, the live site starts counting.

## Good to know

- **Only the live site counts.** Testing on your computer and Vercel
  preview links never add rows (see `SEND_FROM` in `reach.js`).
- **Each workshop counts once per browser tab.** Rebuilding the same plan or
  reloading the page doesn't add another row.
- **Organizations aren't asked**, so their visits never add rows.
- **If you change `Code.gs` later**, use **Deploy → Manage deployments →
  ✏️ Edit → Version: New version → Deploy** so the URL stays the same.
- **Fake numbers:** the web app address is visible in the website's code, so
  someone could send made-up rows. The script rejects anything that isn't
  exactly what the site sends (for example, more than 500 students), but if
  you ever see odd rows, just delete them from the Log tab.
- **Blocked networks:** some schools block Google script links. On those
  networks the website works normally, but that workshop won't be counted.
