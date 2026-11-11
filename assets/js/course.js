// Course page: a classroom view with a player, a syllabus grouped into modules and saved progress.
(() => {
  const { S, C, esc, icon, embed, watchUrl, progress, courseOf, topicName, fmtHours } = window.OA;
  const course = courseOf(document.body.dataset.course);
  const main = document.querySelector('main');
  const lessons = course.lessons;
  const poster = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  main.innerHTML = `
    <section class="page-hero"><div class="container">
      <div class="crumbs"><a href="index.html">Home</a> / <a href="index.html#courses">Courses</a> / ${esc(course.software)}</div>
      <div class="eyebrow">${esc(course.level)} course</div>
      <h1>${esc(course.name)}</h1>
      <p>${esc(course.blurb)}</p>
      <div class="hero-meta"><span>${icon('list')} ${lessons.length} lessons</span><span>${icon('clock')} ${fmtHours(course.seconds)}</span><span>${icon('level')} ${course.modules.length} modules</span><span>${icon('check')} Free on YouTube</span></div>
      <div class="hero-progress"><div class="progress-label"><span>Your progress</span><span id="progress-text"></span></div><div class="progress"><i id="progress-bar"></i></div></div>
    </div></section>
    <div class="container classroom">
      <div class="stage">
        <div class="player" id="player"></div>
        <div class="now">
          <div class="kicker" id="kicker"></div>
          <h2 id="now-title"></h2>
          <div class="now-actions">
            <button class="btn btn-ghost btn-sm" id="prev" type="button">${icon('back')} Previous</button>
            <button class="btn btn-primary btn-sm" id="next" type="button">Next lesson ${icon('arrow')}</button>
            <button class="btn btn-ghost btn-sm" id="done" type="button"></button>
            <a class="btn btn-ghost btn-sm" id="yt" target="_blank" rel="noopener">${icon('youtube')} Watch on YouTube</a>
          </div>
        </div>
      </div>
      <aside class="syllabus" aria-label="Course syllabus">
        <div class="syllabus-head"><h2>Syllabus</h2><span class="muted" style="font-size:.88rem">Pick any lesson, or follow them in order.</span></div>
        <div class="syllabus-scroll" id="syllabus"></div>
      </aside>
    </div>
    <section class="container"><div class="cta-band">
      <div><h2>Not sure which test fits your data?</h2><p>Answer a few questions and the Test Finder points you to the right test, with the matching lessons in SPSS and Stata.</p></div>
      <div class="hero-cta"><a class="btn btn-amber" href="test-finder.html">Open the Test Finder ${icon('arrow')}</a><a class="btn btn-onDark" href="${course.playlistUrl}" target="_blank" rel="noopener">${icon('youtube')} Full playlist</a></div>
    </div></section>`;

  const $ = (s) => main.querySelector(s);
  let current = lessons.find((v) => v.id === location.hash.slice(1)) || lessons.find((v) => !progress.has(v.id)) || lessons[0];

  function syllabus() {
    $('#syllabus').innerHTML = course.modules.map((m) => {
      const done = progress.count(m.lessons);
      const open = m.lessons.includes(current) ? ' open' : '';
      return `<details class="module"${open}><summary><span>${esc(m.name)}</span><small>${done}/${m.lessons.length}</small></summary><ol class="lessons">${m.lessons.map((v) => {
        const n = lessons.indexOf(v) + 1;
        const w = progress.has(v.id);
        return `<li><button class="lesson${w ? ' watched' : ''}" type="button" data-lesson="${v.id}"${v === current ? ' aria-current="true"' : ''}><span class="n">${w ? icon('check') : n}</span><span>${esc(v.title)}</span><time>${v.duration || 'Short'}</time></button></li>`;
      }).join('')}</ol></details>`;
    }).join('');
    const done = progress.count(lessons);
    $('#progress-text').textContent = `${done} of ${lessons.length} lessons`;
    $('#progress-bar').style.width = `${(done / lessons.length) * 100}%`;
    const w = progress.has(current.id);
    const btn = $('#done');
    btn.classList.toggle('is-done', w);
    btn.innerHTML = `${icon('check')} ${w ? 'Completed' : 'Mark as complete'}`;
  }

  function show(v, autoplay) {
    current = v;
    const i = lessons.indexOf(v);
    $('#player').innerHTML = autoplay ? embed(v.id) : `<button class="poster" type="button" aria-label="Play lesson"><img src="${poster(v.id)}" alt=""><span class="big-play"><span>${icon('play')}</span></span></button>`;
    $('#kicker').innerHTML = `<span class="chip" data-sw="${course.key}">Lesson ${i + 1} of ${lessons.length}</span><span>${esc(v.short ? 'Quick tip' : topicName[v.topic])}</span>${v.duration ? `<span>${v.duration}</span>` : ''}`;
    $('#now-title').textContent = v.title;
    $('#yt').href = watchUrl(v);
    $('#prev').disabled = i === 0;
    $('#next').disabled = i === lessons.length - 1;
    history.replaceState(null, '', `#${v.id}`);
    document.title = `${v.title} | ${course.name} | ${S.name}`;
    syllabus();
  }

  main.addEventListener('click', (e) => {
    if (e.target.closest('.poster')) { $('#player').innerHTML = embed(current.id); return; }
    const l = e.target.closest('[data-lesson]');
    if (l) {
      show(lessons.find((v) => v.id === l.dataset.lesson), true);
      if (matchMedia('(max-width: 980px)').matches) $('#player').scrollIntoView({ block: 'center' });
      return;
    }
    const i = lessons.indexOf(current);
    if (e.target.closest('#prev') && i > 0) show(lessons[i - 1], true);
    if (e.target.closest('#next') && i < lessons.length - 1) { progress.set(current.id, true); show(lessons[i + 1], true); }
    if (e.target.closest('#done')) { progress.set(current.id, !progress.has(current.id)); syllabus(); }
  });
  window.addEventListener('hashchange', () => {
    const v = lessons.find((x) => x.id === location.hash.slice(1));
    if (v && v !== current) show(v, true);
  });

  show(current, false);
})();
