# chemlessons.xyz

A full year of high school chemistry curriculum in two course tracks —
**Conceptual Chemistry** (models and phenomena first) and **Mathematical Chemistry**
(quantitative problem-solving first) — with interactive notebook pages, slide decks,
assignments, labs, and (for verified educators) assessments. Built with plain
HTML, CSS, and JavaScript. No frameworks, no build step.

**Live site:** https://chemlessons.xyz

## Project layout

```
index.html          Home page
curriculum.html     Unit-by-unit resource browser (rendered from js/data.js)
slides.html         HTML slide deck gallery (rendered from js/data.js)
assessments.html    Educator verification info + FAQ
about.html          About, philosophy, license, contact
404.html            Custom not-found page (GitHub Pages serves this automatically)
css/style.css       All site styles
js/data.js          ★ ALL site content lives here — course tracks, units, resources, decks
js/main.js          Shared behavior: nav, animations, hero canvas, FA fallback
js/curriculum.js    Curriculum page renderer + search/filter
slides/demo-deck/   Self-contained HTML slide deck (copy it to make new decks)
assets/             Logo files + favicon
scripts/            Apps Script that builds the educator-access Google Form (not part of the site)
CNAME               Custom domain for GitHub Pages
```

## Editing content — one file

Everything shown on the curriculum and slides pages comes from **`js/data.js`**.
You should rarely need to touch the HTML.

### Course tracks

`TRACKS` holds the two courses. Each entry has an `id` (`conceptual` /
`mathematical`), a `label`, a `short` name (unit chips), a one-letter `badge`
(homepage tiles), a `tagline` (shown under the course switcher), and its own
`units` array. The two courses are fully independent — different unit names,
numbering, counts, and sequences are all fine. The switcher, homepage tiles,
and stats render from this automatically; adding a third track (e.g. AP
Chemistry) is just another entry in the array.

Unit `id`s must be unique **across all tracks** (they're used for deep links):
`curriculum.html#conceptual-unit-4` or `curriculum.html#mathematical-unit-6`
opens that exact unit in the right course, and `curriculum.html#mathematical`
opens that course directly.

### Add or edit a resource

Each unit (inside its track) has a `resources` array:

```js
{ title: "Density of Unknown Solids Lab", kind: "lab", type: "gdoc",
  url: "https://docs.google.com/document/d/FILE_ID/preview",
  copyUrl: "https://docs.google.com/document/d/FILE_ID/copy" },
```

- `kind` groups it within the unit: `notebook`, `slides`, `assignment`, `lab`,
  `activity`, or `assessment`.
- `type` sets the icon/badge: `gdoc`, `gsheet`, `gslides`, `gform`, `pdf`, `html`,
  `video`, or `link`.
- Leave `url: ""` and the resource shows as **"In progress"** — handy for listing
  the plan before the files are ready.
- `copyUrl` is optional and adds a **"Make a copy"** button.

### Google Drive link tips

For any Google file, grab the share link and swap the ending:

| You want                | URL ending                                  |
| ----------------------- | ------------------------------------------- |
| Clean read-only preview | `.../preview` instead of `.../edit`         |
| Force "Make a copy"     | `.../copy` instead of `.../edit`            |
| PDF stored in Drive     | `https://drive.google.com/file/d/FILE_ID/view` |

Set sharing to **"Anyone with the link – Viewer"** on public resources. Keep
assessments restricted and share them per-teacher after verification.

### Add a new HTML slide deck

1. Duplicate `slides/demo-deck/` → `slides/unit-4-bonding/` (any name).
2. Edit the `<section class="slide">` blocks in its `index.html`.
3. Add an entry to `DECKS` in `js/data.js` so it appears in the gallery, and/or a
   resource with `type: "html"` in the right unit. An optional `track` field
   (e.g. `track: "Mathematical"`) shows a course label on the gallery card.

### Set the educator-access form

In `js/data.js`, set:

```js
requestAccessUrl: "https://forms.gle/your-form-id",
```

Every "Request educator access" button across the site points there automatically.

## Font Awesome Pro

Each HTML page's `<head>` loads a Font Awesome **Pro kit** (kit `83c74fddfb`,
with the **Classic → Solid** and **Duotone → Solid** styles enabled):

```html
<script src="https://kit.fontawesome.com/83c74fddfb.js" crossorigin="anonymous"></script>
```

Icons use `fa-solid …` (e.g. the nav toggle, search) and `fa-duotone fa-solid …`
(e.g. `fa-flask`, `fa-notebook`), so **both** of those kit styles must stay
enabled, and `chemlessons.xyz`, `www.chemlessons.xyz`, and `localhost` must be in
the kit's authorized domains. If the kit ever fails to load, `js/main.js` falls
back to each icon's `data-fb` emoji (via the `no-fa` class), so nothing breaks.

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Development workflow

Two branches: **`dev`** (working) and **`main`** (production — auto-deploys).
Never commit directly to `main`.

```sh
npm install        # one-time: dev tooling (html-validate, linkinator, live-server)
npm run dev        # local live-reload server at http://localhost:5500
npm run check      # html-validate + internal link check (what CI runs on PRs)
npm run release    # open a PR from dev → main
```

To ship a change: work on `dev`, run `npm run check`, then `npm run release`
(or the `/ship` slash command) to open the PR. Once CI is green and the PR
merges, `main` auto-deploys. Other slash commands: `/wip` (checkpoint dev),
`/sitrep` (status report), `/add-deck` (scaffold a new HTML slide deck).

## Hosting & deployment

Static site on **GitHub Pages**, published by GitHub Actions
(`.github/workflows/deploy.yml`) on every push to `main`;
`.github/workflows/ci.yml` runs the lint + link checks on pull requests. The
custom domain comes from the `CNAME` file (`chemlessons.xyz`), with **Enforce
HTTPS** on.

DNS is managed at WordPress.com (the domain's nameservers) and points the apex
at GitHub Pages, mirroring docmayscience.com:

| Type  | Host  | Value                                              |
| ----- | ----- | -------------------------------------------------- |
| A     | `@`   | `185.199.108.153`–`185.199.111.153` (4 records)    |
| AAAA  | `@`   | `2606:50c0:8000::153`–`2606:50c0:8003::153` (4 records) |
| CNAME | `www` | `jwmay.github.io`                                  |

The Google MX (email) records are left untouched.

## License

Site content is intended for sharing under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) —
see `about.html#license` and adjust if you prefer different terms.
