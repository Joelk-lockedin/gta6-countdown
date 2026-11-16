'use strict';

/* =====================================================================
   Data
   ===================================================================== */

// Every region unlocks at midnight on 19 November 2026 in its own store time zone.
const AUSTRALIA = { zone: 'AEDT', at: Date.parse('2026-11-18T13:00:00Z') };

const REGIONS = [
  { code: 'NZ', name: 'New Zealand',    countries: 'New Zealand (first in the world)',               zone: 'NZDT',  at: '2026-11-18T11:00:00Z' },
  { code: 'JP', name: 'Japan & Korea',  countries: 'Japan, South Korea',                             zone: 'JST',   at: '2026-11-18T15:00:00Z' },
  { code: 'SG', name: 'Singapore & HK', countries: 'Singapore, Hong Kong, Malaysia, Taiwan',         zone: 'UTC+8', at: '2026-11-18T16:00:00Z' },
  { code: 'ID', name: 'Indonesia',      countries: 'Indonesia, Thailand',                            zone: 'UTC+7', at: '2026-11-18T17:00:00Z' },
  { code: 'IN', name: 'India',          countries: 'India',                                          zone: 'IST',   at: '2026-11-18T18:30:00Z' },
  { code: 'AE', name: 'UAE',            countries: 'United Arab Emirates',                           zone: 'GST',   at: '2026-11-18T20:00:00Z' },
  { code: 'SA', name: 'Saudi & Turkey', countries: 'Saudi Arabia, Turkey',                           zone: 'UTC+3', at: '2026-11-18T21:00:00Z' },
  { code: 'ZA', name: 'South Africa',   countries: 'South Africa, Greece, Finland, Israel, Ukraine', zone: 'UTC+2', at: '2026-11-18T22:00:00Z' },
  { code: 'EU', name: 'Central Europe', countries: 'Germany, France, Italy, Netherlands, Poland',    zone: 'CET',   at: '2026-11-18T23:00:00Z' },
  { code: 'UK', name: 'United Kingdom', countries: 'UK, Ireland, Portugal, Iceland',                 zone: 'GMT',   at: '2026-11-19T00:00:00Z' },
  { code: 'BR', name: 'Brazil',         countries: 'Brazil, Argentina, Chile, Uruguay',              zone: 'UTC−3', at: '2026-11-19T03:00:00Z' },
  { code: 'BO', name: 'Bolivia',        countries: 'Bolivia',                                        zone: 'BOT',   at: '2026-11-19T04:00:00Z' },
  { code: 'US', name: 'United States',  countries: 'USA, Canada, Colombia, Peru',                    zone: 'ET',    at: '2026-11-19T05:00:00Z' },
  { code: 'MX', name: 'Mexico',         countries: 'Mexico, Costa Rica, Guatemala (last to unlock)', zone: 'CST',   at: '2026-11-19T06:00:00Z' },
];
const MAIN_REGIONS = ['NZ', 'JP', 'IN', 'EU', 'UK', 'US'];

const BACKGROUNDS = [
  ['cover-art.webp', 'Cover Art'],
  ['artwork.webp', 'Artwork'],
  ['trailer2-art.webp', 'Trailer 2 Art'],
  ['ultimate-edition.webp', 'Ultimate Edition'],
  ['ultimate-edition-2.webp', 'Ultimate Edition 2'],
  ['safehouse.webp', 'Safehouse'],
  ['goodtime-gear.webp', 'Good Time Gear'],
  ['boobie-ike.webp', 'Boobie Ike'],
  ['cal-hampton.webp', 'Cal Hampton'],
  ['leonida-keys.webp', 'Leonida Keys'],
  ['real-dimez.webp', 'Real Dimez'],
  ['vice-city-sign.webp', 'Vice City Sign'],
  ['vice-city-beach.webp', 'Vice City Beach'],
  ['vice-city.jpg', 'Vice City'],
  ['lucia.jpg', 'Lucia'],
  ['jason-and-lucia.avif', 'Jason and Lucia'],
  ['grassrivers-1.avif', 'Grassrivers'],
  ['grassrivers-2.avif', 'Grassrivers 2'],
];

const ALBUMS = {
  vi: {
    title: 'GTA VI: The Album',
    url: 'https://api.soundcloud.com/playlists/2300288925',
    page: 'https://soundcloud.com/atlanticrecords/sets/gtavithealbum',
    youtube: 'https://www.youtube.com/results?search_query=GTA+VI+The+Album',
  },
  v: {
    title: 'GTA V: Welcome to Los Santos',
    url: 'https://soundcloud.com/migbert-damazo/sets/the-alchemist-the-alchemist-oh',
    page: 'https://soundcloud.com/migbert-damazo/sets/the-alchemist-the-alchemist-oh',
    youtube: 'https://www.youtube.com/results?search_query=The+Alchemist+Oh+No+Welcome+to+Los+Santos+album',
  },
};

const $ = (sel, root = document) => root.querySelector(sel);
const pad = n => String(n).padStart(2, '0');

/* =====================================================================
   Settings (saved in this browser)
   ===================================================================== */

const STORE_KEY = 'gta6-countdown-settings';
const DEFAULTS = {
  regions: MAIN_REGIONS, bg: 'cover-art.webp', autoBg: true,
  effects: true, particles: true, news: true, music: true, footer: true,
  portrait: false,
};
const settings = Object.assign({}, DEFAULTS);
try {
  const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  for (const key of Object.keys(DEFAULTS)) if (key in saved) settings[key] = saved[key];
} catch { /* storage unavailable: defaults are fine */ }
if (!Array.isArray(settings.regions)) settings.regions = MAIN_REGIONS;
if (!BACKGROUNDS.some(b => b[0] === settings.bg)) settings.bg = DEFAULTS.bg;

function saveSettings() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
}

/* =====================================================================
   Countdowns
   ===================================================================== */

const localTime = new Intl.DateTimeFormat(undefined, {
  weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
});

function split(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(total / 86400), h: Math.floor(total / 3600) % 24, m: Math.floor(total / 60) % 60, s: total % 60 };
}

const cards = REGIONS.map(r => {
  const time = Date.parse(r.at);
  const el = document.createElement('article');
  el.className = 'region';
  el.title = r.countries;
  el.innerHTML = `
    <div class="region-head"><span class="code">${r.code}</span><h2 class="region-name">${r.name}</h2></div>
    <div class="mini"></div>
    <div class="region-when">Midnight ${r.zone} · <em>${localTime.format(time)}</em> your time</div>`;
  return { code: r.code, time, el, mini: $('.mini', el), last: '' };
});

const slots = { top: $('#row-top'), left: $('#side-left'), right: $('#side-right'), bottom: $('#row-bottom') };
const stage = $('.stage'), world = $('.world');
let wideLayout = null;

// True when the stage has room for cards beside the hero (matches the 1056px container query in styles.css).
function stageIsWide() {
  const cs = getComputedStyle(stage);
  return stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) >= 1056;
}

// In TikTok Live mode, shrink the whole block if the chosen cards would not fit the frame's height.
function fitWorld() {
  if (!settings.portrait) { world.style.removeProperty('--fit'); return; }
  const cs = getComputedStyle(stage);
  const room = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  world.style.setProperty('--fit', Math.min(1, room / world.offsetHeight).toFixed(4));
}

// Up to six cards flank the hero (earlier unlocks on the left); any more go above and below it.
function layoutRegions() {
  const chosen = cards.filter(c => settings.regions.includes(c.code));
  const plan = { top: [], left: [], right: [], bottom: [] };
  wideLayout = stageIsWide();
  if (!wideLayout) {
    plan.bottom = chosen;
  } else {
    const sides = Math.min(chosen.length, 6);
    const extra = chosen.length - sides;
    const top = Math.ceil(extra / 2);
    const leftCount = Math.ceil(sides / 2);
    plan.top = chosen.slice(0, top);
    plan.left = chosen.slice(top, top + leftCount);
    plan.right = chosen.slice(top + leftCount, top + sides);
    plan.bottom = chosen.slice(top + sides);
  }
  for (const key of Object.keys(slots)) slots[key].replaceChildren(...plan[key].map(c => c.el));
  fitWorld();
}
new ResizeObserver(() => { if (stageIsWide() !== wideLayout) layoutRegions(); }).observe(stage);
new ResizeObserver(fitWorld).observe(world);

const heroDigits = {};
document.querySelectorAll('#hero-countdown .digit').forEach(el => { heroDigits[el.dataset.u] = el; });
const heroWhen = $('#hero-when');
heroWhen.innerHTML = `Midnight ${AUSTRALIA.zone}, Thu 19 Nov · <strong>${localTime.format(AUSTRALIA.at)}</strong> your time`;

function setDigit(unit, value) {
  const el = heroDigits[unit], text = String(value);
  if (el.textContent === text) return;
  el.textContent = text;
  if (unit !== 's') {
    el.classList.remove('flip');
    void el.offsetWidth; // restart the animation
    el.classList.add('flip');
  }
}

function tick() {
  const now = Date.now();
  const au = split(AUSTRALIA.at - now);
  setDigit('d', au.d); setDigit('h', au.h); setDigit('m', au.m); setDigit('s', au.s);
  if (now >= AUSTRALIA.at && !heroWhen.dataset.out) {
    heroWhen.dataset.out = '1';
    heroWhen.innerHTML = '<strong>Out now in Australia.</strong>';
  }
  for (const c of cards) {
    const left = c.time - now;
    let html;
    if (left <= 0) {
      html = '<span><b>OUT NOW</b></span>';
      c.mini.classList.add('out');
    } else {
      const t = split(left);
      html = `<span><b>${t.d}</b><i>D</i></span><span><b>${pad(t.h)}</b><i>H</i></span><span><b>${pad(t.m)}</b><i>M</i></span><span><b>${pad(t.s)}</b><i>S</i></span>`;
    }
    if (html !== c.last) { c.mini.innerHTML = html; c.last = html; }
  }
}

/* =====================================================================
   Backgrounds
   ===================================================================== */

const Background = (() => {
  const layers = [$('#bg-a'), $('#bg-b')];
  const select = $('#bg-select');
  let front = 0, current = null, timer = 0;

  for (const [file, label] of BACKGROUNDS) select.add(new Option(label, file));

  async function show(file) {
    if (file === current) return;
    current = file;
    select.value = file;
    const next = layers[1 - front];
    next.src = 'assets/bg/' + file;
    try { await next.decode(); } catch { /* missing image: the gradient shows instead */ }
    if (current !== file) return; // a newer choice won
    next.classList.add('show');
    layers[front].classList.remove('show');
    front = 1 - front;
  }

  function cycle() {
    const i = BACKGROUNDS.findIndex(b => b[0] === current);
    show(BACKGROUNDS[(i + 1) % BACKGROUNDS.length][0]);
  }

  function setAuto(on) {
    clearInterval(timer);
    if (on) timer = setInterval(cycle, 20000);
  }

  select.addEventListener('change', () => {
    settings.bg = select.value;
    saveSettings();
    show(select.value);
    setAuto(settings.autoBg); // restart the 20s clock from this pick
  });

  layers[0].src = 'assets/bg/' + settings.bg;
  layers[0].onerror = () => layers[0].removeAttribute('src');
  current = settings.bg;
  select.value = current;
  return { setAuto };
})();

/* =====================================================================
   Floating lights (canvas)
   ===================================================================== */

const Particles = (() => {
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALETTE = [
    ['#ffb84d', .30], ['#ff5cc2', .30], ['#c94bff', .18], ['#ff8c5c', .17], ['#7ad7ff', .05],
  ];
  const rgba = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };
  // One pre-drawn glow per colour: a hot core for sparks, a soft disc for the out-of-focus blobs.
  function sprite(hex, soft) {
    const size = 128, c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    if (soft) {
      grad.addColorStop(0, rgba(hex, .55)); grad.addColorStop(.55, rgba(hex, .28)); grad.addColorStop(1, rgba(hex, 0));
    } else {
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)'); grad.addColorStop(.1, rgba(hex, .95));
      grad.addColorStop(.32, rgba(hex, .32)); grad.addColorStop(1, rgba(hex, 0));
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
  }
  const sparks = PALETTE.map(p => sprite(p[0], false));
  const blobs = PALETTE.map(p => sprite(p[0], true));
  const pickColor = () => {
    let r = Math.random();
    for (let i = 0; i < PALETTE.length; i++) { r -= PALETTE[i][1]; if (r <= 0) return i; }
    return 0;
  };
  const rand = (a, b) => a + Math.random() * (b - a);

  let w = 0, h = 0, items = [], raf = 0, last = 0, running = false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function make(anywhere) {
    const blob = Math.random() < .09;
    const z = blob ? rand(.15, .4) : Math.pow(Math.random(), 1.6) * .8 + .2; // depth: 0 far, 1 near
    return {
      blob, z, color: pickColor(),
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + rand(20, 120),
      size: blob ? rand(70, 170) : 10 + z * 30,
      rise: blob ? rand(4, 9) : 8 + z * 34,           // px per second
      swayAmp: blob ? rand(20, 50) : 8 + z * 26,
      swayRate: rand(.15, .55), swayAt: rand(0, 6.28),
      twinkleRate: rand(.5, 2.2), twinkleAt: rand(0, 6.28),
      alpha: blob ? rand(.1, .2) : .3 + z * .6,
      age: anywhere ? 9 : 0,
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // The canvas fills the frame, which is the whole window normally and 720x1280 in TikTok Live mode.
    const nw = canvas.clientWidth || window.innerWidth, nh = canvas.clientHeight || window.innerHeight;
    if (nw === w && nh === h) return;
    if (Math.abs(nw - w) > 200) items = []; // different shape: scatter the lights afresh
    w = nw; h = nh;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const want = Math.max(36, Math.min(120, Math.round(w * h / 20000)));
    while (items.length < want) items.push(make(true));
    items.length = want;
    if (!running) draw(0);
  }

  function draw(dt) {
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < items.length; i++) {
      let p = items[i];
      p.age += dt;
      p.y -= p.rise * dt;
      p.swayAt += p.swayRate * dt;
      p.twinkleAt += p.twinkleRate * dt;
      if (p.y < -p.size) p = items[i] = make(false);

      const edge = Math.min(1, p.age / 1.5) * Math.min(1, (p.y + p.size) / (h * .16));
      const twinkle = p.blob ? .85 + .15 * Math.sin(p.twinkleAt) : .6 + .4 * Math.sin(p.twinkleAt);
      const a = p.alpha * edge * twinkle;
      if (a <= .01) continue;
      const x = p.x + Math.sin(p.swayAt) * p.swayAmp + pointer.x * p.z * 26;
      const y = p.y + pointer.y * p.z * 16;
      ctx.globalAlpha = a;
      ctx.drawImage(p.blob ? blobs[p.color] : sparks[p.color], x - p.size / 2, y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000 || 0);
    last = now;
    draw(dt);
    raf = requestAnimationFrame(frame);
  }

  function set(on) {
    cancelAnimationFrame(raf);
    running = on && !reduced && !document.hidden;
    if (!on) return;
    if (!w) resize();
    if (running) { last = performance.now(); raf = requestAnimationFrame(frame); } else draw(0);
  }

  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('pointermove', e => {
    pointer.tx = e.clientX / window.innerWidth - .5;
    pointer.ty = e.clientY / window.innerHeight - .5;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => set(settings.particles));
  return { set };
})();

/* =====================================================================
   News panel
   ===================================================================== */

const News = (() => {
  const panel = $('#news'), list = $('#news-list'), btn = $('#news-btn');
  const refreshBtn = $('#news-refresh'), updated = $('#news-updated');
  const dateFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  function render() {
    const items = ((window.GTA_NEWS && window.GTA_NEWS.items) || []).slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    list.replaceChildren();
    if (!items.length) {
      const p = document.createElement('p');
      p.className = 'news-empty';
      p.textContent = 'No news yet. Add entries to news.js, then press refresh.';
      list.append(p);
    }
    for (const item of items) {
      const card = document.createElement('article');
      card.className = 'news-item';
      const h = document.createElement('h3'); h.textContent = item.title;
      const d = document.createElement('div'); d.className = 'news-date';
      d.textContent = dateFmt.format(new Date(item.date + 'T12:00:00')) + (item.source ? ' · ' + item.source : '');
      const p = document.createElement('p'); p.textContent = item.text || '';
      card.append(h, d, p);
      if (item.url) {
        const a = document.createElement('a');
        a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = 'Read the article ↗';
        card.append(a);
      }
      list.append(card);
    }
    updated.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Re-reads news.js so edits show up without reloading the page.
  function refresh() {
    refreshBtn.classList.remove('spin');
    void refreshBtn.offsetWidth;
    refreshBtn.classList.add('spin');
    const s = document.createElement('script');
    s.src = 'news.js?t=' + Date.now();
    s.onload = s.onerror = () => { s.remove(); render(); };
    document.head.append(s);
  }

  function toggle(open) {
    panel.classList.toggle('open', open);
    panel.inert = !open;
    btn.setAttribute('aria-expanded', String(open));
  }

  btn.addEventListener('click', () => toggle(!panel.classList.contains('open')));
  $('#news-close').addEventListener('click', () => toggle(false));
  refreshBtn.addEventListener('click', refresh);
  render();
  return { toggle };
})();

/* =====================================================================
   Music player (SoundCloud widget behind a custom UI)
   ===================================================================== */

const Music = (() => {
  const panel = $('#music'), btn = $('#music-btn'), iframe = $('#sc-iframe');
  const el = {
    title: $('#music-title'), cover: $('#music-cover'), track: $('#track-title'), artist: $('#track-artist'),
    seek: $('#music-seek'), now: $('#music-now'), len: $('#music-len'),
    play: $('#music-play'), repeat: $('#music-repeat'), mute: $('#music-mute'), volume: $('#music-volume'),
    youtube: $('#music-youtube'), open: $('#music-open'), tracksBtn: $('#music-tracks-btn'), tracks: $('#music-tracks'),
    status: $('#music-status'),
  };
  const OPTIONS = '&color=%23ff5cc2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false';
  const DEFAULT_COVER = 'assets/bg/cover-art.webp';
  let widget = null, album = 'vi', ready = false, playing = false, repeat = false, muted = false;
  let seeking = false, index = 0, sounds = [], retries = 0, readyTimer = 0;

  let direction = 1, picked = false, hops = 0;

  const clock = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
  // "Song (from GTAVI: The Album)" -> "Song"
  const cleanTitle = t => (t || '').replace(/\s*[([]from GTA ?VI:[^)\]]*[)\]]/i, '').trim();
  // SoundCloud only streams a 30-second sample of some label tracks.
  const isPreview = s => !!s && s.policy === 'SNIP';
  const status = text => { el.status.hidden = !text; el.status.textContent = text || ''; };

  function setPlaying(on) {
    playing = on;
    panel.classList.toggle('playing', on);
    el.play.setAttribute('aria-label', on ? 'Pause' : 'Play');
  }

  function showAlbum() {
    const a = ALBUMS[album];
    el.title.textContent = a.title;
    el.youtube.href = a.youtube;
    el.open.href = a.page;
    panel.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.album === album));
  }

  function showSound(sound) {
    if (!sound) return;
    el.track.textContent = el.track.title = cleanTitle(sound.title) || 'Unknown track';
    const artist = (sound.publisher_metadata && sound.publisher_metadata.artist) || (sound.user && sound.user.username) || '';
    el.artist.textContent = el.artist.title = artist || ' ';
    const art = sound.artwork_url || (sound.user && sound.user.avatar_url);
    el.cover.src = art ? art.replace('-large', '-t500x500') : DEFAULT_COVER;
    const secs = (sound.duration || 0) / 1000;
    el.seek.max = Math.max(1, secs);
    el.len.textContent = clock(secs);
  }

  function renderTracks() {
    el.tracks.replaceChildren(...sounds.map((s, i) => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button';
      b.className = i === index ? 'current' : '';
      const n = document.createElement('span'); n.className = 'n'; n.textContent = i + 1;
      const t = document.createElement('span'); t.className = 't';
      t.textContent = (cleanTitle(s.title) || `Track ${i + 1}`) + (isPreview(s) ? ' (30s preview)' : '');
      b.append(n, t);
      b.addEventListener('click', () => { picked = true; widget.skip(i); widget.play(); });
      li.append(b);
      return li;
    }));
  }

  // SoundCloud fills in track details lazily, so ask again a few times until titles arrive.
  function loadSounds() {
    widget.getSounds(list => {
      sounds = list || [];
      renderTracks();
      if (sounds.some(s => !s.title) && retries++ < 8) setTimeout(loadSounds, 1500);
    });
  }

  // Shows the current track. Preview-only tracks are passed over unless picked from the list.
  function syncCurrent() {
    widget.getCurrentSound(sound => {
      widget.getCurrentSoundIndex(i => {
        index = i || 0;
        const atEnd = direction > 0 ? index >= sounds.length - 1 : index <= 0;
        if (playing && isPreview(sound) && !picked && !atEnd && hops++ < sounds.length) {
          if (direction > 0) widget.next(); else widget.prev();
          return;
        }
        hops = 0; picked = false; direction = 1;
        showSound(sound);
        renderTracks();
        if (sounds.some(s => !s.title)) loadSounds();
      });
    });
  }

  function onReady() {
    clearTimeout(readyTimer);
    ready = true;
    status('');
    widget.setVolume(muted ? 0 : Number(el.volume.value));
    retries = 0;
    loadSounds();
    syncCurrent();
  }

  function waitForReady() {
    ready = false;
    el.track.textContent = 'Loading…';
    el.artist.textContent = ' ';
    clearTimeout(readyTimer);
    readyTimer = setTimeout(() => {
      if (!ready) status('Could not reach SoundCloud. Check your connection, then switch album to retry.');
    }, 12000);
  }

  function init() {
    if (widget) return;
    showAlbum();
    waitForReady();
    const api = document.createElement('script');
    api.src = 'https://w.soundcloud.com/player/api.js';
    api.onerror = () => status('Could not load the SoundCloud player. Check your connection.');
    api.onload = () => {
      iframe.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(ALBUMS[album].url) + OPTIONS;
      widget = window.SC.Widget(iframe);
      const E = window.SC.Widget.Events;
      widget.bind(E.READY, onReady);
      widget.bind(E.PLAY, () => { setPlaying(true); syncCurrent(); });
      widget.bind(E.PAUSE, () => setPlaying(false));
      widget.bind(E.FINISH, () => {
        if (repeat) { widget.skip(index); widget.play(); } else setPlaying(false);
      });
      widget.bind(E.PLAY_PROGRESS, e => {
        if (seeking) return;
        const secs = e.currentPosition / 1000;
        el.seek.value = secs;
        el.now.textContent = clock(secs);
      });
      widget.bind(E.ERROR, () => status('That track could not be played. Try the next one.'));
    };
    document.head.append(api);
  }

  function switchAlbum(next) {
    if (next === album || !ALBUMS[next]) return;
    album = next;
    showAlbum();
    if (!widget) return;
    const resume = playing;
    setPlaying(false);
    sounds = []; index = 0; renderTracks();
    el.seek.value = 0; el.now.textContent = '0:00'; el.len.textContent = '0:00';
    el.cover.src = DEFAULT_COVER;
    status('');
    waitForReady();
    widget.load(ALBUMS[album].url, {
      auto_play: resume, hide_related: true, show_comments: false, show_user: true,
      show_reposts: false, show_teaser: false,
      callback: onReady,
    });
  }

  function toggle(open) {
    panel.classList.toggle('open', open);
    panel.inert = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (open) init();
  }

  btn.addEventListener('click', () => toggle(!panel.classList.contains('open')));
  panel.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => switchAlbum(b.dataset.album)));
  el.play.addEventListener('click', () => { if (ready) widget.toggle(); });
  $('#music-prev').addEventListener('click', () => { if (ready) { direction = -1; widget.prev(); } });
  $('#music-next').addEventListener('click', () => { if (ready) widget.next(); });
  el.repeat.addEventListener('click', () => {
    repeat = !repeat;
    el.repeat.setAttribute('aria-pressed', String(repeat));
  });
  el.seek.addEventListener('input', () => { seeking = true; el.now.textContent = clock(Number(el.seek.value)); });
  el.seek.addEventListener('change', () => {
    if (ready) widget.seekTo(Number(el.seek.value) * 1000);
    seeking = false;
  });
  el.volume.addEventListener('input', () => {
    muted = false;
    el.mute.setAttribute('aria-pressed', 'false');
    if (ready) widget.setVolume(Number(el.volume.value));
  });
  el.mute.addEventListener('click', () => {
    muted = !muted;
    el.mute.setAttribute('aria-pressed', String(muted));
    if (ready) widget.setVolume(muted ? 0 : Number(el.volume.value));
  });
  el.tracksBtn.addEventListener('click', () => {
    el.tracks.hidden = !el.tracks.hidden;
    el.tracksBtn.setAttribute('aria-expanded', String(!el.tracks.hidden));
  });
  el.cover.addEventListener('error', () => { if (!el.cover.src.endsWith(DEFAULT_COVER)) el.cover.src = DEFAULT_COVER; });
  showAlbum();
  return { toggle };
})();

/* =====================================================================
   Customize panel
   ===================================================================== */

const Settings = (() => {
  const panel = $('#settings'), btn = $('#settings-btn'), scrim = $('#scrim');
  const chipBox = $('#region-chips');
  const chips = {};

  for (const r of REGIONS) {
    const label = document.createElement('label');
    label.className = 'chip';
    label.title = r.countries;
    label.innerHTML = `<input type="checkbox" value="${r.code}"><span class="code">${r.code}</span><span>${r.name}</span>`;
    const input = $('input', label);
    input.addEventListener('change', () => {
      const picked = new Set(settings.regions);
      if (input.checked) picked.add(r.code); else picked.delete(r.code);
      setRegions(REGIONS.map(x => x.code).filter(code => picked.has(code)));
    });
    chips[r.code] = { label, input };
    chipBox.append(label);
  }

  function setRegions(codes) {
    settings.regions = codes;
    saveSettings();
    for (const code of Object.keys(chips)) {
      const on = codes.includes(code);
      chips[code].input.checked = on;
      chips[code].label.classList.toggle('on', on);
    }
    layoutRegions();
  }

  panel.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    const preset = b.dataset.preset;
    setRegions(preset === 'all' ? REGIONS.map(r => r.code) : preset === 'none' ? [] : MAIN_REGIONS.slice());
  }));

  // Apply every on/off option to the page.
  function apply() {
    document.body.classList.toggle('portrait', settings.portrait);
    sizeFrame();
    layoutRegions();
    document.body.classList.toggle('no-effects', !settings.effects);
    document.body.classList.toggle('no-particles', !settings.particles);
    Particles.set(settings.particles);
    Background.setAuto(settings.autoBg);
    $('#news-btn').hidden = !settings.news;
    if (!settings.news) News.toggle(false);
    $('#music-btn').hidden = !settings.music;
    if (!settings.music) Music.toggle(false);
    $('#footer').hidden = !settings.footer;
    measureFooter();
  }

  for (const key of ['portrait', 'autoBg', 'effects', 'particles', 'news', 'music', 'footer']) {
    const input = $('#opt-' + key);
    input.checked = settings[key];
    input.addEventListener('change', () => {
      settings[key] = input.checked;
      saveSettings();
      apply();
    });
  }

  function toggle(open) {
    panel.classList.toggle('open', open);
    panel.inert = !open;
    scrim.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', () => toggle(!panel.classList.contains('open')));
  $('#settings-close').addEventListener('click', () => toggle(false));
  scrim.addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    toggle(false); News.toggle(false);
  });

  return { apply, setRegions };
})();

/* =====================================================================
   Start
   ===================================================================== */

// Panels and buttons sit above the fixed footer, whatever height its text wraps to.
function measureFooter() {
  const footer = $('#footer');
  document.documentElement.style.setProperty('--footer-h', (footer.hidden ? 0 : footer.offsetHeight) + 'px');
  fitWorld();
}
new ResizeObserver(measureFooter).observe($('#footer'));

// TikTok Live mode: scale the 720x1280 frame to the tallest 9:16 box the window can hold, centred.
function sizeFrame() {
  const scale = Math.min(window.innerHeight / 1280, window.innerWidth / 720);
  const root = document.documentElement.style;
  root.setProperty('--frame-scale', scale.toFixed(4));
  root.setProperty('--frame-top', Math.max(0, (window.innerHeight - 1280 * scale) / 2).toFixed(1) + 'px');
}
window.addEventListener('resize', sizeFrame);

Settings.setRegions(settings.regions);
Settings.apply();
tick();
setInterval(tick, 250);
