// Writes the thin inner pages that share one <head>. Run after changing a title or description:
//   node scripts/make-pages.mjs
import { writeFile } from 'node:fs/promises';

const head = (title, desc) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Owori Analytics</title>
  <meta name="description" content="${desc}">
  <meta property="og:title" content="${title} | Owori Analytics">
  <meta property="og:description" content="${desc}">
  <meta name="theme-color" content="#0B2545">
  <link rel="icon" href="assets/brand/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/site.css">
</head>
`;
const scripts = (page) => `<script src="data/channel.js"></script>
<script src="data/site.js"></script>
<script src="assets/js/site.js"></script>
${page ? `<script src="assets/js/${page}.js"></script>\n` : ''}</body>
</html>
`;
const hero = (crumb, eyebrow, h1, p, extra = '') => `  <section class="page-hero"><div class="container">
    ${crumb ? `<div class="crumbs"><a href="index.html">Home</a> / ${crumb}</div>` : ''}
    <div class="eyebrow">${eyebrow}</div>
    <h1>${h1}</h1>
    <p>${p}</p>${extra}
  </div></section>`;

const pages = {};

for (const [key, title, desc] of [
  ['spss', 'SPSS for Data Analysis', 'A free SPSS course: data entry, chi-square, t-tests, ANOVA, correlation, regression, survival analysis, factor analysis and GEE.'],
  ['stata', 'The Complete Beginner&rsquo;s Guide to Stata', 'A free Stata course: do-files, data management, hypothesis tests, linear, logistic and count regression, and Cox models.'],
  ['r', 'R Programming for Data Analysis', 'A free beginner course in R and RStudio: data types, data structures, functions, loops, packages, dplyr and tidyr.'],
]) pages[key] = `${head(title, desc)}<body data-course="${key}">\n<main></main>\n${scripts('course')}`;

pages.library = `${head('Video library', 'Search every Owori Analytics tutorial by topic and software: SPSS, Stata, R and statistics concepts.')}<body>
<main>
${hero('Library', 'Video library', 'Find the exact lesson you need', 'Search every tutorial by test, model or software. Videos you have watched are ticked.')}
  <div class="container">
    <div class="toolbar">
      <label class="search"><span class="sr-only">Search lessons</span><span id="search-icon"></span><input id="q" type="search" placeholder="Search, for example logistic regression or ANOVA" autocomplete="off"></label>
      <label><span class="sr-only">Topic</span><select class="select" id="topic"></select></label>
      <label><span class="sr-only">Sort</span><select class="select" id="sort"><option value="course">Course order</option><option value="views">Most watched</option><option value="short">Shortest first</option><option value="long">Longest first</option></select></label>
    </div>
    <div class="filters" id="filters"></div>
    <p class="result-count" id="count" aria-live="polite"></p>
    <div class="grid videos" id="grid"></div>
    <div class="empty" id="empty" hidden><p>No lessons match that search.</p><button class="btn btn-ghost btn-sm" id="reset" type="button">Clear filters</button></div>
  </div>
</main>
${scripts('library')}`;

pages['test-finder'] = `${head('Test Finder: which statistical test should I use?', 'Answer a few questions about your outcome and study design to find the right statistical test, with lessons in SPSS and Stata.')}<body>
<main>
${hero('Test Finder', 'Test Finder', 'Which statistical test should I use?', 'Answer a few questions about your outcome and study design. You will get a recommended test and the lessons that show you how to run it.')}
  <div class="container"><div class="finder"><div class="finder-card" id="finder"></div></div></div>
</main>
${scripts('finder')}`;

pages['404'] = `${head('Page not found', 'This page does not exist.')}<body>
<main>
${hero('', 'Error 404', 'This page is an outlier', 'The page you asked for does not exist. Head back and keep learning.', '\n    <div class="hero-cta"><a class="btn btn-amber" href="index.html">Go to the home page</a><a class="btn btn-onDark" href="library.html">Browse the library</a></div>')}
</main>
${scripts('')}`;

const swatch = (hex, name, use) => `<div class="swatch"><i style="background:${hex}"></i><div><b>${name}</b>${hex}<br><span class="muted">${use}</span></div></div>`;
pages.brand = `${head('Brand guide', 'Logo, colours, typography and voice for Owori Analytics.')}<body>
<main>
${hero('Brand guide', 'Brand guide', 'The Owori Analytics identity', 'Logo files, colours, typography and tone of voice. Use this page for thumbnails, slides, social posts and printed material.')}
  <section class="section"><div class="container">
    <div class="section-head"><div class="eyebrow">Logo</div><h2>A bell curve inside the O</h2>
      <p class="lead">The ring is the O of Owori. Inside it sits a normal distribution, the first idea every statistics student meets, and its peak reads as the A of Analytics. The amber point marks the mean: the clear answer in the middle of the data.</p></div>
    <div class="grid c3">
      <div><div class="logo-tile light"><img src="assets/brand/logo-full.svg" alt="Owori Analytics logo on a light background"></div><p class="muted" style="margin-top:10px">Primary logo. <a href="assets/brand/logo-full.svg" download>Download SVG</a></p></div>
      <div><div class="logo-tile dark"><img src="assets/brand/logo-full-reverse.svg" alt="Owori Analytics logo on a dark background"></div><p class="muted" style="margin-top:10px">Reverse logo for dark backgrounds. <a href="assets/brand/logo-full-reverse.svg" download>Download SVG</a></p></div>
      <div><div class="logo-tile light" style="gap:22px;grid-auto-flow:column"><img src="assets/brand/logo-mark.svg" alt="Owori Analytics mark" width="64"><img src="assets/brand/logo-mark-reverse.svg" alt="Owori Analytics reverse mark" width="64" style="box-shadow:0 0 0 1px #E2E8F0;border-radius:15px"></div><p class="muted" style="margin-top:10px">Mark for avatars and favicons. <a href="assets/brand/logo-mark.svg" download>Download SVG</a></p></div>
    </div>
    <ul class="checks" style="margin-top:28px">
      <li><span>Keep clear space around the logo of at least a quarter of the mark&rsquo;s height.</span></li>
      <li><span>Do not stretch, recolour, rotate or add effects. Use the reverse version on navy or on photographs.</span></li>
      <li><span>The wordmark is set in Plus Jakarta Sans: &ldquo;Owori&rdquo; in ExtraBold and &ldquo;Analytics&rdquo; in Medium. Convert the text to outlines before sending the SVG to a printer.</span></li>
    </ul>
  </div></section>
  <section class="section alt"><div class="container">
    <div class="section-head"><div class="eyebrow">Colour</div><h2>Trust, clarity and one warm highlight</h2></div>
    <div class="swatches">
      ${[['#0B2545', 'Deep Navy', 'Primary. Authority.'], ['#0E8C88', 'Insight Teal', 'Buttons and links.'], ['#2EC4B6', 'Bright Teal', 'Charts and dark mode.'], ['#FFB400', 'Signal Amber', 'Highlights only.'], ['#F6F8FB', 'Paper', 'Page background.'], ['#0F1B2D', 'Ink', 'Body text.']].map((s) => swatch(...s)).join('\n      ')}
    </div>
    <p class="muted" style="margin-top:18px">Software accents used on labels: SPSS teal #0E8C88, Stata blue #3D5AF1, R ochre #C77700, Concepts violet #6B4FD8.</p>
  </div></section>
  <section class="section"><div class="container split">
    <div><div class="eyebrow">Typography</div>
      <p class="type-sample">Plus Jakarta Sans for headings</p>
      <p class="lead" style="margin-top:14px">Inter for body text. It stays readable at small sizes, in tables and on slides full of numbers.</p>
      <p class="muted">Both are free Google Fonts. Use sentence case for headings. Write statistics exactly, for example p = 0.003.</p></div>
    <div><div class="eyebrow">Voice</div>
      <ul class="checks">
        <li><span><strong>Clear.</strong> Plain words first, the technical term second.</span></li>
        <li><span><strong>Practical.</strong> Every idea ends in a step the learner can do.</span></li>
        <li><span><strong>Encouraging.</strong> Statistics is a skill anyone can learn, one test at a time.</span></li>
        <li><span><strong>Rigorous.</strong> Assumptions, limits and honest interpretation always get a mention.</span></li>
      </ul></div>
  </div></section>
</main>
${scripts('')}`;

for (const [name, html] of Object.entries(pages)) await writeFile(`${name}.html`, html);
console.log('Wrote', Object.keys(pages).map((n) => `${n}.html`).join(', '));
