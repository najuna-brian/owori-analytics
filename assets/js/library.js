// Library page: search, filter and sort every video on the channel.
(() => {
  const { S, all, esc, icon, card, softwareOf } = window.OA;
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const state = { q: params.get('q') || '', sw: params.get('software') || 'all', topic: params.get('topic') || 'all', sort: 'course' };

  const order = new Map();
  S.courses.forEach((c, ci) => c.lessons.forEach((v, i) => { if (!order.has(v.id)) order.set(v.id, ci * 1000 + i); }));
  const topics = S.topicOrder.map((k) => S.topics.find((t) => t.key === k)).filter((t) => all.some((v) => v.topic === t.key));
  const filters = [['all', 'All'], ['spss', 'SPSS'], ['stata', 'Stata'], ['r', 'R'], ['concept', 'Concepts'], ['short', 'Shorts']];

  $('#filters').innerHTML = filters.map(([k, l]) => `<button class="filter" type="button" data-sw="${k}">${l}</button>`).join('');
  $('#topic').innerHTML = '<option value="all">All topics</option>' + topics.map((t) => `<option value="${t.key}">${esc(t.name)}</option>`).join('');
  $('#search-icon').innerHTML = icon('search');
  $('#q').value = state.q;
  $('#topic').value = state.topic;

  const sorters = {
    course: (a, b) => (order.get(a.id) ?? 9e6) - (order.get(b.id) ?? 9e6),
    views: (a, b) => b.views - a.views,
    short: (a, b) => (a.seconds || 9e6) - (b.seconds || 9e6),
    long: (a, b) => (b.seconds || 0) - (a.seconds || 0),
  };

  function render() {
    const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = all.filter((v) => {
      if (state.sw === 'short' ? !v.short : state.sw !== 'all' && softwareOf(v) !== state.sw) return false;
      if (state.topic !== 'all' && v.topic !== state.topic) return false;
      const hay = `${v.title} ${softwareOf(v)} ${OA.topicName[v.topic]}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    }).sort(sorters[state.sort]);
    document.querySelectorAll('.filter').forEach((b) => b.setAttribute('aria-pressed', b.dataset.sw === state.sw));
    $('#count').textContent = `${list.length} of ${all.length} videos`;
    $('#grid').innerHTML = list.map(card).join('');
    $('#empty').hidden = list.length > 0;
  }

  $('#q').addEventListener('input', (e) => { state.q = e.target.value; render(); });
  $('#topic').addEventListener('change', (e) => { state.topic = e.target.value; render(); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  $('#filters').addEventListener('click', (e) => { const b = e.target.closest('.filter'); if (b) { state.sw = b.dataset.sw; render(); } });
  $('#reset').addEventListener('click', () => { Object.assign(state, { q: '', sw: 'all', topic: 'all' }); $('#q').value = ''; $('#topic').value = 'all'; render(); });
  document.addEventListener('oa:progress', render);
  render();
})();
