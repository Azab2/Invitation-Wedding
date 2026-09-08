const C = INVITATION;
const $ = id => document.getElementById(id);
const set = (id, value) => { const e = $(id); if (e) e.textContent = value; };

function roseSVG(variant, uid) {
  if (variant === 'bud') {
    return '<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M50 152 C 50 110, 50 90, 50 62" stroke="#6b9158" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="50" cy="52" rx="15" ry="20" fill="url(#budGrad' + uid + ')"/>' +
      '<path d="M50 34 C 60 34, 66 44, 60 54 C 66 54, 62 66, 50 70 C 38 66, 34 54, 40 54 C 34 44, 40 34, 50 34 Z" fill="#c95d86"/><path d="M50 42 C 55 42, 58 47, 55 52 C 58 52, 55 60, 50 62 C 45 60, 42 52, 45 52 C 42 47, 45 42, 50 42 Z" fill="#a84a6f"/>' +
      '<path d="M42 110 q -14 8 -18 -6 q 14 -4 18 6 Z" fill="#7fb069" transform="rotate(18 42 110)"/><path d="M56 126 q 14 8 18 -6 q -14 -4 -18 6 Z" fill="#6b9158" transform="rotate(-20 56 126)"/>' +
      '<defs><radialGradient id="budGrad' + uid + '" cx="0.35" cy="0.3" r="1"><stop offset="0" stop-color="#f9d2e0"/><stop offset="1" stop-color="#d96a93"/></radialGradient></defs></svg>';
  }
  if (variant === 'daisy') {
    return '<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M50 150 C 50 110, 50 90, 50 72" stroke="#6b9158" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      petalRing('#ffffff', '#e8f0ff', 44) +
      '<circle cx="50" cy="44" r="12" fill="#f5cd63"/><circle cx="50" cy="44" r="6" fill="#e8a52b" opacity="0.55"/>' +
      '<path d="M38 96 q -16 6 -20 -10 q 16 -4 20 10 Z" fill="#7fb069" transform="rotate(12 38 96)"/><path d="M62 112 q 16 6 20 -10 q -16 -4 -20 10 Z" fill="#6b9158" transform="rotate(-18 62 112)"/>' +
      '</svg>';
  }
  // layered open rose
  return '<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M50 152 C 50 112, 50 90, 50 58" stroke="#6b9158" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<g>' +
      '<path d="M50 30 C 86 22, 84 60, 50 66 C 16 60, 14 22, 50 30 Z" fill="url(#roseOuter' + uid + ')"/>' +
      '<path d="M50 34 C 76 30, 76 56, 50 60 C 24 56, 24 30, 50 34 Z" fill="#f2a9c2"/>' +
      '<path d="M50 38 C 66 35, 66 52, 50 55 C 34 52, 34 35, 50 38 Z" fill="#f9c6d7"/>' +
      '<path d="M50 41 C 60 40, 60 49, 50 50 C 40 49, 40 40, 50 41 Z" fill="#fff0f4"/>' +
      '<path d="M50 43 C 53 42.5, 54 46, 50 47 C 46 46, 47 42.5, 50 43 Z" fill="#e8a52b"/>' +
    '</g>' +
    '<path d="M38 104 q -16 8 -20 -8 q 16 -4 20 8 Z" fill="#7fb069" transform="rotate(15 38 104)"/><path d="M62 122 q 16 8 20 -8 q -16 -4 -20 8 Z" fill="#6b9158" transform="rotate(-22 62 122)"/>' +
    '<defs><radialGradient id="roseOuter' + uid + '" cx="0.5" cy="0.35" r="0.6"><stop offset="0" stop-color="#ffd7e4"/><stop offset="1" stop-color="#e98eaf"/></radialGradient></defs></svg>';
}

function petalRing(fill, inner, r) {
  let s = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const cx = 50 + r * Math.cos(a);
    const cy = 44 + r * Math.sin(a);
    const rot = (a * 180) / Math.PI;
    s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="9" ry="15" fill="' + fill + '" transform="rotate(' + rot.toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')" opacity="0.92"/>';
  }
  return s + '<ellipse cx="44" cy="44" rx="7" ry="12" fill="' + inner + '" opacity="0.8"/>';
}

function buildFlowers() {
  const wrap = document.querySelector('.bg-flowers');
  if (!wrap) return;
  const heights = [window.innerHeight, document.body.scrollHeight];
  const page = Math.max(heights[0], heights[1]);
  const total = Math.max(12, Math.round(page / 150));
  const variants = ['rose', 'rose', 'daisy', 'bud'];
  const parts = [];
  for (let i = 0; i < total; i++) {
    const v = variants[i % variants.length];
    const left = 2 + ((i * 71) % 92);
    const top = ((i * 47) % 100);
    const size = 46 + ((i * 31) % 62);
    const anim = (i % 3 === 0) ? 'twirl' : (i % 2 === 0) ? 'floating' : 'sway';
    const delay = (i % 9) * 0.7;
    const opacity = 0.45 + (i % 4) * 0.13;
    parts.push(
      '<div class="fl ' + anim + '" style="left:' + left + '%;top:' + top + '%;width:' + size + 'px;animation-delay:' + delay + 's;opacity:' + opacity + ';transform:rotate(' + ((i * 37) % 24 - 12) + 'deg)">' +
        roseSVG(v, i) +
      '</div>'
    );
  }
  wrap.innerHTML = parts.join('');
}
buildFlowers();
window.addEventListener('resize', buildFlowers);

set('splashGroom', C.couple.groom);
set('splashBride', C.couple.bride);
set('splashDate', C.dateFrench);
set('groom', C.couple.groom);
set('bride', C.couple.bride);
set('footerGroom', C.couple.groom);
set('footerBride', C.couple.bride);
set('dateFrench', C.dateFrench);
set('timeFrench', C.timeFrench);
set('timeFrenchCalendar', C.timeFrench);
const arabicLines = C.arabicInvitation.split('\n');
$('arabicInvitation').innerHTML = arabicLines[0] + '\n<strong>' + (arabicLines[1] || '') + '</strong>';
set('arabicDate', C.arabicDate);
set('venueNameHero', C.venue);
set('venueCityHero', C.city);
set('venueName', C.venue);
set('venueCity', C.city);
set('dressIntro', C.dress.intro);
set('ladiesDress', C.dress.ladies);
set('gentlemenDress', C.dress.gentlemen);
$('mapsBtn').href = C.mapsUrl;
$('venueMap').src = 'https://maps.google.com/maps?q=' + encodeURIComponent(C.venue + ', ' + C.city) + '&z=16&output=embed';

const gallery = $('gallery');
const galleryImgs = C.gallery.map(src => `<figure class="gallery-card"><img src="${src}" alt="Wedding photo"></figure>`).join('');
gallery.innerHTML = galleryImgs + galleryImgs;

function tick() {
  let diff = new Date(C.date) - new Date();
  if (diff < 0) diff = 0;
  let s = Math.floor(diff / 1000), d = Math.floor(s / 86400); s %= 86400;
  let h = Math.floor(s / 3600); s %= 3600;
  let m = Math.floor(s / 60); s %= 60;
  set('days', String(d).padStart(2,'0')); set('hours', String(h).padStart(2,'0'));
  set('minutes', String(m).padStart(2,'0')); set('seconds', String(s).padStart(2,'0'));
}
tick(); setInterval(tick, 1000);

const opening = $('opening');
let closing = false;
function closeOpening() {
  if (closing) return;
  closing = true;
  opening.classList.add('closing');
  opening.style.transition = 'opacity 1.2s ease';
  opening.style.opacity = '0';
  setTimeout(() => opening.remove(), 1250);
}

if (C.splash.enabled) {
  requestAnimationFrame(() => opening.classList.add('play'));
  setTimeout(() => opening.classList.add('ready'), C.splash.duration);
} else {
  closeOpening();
}

const obs = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('visible');
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(e => obs.observe(e));

$('openMessage').addEventListener('click', () => {
  $('messageForm').classList.add('open');
  $('openMessage').style.display = 'none';
  document.querySelector('#messageForm input').focus();
});

$('messageForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = e.target.name.value.trim();
  const message = e.target.message.value.trim();
  const msgEl = $('formMessage');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  if (window.location.protocol === 'file:') {
    msgEl.textContent = 'This needs the server. Close this page and run `node server.js`, then open http://localhost:3000.';
    msgEl.classList.add('error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });
    if (!res.ok) throw new Error('bad response');
    msgEl.textContent = 'Merci ! Your message has been delivered.';
    msgEl.classList.remove('error');
    msgEl.classList.add('success');
    e.target.reset();
  } catch (err) {
    msgEl.textContent = 'Could not reach the server. Make sure it is running with `node server.js`, then try again.';
    msgEl.classList.remove('success');
    msgEl.classList.add('error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

const music = $('music');
const musicToggle = $('musicToggle');
music.volume = 0.15;
let musicStarted = false;

function startMusic() {
  if (musicStarted) return;
  music.play().then(() => {
    musicStarted = true;
    musicToggle.classList.add('playing');
  }).catch(() => {});
}
$('enterInvitation').addEventListener('click', () => {
  startMusic();
  closeOpening();
});
music.play().then(() => {
  musicStarted = true;
}).catch(() => {
  musicToggle.classList.remove('playing');
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => window.addEventListener(ev, startMusic, { once: true }));
});
musicToggle.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicStarted = true;
    musicToggle.classList.add('playing');
  } else {
    music.pause();
    musicToggle.classList.remove('playing');
  }
});
