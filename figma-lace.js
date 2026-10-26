// "Floral lace garden" — Maitreyi's Figma shader (frame "Yourname-vertical"),
// ported line for line from its WGSL source to WebGL so it runs in every browser.
// The animation is the frame's own keyframes: eleven settings ease from their start
// to end values over 4.008 s (cubic-bezier .5,0,.5,1), then ease back, looping without a jump.
// Usage: <canvas data-figma-lace></canvas> for the home intro. On pages with project
// squares (.ix-tile .pic), the same lace plays over a card in white and pink on hover.
(function () {
  const FRAG = `
precision highp float;
uniform vec2 dims;
uniform float veil, fine;
uniform float flowerSize, spacing, patternStyle, growth, meshSize, threadThickness, edgeSoftness,
              seed, density, rotation, irregularity, clouds, glow, grain;
float hashL(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noiseL(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 w = f*f*(3.0-2.0*f);
  return mix(mix(hashL(i),hashL(i+vec2(1.0,0.0)),w.x),mix(hashL(i+vec2(0.0,1.0)),hashL(i+vec2(1.0,1.0)),w.x),w.y); }
vec2 rotateL(vec2 p, float a){ return vec2(cos(a)*p.x-sin(a)*p.y, sin(a)*p.x+cos(a)*p.y); }
float leafL(vec2 p, float len, float width, float softness){
  float t = clamp(p.x/len, 0.0, 1.0);
  float edge = width * pow(max(sin(t*3.141593),0.0),0.85) * (1.0+0.075*sin(t*52.0));
  float body = (1.0-smoothstep(-softness,softness,abs(p.y)-edge))*smoothstep(-softness,softness,p.x)*(1.0-smoothstep(len-softness,len+softness,p.x));
  float vein = 1.0-smoothstep(0.6,1.5,abs(p.y+sin(t*3.14159)*1.1));
  float sideVeins = pow(max(0.0,cos(t*36.0-abs(p.y)*0.30)),16.0)*0.50;
  return body*(1.0-0.65*vein)*(1.0-sideVeins);
}
float roseL(vec2 p, float radius, float phase, float opening, float softness, float organic){
  float result = 0.0;
  float rad = radius*mix(0.18,1.0,opening);
  for (int ring = 0; ring < 3; ring++) {
    float rf = float(ring);
    float orbit = rad*(0.59-rf*0.20);
    float petalLen = rad*(0.46-rf*0.095);
    float petalWidth = rad*(0.40-rf*0.105);
    for (int k = 0; k < 7; k++) {
      float fk = float(k);
      float a = fk*0.897598+rf*0.49+phase+organic*0.09*sin(fk*7.1+phase);
      vec2 q = rotateL(p,-a)-vec2(orbit,0.0);
      float flutter = 1.0+organic*0.055*sin(atan(q.y,q.x)*5.0+phase+fk);
      float d = length(q/vec2(petalLen,petalWidth))/flutter;
      float aa = softness/max(petalWidth,1.0);
      float petal = 1.0-smoothstep(1.0-aa,1.0+aa,d);
      float incision = smoothstep(0.66-aa,0.66+aa,d)*(1.0-smoothstep(0.77-aa,0.77+aa,d));
      float cut = incision*smoothstep(-petalLen*0.60,petalLen*0.2,q.x);
      result = mix(result,1.0-cut*0.94,petal);
    }
  }
  float a = atan(p.y,p.x)+phase;
  float r = length(p)/max(rad,1.0);
  float heart = (1.0-smoothstep(0.14,0.20,r))*(0.55+0.45*sin(a*2.0+r*42.0));
  return max(result,heart);
}
uniform vec2 canvasPx;
void main(){
  // uv as in the WGSL vertex quad: (0,0) top-left, (1,1) bottom-right
  vec2 uv = vec2(gl_FragCoord.x / canvasPx.x, 1.0 - gl_FragCoord.y / canvasPx.y);
  float aa = max(0.35,edgeSoftness+0.25);
  float pitch = meshSize*fine;
  vec2 pixelP = uv*dims;
  vec2 cellP = (floor(pixelP/pitch)+0.5)*pitch;
  vec2 p = rotateL(cellP-dims*0.5,-rotation*0.0174532925);
  vec2 tile = floor(p/spacing);
  float ornament = 0.0;
  float halo = 0.0;
  for (int iy = -1; iy <= 1; iy++) {
    for (int ix = -1; ix <= 1; ix++) {
      vec2 id = tile+vec2(float(ix),float(iy));
      float rand = hashL(id+vec2(seed*1.731,seed*0.317));
      float rand2 = hashL(id.yx+vec2(seed+17.0,41.0));
      vec2 center = (id+0.5)*spacing;
      if (patternStyle < 0.5) {
        center = center+vec2((abs(mod(id.y,2.0)) < 0.5 ? 0.14 : -0.14)*spacing,0.0);
      } else if (patternStyle < 1.5) {
        center = center+vec2(sin(id.y*1.8+id.x)*spacing*0.21,0.0);
      } else {
        center = center+vec2(rand-0.5,rand2-0.5)*spacing*0.67;
      }
      center = center+vec2(rand2-0.5,rand-0.5)*spacing*0.18*irregularity;
      vec2 localP = p-center;
      float activeFlower = 1.0-smoothstep(density-0.04,density+0.04,rand);
      float localGrowth = smoothstep(rand*0.11,1.0,growth);
      float bloomOpen = smoothstep(0.39,0.98,localGrowth);
      float radius = min(flowerSize,spacing*0.68)*mix(0.78,1.17,rand2);
      float stemLen = spacing*0.75;
      float stemT = clamp((stemLen-localP.y)/stemLen,0.0,1.0);
      float bend = sin(stemT*4.0+rand*4.0)*spacing*0.10*mix(0.25,1.0,irregularity);
      float sx = localP.x-bend;
      float revealStem = smoothstep(stemT-0.025,stemT+0.025,localGrowth*2.4)*smoothstep(0.0,0.025,localGrowth);
      float stem = (1.0-smoothstep(1.5,3.6+edgeSoftness,abs(sx)))*smoothstep(-aa,aa,localP.y)*(1.0-smoothstep(stemLen-aa,stemLen+aa,localP.y))*revealStem;
      float botany = stem;
      for (int li = 0; li < 4; li++) {
        float lf = float(li);
        float y = stemLen*(0.20+lf*0.18);
        float bt = (stemLen-y)/stemLen;
        float bx = sin(bt*4.0+rand*4.0)*spacing*0.10*mix(0.25,1.0,irregularity);
        float side = mod(lf,2.0) < 0.5 ? 1.0 : -1.0;
        float leafGrowth = smoothstep(0.15+bt*0.30,0.48+bt*0.30,localGrowth);
        vec2 leafQ = rotateL(localP-vec2(bx,y),side*0.58);
        vec2 mirrored = vec2(leafQ.x*side,leafQ.y);
        float leaf = leafL(mirrored,max(1.0,radius*0.92*leafGrowth),max(0.1,radius*0.23*leafGrowth),aa)*smoothstep(0.0,0.08,leafGrowth);
        botany = max(botany,leaf);
      }
      vec2 roseP = rotateL(localP,rand*6.283185);
      float rose = 0.0;
      if (length(localP) < radius*1.35 && localGrowth > 0.30 && activeFlower > 0.0) {
        rose = roseL(roseP,radius,rand*5.0,bloomOpen,aa,irregularity)*smoothstep(0.30,0.44,localGrowth);
      }
      botany = max(botany,rose);
      if (patternStyle < 0.5) {
        float wreathR = radius*1.18;
        float d = length(localP);
        float angle = atan(localP.y,localP.x);
        float curlR = wreathR*(1.0+0.035*sin(angle*3.0+rand*6.0));
        float wreath = (1.0-smoothstep(1.0,3.2,abs(d-curlR)))*(1.0-smoothstep(-3.20+6.5*localGrowth,-3.12+6.5*localGrowth,angle))*smoothstep(0.0,0.08,localGrowth);
        botany = max(botany,wreath*0.78);
      }
      if (patternStyle > 0.5 && patternStyle < 1.5) {
        float vineX = localP.x-sin(localP.y/spacing*6.283185+rand)*spacing*0.21;
        float vineTip = spacing*(0.52-localGrowth*1.05);
        float vine = (1.0-smoothstep(1.0,3.0,abs(vineX)))*(1.0-smoothstep(spacing*0.48,spacing*0.52,abs(localP.y)))*smoothstep(vineTip-3.0,vineTip+3.0,localP.y)*smoothstep(0.0,0.04,localGrowth);
        botany = max(botany,vine);
      }
      ornament = max(ornament,botany*activeFlower);
      halo = max(halo,exp(-dot(localP,localP)/(radius*radius*1.6))*activeFlower*bloomOpen);
    }
  }
  vec2 gridD = abs(fract(pixelP/pitch)-0.5)*pitch;
  float strandD = min(gridD.x,gridD.y);
  float strandWidth = min(threadThickness*fine,pitch*0.70);
  float net = 1.0-smoothstep(strandWidth*0.5,strandWidth*0.5+aa*0.65*fine,strandD);
  float stitch = 0.89+0.11*cos(pixelP.x*2.8)*cos(pixelP.y*2.8);
  float textile = max(net*0.77,ornament*stitch);
  float n = noiseL(pixelP/180.0+seed)*0.56+noiseL(pixelP/70.0+seed*0.31)*0.28+noiseL(pixelP/29.0)*0.16;
  float cloud = smoothstep(0.40,0.77,n)*clouds;
  vec3 pink = mix(vec3(0.81,0.39,0.68),vec3(0.96,0.59,0.80),noiseL(pixelP/470.0));
  vec3 ink = vec3(0.075,0.085,0.205);
  ink = mix(ink,vec3(0.25,0.30,0.44),cloud*0.62);
  vec3 color = mix(pink,ink,textile);
  float borderX = abs(uv.x-0.5)*2.0;
  float stripe = 1.0-smoothstep(0.003,0.009,abs(borderX-0.87));
  float stripe2 = 1.0-smoothstep(0.002,0.005,abs(borderX-0.92));
  color = mix(color,ink,max(stripe,stripe2)*0.82*smoothstep(0.0,0.18,growth));
  color = mix(color,vec3(0.93,0.94,0.88),clamp(cloud*(0.95+glow*0.6)+glow*halo*0.10,0.0,0.88));
  if (veil > 0.5) {
    // On a project card: pink lace on a white ground.
    float flower = smoothstep(0.35,0.95,ornament);
    vec3 rose = mix(vec3(0.89,0.42,0.64),vec3(0.97,0.64,0.79),noiseL(pixelP/300.0));
    vec3 vc = mix(vec3(1.0),vec3(0.98,0.84,0.90),net*0.85);
    vc = mix(vc,rose,flower*stitch);
    vc = mix(vc,vec3(1.0),cloud*0.55);
    gl_FragColor = vec4(vc,1.0);
    return;
  }
  float fiberNoise = (hashL(floor(pixelP*1.7)+seed)-0.5)*grain*0.22;
  color = clamp(color+vec3(fiberNoise),vec3(0.0),vec3(1.0));
  gl_FragColor = vec4(color,1.0);
}`;
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  // The frame's keyframes: [start, end]; all ease 0 → 4.008 s, then hold to 15 s and loop.
  const TRACKS = {
    spacing: [366, 388], growth: [1, 0.55], grain: [0.64, 0.95], rotation: [-98, -14],
    flowerSize: [137, 47], edgeSoftness: [1.25, 0.45], threadThickness: [1.55, 1.8],
    meshSize: [12.1, 10.6], density: [0.81, 0.71], glow: [0.52, 0.06], clouds: [0.25, 0.31]
  };
  const FIXED = { seed: 7, patternStyle: 0, irregularity: 0.84 };
  const RAMP = 4.008;
  // cubic-bezier(.5, 0, .5, 1)
  const bez = x => { let t = x; for (let i = 0; i < 8; i++) { const cx = 3 * .5 * t * (1 - t) * (1 - t) + 3 * .5 * t * t * (1 - t) + t * t * t - x;
    const dx = 3 * .5 * (1 - t) * (1 - t) + 6 * (0.5 - .5) * t * (1 - t) + 3 * (1 - .5) * t * t; if (Math.abs(cx) < 1e-5) break; t -= cx / Math.max(dx, 1e-4); t = Math.min(1, Math.max(0, t)); }
    return 3 * t * t * (1 - t) + t * t * t; };

  // Sets up the shader on one canvas. opts.veil draws the white and pink card lace;
  // opts.scale shrinks the pattern (pattern pixels per screen pixel); opts.fine shrinks only the
  // mesh cells, for smaller pixels; opts.maxDpr caps the render resolution.
  function lace(cv, opts) {
    opts = opts || {};
    const gl = cv.getContext('webgl', { antialias: false, alpha: !!opts.veil, premultipliedAlpha: true });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['dims', 'canvasPx', 'veil', 'fine'].concat(Object.keys(TRACKS), Object.keys(FIXED)).forEach(k => U[k] = gl.getUniformLocation(pr, k));
    const scale = opts.scale || 1;
    let w = 1, h = 1, k = 0;
    // sizes are in CSS pixels (Figma points); render at up to 1.25x for crisp threads without overworking the GPU
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, opts.maxDpr || 1.25); w = r.width; h = r.height;
      cv.width = Math.max(1, Math.round(w * d)); cv.height = Math.max(1, Math.round(h * d)); gl.viewport(0, 0, cv.width, cv.height); };
    const draw = nk => {
      k = nk;
      gl.uniform2f(U.dims, w / scale, h / scale); gl.uniform2f(U.canvasPx, cv.width, cv.height); gl.uniform1f(U.veil, opts.veil ? 1 : 0); gl.uniform1f(U.fine, opts.fine || 1);
      for (const n in TRACKS) gl.uniform1f(U[n], TRACKS[n][0] + (TRACKS[n][1] - TRACKS[n][0]) * k);
      for (const n in FIXED) gl.uniform1f(U[n], FIXED[n]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    // A seamless loop: ease from start to end over 4.008 s (the Figma ramp), hold a moment,
    // ease back the same way, hold, repeat — so there is never a jump.
    const HOLD = 1.5, CYCLE = 2 * (RAMP + HOLD);
    let t0 = 0, raf = 0;
    const loop = now => {
      const s = ((now - t0) / 1000) % CYCLE;
      let x;
      if (s < RAMP) x = s / RAMP;                                  // forward
      else if (s < RAMP + HOLD) x = 1;                             // hold at the end
      else if (s < 2 * RAMP + HOLD) x = 1 - (s - RAMP - HOLD) / RAMP;  // back
      else x = 0;                                                  // hold at the start
      const nk = bez(x);
      if (Math.abs(nk - k) > 1e-4) draw(nk);
      raf = requestAnimationFrame(loop);
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      size, draw: () => draw(k),
      play(fromStart) { if (reduced) return; if (fromStart) { t0 = performance.now(); draw(0); } if (!raf) raf = requestAnimationFrame(loop); },
      stop() { cancelAnimationFrame(raf); raf = 0; }
    };
  }

  // The home intro: full colour, always looping while on screen.
  document.querySelectorAll('canvas[data-figma-lace]').forEach(cv => {
    const L = lace(cv);
    if (!L) return;
    L.size(); L.draw();
    addEventListener('resize', () => { L.size(); L.draw(); });
    let started = false;
    new IntersectionObserver(e => {
      if (e[0].isIntersecting) { L.play(!started); started = true; } else L.stop();
    }).observe(cv);
  });

  // Project cards: one shared canvas moves to the card under the pointer
  // (or, on touch screens, the card in the middle of the screen) and plays the lace there.
  const cards = document.querySelectorAll('.ix-tile .pic');
  if (!cards.length) return;
  const cv = document.createElement('canvas');
  cv.className = 'card-lace'; cv.setAttribute('aria-hidden', 'true');
  const L = lace(cv, { veil: true, scale: 0.8, fine: 0.36, maxDpr: 2 });
  if (!L) return;
  let current = null, hideT = 0;
  const show = pic => {
    clearTimeout(hideT);
    if (current !== pic) { pic.appendChild(cv); current = pic; L.size(); L.play(true); }
    else L.play(false);
    requestAnimationFrame(() => cv.classList.add('on'));
  };
  const hide = pic => {
    if (current !== pic) return;
    cv.classList.remove('on');
    hideT = setTimeout(() => { L.stop(); }, 600);
  };
  addEventListener('resize', () => { if (current) L.size(); });
  if (matchMedia('(hover: hover)').matches) {
    cards.forEach(pic => {
      const tile = pic.closest('.ix-tile') || pic;
      tile.addEventListener('pointerenter', () => show(pic));
      tile.addEventListener('pointerleave', () => hide(pic));
      tile.addEventListener('focus', () => show(pic));
      tile.addEventListener('blur', () => hide(pic));
    });
  } else {
    // touch: the card crossing the middle of the screen gets the lace
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? show(e.target) : hide(e.target)),
      { rootMargin: '-45% 0px -45% 0px' });
    cards.forEach(pic => io.observe(pic));
  }
})();
