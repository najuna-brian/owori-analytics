// Test Finder: walks the decision tree in data/site.js and lists the matching lessons.
(() => {
  const { all, esc, icon, thumb, softwareOf, softwareLabel } = window.OA;
  const tree = window.FINDER;
  const box = document.querySelector('#finder');
  let trail = []; // [{ node, label }]

  const lessonsFor = (node) => all.filter((v) => node.match.test(v.title) && !(node.exclude && node.exclude.test(v.title)));
  const mini = (v) => `<button class="mini" type="button" data-play="${v.id}"><span class="thumb"><img src="${thumb(v.id)}" alt="" loading="lazy"></span><span><b>${esc(v.title)}</b><small>${v.duration || 'Short'}</small></span></button>`;

  function render() {
    const key = trail.length ? trail[trail.length - 1].go : 'start';
    const node = tree[key];
    const crumbs = `<div class="trail">${trail.map((t) => `<span class="chip">${esc(t.label)}</span>`).join('')}</div>`;
    const nav = trail.length ? `<div class="finder-nav"><button class="btn btn-ghost btn-sm" type="button" data-back>${icon('back')} Back</button><button class="btn btn-ghost btn-sm" type="button" data-restart>Start again</button></div>` : '';

    if (node.q) {
      box.innerHTML = `${crumbs}<div class="result-badge">Question ${trail.length + 1}</div><h2>${esc(node.q)}</h2>
        <div class="options">${node.options.map((o, i) => `<button class="option" type="button" data-i="${i}"><span><b>${esc(o.label)}</b>${o.hint ? `<small>${esc(o.hint)}</small>` : ''}</span>${icon('arrow')}</button>`).join('')}</div>${nav}`;
    } else {
      const found = lessonsFor(node);
      const groups = [['concept', 'Understand the idea'], ['spss', 'Do it in SPSS'], ['stata', 'Do it in Stata'], ['r', 'Do it in R']]
        .map(([sw, title]) => ({ sw, title, list: found.filter((v) => softwareOf(v) === sw) }))
        .filter((g) => g.list.length);
      box.innerHTML = `${crumbs}<div class="result-badge">${icon('check')} Recommended test</div><h2>${esc(node.test)}</h2><p class="lead">${esc(node.why)}</p>
        <div class="lesson-groups">${groups.map((g) => `<div><h3><span class="chip" data-sw="${g.sw}">${softwareLabel[g.sw]}</span>${g.title}</h3><div class="mini-list">${g.list.map(mini).join('')}</div></div>`).join('') || '<p class="muted">There is no lesson on this test yet.</p>'}</div>
        ${nav}<p class="note">This tool is a guide for common study designs. Always check the assumptions of the test against your own data, and confirm the choice with your supervisor or statistician.</p>`;
    }
    box.querySelector('h2').setAttribute('tabindex', '-1');
  }

  box.addEventListener('click', (e) => {
    const o = e.target.closest('.option');
    const key = trail.length ? trail[trail.length - 1].go : 'start';
    if (o) trail.push(tree[key].options[Number(o.dataset.i)]);
    else if (e.target.closest('[data-back]')) trail.pop();
    else if (e.target.closest('[data-restart]')) trail = [];
    else return;
    render();
    box.querySelector('h2').focus({ preventScroll: true });
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  render();
})();
