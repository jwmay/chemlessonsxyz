# CLAUDE.md

Guidance for Claude Code working in this repo. For the project layout, the
content model (`js/data.js`), and resource conventions, read
**[README.md](README.md)** — it is the source of truth and this file does not
repeat it. For day-to-day operations — the npm scripts, slash commands, and the
ship / add-content / version-tracking flows — read **[WORKFLOW.md](WORKFLOW.md)**.

## What this is

A free high-school chemistry curriculum site — plain HTML, one shared
`css/style.css`, a little vanilla JS (`js/main.js`, `js/curriculum.js`). No
framework, no build step. Nearly all page content renders from **`js/data.js`**.
Deployed to **chemlessons.xyz** via GitHub Pages (GitHub Actions).

## Guardrails

- **Never commit directly to `main`.** `main` is production and auto-deploys
  to chemlessons.xyz. Work on `dev`; ship via a PR (`/ship`, or
  `npm run release`).
- **Run `npm run check` before finishing** any HTML/CSS change — it runs
  `html-validate` + an internal link check, exactly what CI runs on every PR.
  The pages are lint-clean; keep them that way.
- **No inline `style=` attributes.** Add or extend a class in `css/style.css`
  instead (the `no-inline-style` rule fails the build otherwise). Design tokens
  live in `:root` at the top of the stylesheet — change a color/size there, not
  ad hoc.
- **Content goes in `js/data.js`, not the HTML** — course tracks, units,
  resources, and slide decks all render from it. See the README.
- **Match the link/asset path style of the file you're editing** — most pages
  use relative paths (`css/style.css`); `404.html` uses root-absolute
  (`/css/style.css`) on purpose, since it's served for arbitrary URLs.
- Prefer the project slash commands over raw git: `/ship`, `/wip`, `/sitrep`,
  `/add-deck`.

## Icons — Font Awesome Pro kit (read before adding any icon)

Every page's `<head>` loads a Font Awesome **Pro kit** (kit `83c74fddfb`, with
the **Classic Solid** and **Duotone Solid** styles enabled):

```html
<script src="https://kit.fontawesome.com/83c74fddfb.js" crossorigin="anonymous"></script>
```

- Use only those two styles: `fa-solid …` (e.g. the nav toggle, search) and
  `fa-duotone fa-solid …` (e.g. `fa-flask`, `fa-notebook`). Other weights
  (regular/light/thin) and Sharp aren't in the kit and would render as blank
  boxes.
- When adding an icon, always give it a `data-fb` emoji fallback and
  `aria-hidden="true"`, matching the neighbouring markup and the `iconHTML()`
  helper in `js/main.js`. If the kit ever fails to load, those emoji show via
  the `.no-fa` class — so nothing looks broken.
- The kit's authorized domains must include `chemlessons.xyz`,
  `www.chemlessons.xyz`, and `localhost`.

## Verifying a rendered change

No build step — just serve the folder and open it:

```sh
npm run dev          # live-reload server at http://localhost:5500
# or: python3 -m http.server 8000  → http://localhost:8000
```

Font Awesome renders client-side, so a headless screenshot shows real icons
only once a real kit code is in place (otherwise you'll see the emoji
fallback, which is expected). `npm run check` catches HTML and broken-link
problems that a screenshot won't.
