// First-visit intro, from Maitreyi's Figma file ("MacBook Air - 1", 3.38 s):
// the screen goes from near-black to white to pink while an ink bloom reveals her
// logo (the hair turns from deep maroon through blush to white), the eyebrows
// trace in from left to right and the whole mark drifts up and left.
// It plays each time the site is opened (once per tab), then fades into the page. window.mbIntro resolves
// when the page should start its own animations. Click or press a key to skip.
// Add ?intro to the address to see it again.
(function () {
  // ?intro replays it; ?intro=2.5 holds it still at that second (for checking a frame)
  const q = new URLSearchParams(location.search).get('intro');
  let seen = q === null ? false : null;
  if (seen === false) try { seen = sessionStorage.getItem('mb-intro-seen') === '1'; } catch (e) {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) { window.mbIntro = Promise.resolve(); return; }
  try { sessionStorage.setItem('mb-intro-seen', '1'); } catch (e) {}

  const D = '3.380824s';
  const IN = 'cubic-bezier(.5,0,.5,1)', REVEAL = 'cubic-bezier(.45,0,.2,1)', DRIFT = 'cubic-bezier(.22,1,.36,1)';
  // the bloom ellipse (603.5 × 497, centred in a 1207 × 994 box) grows from nothing
  const bloom = (sx, sy) => 'ellipse(' + (603.5 * sx) + 'px ' + (497 * sy) + 'px at 603.5px 497px)';
  const css = `
body > .mbi { position: fixed !important; inset: 0; z-index: 9999 !important; overflow: hidden; background: #0A080A; cursor: pointer;
  animation: mbi-bg ${D} linear forwards; transition: opacity .8s ease; }
body > .mbi.out { opacity: 0; pointer-events: none; }
body > .mbi:not(.go), body > .mbi:not(.go) * { animation-play-state: paused !important; }
.mbi-stage { position: absolute; left: 0; top: 0; width: 1280px; height: 832px; transform-origin: 0 0; }
.mbi-layer { position: absolute; inset: 0; animation: mbi-drift ${D} linear forwards; }
.mbi-bloom { position: absolute; left: 54px; top: -205px; width: 1207px; height: 994px; animation: mbi-bloom ${D} linear forwards; }
.mbi-brow { position: absolute; overflow: hidden; }
.mbi-part { position: absolute; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
.mbi-hair { background: #250707; animation: mbi-hair ${D} linear forwards; }
.mbi-browfill { background: #000; animation: mbi-browfill-l ${D} linear forwards; }
.mbi-browfill.r { animation-name: mbi-browfill-r; }
@keyframes mbi-bg { 0% { background-color: #0A080A; animation-timing-function: ${IN}; } 21.869% { background-color: #FFF; animation-timing-function: ${IN}; } 52.735%, 100% { background-color: #CF6B9B; } }
@keyframes mbi-drift { 0%, 47.506% { translate: 0 0; animation-timing-function: ${DRIFT}; } 75.658%, 100% { translate: -18px -6px; } }
@keyframes mbi-bloom {
  0% { clip-path: ${bloom(0, 0)}; animation-timing-function: ${REVEAL}; }
  4.322% { clip-path: ${bloom(0.035, 0.025)}; animation-timing-function: ${REVEAL}; }
  23.77% { clip-path: ${bloom(0.36, 0.24)}; animation-timing-function: ${REVEAL}; }
  43.938% { clip-path: ${bloom(0.68, 0.86)}; animation-timing-function: ${REVEAL}; }
  66.627%, 100% { clip-path: ${bloom(1, 1)}; } }
@keyframes mbi-hair { 0% { background-color: #250707; animation-timing-function: ${IN}; } 41.593% { background-color: #E7C3C3; animation-timing-function: ${IN}; } 88.233%, 100% { background-color: #FFF; } }
@keyframes mbi-browfill-l { 0% { background-color: #000; animation-timing-function: ${IN}; } 90.545%, 100% { background-color: #FFF; } }
@keyframes mbi-browfill-r { 0% { background-color: #000; animation-timing-function: ${IN}; } 96.602%, 100% { background-color: #FFF; } }
@keyframes mbi-brow-l { 0%, 54.833% { clip-path: inset(0 100% 0 0); animation-timing-function: ${REVEAL}; } 79.758%, 100% { clip-path: inset(0 0 0 0); } }
@keyframes mbi-brow-r { 0%, 66.627% { clip-path: inset(0 100% 0 0); animation-timing-function: ${REVEAL}; } 90.545%, 100% { clip-path: inset(0 0 0 0); } }
`;
  // the logo's shapes are built in, so nothing has to download before the animation can run
  const SHAPES = {
    'v1.svg': "data:image/svg+xml,%3Csvg preserveAspectRatio=%22none%22 overflow=%22visible%22 style=%22display: block;%22 width=%22256.513%22 height=%22314.256%22 viewBox=%220 0 256.513 314.256%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath id=%22Vector%22 d=%22M131.101 111.045C142.748 116.514 157.833 125.184 172.972 138.82C178.517 143.814 192.672 157.222 205.193 177.887C209.072 184.29 212.01 190.295 217.885 202.306C225.667 218.212 231.397 231.521 233.865 237.495C250.394 277.507 255.412 314.457 256.409 314.255C257.265 314.082 252.644 287.061 248.284 266.397C247.018 260.395 243.675 245.027 238.483 227.003C238.313 226.416 238.169 225.918 238.049 225.508C233.905 211.333 231.407 202.787 226.765 191.646C219.966 175.326 213.079 164.271 204.445 150.412C200.342 143.823 190.497 128.432 175.877 110.162C168.379 100.792 162.122 93.0325 152.313 83.6244C143.486 75.1588 135.71 69.1257 131.107 65.5745C122.691 59.0823 116.142 54.7659 108.239 49.5564C99.3375 43.6895 93.7691 40.0195 85.6292 35.6558C79.7541 32.5063 80.4484 33.2353 66.674 26.5327C52.2355 19.5078 50.8216 18.3902 41.4608 14.1534C35.3912 11.4057 30.3037 9.11607 23.4213 6.65129C13.8715 3.23201 5.71107 1.21024 0 0C21.6153 12.5726 46.7001 29.372 72.644 51.6104C96.7142 72.2429 115.987 92.811 131.101 111.045Z%22 fill=%22%23250707%22/%3E%3C/svg%3E",
    'v2.svg': "data:image/svg+xml,%3Csvg preserveAspectRatio=%22none%22 overflow=%22visible%22 style=%22display: block;%22 width=%22497.225%22 height=%22457.24%22 viewBox=%220 0 497.225 457.24%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath id=%22Vector%22 d=%22M497.225 112.547C475.979 110.794 445.16 111.331 411.436 123.48C402.789 126.595 334.684 152.235 298.556 219.433C277.308 258.957 286.08 277.592 260.163 300.085C237.746 319.54 221.991 313.577 200.654 338.491C196.959 342.805 181.23 360.476 173.198 390.73C166.495 415.979 172.404 422.255 162.961 436.952C160.042 441.494 151.452 454.864 137.197 456.961C123.9 458.918 111.735 450.176 101.583 442.88C97.5105 439.953 92.9525 436.072 83.8369 428.306C76.0382 421.663 72.998 418.747 66.9866 415.384C60.1835 411.578 54.3428 409.869 51.8212 409.203C44.6032 407.297 37.9588 405.542 30.4774 407.518C21.39 409.917 19.3319 415.636 15.0389 414.16C11.2937 412.871 9.96004 407.432 7.13053 397.61C6.01996 393.755 5.50927 390.878 4.56994 385.26C2.50688 372.925 1.47534 366.756 1.07826 363.519C-0.292449 352.348 -0.102827 343.727 0.276418 326.485C0.669931 308.593 1.88779 295.175 2.50413 289.012C2.6622 287.431 3.5085 279.05 4.91187 269.21C6.616 257.262 10.3939 230.774 17.9645 206.004C20.4178 197.977 30.3012 167.095 53.8173 132.567C64.4422 116.966 86.7257 87.581 123.788 60.9452C157.118 36.993 187.084 26.2709 202.927 20.7358C228.782 11.7012 249.188 8.19526 267.62 5.02858C267.62 5.02858 296.156 0.124819 333.569 0.00184091C341.962 -0.0267074 354.07 0.210465 368.11 5.55343C373.4 7.5672 377.469 9.73689 383.916 13.5338C391.06 17.7415 407.743 27.5687 423.371 39.6283C457.365 65.86 493.514 108.173 497.225 112.547Z%22 fill=%22%23250707%22/%3E%3C/svg%3E",
    'v4.svg': "data:image/svg+xml,%3Csvg preserveAspectRatio=%22none%22 overflow=%22visible%22 style=%22display: block;%22 width=%22217.708%22 height=%2246.6222%22 viewBox=%220 0 217.708 46.6222%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath id=%22Vector%22 d=%22M211.433 20.5267C208.943 25.3003 203.842 28.1091 198.48 27.6468C174.762 25.6023 109.482 20.4026 80.0145 22.3681C43.6441 24.7931 0 46.6222 0 46.6222C0 46.6222 61.8294 1.75163 77.5897 0.538863C90.5839 -0.460885 180.219 0.188077 211.286 0.446661C216.126 0.486739 219.203 5.63041 216.964 9.92312L211.433 20.5267Z%22 fill=%22black%22/%3E%3C/svg%3E",
    'v6.svg': "data:image/svg+xml,%3Csvg preserveAspectRatio=%22none%22 overflow=%22visible%22 style=%22display: block;%22 width=%2269.3201%22 height=%2248.2315%22 viewBox=%220 0 69.3201 48.2315%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath id=%22Vector%22 d=%22M13.2403 25.3225L0.0657952 47.5615C-0.187901 47.9897 0.347809 48.4464 0.724811 48.1214C5.76238 43.7797 19.1738 32.9307 32.5853 28.1392C42.4237 24.6243 51.04 23.5543 56.5452 23.2758C60.7182 23.0647 64.4334 20.5607 66.1606 16.7549C68.1726 12.3215 70.1566 6.92951 68.9557 5.0072C67.7864 3.13615 65.3578 1.51693 63.3658 0.421134C61.8689 -0.402255 60.0473 0.0227584 58.9574 1.33854C58.0765 2.40197 56.6148 3.70463 54.1962 5.0072C50.5357 6.97897 36.4108 11.5332 26.9367 14.4901C21.1875 16.2844 16.3106 20.1397 13.2403 25.3225Z%22 fill=%22black%22/%3E%3C/svg%3E"
  };
  const part = (cls, src, x, y, w, h) =>
    '<div class="mbi-part ' + cls + '" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;' +
    '-webkit-mask-image:url(&quot;' + SHAPES[src] + '&quot;);mask-image:url(&quot;' + SHAPES[src] + '&quot;)"></div>';
  const wrap = document.createElement('div');
  wrap.className = 'mbi';
  wrap.setAttribute('aria-hidden', 'true');
  // positions are the Figma frame's, in its 1280 × 832 coordinates
  wrap.innerHTML = '<style>' + css + '</style><div class="mbi-stage"><div class="mbi-layer">' +
    '<div class="mbi-bloom">' +
      part('mbi-hair', 'v1.svg', 723.46 - 54, 183.79 + 205, 256.513, 314.256) +
      part('mbi-hair', 'v2.svg', 338.05 - 54, 178.38 + 205, 497.225, 457.24) +
    '</div>' +
    '<div class="mbi-brow" style="left:625.17px;top:556.57px;width:223.388px;height:52.302px;animation:mbi-brow-l ' + D + ' linear forwards">' +
      part('mbi-browfill', 'v4.svg', 2.8, 2.87, 217.708, 46.622) + '</div>' +
    '<div class="mbi-brow" style="left:898.09px;top:539.89px;width:75px;height:53.912px;animation:mbi-brow-r ' + D + ' linear forwards">' +
      part('mbi-browfill r', 'v6.svg', 2.91, 2.82, 69.32, 48.232) + '</div>' +
  '</div></div>';
  document.body.appendChild(wrap);
  document.documentElement.style.overflow = 'hidden';

  // keep the logo centred and a comfortable size on any screen
  const stage = wrap.querySelector('.mbi-stage');
  const fit = () => {
    const vw = innerWidth, vh = innerHeight, s = Math.min(vw * 0.62 / 642, vh * 0.6 / 428);
    stage.style.transform = 'translate(' + (vw / 2 - 659 * s) + 'px,' + (vh / 2 - 392 * s) + 'px) scale(' + s + ')';
  };
  fit(); addEventListener('resize', fit);

  if (q) {
    wrap.querySelectorAll('.mbi, .mbi *').forEach(e => { e.style.animationDelay = (-q) + 's'; e.style.animationPlayState = 'paused'; });
    wrap.style.animationDelay = (-q) + 's'; wrap.style.animationPlayState = 'paused';
    window.mbIntro = new Promise(() => {});
    return;
  }
  let done;
  window.mbIntro = new Promise(r => { done = r; });
  let ended = false;
  const finish = () => {
    if (ended) return; ended = true;
    wrap.classList.add('out');
    document.documentElement.style.overflow = '';
    done();
    setTimeout(() => { wrap.remove(); removeEventListener('resize', fit); }, 900);
  };
  // Start only once the page has been parsed and the shapes are decoded, two frames later,
  // so a first visit (nothing cached, the page still loading) plays as smoothly as a repeat one.
  let timer = 0, started = false;
  const go = () => {
    if (started || ended) return; started = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wrap.classList.add('go');
      timer = setTimeout(finish, 3381 + 500);
    }));
  };
  const ready = Promise.all(Object.values(SHAPES).map(u => { const im = new Image(); im.src = u; return im.decode ? im.decode().catch(() => {}) : null; }));
  const parsed = document.readyState === 'loading' ? new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true })) : Promise.resolve();
  Promise.all([ready, parsed]).then(go);
  setTimeout(go, 1500);   // never wait longer than this
  const skip = () => { clearTimeout(timer); finish(); };
  wrap.addEventListener('click', skip);
  addEventListener('keydown', skip, { once: true });
})();
