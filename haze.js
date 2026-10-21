// Two moving backgrounds for the home page.
// 1. canvas[data-haze]: a soft lavender haze with a fine print grain, like a
//    risograph card. Light blobs drift; one follows the mouse. setMode('warm')
//    shifts it to a warm paper tone (used for industrial design).
// 2. canvas[data-pagedots]: fixed behind the whole white page, a dot grid that only
//    shows in drifting patches, with a patch that gathers around the mouse.
// Both hold still for reduced-motion visitors and pause when hidden.
(function () {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mouseX = -9999, mouseY = -9999;
  addEventListener('pointermove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  // ---------- haze ----------
  const FRAG = `
precision mediump float;
uniform vec2 res; uniform float t; uniform vec2 m; uniform float warm;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float blob(vec2 p, vec2 c, float r){ return exp(-dot(p - c, p - c) / (r * r)); }
void main(){
  vec2 uv = gl_FragCoord.xy / res; vec2 p = uv; p.x *= res.x / res.y; float a = res.x / res.y;
  float f = 0.0;
  f += 0.9 * blob(p, vec2(a * (0.30 + 0.12 * sin(t * 0.21)), 0.30 + 0.10 * cos(t * 0.17)), 0.38);
  f += 0.8 * blob(p, vec2(a * (0.78 + 0.10 * cos(t * 0.15)), 0.62 + 0.12 * sin(t * 0.19)), 0.34);
  f += 0.7 * blob(p, vec2(a * (0.55 + 0.20 * sin(t * 0.11 + 2.0)), 0.95 + 0.08 * sin(t * 0.23)), 0.30);
  f += 0.6 * blob(p, vec2(m.x * a, m.y), 0.26);                       // the one that follows the mouse
  float hi = blob(p, vec2(a * (0.15 + 0.08 * sin(t * 0.13)), 0.85), 0.30);  // a white highlight
  vec3 base = mix(vec3(0.89, 0.88, 0.98), vec3(0.97, 0.94, 0.90), warm);
  vec3 deep = mix(vec3(0.56, 0.54, 0.95), vec3(0.88, 0.70, 0.55), warm);
  vec3 col = mix(base, deep, clamp(f * 0.55, 0.0, 1.0));
  col = mix(col, vec3(1.0), hi * 0.55);
  // print grain: fine dots in a screen pattern plus noise
  vec2 g = mod(gl_FragCoord.xy, 3.0);
  float dotp = step(length(g - 1.5), 0.9) * 0.035;
  col -= dotp; col += (h(gl_FragCoord.xy + floor(t * 12.0)) - 0.5) * 0.05;
  gl_FragColor = vec4(col, 1.0);
}`;
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  document.querySelectorAll('canvas[data-haze]').forEach(cv => {
    const gl = cv.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = k => gl.getUniformLocation(pr, k), uRes = U('res'), uT = U('t'), uM = U('m'), uWarm = U('warm');
    let mx = .62, my = .5, w = 0, wTarget = 0, on = true, raf = 0;
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); gl.viewport(0, 0, cv.width, cv.height); };
    const draw = s => {
      const r = cv.getBoundingClientRect();
      const inside = mouseX >= r.left && mouseX <= r.right && mouseY >= r.top && mouseY <= r.bottom;
      const tx = inside ? (mouseX - r.left) / r.width : .62, ty = inside ? 1 - (mouseY - r.top) / r.height : .5;
      mx += (tx - mx) * .05; my += (ty - my) * .05; w += (wTarget - w) * .12;
      gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uT, s); gl.uniform2f(uM, mx, my); gl.uniform1f(uWarm, w);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    cv.setMode = mode => { wTarget = mode === 'warm' ? 1 : 0; if (still) { w = wTarget; draw(8); } };
    size(); draw(8); addEventListener('resize', () => { size(); draw(performance.now() / 1000); });
    if (still) return;
    const loop = ms => { draw(ms / 1000 + 8); raf = on ? requestAnimationFrame(loop) : 0; };
    new IntersectionObserver(e => { on = e[0].isIntersecting; if (on && !raf) raf = requestAnimationFrame(loop); }).observe(cv);
  });

  // ---------- dots behind the page ----------
  document.querySelectorAll('canvas[data-pagedots]').forEach(cv => {
    const ctx = cv.getContext('2d'), GAP = 18, R = 1.4;
    let W = 0, H = 0, d = 1, fx = -9999, fy = -9999;
    const size = () => { d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const noise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), e = hash(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v; };
    const draw = t => {
      fx += (mouseX - fx) * .08; fy += (mouseY - fy) * .08;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = 'rgba(160, 158, 220, .55)';
      const sy = scrollY * .3;   // the pattern drifts gently as you scroll
      for (let y = (-sy % GAP) - GAP; y < H + GAP; y += GAP) {
        const gy = Math.round((y + sy) / GAP);
        for (let x = GAP / 2; x < W; x += GAP) {
          const gx = Math.round(x / GAP);
          let v = noise(gx * .09 + t * .05, gy * .09 - t * .03);
          const dm = Math.hypot(x - fx, y - fy);
          v += Math.max(0, 1 - dm / 160) * .55;              // a patch gathers around the mouse
          if (v > .72) { ctx.beginPath(); ctx.arc(x, y, R * Math.min(1.6, (v - .62) * 4), 0, 6.283); ctx.fill(); }
        }
      }
    };
    size(); draw(0); addEventListener('resize', () => { size(); draw(performance.now() / 1000); });
    if (still) { addEventListener('scroll', () => draw(0), { passive: true }); return; }
    const loop = ms => { draw(ms / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
})();
