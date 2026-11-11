# Owori Analytics website

The website for [Owori Analytics](https://www.youtube.com/@OworiAnalytics), a YouTube channel by Owori Benard that teaches biostatistics, epidemiology and data analysis in SPSS, Stata and R.

It is a static site: plain HTML, CSS and JavaScript with no build step and no dependencies. It can be hosted on GitHub Pages, Cloudflare Pages, Netlify or any web server.

## What is in it

| Page | Purpose |
|---|---|
| `index.html` | Home page: courses, learning path, most-watched lessons, about and services |
| `spss.html`, `stata.html`, `r.html` | Course classrooms with a player, a syllabus grouped into modules and saved progress |
| `test-finder.html` | "Which statistical test should I use?" guide that links each test to its lessons |
| `library.html` | Search, filter and sort every video on the channel |
| `brand.html` | Brand guide: logo, colours, typography and voice |

Lessons play from YouTube inside the site. A learner's progress is saved in their own browser.

## Run it locally

```bash
node scripts/serve.mjs
```

Then open http://localhost:4173.

## Update the videos

All video data comes from the public channel. When new videos are published, run:

```bash
node scripts/fetch-channel.mjs
```

This rewrites `data/channel.json` and `data/channel.js`. New lessons then appear in the courses, the library and the Test Finder without any other change. No API key is needed.

## Edit the content

- `data/site.js` holds the course names and descriptions, the topic rules that group lessons into modules, and the Test Finder questions.
- Set `contactEmail` in `data/site.js` and every "Get in touch" button becomes an email link. Until then the buttons open the YouTube channel.
- `scripts/make-pages.mjs` regenerates the inner pages if you change a page title or description.
- The services in the "Work with Owori Analytics" section of `index.html` are a starting draft. Edit them to match what is actually offered.

## Brand files

Logos are in `assets/brand/` as SVG: the full logo, a reverse version for dark backgrounds, and the mark on its own. Colours and fonts are defined at the top of `assets/css/site.css`.

## Publish with GitHub Pages

In the repository settings, open Pages, choose "Deploy from a branch", then select the `main` branch and the root folder. Pages on a private repository needs a paid GitHub plan, so either make the repository public or use another host.
