// A trail of tiny pink pixel flowers that follows the cursor. Each flower is a
// cross of five square "pixels"; they are dropped along the path as the pointer
// moves (or the page scrolls under it) and fade and shrink away within a second.
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9998';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, d = 1;
  const size = () => { d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener('resize', size);

  const PINKS = ['#CF6B9B', '#E59AC0', '#F2BCD6', '#D9478A'];
  const STEP = 14, LIFE = 900, PX = 2.6;   // spacing between flowers, how long one lives (ms), pixel size
  const dots = [];
  let x = null, y = null, lastX = null, lastY = null, raf = 0;
  const drop = (px, py) => dots.push({ x: px, y: py, t: performance.now(), c: PINKS[(Math.random() * PINKS.length) | 0], s: Math.random() < .3 ? 2 : 1 });
  const lay = (nx, ny) => {
    if (lastX === null) { lastX = nx; lastY = ny; drop(nx, ny); return; }
    const dx = nx - lastX, dy = ny - lastY, dist = Math.hypot(dx, dy);
    for (let i = STEP; i <= dist; i += STEP) drop(lastX + dx * i / dist, lastY + dy * i / dist);
    if (dist >= STEP) { lastX = nx; lastY = ny; }
    if (!raf) raf = requestAnimationFrame(draw);
  };
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; lay(x, y); }, { passive: true });
  // scrolling moves the page under a still cursor: draw the trail along the scroll
  let sy = scrollY;
  addEventListener('scroll', () => {
    if (x === null) return;
    const dy = scrollY - sy; sy = scrollY;
    lastY = lastY === null ? null : lastY + dy;   // the last flower rides with the page
    dots.forEach(p => { p.y -= dy; });
    lay(x, y);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { lastX = lastY = null; });

  function flower(p, k) {
    const u = PX * p.s * (1 - k * .5);
    ctx.globalAlpha = 1 - k * k;
    ctx.fillStyle = p.c;
    // a plus of five pixels: centre and four petals
    [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([i, j]) => ctx.fillRect(p.x + i * u * 1.6 - u / 2, p.y + j * u * 1.6 - u / 2, u, u));
  }
  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    for (let i = dots.length - 1; i >= 0; i--) {
      const k = (now - dots[i].t) / LIFE;
      if (k >= 1) { dots.splice(i, 1); continue; }
      flower(dots[i], k);
    }
    ctx.globalAlpha = 1;
    raf = dots.length ? requestAnimationFrame(draw) : 0;
  }
})();
