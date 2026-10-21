// Floral lace, after the "Floral lace garden" shader in Maitreyi's Figma file:
// a fine filet mesh in pink, with clusters of dark blooms that slowly grow and
// fade, cloudy highlights drifting through, and dotted rings around each bloom.
// Usage: <canvas data-lace></canvas>. Still for reduced-motion visitors.
(function () {
  const FRAG = `
precision mediump float;
uniform vec2 res; uniform float t; uniform vec2 m; uniform float cell;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a*n(p); p *= 2.03; a *= 0.5; } return s; }
// distance to the nearest bloom centre on a jittered grid, plus that bloom's id
vec3 bloom(vec2 p){
  vec2 g = floor(p), best = vec2(9.0); float id = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 c = g + vec2(x, y); vec2 o = vec2(h(c), h(c + 7.3)) * 0.7 + 0.15;
    vec2 d = c + o - p; if (dot(d, d) < dot(best, best)) { best = d; id = h(c + 3.1); }
  }
  return vec3(length(best), id, 0.0);
}
void main(){
  vec2 px = gl_FragCoord.xy;
  vec2 cellId = floor(px / cell);                 // every pixel of a mesh cell shares one value
  vec2 p = (cellId * cell) / res.y * 3.2;        // motif scale
  vec2 mp = vec2(m.x * res.x / res.y, m.y) * 3.2;
  vec3 b = bloom(p + vec2(0.0, t * 0.015));
  float grow = 0.30 + 0.12 * sin(t * 0.25 + b.y * 6.283);   // each bloom grows and shrinks on its own beat
  grow += 0.10 * smoothstep(1.2, 0.0, distance(p, mp));      // blooms open up near the cursor
  float edge = b.x + 0.22 * (fbm(p * 3.0 + b.y * 10.0 + t * 0.05) - 0.5);
  float inBloom = step(edge, grow);
  float ring = step(abs(b.x - grow - 0.09), 0.018) * step(0.5, h(cellId));   // dotted outline
  float cloud = fbm(p * 0.8 + vec2(t * 0.03, -t * 0.02));
  vec3 pink = mix(vec3(0.78, 0.38, 0.72), vec3(0.93, 0.64, 0.88), smoothstep(0.35, 0.8, cloud));
  vec3 plum = mix(vec3(0.20, 0.15, 0.27), vec3(0.42, 0.38, 0.47), fbm(p * 6.0 + t * 0.04));
  vec3 col = mix(pink, plum, inBloom);
  col = mix(col, vec3(0.25, 0.17, 0.30), ring * (1.0 - inBloom));
  col += inBloom * step(0.93, h(cellId + floor(t * 0.6))) * 0.25;   // speckles inside a bloom
  vec2 f = mod(px, cell);                          // the mesh itself
  float line = step(f.x, 1.0) + step(f.y, 1.0);
  col = mix(col, col * 0.62, clamp(line, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}`;
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  document.querySelectorAll('canvas[data-lace]').forEach(cv => {
    const gl = cv.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = k => gl.getUniformLocation(pr, k), uRes = U('res'), uT = U('t'), uM = U('m'), uCell = U('cell');
    let mx = -5, my = -5, tx = mx, ty = my, on = true, raf = 0, d = 1;
    const size = () => { const r = cv.getBoundingClientRect(); d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); gl.viewport(0, 0, cv.width, cv.height); };
    const draw = s => { mx += (tx - mx) * .05; my += (ty - my) * .05; gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uT, s); gl.uniform2f(uM, mx, my); gl.uniform1f(uCell, 7 * d); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    size(); draw(12); addEventListener('resize', () => { size(); draw(performance.now() / 1000); });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const loop = ms => { draw(ms / 1000 + 12); raf = on ? requestAnimationFrame(loop) : 0; };
    new IntersectionObserver(e => { on = e[0].isIntersecting; if (on && !raf) raf = requestAnimationFrame(loop); }).observe(cv);
    cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height; });
    cv.parentElement.addEventListener('pointerleave', () => { tx = -5; ty = -5; });
  });
})();
