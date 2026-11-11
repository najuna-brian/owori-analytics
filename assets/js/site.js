// Shared code for every page: data model, header and footer, theme, progress and the video player.
(() => {
  const C = window.CHANNEL;
  const S = window.SITE;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tidy = (t) => { t = String(t).replace(/\s+/g, ' ').replace(/\s+([:,])/g, '$1').trim(); return t.charAt(0).toUpperCase() + t.slice(1); };

  const icons = {
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    back: '<path d="M19 12H5m6 6-6-6 6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    level: '<path d="M5 20v-4m7 4V10m7 10V4"/>',
    youtube: '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8z" fill="currentColor" stroke="none"/><path d="M10 15.2V8.8l5.2 3.2z" fill="var(--yt-play, var(--surface))" stroke="none"/>',
    external: '<path d="M14 5h5v5m0-5-8 8M10 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4"/>',
    cap: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c2 2 10 2 12 0v-4.5M22 9v5"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9"/>',
    heart: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    chart: '<path d="M4 20V4m0 16h16M8 16v-4m4 4V8m4 8v-6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.500 6"/>',
  };
  const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || ''}</svg>`;
  const mark = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="var(--mark-bg)"/><circle cx="32" cy="32" r="18.5" fill="none" stroke="var(--mark-ring)" stroke-width="5"/><path d="M21.5 39.5C27 39.5 28 23.5 32 23.5s5 16 10.500 16" fill="none" stroke="var(--mark-curve)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="23.5" r="3.4" fill="#FFB400"/></svg>';

  // ---- Data model -------------------------------------------------------
  const all = [...C.videos, ...C.shorts];
  const byId = new Map(all.map((v) => [v.id, v]));
  const topicName = Object.fromEntries(S.topics.map((t) => [t.key, t.name]));
  for (const v of all) {
    v.title = tidy(v.title);
    v.topic = S.topics.find((t) => t.test.test(v.title)).key;
    v.concept = S.concept.test(v.title);
    v.course = null;
  }
  for (const c of S.courses) {
    const p = C.playlists.find((pl) => c.playlist.test(pl.title));
    c.playlistId = p ? p.id : '';
    c.playlistUrl = p ? `https://www.youtube.com/playlist?list=${p.id}` : C.channel.url;
    c.lessons = (p ? p.videoIds : []).map((id) => byId.get(id)).filter(Boolean);
    c.lessons.forEach((v) => { if (!v.course) v.course = c.key; });
    c.seconds = c.lessons.reduce((a, v) => a + (v.seconds || 0), 0);
    // Group lessons into modules by topic, keeping the playlist order.
    c.modules = [];
    for (const v of c.lessons) {
      const key = v.short ? 'tips' : v.topic;
      let m = c.modules.find((x) => x.key === key);
      if (!m) c.modules.push((m = { key, name: v.short ? 'Quick tips (Shorts)' : topicName[key], lessons: [] }));
      m.lessons.push(v);
    }
  }
  for (const v of all) {
    if (v.course) continue;
    if (/spss/i.test(v.title)) v.course = 'spss';
    else if (/stata/i.test(v.title)) v.course = 'stata';
  }
  const courseOf = (key) => S.courses.find((c) => c.key === key);
  const softwareOf = (v) => (v.concept ? 'concept' : v.course || 'concept');
  const softwareLabel = { spss: 'SPSS', stata: 'Stata', r: 'R', concept: 'Concept' };

  const fmtViews = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K` : String(n)) + ' views';
  const fmtHours = (sec) => { const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60); return h ? `${h} h ${m} min` : `${m} min`; };
  const thumb = (id) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
  const watchUrl = (v) => `https://www.youtube.com/${v.short ? 'shorts/' : 'watch?v='}${v.id}`;

  // ---- Progress (saved in this browser only) ----------------------------
  const KEY = 'oa-watched';
  let watched;
  try { watched = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { watched = new Set(); }
  const progress = {
    has: (id) => watched.has(id),
    set(id, on) {
      on ? watched.add(id) : watched.delete(id);
      try { localStorage.setItem(KEY, JSON.stringify([...watched])); } catch { /* private mode */ }
      document.dispatchEvent(new CustomEvent('oa:progress'));
    },
    count: (lessons) => lessons.filter((v) => watched.has(v.id)).length,
  };

  // ---- Theme ------------------------------------------------------------
  const root = document.documentElement;
  const storedTheme = (() => { try { return localStorage.getItem('oa-theme'); } catch { return null; } })();
  root.dataset.theme = storedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // ---- Header and footer ------------------------------------------------
  const here = location.pathname.split('/').pop() || 'index.html';
  const contactHref = S.contactEmail ? `mailto:${S.contactEmail}` : C.channel.url;
  const navLinks = [
    ['spss.html', 'SPSS'], ['stata.html', 'Stata'], ['r.html', 'R'],
    ['test-finder.html', 'Test Finder'], ['library.html', 'Library'], ['index.html#about', 'About'],
  ];

  function chrome() {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `<div class="container">
      <a class="brand" href="index.html" aria-label="${esc(S.name)} home">${mark}<span style="margin:0;color:inherit"><b>Owori</b><span>Analytics</span></span></a>
      <nav class="nav" id="nav" aria-label="Main">${navLinks.map(([h, l]) => `<a href="${h}"${h === here ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
      <div class="header-actions">
        <button class="icon-btn" id="theme-btn" type="button" aria-label="Switch colour theme"></button>
        <a class="btn btn-primary btn-sm" href="${C.channel.url}?sub_confirmation=1" target="_blank" rel="noopener">${icon('youtube')}<span>Subscribe</span></a>
        <button class="icon-btn menu-btn" id="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav">${icon('menu')}</button>
      </div></div>`;
    document.body.prepend(header);

    const themeBtn = header.querySelector('#theme-btn');
    const paint = () => { themeBtn.innerHTML = icon(root.dataset.theme === 'dark' ? 'sun' : 'moon'); };
    paint();
    themeBtn.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('oa-theme', root.dataset.theme); } catch { /* ignore */ }
      paint();
    });
    const menuBtn = header.querySelector('#menu-btn');
    const nav = header.querySelector('#nav');
    menuBtn.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open); });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) nav.classList.remove('open'); });

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `<div class="container">
      <div class="footer-grid">
        <div>
          <a class="brand" href="index.html">${mark}<span style="margin:0;color:inherit"><b>Owori</b><span>Analytics</span></span></a>
          <p class="muted" style="margin-top:14px;max-width:38ch">Free, step-by-step biostatistics and data analysis tutorials for students, researchers and public health practitioners.</p>
        </div>
        <div><h4>Courses</h4><ul>${S.courses.map((c) => `<li><a href="${c.page}">${esc(c.name)}</a></li>`).join('')}</ul></div>
        <div><h4>Learn</h4><ul><li><a href="test-finder.html">Test Finder</a></li><li><a href="library.html">Video library</a></li><li><a href="index.html#path">Learning path</a></li></ul></div>
        <div><h4>Connect</h4><ul><li><a href="${C.channel.url}" target="_blank" rel="noopener">YouTube channel</a></li><li><a href="${contactHref}"${S.contactEmail ? '' : ' target="_blank" rel="noopener"'}>Get in touch</a></li><li><a href="brand.html">Brand guide</a></li></ul></div>
      </div>
      <div class="footer-base"><span>&copy; ${new Date().getFullYear()} ${esc(S.name)}. ${esc(S.location)}.</span><span>Lessons are hosted on YouTube. SPSS, Stata and R are trademarks of their owners.</span></div>
    </div>`;
    document.body.append(footer);
  }

  // ---- Video card and modal player --------------------------------------
  function card(v) {
    const sw = softwareOf(v);
    return `<button class="video-card" type="button" data-play="${v.id}">
      <span class="thumb"><img src="${thumb(v.id)}" alt="" loading="lazy" width="320" height="180">
        ${progress.has(v.id) ? `<span class="done" title="Watched">${icon('check')}</span>` : ''}
        ${v.duration ? `<span class="dur">${v.duration}</span>` : v.short ? '<span class="dur">Short</span>' : ''}
        <span class="play"><span>${icon('play')}</span></span></span>
      <span class="video-info"><h3>${esc(v.title)}</h3>
        <span class="video-meta"><span class="chip" data-sw="${sw}">${softwareLabel[sw]}</span><span>${fmtViews(v.views)}</span>${v.age ? `<span>${esc(v.age)}</span>` : ''}</span></span>
    </button>`;
  }

  const embed = (id) => `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="Video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

  let dialog;
  function play(id) {
    const v = byId.get(id);
    if (!v) return;
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'modal';
      document.body.append(dialog);
      dialog.addEventListener('close', () => { dialog.innerHTML = ''; });
      dialog.addEventListener('click', (e) => { if (e.target === dialog || e.target.closest('[data-close]')) dialog.close(); });
    }
    const c = v.course && courseOf(v.course);
    const inCourse = c && c.lessons.includes(v);
    dialog.innerHTML = `<button class="icon-btn modal-close" type="button" data-close aria-label="Close player">${icon('close')}</button>
      <div class="player">${embed(v.id)}</div>
      <div class="modal-body"><div><h2>${esc(v.title)}</h2><span class="video-meta"><span class="chip" data-sw="${softwareOf(v)}">${softwareLabel[softwareOf(v)]}</span><span>${esc(topicName[v.topic])}</span>${v.duration ? `<span>${v.duration}</span>` : ''}</span></div>
      <div class="modal-actions">${inCourse ? `<a class="btn btn-primary btn-sm" href="${c.page}#${v.id}">Open in course ${icon('arrow')}</a>` : ''}<a class="btn btn-ghost btn-sm" href="${watchUrl(v)}" target="_blank" rel="noopener">${icon('youtube')} YouTube</a></div></div>`;
    dialog.showModal();
    progress.set(v.id, true);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-play]');
    if (b) play(b.dataset.play);
  });

  window.OA = { C, S, all, byId, esc, icon, mark, card, play, embed, thumb, watchUrl, progress, courseOf, softwareOf, softwareLabel, topicName, fmtViews, fmtHours, contactHref };
  chrome();
})();
