# DIPLO

Single-page site for **DIPLO — Defence Industry Pathway & Leadership Outreach**,
a student-led initiative connecting university students from a range of academic
disciplines with the practical realities of Australia's defence industry.

The page is a single self-contained HTML file: fonts and imagery are embedded as
base64, so it renders with no server, no build step at run time, and no external
requests.

## Contents

| Path | What it is |
|---|---|
| `public/index.html` | The built page. This is the deployable artefact, and the whole of what gets served. |
| `mocks/diplo-mock-a.template.html` | Editable source, with `@@TOKEN@@` placeholders for embedded assets. |
| `mocks/assets/` | Fonts and photography inlined at build time. |
| `mocks/build.ps1` | Inlines the assets and writes the built page. |
| `wrangler.jsonc` | Cloudflare configuration. Serves `public/` as static assets. |
| `form-backend/` | Google Apps Script receiver that writes registrations to a Google Sheet. |

## Building

Edit the template, never the built file, then:

```powershell
powershell -File mocks/build.ps1
```

The build is deterministic - the same template and assets always produce a
byte-identical page. It aborts if an asset is missing rather than emitting a
page with empty images.

## Deploying

`public/index.html` is the whole site, and it is committed. Deployment copies
it; nothing is compiled or fetched at deploy time.

The live site is a Cloudflare Worker connected to this repository, configured
by `wrangler.jsonc` as an assets-only Worker over `public/`. In the Cloudflare
dashboard:

- **Build command** - leave empty. `mocks/build.ps1` is PowerShell and will not
  run in Cloudflare's Linux build environment; the page is built locally on
  Windows and committed instead.
- **Deploy command** - `npx wrangler deploy`

Because the build writes straight to the directory that gets served, the page
you open locally is byte-for-byte the page that goes live.

Any other static host works too - point it at `public/` as the site root.

## Registration form

The expression-of-interest form posts to a Google Apps Script web app, which
appends each registration to a Google Sheet. Setup takes about five minutes and
is documented in [`form-backend/SETUP.md`](form-backend/SETUP.md).

Paste the deployment URL into `EOI_ENDPOINT` near the bottom of the template,
then rebuild. Left empty, the form still validates and shows its success state
but stores nothing, which is the correct behaviour for review builds.

## Design tokens

- Ink `#08090B`, raised `#0E1013`
- Champagne `#C9BFAE`, bright `#E9E2D2`, stone `#8E8779`
- Type: Saira Condensed (display), IBM Plex Sans (body), IBM Plex Mono (labels)

## Notes

- **Photography is placeholder.** The current images are public-domain U.S. Air
  Force / U.S. Marine Corps photographs via Wikimedia Commons. Replace them with
  licensed or cleared imagery before launch.
- **Non-affiliation.** The industry names shown on the page are presented as the
  sector students prepare for, alongside an explicit disclaimer. DIPLO is an
  independent, student-led educational initiative, is not affiliated with or
  endorsed by any organisation named or the Department of Defence, and does not
  provide recruitment, internships, security clearances, or access to sensitive
  information. Preserve this framing in any copy changes.
- **Registration data.** The form collects names, email addresses and phone
  numbers. Keep the destination sheet shared with named people rather than
  "anyone with the link".

## Contributing

`main` holds the deployable state. Make changes on a branch and merge into
`main` via pull request rather than committing to `main` directly.
