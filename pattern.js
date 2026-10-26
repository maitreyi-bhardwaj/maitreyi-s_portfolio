// Dotted lace, after Maitreyi's reference: a grid of round dots that draws
// curls, scrolls and four-petal flowers. Soft clouds drift over it; where a
// cloud passes the dots light up, elsewhere they fade to the background, so
// the pattern keeps changing. The mouse lights up the area around it.
//   .page-dots placeholder (home page): very faint pink dots on white
//   footer.foot (every page): small dots on the brown footer, shifting colour as you scroll
(function () {
  const FRAG = `
precision mediump float;
uniform vec2 res; uniform float t; uniform vec2 m; uniform float cell; uniform float mode; uniform float scroll; uniform float hue;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a*n(p); p *= 2.02; a *= 0.5; } return s; }
// a curl: an Archimedean spiral of dots
float curl(vec2 q, vec2 c, float r, float dir){
  vec2 d = q - c; d.x *= dir; float rr = length(d);
  float a = atan(d.y, d.x) / 6.2832 + 0.5;
  float turns = rr / r * 2.2 - a;
  return step(rr, r) * step(abs(fract(turns) - 0.5), 0.17) * step(0.12 * r, rr);
}
// a four-petal flower with a dotted centre
float flower(vec2 q, vec2 c, float s){
  vec2 d = abs(q - c);
  float petals = step(length(d - vec2(s * 0.95, 0.0)), s * 0.62) + step(length(d - vec2(0.0, s * 0.95)), s * 0.62);
  float hole = step(length(d - vec2(s * 0.95, 0.0)), s * 0.2) + step(length(d - vec2(0.0, s * 0.95)), s * 0.2);
  return clamp(petals - hole, 0.0, 1.0) + step(length(q - c), s * 0.32);
}
// one tile of the pattern: two curls facing each other, two flowers, a small curl
float motif(vec2 q){
  float v = curl(q, vec2(0.28, 0.30), 0.20, 1.0) + curl(q, vec2(0.72, 0.70), 0.20, -1.0)
          + flower(q, vec2(0.74, 0.24), 0.085) + flower(q, vec2(0.26, 0.76), 0.085)
          + curl(q, vec2(0.50, 0.50), 0.08, 1.0);
  return clamp(v, 0.0, 1.0);
}
void main(){
  vec2 px = gl_FragCoord.xy + vec2(0.0, scroll);
  vec2 id = floor(px / cell);                       // the dot this pixel belongs to
  float tiles = 26.0;                                // dots per tile
  vec2 tile = floor(id / tiles);
  vec2 q = fract(id / tiles);
  if (mod(tile.x + tile.y, 2.0) > 0.5) q.x = 1.0 - q.x;   // mirror every other tile
  float on = motif(q);
  // drifting clouds decide which parts of the lace are lit
  vec2 uv = id / 60.0;
  float cloud = fbm(uv * 1.3 + vec2(t * 0.035, -t * 0.02));
  float lit = smoothstep(0.42, 0.68, cloud);
  vec2 mp = m + vec2(0.0, scroll);
  lit = max(lit, smoothstep(220.0, 0.0, distance(px, mp)));     // and so does the mouse
  float r = length(mod(px, cell) - cell * 0.5) / cell;
  float dotShape = smoothstep(0.40, 0.33, r);
  vec3 col;
  if (mode < 0.5) {   // page: white, faint pink lace
    float a = dotShape * on * (0.04 + 0.15 * lit);
    a += dotShape * (1.0 - on) * 0.02 * lit;                     // a whisper of the mesh where lit
    col = mix(vec3(1.0), vec3(0.86, 0.45, 0.66), a);
  } else {            // footer: brown with pink lace, a soft pink glow where lit
    vec3 brown = vec3(0.141, 0.086, 0.051);
    col = mix(brown, vec3(0.35, 0.17, 0.20), 0.45 * smoothstep(0.5, 0.85, cloud));
    // the dots drift through soft pinks, lilacs, peaches and mints as the page scrolls
    float p = fract(cloud * 0.9 + (id.x + id.y) / 160.0 + hue) * 4.0;
    vec3 c0 = vec3(0.94, 0.66, 0.82), c1 = vec3(0.78, 0.70, 0.96), c2 = vec3(0.98, 0.76, 0.64), c3 = vec3(0.68, 0.88, 0.80);
    vec3 tint = p < 1.0 ? mix(c0, c1, smoothstep(0.0, 1.0, p)) : p < 2.0 ? mix(c1, c2, smoothstep(1.0, 2.0, p))
              : p < 3.0 ? mix(c2, c3, smoothstep(2.0, 3.0, p)) : mix(c3, c0, smoothstep(3.0, 4.0, p));
    float small = smoothstep(0.33, 0.26, r);
    col = mix(col, tint, small * on * (0.24 + 0.70 * lit));
  }
  gl_FragColor = vec4(col, 1.0);
}`;
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mouseX = -9999, mouseY = -9999;
  addEventListener('pointermove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  function start(cv, mode, fixed) {
    const gl = cv.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = k => gl.getUniformLocation(pr, k), uRes = U('res'), uT = U('t'), uM = U('m'), uCell = U('cell'), uMode = U('mode'), uScroll = U('scroll'), uHue = U('hue');
    let d = 1, fx = -9999, fy = -9999, on = true, raf = 0;
    const size = () => { const r = cv.getBoundingClientRect(); d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); gl.viewport(0, 0, cv.width, cv.height); };
    const draw = s => {
      const r = cv.getBoundingClientRect();
      fx += (mouseX - fx) * .08; fy += (mouseY - fy) * .08;
      gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uT, s); gl.uniform1f(uCell, (mode ? 6 : 8) * d); gl.uniform1f(uHue, scrollY * 0.0009 + s * 0.02); gl.uniform1f(uMode, mode);
      gl.uniform2f(uM, (fx - r.left) * d, (r.bottom - fy) * d);
      gl.uniform1f(uScroll, fixed ? -scrollY * d : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    size(); draw(10); addEventListener('resize', () => { size(); draw(performance.now() / 1000 + 10); });
    if (still) { if (fixed) addEventListener('scroll', () => draw(10), { passive: true }); return; }
    const loop = ms => { draw(ms / 1000 + 10); raf = on ? requestAnimationFrame(loop) : 0; };
    new IntersectionObserver(e => { on = e[0].isIntersecting; if (on && !raf) raf = requestAnimationFrame(loop); }).observe(fixed ? document.body : cv);
  }

  const page = document.querySelector('.page-dots');
  if (page && !page.querySelector('canvas')) { const cv = document.createElement('canvas'); page.appendChild(cv); start(cv, 0, true); }
  const foot = document.querySelector('footer.foot');
  if (foot) { const cv = document.createElement('canvas'); cv.className = 'foot-lace'; cv.setAttribute('aria-hidden', 'true'); foot.prepend(cv); start(cv, 1, false); }
})();
