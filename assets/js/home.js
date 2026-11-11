// Home page: fills in the numbers, course cards, learning path and most-watched lessons.
(() => {
  const { C, S, all, esc, icon, card, progress, fmtHours, contactHref } = window.OA;
  const $ = (s) => document.querySelector(s);

  const seconds = all.reduce((a, v) => a + (v.seconds || 0), 0);
  const views = all.reduce((a, v) => a + v.views, 0);
  const stats = [
    [all.length, 'free video tutorials'],
    [S.courses.length, 'structured courses'],
    [`${Math.floor(seconds / 3600)}+`, 'hours of teaching'],
    [`${Math.floor(views / 10000) * 10}K+`, 'views from learners'],
  ];
  $('#stats').innerHTML = stats.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');

  const deco = '<svg class="deco" viewBox="0 0 170 100" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" aria-hidden="true"><path d="M5 92C50 92 55 12 85 12s35 80 80 80"/></svg>';
  function courses() {
    $('#courses-grid').innerHTML = S.courses.map((c) => {
      const done = progress.count(c.lessons);
      const pct = c.lessons.length ? Math.round((done / c.lessons.length) * 100) : 0;
      return `<a class="card course-card" data-sw="${c.key}" href="${c.page}">
        <div class="course-top"><div class="sw">${c.software}</div><div class="sw-sub">${esc(c.level)}</div>${deco}</div>
        <div class="course-body"><h3>${esc(c.name)}</h3><p>${esc(c.tagline)}</p>
          <div class="course-meta"><span>${icon('list')} ${c.lessons.length} lessons</span><span>${icon('clock')} ${fmtHours(c.seconds)}</span></div>
          ${done ? `<div><div class="progress-label"><span>Your progress</span><span>${done} of ${c.lessons.length}</span></div><div class="progress"><i style="width:${pct}%"></i></div></div>` : ''}
          <span class="btn btn-ghost btn-sm" style="align-self:flex-start">${done ? 'Continue course' : 'Start course'} ${icon('arrow')}</span>
        </div></a>`;
    }).join('');
  }
  courses();
  document.addEventListener('oa:progress', courses);

  const path = S.topicOrder
    .map((key) => ({ key, topic: S.topics.find((t) => t.key === key), n: all.filter((v) => v.topic === key).length }))
    .filter((t) => t.n && !['ai'].includes(t.key));
  $('#path-list').innerHTML = path.map((t) => `<li><a href="library.html?topic=${t.key}"><span><b>${esc(t.topic.name)}</b><small>${t.n} lesson${t.n > 1 ? 's' : ''}</small></span></a></li>`).join('');

  const popular = [...C.videos].sort((a, b) => b.views - a.views).slice(0, 8);
  $('#popular-grid').innerHTML = popular.map(card).join('');

  $('#about-photo').src = C.channel.avatar;
  $('#subs').textContent = C.channel.subscribers.replace(/\s*subscribers/i, '');
  document.querySelectorAll('[data-contact]').forEach((a) => {
    a.href = contactHref;
    if (!S.contactEmail) { a.target = '_blank'; a.rel = 'noopener'; }
  });
})();
