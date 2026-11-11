// Refreshes data/channel.json and data/channel.js from the public YouTube channel.
// Usage: node scripts/fetch-channel.mjs
// No API key or dependencies needed. Re-run whenever new videos are published.
import { writeFile } from 'node:fs/promises';

const HANDLE = '@OworiAnalytics';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const HEADERS = { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' };

const walk = (o, key, out = []) => {
  if (o && typeof o === 'object') for (const k in o) { if (k === key) out.push(o[k]); walk(o[k], key, out); }
  return out;
};

async function page(url) {
  const html = await (await fetch(url, { headers: HEADERS })).text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) throw new Error('Could not read page data from ' + url);
  return {
    data: JSON.parse(m[1]),
    key: html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1],
    version: html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1],
  };
}

async function more(token, key, version) {
  const res = await fetch('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false&key=' + key, {
    method: 'POST',
    headers: { ...HEADERS, 'content-type': 'application/json' },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: version, hl: 'en', gl: 'US' } }, continuation: token }),
  });
  return res.json();
}

const toSeconds = (t) => (t || '').split(':').reduce((a, n) => a * 60 + Number(n), 0);
const toNumber = (t) => {
  const m = (t || '').replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return 0;
  return Math.round(Number(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] || 1));
};

function readShort(s) {
  const id = walk(s, 'reelWatchEndpoint')[0]?.videoId;
  const m = (s.accessibilityText || '').match(/^(.*), ([\d.,]+\s?[KMB]?) views? - play Short$/i);
  return id ? { id, title: (m ? m[1] : s.accessibilityText || '').replace(/\s*#\w+/g, '').trim(), views: toNumber(m?.[2]), short: true } : null;
}

function readVideo(l) {
  if (!l.contentId || !/VIDEO|SHORT/.test(l.contentType || 'VIDEO')) return null;
  const meta = walk(l.metadata, 'content').filter((s) => typeof s === 'string');
  const badge = walk(l.contentImage, 'thumbnailBadgeViewModel').map((b) => b.text).find((t) => /^\d+(:\d+)+$/.test(t || ''));
  const views = meta.slice(1).find((s) => /^[\d.,]+\s?[KMB]?( views?)?$/i.test(s));
  const age = meta.find((s) => /ago$/i.test(s));
  return { id: l.contentId, title: meta[0], duration: badge || '', seconds: toSeconds(badge), views: toNumber(views), age: age || '' };
}

async function playlist(id) {
  const { data, key, version } = await page('https://www.youtube.com/playlist?list=' + id);
  const videos = [];
  let source = data;
  for (let guard = 0; guard < 50; guard++) {
    for (const l of walk(source, 'lockupViewModel')) { const v = readVideo(l); if (v) videos.push(v); }
    for (const l of walk(source, 'shortsLockupViewModel')) { const v = readShort(l); if (v) videos.push(v); }
    const token = walk(source, 'continuationCommand').map((c) => c.token).find(Boolean);
    if (!token) break;
    source = await more(token, key, version);
  }
  const seen = new Set();
  return videos.filter((v) => !seen.has(v.id) && seen.add(v.id));
}

const home = await page(`https://www.youtube.com/${HANDLE}/playlists`);
const meta = walk(home.data, 'channelMetadataRenderer')[0];
const channelId = meta.externalId;
const headerText = walk(walk(home.data, 'pageHeaderViewModel')[0], 'content').filter((s) => typeof s === 'string');

const lists = walk(home.data, 'lockupViewModel')
  .filter((l) => /PLAYLIST|COURSE/.test(l.contentType || ''))
  .map((l) => ({ id: l.contentId, title: walk(l.metadata, 'content').find((s) => typeof s === 'string') }));

const suffix = channelId.slice(2);
const videos = await playlist('UULF' + suffix);
let shorts = [];
try { shorts = await playlist('UUSH' + suffix); } catch { /* channel has no Shorts */ }

const playlists = [];
for (const l of lists) playlists.push({ ...l, videoIds: (await playlist(l.id)).map((v) => v.id) });

const out = {
  fetchedAt: new Date().toISOString().slice(0, 10),
  channel: {
    id: channelId,
    handle: HANDLE,
    title: meta.title,
    url: `https://www.youtube.com/${HANDLE}`,
    description: meta.description,
    subscribers: headerText.find((s) => /subscribers/.test(s)) || '',
    avatar: meta.avatar?.thumbnails?.at(-1)?.url || '',
  },
  playlists,
  videos,
  shorts,
};

await writeFile('data/channel.json', JSON.stringify(out, null, 1));
await writeFile('data/channel.js', 'window.CHANNEL = ' + JSON.stringify(out) + ';\n');
console.log(`${videos.length} videos, ${shorts.length} Shorts, ${playlists.map((p) => `${p.title}: ${p.videoIds.length}`).join(' | ')}`);
console.log(out.channel.subscribers, '|', videos.reduce((a, v) => a + v.views, 0), 'views on long videos');
