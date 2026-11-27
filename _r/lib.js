// Thư viện dựng ảnh: kết xuất HDR → AO theo độ sâu → DOF (xoá phông theo khẩu độ) → chỉnh màu kiểu phim
const A = window.__ALKI;
const T = {};
const tex = (c, { repeat = [1, 1], srgb = false, aniso = 16 } = {}) => {
  const t = new A.CanvasTex(c); t.wrapS = t.wrapT = A.Repeat; t.repeat.set(repeat[0], repeat[1]); t.anisotropy = aniso; t.colorSpace = srgb ? A.SRGB : A.NoCS; t.needsUpdate = true; return t;
};
const cv = (w, h = w) => A.canvas(w, h);
const rnd = (s) => A.rand(s);
function mesh(g, m, p, r, s) { const o = new A.Mesh(g, m); if (p) o.position.set(...p); if (r) o.rotation.set(...r); if (s) (typeof s === 'number' ? o.scale.setScalar(s) : o.scale.set(...s)); o.castShadow = o.receiveShadow = true; return o; }
function V(x, y, z) { return new A.V3(x, y, z); }
function phys(o) { return new A.Phys(o); }
function col(c) { return new A.Color(c); }

/* ---------------- Bầu trời toàn cảnh vẽ tay (equirect) ---------------- */
function skyTex({ zenith = '#2f78c8', mid = '#79b2e3', horizon = '#e8eef3', ground = '#c9b393', sunDir = null, sunAz = .2, sunEl = .35, sunCol = '255,236,200', clouds = 40, seed = 3, haze = '255,240,220', warm = 0 } = {}) {
  const W = 4096, H = 2048, c = cv(W, H), x = c.getContext('2d'), R = rnd(seed);
  const g = x.createLinearGradient(0, 0, 0, H / 2);
  g.addColorStop(0, zenith); g.addColorStop(.55, mid); g.addColorStop(.86, mid); g.addColorStop(.975, horizon); g.addColorStop(1, horizon);
  x.fillStyle = g; x.fillRect(0, 0, W, H / 2);
  const gg = x.createLinearGradient(0, H / 2, 0, H); gg.addColorStop(0, horizon); gg.addColorStop(.06, ground); gg.addColorStop(1, ground);
  x.fillStyle = gg; x.fillRect(0, H / 2, W, H / 2);
  if (sunDir) { sunAz = Math.atan2(sunDir.z, -sunDir.x); sunEl = Math.asin(sunDir.clone().normalize().y); }
  const sx = ((sunAz / (Math.PI * 2)) % 1 + 1) % 1 * W, sy = (0.5 - sunEl / Math.PI) * H;
  // quầng nắng
  for (const [r, a] of [[700, .14 + warm * .12], [300, .3], [110, .6]]) { const s = x.createRadialGradient(sx, sy, 0, sx, sy, r); s.addColorStop(0, `rgba(${haze},${a})`); s.addColorStop(1, `rgba(${haze},0)`); x.fillStyle = s; x.fillRect(0, 0, W, H / 2 + 40); }
  // mây tích nhiều lớp
  for (let i = 0; i < clouds; i++) {
    const cxp = R() * W, el = .02 + Math.pow(R(), 1.8) * .32, cy = (0.5 - el) * H, sz = (60 + R() * 220) * (1 - el * 1.4), n = 8 + Math.floor(R() * 14);
    for (let k = 0; k < n; k++) {
      const px = cxp + (R() - .5) * sz * 3.2, py = cy + (R() - .7) * sz * .55, rr = sz * (.35 + R() * .6);
      const s = x.createRadialGradient(px, py, 0, px, py, rr);
      s.addColorStop(0, 'rgba(255,255,255,.78)'); s.addColorStop(.55, 'rgba(250,250,252,.42)'); s.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = s; x.beginPath(); x.ellipse(px, py, rr, rr * .55, 0, 0, 7); x.fill();
      const sh = x.createRadialGradient(px, py + rr * .3, 0, px, py + rr * .3, rr * .8); sh.addColorStop(0, 'rgba(150,165,185,.16)'); sh.addColorStop(1, 'rgba(150,165,185,0)'); x.fillStyle = sh; x.beginPath(); x.ellipse(px, py + rr * .3, rr * .8, rr * .35, 0, 0, 7); x.fill();
    }
  }
  const t = tex(c, { srgb: true }); t.wrapS = A.Repeat; return t;
}
function skyDome(t, { intensity = 1, radius = 600, sunDir = null, sunPower = 40 } = {}) {
  const g = new A.Group();
  const m = new A.Basic({ map: t, side: A.Back, depthWrite: false, fog: false }); m.color.setScalar(intensity);
  const s = new A.Mesh(new A.Sphere(radius, 96, 48), m); s.renderOrder = -10; g.add(s);
  if (sunDir) { const sun = new A.Mesh(new A.Sphere(radius * .022, 24, 12), new A.Basic({ color: col('#fff1d6').multiplyScalar(sunPower), fog: false })); sun.position.copy(sunDir.clone().normalize().multiplyScalar(radius * .9)); g.add(sun); }
  return g;
}
function envFromScene(R, sc, sigma = .02) { const pm = new A.PMREM(R); const t = pm.fromScene(sc, sigma).texture; pm.dispose(); return t; }
function sunLight(dir, color = '#fff1dc', intensity = 3, { size = 14, map = 4096, radius = 6, target = [0, 0, 0], dist = 60 } = {}) {
  const l = new A.Dir(color, intensity); l.position.copy(dir.clone().normalize().multiplyScalar(dist)).add(V(...target)); l.target.position.set(...target);
  l.castShadow = true; l.shadow.mapSize.set(map, map); Object.assign(l.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 1, far: dist * 2.2 });
  l.shadow.camera.updateProjectionMatrix(); l.shadow.bias = -2e-4; l.shadow.normalBias = .03; l.shadow.radius = radius; l.shadow.blurSamples = 24; return l;
}

/* ---------------- Vật liệu nền ---------------- */
function noiseLayer(x, W, H, R, n, cols, a, sz) { for (let i = 0; i < n; i++) { x.globalAlpha = R() * a; x.fillStyle = cols[i % cols.length]; x.fillRect(R() * W, R() * H, 1 + R() * sz, 1 + R() * sz); } x.globalAlpha = 1; }
T.walnutSlab = (repeat = [1, 1], tone = 1) => {
  const W = 4096, H = 1024, c = cv(W, H), x = c.getContext('2d'), h = cv(W, H), y = h.getContext('2d'), R = rnd(17);
  const base = x.createLinearGradient(0, 0, 0, H); base.addColorStop(0, '#5b4333'); base.addColorStop(.35, '#664a36'); base.addColorStop(.7, '#59402f'); base.addColorStop(1, '#614634'); x.fillStyle = base; x.fillRect(0, 0, W, H);
  y.fillStyle = '#808080'; y.fillRect(0, 0, W, H);
  // vân dài, mảnh, cong nhẹ theo thớ
  for (let i = 0; i < 1400; i++) {
    const yy = R() * H, amp = 3 + R() * 14, f = .0008 + R() * .0016, ph = R() * 9, dark = R() < .6;
    x.strokeStyle = dark ? `rgba(36,24,16,${.04 + R() * .12})` : `rgba(150,112,82,${.03 + R() * .09})`; x.lineWidth = .5 + R() * (dark ? 2.4 : 1.6);
    y.strokeStyle = dark ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.08)'; y.lineWidth = x.lineWidth;
    for (const k of [x, y]) { k.beginPath(); for (let s = 0; s <= W; s += 16) { const d = yy + Math.sin(s * f + ph) * amp + Math.sin(s * f * 4.1 + ph * 2) * amp * .2; s ? k.lineTo(s, d) : k.moveTo(s, d); } k.stroke(); }
  }
  // dải màu rộng (tâm gỗ / giác gỗ)
  for (let i = 0; i < 14; i++) { const yy = R() * H, hh = 40 + R() * 160; const g = x.createLinearGradient(0, yy - hh, 0, yy + hh); const a = .05 + R() * .08, cc = R() < .5 ? '40,26,16' : '140,104,74'; g.addColorStop(0, `rgba(${cc},0)`); g.addColorStop(.5, `rgba(${cc},${a})`); g.addColorStop(1, `rgba(${cc},0)`); x.fillStyle = g; x.fillRect(0, yy - hh, W, hh * 2); }
  // lỗ chân gỗ li ti
  for (let i = 0; i < 60000; i++) { const px = R() * W, py = R() * H, l = 2 + R() * 7; x.fillStyle = 'rgba(28,18,12,.28)'; x.fillRect(px, py, l, 1); y.fillStyle = 'rgba(0,0,0,.35)'; y.fillRect(px, py, l, 1); }
  if (tone !== 1) { x.globalCompositeOperation = 'multiply'; x.fillStyle = `rgba(${Math.round(255 * tone)},${Math.round(250 * tone)},${Math.round(245 * tone)},1)`; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; }
  const rough = cv(1024, 256), rx = rough.getContext('2d'); rx.drawImage(h, 0, 0, 1024, 256);
  const d = rx.getImageData(0, 0, 1024, 256); for (let i = 0; i < d.data.length; i += 4) { const v = 90 + (128 - d.data[i]) * 1.2; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; } rx.putImageData(d, 0, 0);
  return { map: tex(c, { repeat, srgb: true }), normal: tex(A.h2n(h, 1.1), { repeat }), rough: tex(rough, { repeat }) };
};
T.plaster = (color = '#e9e2d6', repeat = [4, 2]) => {
  const c = cv(1024), x = c.getContext('2d'), h = cv(512), y = h.getContext('2d'), R = rnd(4);
  x.fillStyle = color; x.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) { const g = x.createRadialGradient(R() * 1024, R() * 1024, 0, R() * 1024, R() * 1024, 80 + R() * 200); g.addColorStop(0, `rgba(${R() < .5 ? '255,255,255' : '160,140,120'},.05)`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 1024, 1024); }
  y.fillStyle = '#808080'; y.fillRect(0, 0, 512, 512); for (let i = 0; i < 9000; i++) { y.globalAlpha = R() * .3; y.fillStyle = R() < .5 ? '#fff' : '#000'; y.beginPath(); y.arc(R() * 512, R() * 512, .5 + R() * 3, 0, 7); y.fill(); }
  return { map: tex(c, { repeat, srgb: true }), normal: tex(A.h2n(h, 1.3), { repeat: [repeat[0] * 2, repeat[1] * 2] }) };
};
T.sand = (repeat = [10, 10]) => {
  const S = 2048, c = cv(S), x = c.getContext('2d'), h = cv(S), y = h.getContext('2d'), R = rnd(12);
  x.fillStyle = '#c9ae86'; x.fillRect(0, 0, S, S); y.fillStyle = '#808080'; y.fillRect(0, 0, S, S);
  // gợn cát do gió
  for (let i = 0; i < 260; i++) { const yy = R() * S, ph = R() * 9; y.strokeStyle = `rgba(255,255,255,${.06 + R() * .08})`; y.lineWidth = 6 + R() * 14; y.beginPath(); for (let s = 0; s <= S; s += 20) { const d = yy + Math.sin(s * .004 + ph) * 40 + Math.sin(s * .013 + ph) * 8; s ? y.lineTo(s, d) : y.moveTo(s, d); } y.stroke(); }
  for (let i = 0; i < 260000; i++) { const px = R() * S, py = R() * S, v = R(); x.fillStyle = v < .33 ? 'rgba(120,98,70,.35)' : v < .66 ? 'rgba(255,246,228,.45)' : 'rgba(170,140,100,.3)'; x.fillRect(px, py, 1 + R() * 1.6, 1 + R() * 1.6); y.fillStyle = v < .5 ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.25)'; y.fillRect(px, py, 1.5, 1.5); }
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${R() < .5 ? '90,80,70' : '240,236,228'},.5)`; x.beginPath(); x.arc(R() * S, R() * S, 1.5 + R() * 3, 0, 7); x.fill(); }
  return { map: tex(c, { repeat, srgb: true }), normal: tex(A.h2n(h, 2.2), { repeat }) };
};
T.tiles = (repeat = [6, 6], { color = '#e8e1d4', grout = '#bdb3a4', n = 4 } = {}) => {
  const S = 2048, c = cv(S), x = c.getContext('2d'), h = cv(S), y = h.getContext('2d'), R = rnd(21), p = S / n;
  x.fillStyle = grout; x.fillRect(0, 0, S, S); y.fillStyle = '#404040'; y.fillRect(0, 0, S, S);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const t = .92 + R() * .12, base = col(color).multiplyScalar(t); x.fillStyle = '#' + base.getHexString(); x.fillRect(i * p + 5, j * p + 5, p - 10, p - 10);
    for (let k = 0; k < 40; k++) { x.strokeStyle = `rgba(${R() < .5 ? '180,166,146' : '255,252,246'},${.05 + R() * .12})`; x.lineWidth = 1 + R() * 6; x.beginPath(); const yy = j * p + R() * p; x.moveTo(i * p + 5, yy); x.bezierCurveTo(i * p + p * .3, yy + (R() - .5) * 40, i * p + p * .7, yy + (R() - .5) * 40, i * p + p - 5, yy + (R() - .5) * 20); x.stroke(); }
    for (let k = 0; k < 120; k++) { x.fillStyle = 'rgba(150,130,110,.35)'; x.beginPath(); x.arc(i * p + 8 + R() * (p - 16), j * p + 8 + R() * (p - 16), .8 + R() * 2.4, 0, 7); x.fill(); }
    y.fillStyle = '#a0a0a0'; y.fillRect(i * p + 5, j * p + 5, p - 10, p - 10);
  }
  return { map: tex(c, { repeat, srgb: true }), normal: tex(A.h2n(h, 2), { repeat }) };
};
T.poolTiles = (repeat = [8, 8]) => {
  const S = 1024, c = cv(S), x = c.getContext('2d'), R = rnd(5), n = 16, p = S / n;
  x.fillStyle = '#d8eef0'; x.fillRect(0, 0, S, S);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const v = R(); x.fillStyle = v < .5 ? '#3fb5c9' : v < .8 ? '#5fc6d6' : '#2aa0b8'; x.fillRect(i * p + 2, j * p + 2, p - 4, p - 4); }
  return { map: tex(c, { repeat, srgb: true }) };
};
T.deck = (repeat = [1, 1], tone = '#8a5a3a') => {
  const W = 2048, H = 2048, c = cv(W, H), x = c.getContext('2d'), h = cv(W, H), y = h.getContext('2d'), R = rnd(33), rows = 10, ph = H / rows;
  y.fillStyle = '#909090'; y.fillRect(0, 0, W, H);
  for (let r = 0; r < rows; r++) {
    const t = .78 + R() * .35, base = col(tone).multiplyScalar(t); x.fillStyle = '#' + base.getHexString(); x.fillRect(0, r * ph, W, ph);
    for (let k = 0; k < 40; k++) { const yy = r * ph + R() * ph; x.strokeStyle = `rgba(${R() < .5 ? '50,30,18' : '200,150,110'},${.06 + R() * .16})`; x.lineWidth = .8 + R() * 3; x.beginPath(); for (let s = 0; s <= W; s += 24) { const d = yy + Math.sin(s * .006 + k) * 3; s ? x.lineTo(s, d) : x.moveTo(s, d); } x.stroke(); }
    x.fillStyle = 'rgba(20,12,8,.85)'; x.fillRect(0, r * ph, W, 6); y.fillStyle = '#202020'; y.fillRect(0, r * ph, W, 8);
    for (let s = 0; s < 3; s++) { const px = R() * W; x.fillStyle = 'rgba(20,12,8,.7)'; x.fillRect(px, r * ph, 4, ph); y.fillStyle = '#303030'; y.fillRect(px, r * ph, 5, ph); x.fillStyle = 'rgba(160,160,165,.9)'; x.beginPath(); x.arc(px + 22, r * ph + ph * .3, 5, 0, 7); x.arc(px + 22, r * ph + ph * .7, 5, 0, 7); x.fill(); }
  }
  return { map: tex(c, { repeat, srgb: true }), normal: tex(A.h2n(h, 1.6), { repeat }) };
};
T.concrete = (repeat = [4, 4]) => {
  const S = 1024, c = cv(S), x = c.getContext('2d'), h = cv(S), y = h.getContext('2d'), R = rnd(8);
  x.fillStyle = '#9a9894'; x.fillRect(0, 0, S, S); y.fillStyle = '#808080'; y.fillRect(0, 0, S, S);
  for (let i = 0; i < 400; i++) { const g = x.createRadialGradient(R() * S, R() * S, 0, R() * S, R() * S, 40 + R() * 160); g.addColorStop(0, `rgba(${R() < .5 ? '70,68,64' : '200,198,192'},.08)`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S); }
  noiseLayer(x, S, S, R, 60000, ['#5a5852', '#c8c6c0'], .3, 2); noiseLayer(y, S, S, R, 40000, ['#ffffff', '#000000'], .3, 2);
  return { map: tex(c, { repeat, srgb: true }), normal: tex(A.h2n(h, 1.8), { repeat }) };
};
T.fabric = (color = '#d8cfc0', repeat = [6, 6]) => A.linen(color);

/* ---------------- Đạo cụ ---------------- */
const P = {};
P.vase = (color = '#efe9df', h = 2.6, r = 1.0) => {
  const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push(new A.V2(r * (.55 + .5 * Math.sin(t * Math.PI * .95 + .2) - .18 * t) + (t > .92 ? -.1 : 0), t * h)); }
  pts.push(new A.V2(r * .32, h), new A.V2(r * .3, h - .1)); return mesh(new A.Lathe(pts, 96), phys({ color, roughness: .18, clearcoat: 1, clearcoatRoughness: .08, sheen: .2 }));
};
P.books = (list) => { const g = new A.Group(); let y = 0; list.forEach(([w, t, d, c], i) => { const b = new A.Group(); b.add(mesh(A.rbox(w, t, d, .03), phys({ color: c, roughness: .7, sheen: .4, sheenColor: col('#ffffff') }))); b.add(mesh(new A.Box(w - .12, t - .06, d - .04), phys({ color: '#f1ebdf', roughness: .9 }), [.07, 0, 0])); b.position.y = y + t / 2; b.rotation.y = (i % 2 ? 1 : -1) * .06 * i; g.add(b); y += t; }); return g; };
P.cup = () => { const g = new A.Group(); const pts = [[0, 0], [.42, 0], [.46, .05], [.5, .8], [.47, .82], [.43, .1], [0, .1]].map(([a, b]) => new A.V2(a, b)); g.add(mesh(new A.Lathe(pts, 64), phys({ color: '#f4f0e8', roughness: .15, clearcoat: 1 }))); g.add(mesh(new A.Circle(.43, 48), phys({ color: '#3b2213', roughness: .05, clearcoat: 1 }), [0, .62, 0], [-Math.PI / 2, 0, 0])); const hd = mesh(new A.Torus(.18, .045, 16, 40, Math.PI * 1.2), phys({ color: '#f4f0e8', roughness: .15, clearcoat: 1 }), [.5, .45, 0], [0, 0, -Math.PI * .6]); g.add(hd); return g; };
P.glasses = () => { const g = new A.Group(), fr = phys({ color: '#1b1410', roughness: .25, clearcoat: 1 }), gl = phys({ color: '#6a5a4a', roughness: .02, transmission: .92, thickness: .02, ior: 1.5, transparent: true }); [-.38, .38].forEach(x => { g.add(mesh(new A.Torus(.27, .035, 12, 48), fr, [x, 0, 0])); g.add(mesh(new A.Circle(.26, 40), gl, [x, 0, 0])); }); g.add(mesh(new A.Torus(.1, .025, 8, 20, Math.PI), fr, [0, .06, 0])); [-1, 1].forEach(s => g.add(mesh(new A.Box(.04, .04, 1.3), fr, [s * .64, .05, -.62]))); return g; };
P.plant = (seed = 5, h = 6) => { // cây lá bàng Singapore: thân + lá hình bầu dục cong
  const g = new A.Group(), R = rnd(seed), leaf = phys({ color: '#3e6b34', roughness: .45, clearcoat: .5, clearcoatRoughness: .3, sheen: .3, side: A.Double });
  const lg = (() => { const s = new A.Shape(); s.moveTo(0, 0); s.bezierCurveTo(.45, .2, .55, .9, 0, 1.4); s.bezierCurveTo(-.55, .9, -.45, .2, 0, 0); const geo = new A.Extrude(s, { depth: .01, bevelEnabled: false, curveSegments: 16 }); return geo; })();
  g.add(mesh(new A.Cyl(.06, .09, h * .8, 8), phys({ color: '#5a4630', roughness: .8 }), [0, h * .4, 0]));
  for (let i = 0; i < 34; i++) { const y = h * (.3 + .7 * R()), a = R() * 6.28, l = mesh(lg, leaf, [Math.cos(a) * .1, y, Math.sin(a) * .1], [-.3 - R() * .9, a, (R() - .5) * .4], .8 + R() * .9); g.add(l); }
  const pot = mesh(new A.Cyl(1.1, .85, 1.8, 48), phys({ color: '#e8e2d8', roughness: .55 }), [0, .9, 0]); g.add(pot); return g;
};
P.stringLights = (from, to, n = 24, sag = 1.2) => { const g = new A.Group(); const bulb = new A.Basic({ color: col('#ffcf8a').multiplyScalar(9) }); const wire = new A.Basic({ color: '#1a1a1a' }); for (let i = 0; i < n; i++) { const t = i / (n - 1), p = from.clone().lerp(to, t); p.y -= Math.sin(t * Math.PI) * sag; g.add(mesh(new A.Sphere(.09, 12, 8), bulb, [p.x, p.y, p.z])); } return g; };

/* ---------------- Hậu kỳ ---------------- */
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const AO_FS = `uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 res; uniform float near; uniform float far; uniform float focal; uniform float aoR; uniform float aoK; varying vec2 vUv;
float lin(float d){ return near*far/(far - d*(far-near)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
void main(){ vec3 c = texture2D(tColor, vUv).rgb; float z = lin(texture2D(tDepth, vUv).r); float rpx = aoR*focal/z; float occ = 0.0; float h = hash(vUv*res)*6.2831;
 for(int i=0;i<24;i++){ float fi=float(i); float r = rpx*sqrt((fi+0.5)/24.0); float a = fi*2.39996+h; vec2 o = vec2(cos(a),sin(a))*r/res; float zs = lin(texture2D(tDepth, vUv+o).r); float dz = z - zs; occ += clamp(dz/aoR, 0.0, 1.0) * (1.0 - smoothstep(aoR*1.5, aoR*4.0, dz)); }
 occ /= 24.0; gl_FragColor = vec4(c*(1.0 - aoK*occ), 1.0); }`;
const DOF_FS = `uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 res; uniform float near; uniform float far; uniform float focus; uniform float aper; uniform float maxC;
uniform float expo; uniform vec3 wb; uniform float contrast; uniform float sat; uniform float vig; uniform float grain; uniform float bloom; uniform vec3 lift; varying vec2 vUv;
float lin(float d){ return near*far/(far - d*(far-near)); }
float coc(float z){ return clamp(aper*abs(1.0 - focus/z), 0.0, maxC); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){ float zc = lin(texture2D(tDepth, vUv).r); float cc = coc(zc); vec3 acc = texture2D(tColor, vUv).rgb; float ws = 1.0; vec3 glow = vec3(0.0);
 float h = hash(vUv*res)*6.2831;
 for(int i=0;i<128;i++){ float fi=float(i); float r = maxC*sqrt((fi+0.5)/128.0); float a = fi*2.39996+h; vec2 o = vec2(cos(a),sin(a))*r/res; vec2 uv = vUv+o;
   float zs = lin(texture2D(tDepth, uv).r); float cs = coc(zs); if (zs > zc) cs = min(cs, cc*1.2 + 0.5); float w = smoothstep(r-1.5, r+0.5, cs);
   vec3 s = texture2D(tColor, uv).rgb; acc += s*w; ws += w; glow += max(s - 3.0, 0.0) * w; }
 vec3 c = acc/ws; c += glow/ws*bloom*0.25; c *= expo*wb; c = aces(c);
 float l = dot(c, vec3(0.2126,0.7152,0.0722)); c = mix(vec3(l), c, sat); c = clamp((c-0.5)*contrast+0.5, 0.0, 1.0); c = c + lift*(1.0-c);
 vec2 d = vUv-0.5; d.x *= res.x/res.y; c *= 1.0 - vig*smoothstep(0.35, 1.05, length(d));
 c = pow(c, vec3(1.0/2.2)); c += (hash(vUv*res+7.0)-0.5)*grain; gl_FragColor = vec4(c, 1.0); }`;
function quad(R, fs, uniforms, target) {
  const sc = new A.Scene(), cam = new A.Ortho(-1, 1, 1, -1, 0, 1);
  const m = new A.Shader({ vertexShader: VS, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false }); m.toneMapped = false;
  sc.add(new A.Mesh(new A.Plane(2, 2), m)); R.setRenderTarget(target); R.render(sc, cam);
}
async function renderShot(name, W, H, ss) {
  const def = SHOTS[name]; if (!def) throw new Error('no shot ' + name);
  const w = W * ss, h = H * ss, canvas = document.createElement('canvas'); document.body.appendChild(canvas);
  const R = new A.Renderer({ canvas, antialias: false, preserveDrawingBuffer: true, alpha: false, powerPreference: 'high-performance' });
  R.setPixelRatio(1); R.setSize(w, h, false); R.shadowMap.enabled = true; R.shadowMap.type = 1; R.toneMapping = 0; R.outputColorSpace = A.LinearCS;
  const S = await def(R, w / h);
  const cam = S.camera; cam.aspect = w / h; cam.updateProjectionMatrix();
  const rt = new A.RT(w, h, { type: A.Half, depthTexture: new A.DepthTex(w, h) });
  R.setRenderTarget(rt); R.render(S.scene, cam);
  const rt2 = new A.RT(w, h, { type: A.Half });
  const focal = h / (2 * Math.tan(cam.fov * Math.PI / 360));
  const base = { tDepth: { value: rt.depthTexture }, res: { value: new A.V2(w, h) }, near: { value: cam.near }, far: { value: cam.far } };
  quad(R, AO_FS, { ...base, tColor: { value: rt.texture }, focal: { value: focal }, aoR: { value: S.aoR ?? .25 }, aoK: { value: S.aoK ?? .55 } }, rt2);
  const g = S.grade || {};
  quad(R, DOF_FS, { ...base, tColor: { value: rt2.texture }, focus: { value: S.focus }, aper: { value: (S.aper ?? 18) * ss }, maxC: { value: (S.maxC ?? 26) * ss },
    expo: { value: (g.expo ?? 1) * 1.45 }, wb: { value: new A.V3(...(g.wb || [1, 1, 1])) }, contrast: { value: g.contrast ?? 1.06 }, sat: { value: g.sat ?? 1.04 }, vig: { value: g.vig ?? .32 }, grain: { value: g.grain ?? .018 }, bloom: { value: g.bloom ?? 1.2 }, lift: { value: new A.V3(...(g.lift || [0, 0, 0])) } }, null);
  return canvas.toDataURL('image/png');
}
// Đặt mẫu loa: đáy chạm mặt phẳng y, xoay ry
function placeModel(sc, model, opts, { x = 0, y = 0, z = 0, ry = 0, scale = 1 } = {}) {
  const o = A.buildModel(model, opts); o.scale.setScalar(scale); o.rotation.y = ry; o.updateMatrixWorld(true);
  const b = new A.Box3().setFromObject(o); o.position.set(x - (b.min.x + b.max.x) / 2 + 0, y - b.min.y, z - (b.min.z + b.max.z) / 2);
  o.traverse(m => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } }); sc.add(o); return o;
}

/* ---------------- Nước thật: khúc xạ (transmission) + sóng lăn tăn ---------------- */
T.waves = (repeat = [6, 6], strength = 2.4, seed = 2) => {
  const S = 1024, c = cv(S), x = c.getContext('2d'), R = rnd(seed), img = x.createImageData(S, S), ws = [];
  for (let i = 0; i < 26; i++) { const a = R() * 6.28, f = (2 + Math.floor(R() * 14)) * 2 * Math.PI / S; ws.push([Math.cos(a) * f, Math.sin(a) * f, R() * 6.28, 1 / (1 + f * 120)]); }
  // làm tròn tần số theo lưới để lặp liền mạch
  ws.forEach(w => { const k = Math.round(w[0] * S / (2 * Math.PI)), l = Math.round(w[1] * S / (2 * Math.PI)); w[0] = k * 2 * Math.PI / S; w[1] = l * 2 * Math.PI / S; });
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { let v = 0; for (const [kx, ky, ph, am] of ws) v += Math.sin(i * kx + j * ky + ph) * am; const p = (j * S + i) * 4, g = 128 + v * 60; img.data[p] = img.data[p + 1] = img.data[p + 2] = g; img.data[p + 3] = 255; }
  x.putImageData(img, 0, 0); return tex(A.h2n(c, strength), { repeat });
};
function waterMat({ att = '#1fa5b8', dist = 4, repeat = [8, 8], ns = .45, rough = .04 } = {}) {
  return phys({ color: '#ffffff', roughness: rough, metalness: 0, transmission: 1, thickness: 3, ior: 1.333, attenuationColor: col(att), attenuationDistance: dist,
    normalMap: T.waves(repeat), normalScale: new A.V2(ns, ns), specularIntensity: 1, envMapIntensity: 1.1, side: A.Double });
}
T.foam = () => { const W = 2048, H = 256, c = cv(W, H), x = c.getContext('2d'), R = rnd(14); x.clearRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { const px = R() * W, py = H * .5 + (R() - .5) * H * (.2 + .8 * R()) * Math.sin(px * .01) ; x.fillStyle = `rgba(255,255,255,${.1 + R() * .5})`; x.beginPath(); x.ellipse(px, py, 2 + R() * 10, 1 + R() * 4, 0, 0, 7); x.fill(); }
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.25, 'rgba(0,0,0,0)'); g.addColorStop(.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = g; x.fillRect(0, 0, W, H);
  return tex(c, { repeat: [4, 1] }); };
// Mặt đất lượn sóng (cát): lưới dày + dịch đỉnh
function terrain(w, d, seg, hfn, mat) { const g = new A.Plane(w, d, seg, seg); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, hfn(p.getX(i), p.getZ(i))); g.computeVertexNormals(); const m = new A.Mesh(g, mat); m.receiveShadow = true; m.castShadow = true; return m; }
// Micro cầm tay
P.mic = () => { const g = new A.Group(); const body = phys({ color: '#18191c', metalness: .6, roughness: .3, clearcoat: .6 }), grille = phys({ color: '#b8bcc2', metalness: 1, roughness: .35, normalMap: T.waves([6, 6], 4, 9), normalScale: new A.V2(.6, .6) });
  g.add(mesh(new A.Cyl(.2, .14, 1.9, 32), body, [0, .95, 0])); g.add(mesh(new A.Cyl(.24, .2, .22, 32), phys({ color: '#c9b48a', metalness: 1, roughness: .25 }), [0, 1.95, 0])); g.add(mesh(new A.Sphere(.3, 32, 20), grille, [0, 2.25, 0])); return g; };
P.towel = (color = '#f1ece2', stripe = '#2f5d86') => { const c = cv(512), x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, 512, 512); x.fillStyle = stripe; for (let i = 0; i < 6; i++) x.fillRect(0, 40 + i * 80, 512, 22);
  const g = new A.Plane(7, 4.6, 60, 40); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const X = p.getX(i), Z = p.getZ(i); p.setY(i, .04 + Math.sin(X * 1.3) * .05 + Math.sin(Z * 2.1 + X) * .04); } g.computeVertexNormals();
  return mesh(g, phys({ map: tex(c, { srgb: true }), roughness: .95, sheen: 1, sheenColor: col('#ffffff'), sheenRoughness: .8, normalMap: A.linen('#fff').normalMap, normalScale: new A.V2(1.2, 1.2) })); };
