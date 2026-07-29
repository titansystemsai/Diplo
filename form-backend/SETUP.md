# Wiring the DIPLO form to a Google Sheet

One-time setup, about five minutes. After this, every registration lands
as a row in your sheet automatically.

---

## 1. Create the spreadsheet

Make a new Google Sheet. Name it something like *DIPLO — Registrations*.
You don't need to add any tabs or headers — the script creates a
**Students** tab and an **Industry** tab, with headers, the first time
each is needed.

Copy its **ID** from the address bar. It's the long string between
`/d/` and `/edit`:

```
https://docs.google.com/spreadsheets/d/1AbC...THIS_PART...xyz/edit
```

## 2. Add the script

In that sheet: **Extensions → Apps Script**. Delete whatever is in the
editor, paste in the full contents of `Code.gs`, and replace
`PASTE_YOUR_SPREADSHEET_ID_HERE` at the top with the ID from step 1.

Save (the disk icon).

## 3. Deploy it

**Deploy → New deployment → Web app**, with:

| Setting | Value |
|---|---|
| Execute as | **Me** |
| Who has access | **Anyone** |

Click **Deploy**. Google will ask you to authorise it — it's your own
script, so approve it. You'll pass a "Google hasn't verified this app"
screen; choose *Advanced → Go to (project name)*.

Copy the **Web app URL** it gives you. It looks like:

```
https://script.google.com/macros/s/AKfy..../exec
```

> **"Who has access: Anyone" does not expose your spreadsheet.** It only
> means anyone can send data *to* the script. The sheet's own sharing
> settings are untouched.

## 4. Check it works

Back in the Apps Script editor, choose the `setup` function from the
dropdown and click **Run**. If it completes without error, the script can
reach your sheet, and both tabs and their headers now exist.

## 5. Point the website at it

Open `diplo-mock-a.html`, search for `EOI_ENDPOINT`, and paste the URL
between the quotes:

```javascript
var EOI_ENDPOINT = 'https://script.google.com/macros/s/AKfy..../exec';
```

Save. Submit the form once and confirm a row appears in the sheet.

---

## Changing which sheet responses go to

Edit `SHEET_ID` (different spreadsheet) or `STUDENT_TAB` / `INDUSTRY_TAB`
(different tab names) at the top of `Code.gs`, then:

**Deploy → Manage deployments → edit the existing deployment (pencil icon)
→ Version: "New version" → Deploy.**

The web app URL stays the same, so the website file never needs changing
or re-sending.

⚠️ **Don't click "New deployment"** for this — that mints a *different*
URL, and the form will keep quietly writing to the old sheet.

---

## Things worth knowing

- **The published artifact links can't submit.** Artifacts run under a
  security policy that blocks outbound requests. Live submissions work
  from the local HTML file or once the site is hosted on a real domain.

- **The form shows success immediately**, without waiting for the sheet to
  confirm. This is deliberate — the browser can't read the response back
  from Apps Script anyway, and a registration form should never leave
  someone staring at a spinner. The trade-off is that a failed write is
  invisible to the user, so check the sheet after any change to the setup.

- **Leaving `EOI_ENDPOINT` empty is safe.** The form still validates and
  shows its success state, it just stores nothing — which is the right
  behaviour for a mock you're sending to a client for review.

- **This holds student names, emails and phone numbers.** Keep the sheet
  shared with named people rather than "anyone with the link", and make
  sure the client is clear on who owns that data — their governance plan
  is strict about student information.
