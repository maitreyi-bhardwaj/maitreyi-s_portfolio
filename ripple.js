// Interference ripples, after the "Yourname" shader motion: moving point sources
// whose rings overlap, drawn as bright bands on near-black with warm and cool
// fringes (each colour channel uses a slightly different ring spacing).
// Usage: <canvas data-ripple></canvas>. Still for reduced-motion visitors.
(function () {
  const FRAG = `
precision mediump float;
uniform vec2 res; uniform float t; uniform vec2 m;
float phase(vec2 p, float k){
  // one main source makes the rings; two others bend them, so they wobble and break up
  vec2 a = vec2(0.30 + 0.25*sin(t*0.09), 0.15 + 0.35*sin(t*0.06 + 1.0));
  vec2 b = vec2(0.95 + 0.15*cos(t*0.11), 0.05 + 0.30*cos(t*0.08));
  vec2 c = mix(vec2(0.55, 0.85), m, 0.4);
  float warp = 1.3*sin(k*0.55*distance(p,b) - t*1.3) + 0.8*sin(k*0.35*distance(p,c) - t*0.9);
  return k*distance(p,a) - t*1.8 + warp;
}
void main(){
  vec2 uv = gl_FragCoord.xy/res; vec2 p = uv; p.x *= res.x/res.y;
  float k = 34.0;
  vec3 v = 0.5 + 0.5*vec3(sin(phase(p,k*0.97)), sin(phase(p,k)), sin(phase(p,k*1.03)));
  vec3 band = smoothstep(0.62, 0.99, v);
  vec3 col = vec3(0.010, 0.040, 0.055);
  col += vec3(1.00, 0.62, 0.25)*band.r*0.80;   // warm edge
  col += vec3(0.95, 0.93, 0.85)*band.g*0.45;   // bright core
  col += vec3(0.25, 0.55, 1.00)*band.b*0.55;   // cool edge
  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
}`;
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  document.querySelectorAll('canvas[data-ripple]').forEach(cv => {
    const gl = cv.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(pr, 'res'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm');
    let mx = .5, my = .75, tx = mx, ty = my, on = true, raf = 0;
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 1.5); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); gl.viewport(0, 0, cv.width, cv.height); };
    const draw = s => { mx += (tx - mx) * .04; my += (ty - my) * .04; gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uT, s); gl.uniform2f(uM, mx * cv.width / cv.height, my); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    size(); draw(6); addEventListener('resize', () => { size(); draw(performance.now() / 1000); });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const loop = ms => { draw(ms / 1000); raf = on ? requestAnimationFrame(loop) : 0; };
    new IntersectionObserver(e => { on = e[0].isIntersecting; if (on && !raf) raf = requestAnimationFrame(loop); }).observe(cv);
    cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height; });
  });
})();
