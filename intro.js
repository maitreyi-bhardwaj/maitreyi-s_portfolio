// First-visit intro, from Maitreyi's Figma file ("MacBook Air - 1", 3.6 s):
// the screen goes from near-black to white to pink while an ink bloom reveals her
// logo (the hair turns from deep maroon through blush to white), the eyebrows
// trace in from left to right and the whole mark drifts up and left.
// It plays once per browser, then fades into the page. window.mbIntro resolves
// when the page should start its own animations. Click or press a key to skip.
// Add ?intro to the address to see it again.
(function () {
  // ?intro replays it; ?intro=2.5 holds it still at that second (for checking a frame)
  const q = new URLSearchParams(location.search).get('intro');
  let seen = q === null ? false : null;
  if (seen === false) try { seen = localStorage.getItem('mb-intro-seen') === '1'; } catch (e) {}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) { window.mbIntro = Promise.resolve(); return; }
  try { localStorage.setItem('mb-intro-seen', '1'); } catch (e) {}

  const D = '3.6s';
  const IN = 'cubic-bezier(.5,0,.5,1)', REVEAL = 'cubic-bezier(.45,0,.2,1)', DRIFT = 'cubic-bezier(.22,1,.36,1)';
  // the bloom ellipse (603.5 × 497, centred in a 1207 × 994 box) grows from nothing
  const bloom = (sx, sy) => 'ellipse(' + (603.5 * sx) + 'px ' + (497 * sy) + 'px at 603.5px 497px)';
  const css = `
body > .mbi { position: fixed !important; inset: 0; z-index: 9999 !important; overflow: hidden; background: #0A080A; cursor: pointer;
  animation: mbi-bg ${D} linear forwards; transition: opacity .8s ease; }
body > .mbi.out { opacity: 0; pointer-events: none; }
.mbi-stage { position: absolute; left: 0; top: 0; width: 1280px; height: 832px; transform-origin: 0 0; }
.mbi-layer { position: absolute; inset: 0; animation: mbi-drift ${D} linear forwards; }
.mbi-bloom { position: absolute; left: 54px; top: -205px; width: 1207px; height: 994px; animation: mbi-bloom ${D} linear forwards; }
.mbi-brow { position: absolute; overflow: hidden; }
.mbi-part { position: absolute; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
.mbi-hair { background: #250707; animation: mbi-hair ${D} linear forwards; }
.mbi-browfill { background: #000; animation: mbi-browfill ${D} linear forwards; }
@keyframes mbi-bg { 0% { background-color: #0A080A; animation-timing-function: ${IN}; } 15.667% { background-color: #FFF; animation-timing-function: ${IN}; } 37.778%, 100% { background-color: #CF6B9B; } }
@keyframes mbi-drift { 0%, 37.5% { translate: 0 0; animation-timing-function: ${DRIFT}; } 59.722%, 100% { translate: -18px -6px; } }
@keyframes mbi-bloom {
  0% { clip-path: ${bloom(0, 0)}; animation-timing-function: ${REVEAL}; }
  3.333% { clip-path: ${bloom(0.035, 0.025)}; animation-timing-function: ${REVEAL}; }
  18.333% { clip-path: ${bloom(0.36, 0.24)}; animation-timing-function: ${REVEAL}; }
  33.889% { clip-path: ${bloom(0.68, 0.86)}; animation-timing-function: ${REVEAL}; }
  51.389%, 100% { clip-path: ${bloom(1, 1)}; } }
@keyframes mbi-hair { 0% { background-color: #250707; animation-timing-function: ${IN}; } 37.778% { background-color: #E7C3C3; animation-timing-function: ${IN}; } 80.139%, 100% { background-color: #FFF; } }
@keyframes mbi-browfill { 0% { background-color: #000; animation-timing-function: ${IN}; } 80.139%, 100% { background-color: #FFF; } }
@keyframes mbi-brow-l { 0%, 45.833% { clip-path: inset(0 100% 0 0); animation-timing-function: ${REVEAL}; } 66.667%, 100% { clip-path: inset(0 0 0 0); } }
@keyframes mbi-brow-r { 0%, 54.167% { clip-path: inset(0 100% 0 0); animation-timing-function: ${REVEAL}; } 73.611%, 100% { clip-path: inset(0 0 0 0); } }
`;
  const part = (cls, src, x, y, w, h) =>
    '<div class="mbi-part ' + cls + '" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;' +
    '-webkit-mask-image:url(media/intro/' + src + ');mask-image:url(media/intro/' + src + ')"></div>';
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
      part('mbi-browfill', 'v6.svg', 2.91, 2.82, 69.32, 48.232) + '</div>' +
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
  const timer = setTimeout(finish, 3600 + 500);
  const skip = () => { clearTimeout(timer); finish(); };
  wrap.addEventListener('click', skip);
  addEventListener('keydown', skip, { once: true });
})();
