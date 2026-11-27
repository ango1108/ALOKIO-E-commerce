// Các bối cảnh thật cho từng mẫu loa. 1 đơn vị = 10 cm.
const SHOTS = {};
function cam(fov, pos, look) { const c = new A.Cam(fov, 16 / 9, .05, 4000); c.position.set(...pos); c.lookAt(...look); c.userData.look = V(...look); return c; }
const dist = (c, p) => c.position.distanceTo(V(...p));

/* ============ 1. Bàn gỗ óc chó cạnh cửa sổ (nắng chiều) ============ */
function deskRoom(R, { wall = '#e6ddcf', sunCol = '#ffdcae', sunI = 3.4, evening = false, props = true } = {}) {
  const sc = new A.Scene();
  // môi trường phản chiếu: căn phòng có cửa sổ lớn bên trái
  const env = new A.Scene();
  env.add(new A.Mesh(new A.Box(80, 40, 80), new A.Basic({ color: col(wall).multiplyScalar(evening ? .18 : .42), side: A.Back })));
  const win = new A.Mesh(new A.Plane(26, 18), new A.Basic({ color: col(evening ? '#ffcf9a' : '#fff4e2').multiplyScalar(evening ? 3 : 7), side: A.Double })); win.position.set(-39, 6, 0); win.rotation.y = Math.PI / 2; env.add(win);
  const mul = new A.Basic({ color: '#2a2622', side: A.Double }); [-4.4, 4.4].forEach(z => { const m = new A.Mesh(new A.Plane(.8, 18), mul); m.position.set(-38.8, 6, z); m.rotation.y = Math.PI / 2; env.add(m); }); { const m = new A.Mesh(new A.Plane(26, .8), mul); m.position.set(-38.8, 9, 0); m.rotation.y = Math.PI / 2; env.add(m); }
  const win2 = new A.Mesh(new A.Plane(14, 10), new A.Basic({ color: col('#eef4ff').multiplyScalar(evening ? .5 : 2.2), side: A.Double })); win2.position.set(0, 8, 39); env.add(win2);
  [[20, -2, -39, '#8a6a50'], [-12, 2, -39, '#d8cbb8'], [39, 0, 10, '#2f3b4a']].forEach(([x, y, z, c]) => { const m = new A.Mesh(new A.Plane(14, 10), new A.Basic({ color: col(c).multiplyScalar(.6), side: A.Double })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); });
  const lamp = new A.Mesh(new A.Sphere(2, 16, 8), new A.Basic({ color: col('#ffd9a8').multiplyScalar(evening ? 12 : 4) })); lamp.position.set(18, 10, -20); env.add(lamp);
  const ceil = new A.Mesh(new A.Plane(30, 30), new A.Basic({ color: col('#fff8ee').multiplyScalar(evening ? .4 : 1.2), side: A.Double })); ceil.position.y = 19.5; ceil.rotation.x = Math.PI / 2; env.add(ceil);
  const fl = new A.Mesh(new A.Plane(80, 80), new A.Basic({ color: col('#5a3e2a').multiplyScalar(.6), side: A.Double })); fl.position.y = -6; fl.rotation.x = -Math.PI / 2; env.add(fl);
  sc.environment = envFromScene(R, env, .03); sc.environmentIntensity = evening ? .6 : 1;
  sc.background = col(wall).multiplyScalar(.5);
  // mặt bàn gỗ óc chó nguyên tấm
  const wd = T.walnutSlab([1, 1], .82);
  const top = phys({ map: wd.map, normalMap: wd.normal, normalScale: new A.V2(.35, .35), roughnessMap: wd.rough, roughness: .9, clearcoat: .55, clearcoatRoughness: .22, envMapIntensity: .9 });
  sc.add(mesh(A.rbox(46, .6, 16, .12), top, [0, -.3, -2]));
  // tường + cửa sổ (bóng khung cửa đổ lên tường) + kệ
  const pl = T.plaster(wall, [5, 3]);
  sc.add(mesh(new A.Plane(120, 50), phys({ map: pl.map, normalMap: pl.normal, normalScale: new A.V2(.4, .4), roughness: .95 }), [0, 14, -12]));
  sc.add(mesh(new A.Plane(120, 60), phys({ color: '#4a3424', roughness: .7 }), [0, -9, -2], [-Math.PI / 2, 0, 0]));
  // khung cửa sổ nằm ngoài khung hình, đổ bóng song cửa
  const fr = new A.Group(), frm = new A.Basic({ color: '#222' }); [-1, 0, 1].forEach(k => fr.add(mesh(new A.Box(.5, 30, .5), frm, [0, 0, k * 9]))); [-1, 1].forEach(k => fr.add(mesh(new A.Box(.5, .5, 30), frm, [0, k * 7, 0]))); fr.position.set(-26, 14, 2); fr.rotation.z = -.25; fr.traverse(m => { m.castShadow = true; m.receiveShadow = false; }); sc.add(fr);
  const sun = sunLight(V(-1, .62, .55), sunCol, sunI, { size: 30, radius: 5, dist: 80, target: [0, 0, -4] }); sc.add(sun, sun.target);
  sc.add(new A.Hemi('#f3ece2', '#5b4331', .25));
  if (props) {
    const art = mesh(new A.Box(9, 12, .4), phys({ color: '#f4efe6', roughness: .8 }), [13, 6, -11.2], [0, 0, .04]); sc.add(art);
    const pc = cv(512, 680), px = pc.getContext('2d'); const gr = px.createLinearGradient(0, 0, 0, 680); gr.addColorStop(0, '#d9cdb8'); gr.addColorStop(1, '#b9a68a'); px.fillStyle = gr; px.fillRect(0, 0, 512, 680);
    px.fillStyle = 'rgba(40,52,70,.85)'; px.beginPath(); px.arc(250, 300, 120, 0, 7); px.fill(); px.fillStyle = 'rgba(200,120,70,.7)'; px.fillRect(150, 430, 220, 26);
    sc.add(mesh(new A.Plane(7, 9.6), phys({ map: tex(pc, { srgb: true }), roughness: .9 }), [13.05, 6.2, -10.99], [0, 0, .04]));
    const plant = P.plant(7, 9); plant.position.set(-14, 0, -8.5); sc.add(plant);
  }
  return sc;
}
SHOTS['feat-lacquer'] = async (R) => {
  const sc = deskRoom(R, { props: true });
  placeModel(sc, { type: 'halong' }, { finish: 'huyen', knob: 'champagne', strap: 'kem' }, { x: 0, y: 0, z: 0, ry: -.42 });
  const g = P.glasses(); g.position.set(-3.4, .32, 2.2); g.rotation.set(-.08, .7, 0); sc.add(g);
  const camera = cam(24, [2.2, 3.0, 3.1], [-.05, 1.0, -.15]);
  return { scene: sc, camera, focus: dist(camera, [0, 1.15, 0]), aper: 9, maxC: 22, aoR: .1, aoK: .6, grade: { expo: .78, wb: [1.02, 1, .96], contrast: 1.1, sat: .98, vig: .4 } };
};
SHOTS['blog-material'] = async (R) => {
  const sc = deskRoom(R, { props: true });
  placeModel(sc, { type: 'halong' }, { finish: 'ngoc-trai', knob: 'champagne', strap: 'bo' }, { x: -1.6, z: .6, ry: .35 });
  placeModel(sc, { type: 'hifi', size: 's' }, { finish: 'oc-cho', knob: 'champagne' }, { x: 3.4, z: -2.6, ry: -.3 });
  const bk = P.books([[3.4, .32, 4.6, '#2c3e52'], [3.1, .26, 4.3, '#c9b48a'], [3.3, .3, 4.4, '#7a4a2e']]); bk.position.set(-6.6, 0, -2.4); bk.rotation.y = .3; sc.add(bk);
  const cp = P.cup(); cp.position.set(-5.8, 0, 2.4); sc.add(cp);
  const v = P.vase('#efe9df', 3.2, 1.1); v.position.set(7.8, 0, -4.6); sc.add(v);
  const camera = cam(28, [1.4, 3.4, 8.2], [.7, 1.0, -.8]);
  return { scene: sc, camera, focus: dist(camera, [-1.4, 1, .6]), aper: 14, maxC: 26, grade: { expo: 1.02, wb: [1.03, 1, .96], vig: .3 } };
};

/* ============ 2. Phòng khách (ngày / tối) ============ */
function livingRoom(R, { evening = false } = {}) {
  const sc = new A.Scene();
  const env = new A.Scene();
  env.add(new A.Mesh(new A.Box(90, 40, 90), new A.Basic({ color: col('#ddd3c4').multiplyScalar(evening ? .12 : .8), side: A.Back })));
  const win = new A.Mesh(new A.Plane(30, 22), new A.Basic({ color: col(evening ? '#2c3d5c' : '#fff6e8').multiplyScalar(evening ? .6 : 6.5), side: A.Double })); win.position.set(-44, 8, -6); win.rotation.y = Math.PI / 2; env.add(win);
  [[-20, 14, -30, evening ? 14 : 3], [22, 12, -28, evening ? 10 : 2]].forEach(([x, y, z, k]) => { const l = new A.Mesh(new A.Sphere(1.6, 16, 8), new A.Basic({ color: col('#ffd6a0').multiplyScalar(k) })); l.position.set(x, y, z); env.add(l); });
  { const f = new A.Mesh(new A.Plane(90, 90), new A.Basic({ color: col('#a07a54').multiplyScalar(.45), side: A.Double })); f.position.set(0, -2, 0); f.rotation.x = -Math.PI / 2; env.add(f); }
  sc.environment = envFromScene(R, env, .03); sc.environmentIntensity = evening ? .55 : 1;
  sc.background = col(evening ? '#1b1d22' : '#e8e1d6');
  // sàn gỗ sồi
  const fc = cv(2048), fx = fc.getContext('2d'), fh = cv(2048), fy = fh.getContext('2d'), Rr = rnd(23); fy.fillStyle = '#909090'; fy.fillRect(0, 0, 2048, 2048);
  for (let r = 0; r < 14; r++) { let px = -Rr() * 600; const ph = 2048 / 14; while (px < 2048) { const len = 600 + Rr() * 900, t = .86 + Rr() * .22; fx.fillStyle = '#' + col('#b8946c').multiplyScalar(t).getHexString(); fx.fillRect(px, r * ph, len, ph); for (let k = 0; k < 30; k++) { const yy = r * ph + Rr() * ph; fx.strokeStyle = `rgba(${Rr() < .5 ? '110,78,50' : '226,196,160'},${.05 + Rr() * .14})`; fx.lineWidth = .6 + Rr() * 2; fx.beginPath(); for (let s = 0; s <= len; s += 24) { const d = yy + Math.sin((px + s) * .008 + k) * 2.5; s ? fx.lineTo(px + s, d) : fx.moveTo(px, d); } fx.stroke(); } fx.fillStyle = 'rgba(50,34,20,.6)'; fx.fillRect(px, r * ph, 2, ph); fy.fillStyle = '#404040'; fy.fillRect(px, r * ph, 3, ph); px += len; } fx.fillStyle = 'rgba(50,34,20,.55)'; fx.fillRect(0, r * ph, 2048, 2); fy.fillStyle = '#404040'; fy.fillRect(0, r * ph, 2048, 3); }
  sc.add(mesh(new A.Plane(120, 80), phys({ map: tex(fc, { repeat: [4, 3], srgb: true }), normalMap: tex(A.h2n(fh, 1.5), { repeat: [4, 3] }), roughness: .42, clearcoat: .4, clearcoatRoughness: .25 }), [0, 0, 0], [-Math.PI / 2, 0, 0]));
  const pl = T.plaster('#ece5da', [6, 3]); const wallM = phys({ map: pl.map, normalMap: pl.normal, normalScale: new A.V2(.3, .3), roughness: .95 });
  sc.add(mesh(new A.Plane(120, 40), wallM, [0, 20, -16]));
  // cửa sổ lớn bên trái + rèm voan
  const left = mesh(new A.Plane(80, 40), wallM, [-30, 20, 8], [0, Math.PI / 2, 0]); sc.add(left);
  const glow = new A.Mesh(new A.Plane(16, 22), new A.Basic({ color: col(evening ? '#203048' : '#fffaf0').multiplyScalar(evening ? .5 : 3.5) })); glow.position.set(-29.9, 13, -2); glow.rotation.y = Math.PI / 2; sc.add(glow);
  const voile = phys({ color: '#fbf8f2', roughness: .9, transmission: .55, thickness: .1, transparent: true, opacity: .9, sheen: 1, sheenColor: col('#ffffff'), side: A.Double });
  const vg = new A.Plane(9, 28, 120, 4); const vp = vg.attributes.position; for (let i = 0; i < vp.count; i++) vp.setZ(i, Math.sin(vp.getX(i) * 4.5) * .25); vg.computeVertexNormals();
  [-7.5, 4].forEach(z => sc.add(mesh(vg, voile, [-29.2, 14, z], [0, Math.PI / 2, 0])));
  // ánh nắng chéo qua cửa sổ
  if (!evening) { const sun = sunLight(V(-1, .75, .35), '#ffe3bf', 3.2, { size: 34, radius: 6, dist: 90, target: [0, 0, -6] }); sc.add(sun, sun.target); }
  sc.add(new A.Hemi(evening ? '#3a4458' : '#f4eee6', evening ? '#20160e' : '#8a7058', evening ? .3 : .8));
  // tủ thấp gỗ óc chó
  const wd = T.walnutSlab([1, 1]), woodM = phys({ color: '#e6ddd4', map: wd.map, normalMap: wd.normal, normalScale: new A.V2(.3, .3), roughnessMap: wd.rough, roughness: .8, clearcoat: .5, clearcoatRoughness: .25 });
  const brass = phys({ color: '#c6a35e', metalness: 1, roughness: .28 });
  sc.add(mesh(A.rbox(26, 5.2, 4.8, .12), woodM, [0, 3.6, -13.2]));
  [-1, 1].forEach(a => [-1, 1].forEach(b => sc.add(mesh(new A.Cyl(.18, .12, 1, 12), brass, [a * 12, .5, -13.2 + b * 2]))));
  for (let i = 1; i < 4; i++) sc.add(mesh(new A.Box(.06, 4.6, .05), phys({ color: '#1a120c', roughness: .6 }), [-13 + i * 6.5, 3.6, -10.78]));
  [-9.75, -3.25, 3.25, 9.75].forEach(x => sc.add(mesh(A.rbox(1.6, .14, .14, .06), brass, [x, 4.9, -10.7])));
  // sofa vải lanh (phía trước, ngoài khung, chỉ thấy mép mờ) + thảm
  sc.add(mesh(A.rbox(30, .12, 18, .06), A.linen('#d9d0c2'), [2, .06, -2]));
  const plant = P.plant(11, 13); plant.position.set(19.5, 0, -12.5); plant.scale.setScalar(1.2); sc.add(plant);
  const lampG = new A.Group(); lampG.add(mesh(new A.Cyl(1.3, 1.4, .25, 48), brass, [0, .12, 0])); lampG.add(mesh(new A.Cyl(.12, .12, 15, 16), brass, [0, 7.5, 0])); const shade = mesh(new A.Cyl(1.9, 2.6, 3, 48, 1, true), phys({ color: '#f3ead8', roughness: .9, transmission: .4, thickness: .2, side: A.Double, emissive: col('#ffcf8f'), emissiveIntensity: evening ? 2.2 : .1 }), [0, 15.5, 0]); lampG.add(shade);
  if (evening) { const pl2 = new A.Point('#ffcf8f', 900, 80, 2); pl2.position.set(0, 15, 0); pl2.castShadow = true; pl2.shadow.mapSize.set(2048, 2048); pl2.shadow.radius = 8; lampG.add(pl2); }
  lampG.position.set(-19, 0, -12); sc.add(lampG);
  // tranh
  const art = cv(1024, 700), ax = art.getContext('2d'); const ag = ax.createLinearGradient(0, 0, 0, 700); ag.addColorStop(0, '#9dbbd6'); ag.addColorStop(.55, '#efe1c8'); ag.addColorStop(.56, '#5e8fb3'); ag.addColorStop(1, '#2c587e'); ax.fillStyle = ag; ax.fillRect(0, 0, 1024, 700);
  [[200, 380, 160, 230], [430, 385, 120, 170], [680, 385, 220, 280]].forEach(([cx, base, w, h]) => { ax.fillStyle = 'rgba(64,88,104,.8)'; ax.beginPath(); ax.moveTo(cx - w / 2, base); ax.bezierCurveTo(cx - w * .4, base - h * .7, cx - w * .2, base - h, cx, base - h); ax.bezierCurveTo(cx + w * .25, base - h, cx + w * .4, base - h * .6, cx + w / 2, base); ax.fill(); });
  sc.add(mesh(A.rbox(15.2, 10.6, .4, .05), phys({ color: '#c9b48a', metalness: 1, roughness: .35 }), [0, 16.5, -15.7]));
  sc.add(mesh(new A.Plane(14.4, 9.8), phys({ map: tex(art, { srgb: true }), roughness: .85 }), [0, 16.5, -15.48]));
  return { sc, woodTop: 6.2, sbZ: -13.2 };
}
SHOTS['feat-sound'] = async (R) => {
  const { sc, woodTop } = livingRoom(R);
  placeModel(sc, { type: 'hifi', size: 'l' }, { finish: 'oc-cho', knob: 'champagne' }, { x: -7.4, y: woodTop, z: -13.2, ry: .18 });
  placeModel(sc, { type: 'hifi', size: 'l' }, { finish: 'oc-cho', knob: 'champagne' }, { x: 7.4, y: woodTop, z: -13.2, ry: -.18 });
  const v = P.vase('#e9e2d6', 3, 1); v.position.set(0, woodTop, -13.6); sc.add(v);
  const bk = P.books([[3.8, .35, 2.8, '#c9b48a'], [3.4, .3, 2.6, '#2c3e52']]); bk.position.set(2.6, woodTop, -12.6); sc.add(bk);
  const camera = cam(30, [-3, 8.9, 7], [0, 8.7, -13]);
  return { scene: sc, camera, focus: dist(camera, [-7.4, 8, -12.2]), aper: 10, maxC: 22, aoR: .25, grade: { expo: .9, wb: [1.03, 1, .96], vig: .3 } };
};
SHOTS['blog-home'] = async (R) => {
  const { sc, woodTop } = livingRoom(R);
  placeModel(sc, { type: 'hifi', size: 's' }, { finish: 'oc-cho', knob: 'champagne' }, { x: -8.5, y: woodTop, z: -12.9, ry: .25 });
  placeModel(sc, { type: 'hifi', size: 'm' }, { finish: 'ngoc-trai', knob: 'champagne' }, { x: -1.5, y: woodTop, z: -13.1, ry: .05 });
  placeModel(sc, { type: 'hifi', size: 'l' }, { finish: 'huyen', knob: 'champagne' }, { x: 6.8, y: woodTop, z: -13.2, ry: -.2 });
  const v = P.vase('#e9e2d6', 2.6, .9); v.position.set(11.2, woodTop, -13.6); sc.add(v);
  const camera = cam(30, [-5, 8.9, 8], [-.5, 8.6, -12.8]);
  return { scene: sc, camera, focus: dist(camera, [-1.5, 7.5, -12.5]), aper: 8, maxC: 20, aoR: .25, grade: { expo: .9, wb: [1.03, 1, .97], vig: .3 } };
};
SHOTS['blog-bar'] = async (R) => {
  const { sc, woodTop } = livingRoom(R, { evening: true });
  // TV treo tường đang chiếu phim
  const scr = cv(1600, 900), sx = scr.getContext('2d'); const sg = sx.createLinearGradient(0, 0, 0, 900); sg.addColorStop(0, '#0d2a4a'); sg.addColorStop(.55, '#d98b52'); sg.addColorStop(.58, '#2b5e86'); sg.addColorStop(1, '#0b2236'); sx.fillStyle = sg; sx.fillRect(0, 0, 1600, 900);
  const sun = sx.createRadialGradient(1050, 500, 5, 1050, 500, 260); sun.addColorStop(0, 'rgba(255,226,170,1)'); sun.addColorStop(1, 'rgba(255,226,170,0)'); sx.fillStyle = sun; sx.fillRect(0, 0, 1600, 900);
  sx.fillStyle = 'rgba(10,16,24,.9)'; sx.beginPath(); sx.moveTo(0, 520); sx.bezierCurveTo(300, 380, 520, 420, 700, 520); sx.lineTo(0, 520); sx.fill();
  sc.add(mesh(A.rbox(19.4, 11.2, .35, .06), phys({ color: '#0c0d10', metalness: .6, roughness: .3 }), [0, 14.2, -15.6]));
  sc.add(mesh(new A.Plane(19, 10.8), phys({ color: '#000', roughness: .1, clearcoat: 1, emissive: col('#ffffff'), emissiveMap: tex(scr, { srgb: true }), emissiveIntensity: 1.4 }), [0, 14.2, -15.42]));
  const tvl = new A.Point('#8fb0d8', 300, 40, 2); tvl.position.set(0, 13, -12); sc.add(tvl);
  placeModel(sc, { type: 'bar' }, { finish: 'huyen', knob: 'champagne' }, { x: 0, y: woodTop, z: -12.6 });
  const camera = cam(34, [7, 7.6, 7], [0, 8.6, -13]);
  return { scene: sc, camera, focus: dist(camera, [0, 6.6, -12.2]), aper: 10, maxC: 22, aoR: .2, grade: { expo: 1.25, wb: [1.05, 1, .93], contrast: 1.1, vig: .45, bloom: 2 } };
};

/* ============ 3. Bãi biển lúc nắng vàng ============ */
function beach(R, { sunAz = 3.44, sunEl = .3, warm = .4 } = {}) {
  const sc = new A.Scene();
  const sunDir = V(Math.cos(sunAz) * Math.cos(sunEl), Math.sin(sunEl), -Math.sin(sunAz) * Math.cos(sunEl));
  const sky = skyTex({ zenith: '#1a5cae', mid: '#4f94d6', horizon: '#b9d3e6', ground: '#c9b393', sunDir, clouds: 30, warm, haze: '255,236,210' });
  const dome = skyDome(sky, { intensity: 1.15, sunDir, sunPower: 60 }); sc.add(dome);
  const env = new A.Scene(); env.add(skyDome(sky, { intensity: 1.15, sunDir, sunPower: 60, radius: 80 }));
  sc.environment = envFromScene(R, env, .02);
  const sun = sunLight(sunDir, '#fff0dc', 3.2, { size: 26, radius: 3, dist: 120 }); sc.add(sun, sun.target);
  sc.add(new A.Hemi('#bcd6f0', '#d6c09a', .25));
  // cát: dốc nhẹ ra biển, gợn sóng gió
  const sd = T.sand([14, 14]);
  const sandM = phys({ map: sd.map, normalMap: sd.normal, normalScale: new A.V2(1, 1), roughness: .95, sheen: .4, sheenColor: col('#fff3dc') });
  sc.add(terrain(220, 220, 220, (x, z) => (z > -30 ? (z + 30) * .012 : (z + 30) * .03) + Math.sin(x * .25 + z * .05) * .05 + Math.sin(x * .07 + z * .13) * .12, sandM));
  // cát ướt sát mép nước (sẫm, bóng)
  const wet = terrain(220, 16, 120, (x, z) => .02 + (z + 30 - -30) * 0, phys({ color: '#8a7458', roughness: .25, clearcoat: .6, normalMap: sd.normal, normalScale: new A.V2(.5, .5), transparent: true, opacity: .55 }));
  wet.position.set(0, -.1, -34); sc.add(wet);
  // biển
  const shallow = new A.Mesh(new A.Plane(400, 60), waterMat({ att: '#2bb2c0', dist: 5, repeat: [40, 6], ns: .5 })); shallow.rotation.x = -Math.PI / 2; shallow.position.set(0, -.25, -60); sc.add(shallow);
  const sea = new A.Mesh(new A.Plane(1600, 900), phys({ color: '#0e5d78', roughness: .07, metalness: 0, normalMap: T.waves([160, 90], 2.4, 4), normalScale: new A.V2(.55, .55), envMapIntensity: 1.2 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -.25, -540); sc.add(sea);
  const foam = new A.Mesh(new A.Plane(220, 3.2), new A.Basic({ color: col('#ffffff').multiplyScalar(1.3), alphaMap: T.foam(), transparent: true, depthWrite: false })); foam.rotation.x = -Math.PI / 2; foam.position.set(0, -.08, -31.5); sc.add(foam);
  return { sc, ground: (x, z) => (z > -30 ? (z + 30) * .012 : (z + 30) * .03) + Math.sin(x * .25 + z * .05) * .05 + Math.sin(x * .07 + z * .13) * .12 };
}
SHOTS['blog-wave'] = async (R) => {
  const { sc, ground } = beach(R);
  const t = P.towel('#f3eee4', '#2f5d86'); t.position.set(-2.5, ground(-2.5, 1), 1); t.rotation.y = .3; sc.add(t);
  const o = placeModel(sc, { type: 'wave' }, { finish: 'ngoc-trai', knob: 'champagne' }, { x: 0, y: ground(0, 0) + .02, z: 0, ry: -.5 }); o.position.y -= .08;
  const g0 = ground(0, 0); const camera = cam(28, [2.6, g0 + 1.6, 4.6], [-.6, g0 + .6, -4]);
  return { scene: sc, camera, focus: dist(camera, [0, g0 + .5, 0]), aper: 12, maxC: 24, aoR: .1, grade: { expo: .4, wb: [1.04, 1, .95], contrast: 1.1, sat: 1.08, vig: .3, bloom: 1.5 } };
};
SHOTS['feat-water'] = async (R) => {
  const { sc, ground } = beach(R, { sunEl: .45 });
  placeModel(sc, { type: 'pebble' }, { finish: 'suong-som', knob: 'champagne' }, { x: 0, y: ground(0, -24), z: -24, ry: -.35 });
  const gw = ground(0, -24); const camera = cam(24, [1.6, gw + 1.0, -19.8], [-.2, gw + .5, -26]);
  return { scene: sc, camera, focus: dist(camera, [0, ground(0, -24) + .6, -24]), aper: 12, maxC: 24, aoR: .08, grade: { expo: .42, wb: [1.03, 1, .96], contrast: 1.1, sat: 1.08, vig: .3, bloom: 1.5 } };
};

/* ============ 4. Hồ bơi đá travertine ============ */
function pool(R, { sunAz = 3.5, sunEl = .75 } = {}) {
  const sc = new A.Scene();
  const sunDir = V(Math.cos(sunAz) * Math.cos(sunEl), Math.sin(sunEl), -Math.sin(sunAz) * Math.cos(sunEl));
  const sky = skyTex({ zenith: '#1f6cc0', mid: '#5aa2dc', horizon: '#c2d9ea', ground: '#d8cdb8', sunDir, clouds: 26, warm: 0, seed: 9 });
  sc.add(skyDome(sky, { sunDir, sunPower: 80 })); const env = new A.Scene(); env.add(skyDome(sky, { sunDir, sunPower: 80, radius: 80 })); sc.environment = envFromScene(R, env, .02);
  const sun = sunLight(sunDir, '#fff4e2', 3.4, { size: 30, radius: 2, dist: 120 }); sc.add(sun, sun.target);
  sc.add(new A.Hemi('#cfe3f5', '#d8ccb6', .3));
  const tl = T.tiles([1, 1], { color: '#e9dfcc', grout: '#cbbfa9', n: 4 }); const deckM = (rx, rz) => { const m = phys({ map: tl.map.clone(), normalMap: tl.normal.clone(), normalScale: new A.V2(.6, .6), roughness: .8 }); m.map.repeat.set(rx, rz); m.normalMap.repeat.set(rx, rz); m.map.needsUpdate = m.normalMap.needsUpdate = true; return m; };
  // sàn đá quanh hồ (hồ: x -30..30, z -60..-2)
  sc.add(mesh(new A.Box(140, 1, 40), deckM(14, 4), [0, -.5, 18]));
  sc.add(mesh(new A.Box(40, 1, 70), deckM(4, 7), [-50, -.5, -31])); sc.add(mesh(new A.Box(40, 1, 70), deckM(4, 7), [50, -.5, -31]));
  sc.add(mesh(new A.Box(140, 1, 30), deckM(14, 3), [0, -.5, -81]));
  // bo viền hồ
  const cop = phys({ color: '#efe6d6', roughness: .55, normalMap: tl.normal, normalScale: new A.V2(.4, .4) });
  sc.add(mesh(A.rbox(62, .5, 2.2, .18), cop, [0, .05, -2.1])); sc.add(mesh(A.rbox(2.2, .5, 60, .18), cop, [-31, .05, -31])); sc.add(mesh(A.rbox(2.2, .5, 60, .18), cop, [31, .05, -31]));
  // lòng hồ gạch mosaic
  const pt = T.poolTiles([1, 1]); const poolM = (rx, rz) => { const m = phys({ map: pt.map.clone(), roughness: .3, clearcoat: .6 }); m.map.repeat.set(rx, rz); m.map.needsUpdate = true; return m; };
  sc.add(mesh(new A.Plane(60, 58), poolM(15, 15), [0, -9, -31], [-Math.PI / 2, 0, 0]));
  sc.add(mesh(new A.Plane(60, 9), poolM(15, 2), [0, -4.5, -59.9])); sc.add(mesh(new A.Plane(60, 9), poolM(15, 2), [0, -4.5, -2.1], [0, Math.PI, 0]));
  sc.add(mesh(new A.Plane(58, 9), poolM(15, 2), [-29.9, -4.5, -31], [0, Math.PI / 2, 0])); sc.add(mesh(new A.Plane(58, 9), poolM(15, 2), [29.9, -4.5, -31], [0, -Math.PI / 2, 0]));
  const water = new A.Mesh(new A.Plane(60, 58), waterMat({ att: '#3cc3d2', dist: 14, repeat: [10, 10], ns: .35, rough: .02 })); water.rotation.x = -Math.PI / 2; water.position.set(0, -.6, -31); sc.add(water);
  // ghế tắm nắng gỗ teak + nệm
  const teak = phys({ color: '#8a5a36', roughness: .55, clearcoat: .2 }), cush = A.linen('#f2eee6');
  const lounger = (x, z, ry) => { const g = new A.Group(); g.add(mesh(A.rbox(7, .4, 20, .12), teak, [0, 3, 0])); g.add(mesh(A.rbox(6.6, .9, 13, .4), cush, [0, 3.6, 3.2])); const back = mesh(A.rbox(6.6, .9, 7, .4), cush, [0, 6, -7.2], [-.75, 0, 0]); g.add(back); [-1, 1].forEach(a => [-1, 1].forEach(b => g.add(mesh(new A.Box(.5, 3, .5), teak, [a * 3, 1.5, b * 9])))); g.position.set(x, 0, z); g.rotation.y = ry; sc.add(g); };
  lounger(-44, -18, .08); lounger(-36, -16, .02);
  const plant = P.plant(19, 16); plant.position.set(45, 0, -66); plant.scale.setScalar(1.6); sc.add(plant);
  return { sc };
}
SHOTS['blog-water'] = async (R) => {
  const { sc } = pool(R);
  placeModel(sc, { type: 'pebble' }, { finish: 'suong-som', knob: 'champagne' }, { x: 1.2, y: .3, z: -2.0, ry: -.5 });
  const t = P.towel('#ffffff', '#3c8fb0'); t.position.set(-5.5, .32, 2.6); t.rotation.y = .2; sc.add(t);
  const g = P.glasses(); g.position.set(3.4, .36, -1.6); g.rotation.set(0, -.5, 0); sc.add(g);
  const camera = cam(28, [4.2, 2.0, 4.6], [-.4, .6, -6]);
  return { scene: sc, camera, focus: dist(camera, [1.2, .9, -2]), aper: 12, maxC: 24, aoR: .1, grade: { expo: .42, wb: [1.02, 1, .98], contrast: 1.08, sat: 1.06, vig: .28, bloom: 1.5 } };
};
/* ============ 5. Sân hiên ban đêm: karaoke ============ */
function patio(R) {
  const sc = new A.Scene(); sc.background = col('#0b1020');
  const env = new A.Scene(); env.add(new A.Mesh(new A.Sphere(200, 32, 16), new A.Basic({ color: col('#101828').multiplyScalar(.6), side: A.Back })));
  for (let i = 0; i < 14; i++) { const l = new A.Mesh(new A.Sphere(1.2, 12, 8), new A.Basic({ color: col('#ffcf8a').multiplyScalar(18) })); l.position.set(-40 + i * 6, 18 + Math.sin(i) * 2, -30); env.add(l); }
  sc.environment = envFromScene(R, env, .04); sc.environmentIntensity = .8;
  const dk = T.deck([3, 3], '#7a4e30'); sc.add(mesh(new A.Plane(140, 90), phys({ map: dk.map, normalMap: dk.normal, roughness: .55, clearcoat: .25 }), [0, 0, -10], [-Math.PI / 2, 0, 0]));
  // tường gạch thẻ phía sau + cây xanh tối
  const bc = cv(1024), bx = bc.getContext('2d'), Rb = rnd(3); bx.fillStyle = '#3a2a22'; bx.fillRect(0, 0, 1024, 1024); for (let r = 0; r < 32; r++) for (let c2 = 0; c2 < 8; c2++) { const t = .7 + Rb() * .5; bx.fillStyle = '#' + col('#8a6a58').multiplyScalar(t).getHexString(); bx.fillRect(c2 * 128 + (r % 2) * 64 + 3, r * 32 + 3, 122, 26); }
  sc.add(mesh(new A.Plane(140, 40), phys({ map: tex(bc, { repeat: [5, 1.6], srgb: true }), roughness: .85 }), [0, 20, -40]));
  [[-26, -36], [-10, -37], [16, -36], [32, -35]].forEach(([x, z], i) => { const p = P.plant(30 + i, 12 + i * 2); p.position.set(x, 0, z); p.scale.setScalar(1.4); sc.add(p); });
  // dây đèn tròn + nguồn sáng ấm
  [[V(-40, 22, -30), V(40, 22, -30)], [V(-40, 20, -20), V(30, 24, -36)], [V(-30, 24, -10), V(40, 21, -26)]].forEach(([a, b]) => sc.add(P.stringLights(a, b, 30, 2.2)));
  [[-18, 18, -24], [6, 19, -26], [24, 18, -22]].forEach(([x, y, z]) => { const l = new A.Point('#ffc47a', 900, 90, 2); l.position.set(x, y, z); sc.add(l); });
  const key = new A.Point('#ffe2bf', 1800, 80, 2); key.position.set(12, 14, 10); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; sc.add(key);
  const rim = new A.Point('#7aa8ff', 700, 60, 2); rim.position.set(-14, 9, -14); sc.add(rim);
  sc.add(new A.Hemi('#3a4868', '#2a1c12', .5));
  return { sc };
}
SHOTS['blog-karaoke'] = async (R) => {
  const { sc } = patio(R);
  placeModel(sc, { type: 'trolley', bass: 5, style: 'ak' }, { finish: 'go-den' }, { x: 0, z: -8, ry: -.32 });
  const m1 = P.mic(); m1.position.set(5.2, 0, -3.5); m1.rotation.set(0, .4, 1.45); m1.position.y = .3; sc.add(m1);
  const m2 = P.mic(); m2.position.set(6.4, .3, -2.4); m2.rotation.set(0, -.6, 1.5); sc.add(m2);
  const camera = cam(34, [9, 6.2, 9], [0, 6.2, -10]);
  return { scene: sc, camera, focus: dist(camera, [0, 7, -6]), aper: 14, maxC: 30, aoR: .2, grade: { expo: 1.15, wb: [1.06, 1, .9], contrast: 1.12, sat: 1.08, vig: .5, bloom: 3 } };
};
SHOTS['blog-knobs'] = async (R) => {
  const { sc } = patio(R);
  placeModel(sc, { type: 'trolley', bass: 5, style: 'ak' }, { finish: 'go-den' }, { x: 0, z: -8, ry: -.2 });
  const camera = cam(28, [3.6, 12.2, -1.5], [-.4, 10.6, -5.6]);
  return { scene: sc, camera, focus: dist(camera, [-.5, 10.7, -5.5]), aper: 9, maxC: 26, aoR: .08, grade: { expo: 1.1, wb: [1.05, 1, .92], contrast: 1.12, vig: .5, bloom: 3 } };
};

/* ============ 6. Góc xưởng: ắc quy, bảo quản ============ */
SHOTS['blog-battery'] = async (R) => {
  const sc = new A.Scene(); sc.background = col('#2a2824');
  const env = new A.Scene(); env.add(new A.Mesh(new A.Box(80, 40, 80), new A.Basic({ color: col('#8a857c').multiplyScalar(.6), side: A.Back })));
  const sk = new A.Mesh(new A.Plane(30, 8), new A.Basic({ color: col('#fff4e6').multiplyScalar(5), side: A.Double })); sk.position.set(0, 19, -10); sk.rotation.x = Math.PI / 2; env.add(sk);
  const door = new A.Mesh(new A.Plane(24, 18), new A.Basic({ color: col('#e8f0ff').multiplyScalar(3), side: A.Double })); door.position.set(39, 6, 0); door.rotation.y = -Math.PI / 2; env.add(door);
  sc.environment = envFromScene(R, env, .03); sc.environmentIntensity = 1.6;
  const cn = T.concrete([5, 4]); sc.add(mesh(new A.Plane(100, 80), phys({ map: cn.map, normalMap: cn.normal, roughness: .7, clearcoat: .2 }), [0, 0, -10], [-Math.PI / 2, 0, 0]));
  const ply = phys({ color: '#cdb89a', roughness: .85, normalMap: T.plaster('#cdb89a').normal }); const wd = T.walnutSlab([2, 1]);
  sc.add(mesh(new A.Plane(100, 40), ply, [0, 20, -22]));
  // bàn thao tác gỗ + dụng cụ
  sc.add(mesh(A.rbox(30, 1, 9, .1), phys({ color: '#a07e5a', roughness: .7, map: wd.map }), [10, 9, -17])); [-1, 1].forEach(a => [-1, 1].forEach(b => sc.add(mesh(new A.Box(.8, 9, .8), phys({ color: '#2a2a2c', metalness: .6, roughness: .5 }), [10 + a * 13.5, 4.5, -17 + b * 3.6]))));
  const sun = sunLight(V(1, .9, .6), '#fff1e0', 2.6, { size: 30, radius: 6, dist: 80 }); sc.add(sun, sun.target);
  sc.add(new A.Hemi('#e8eef6', '#5a5048', .3));
  placeModel(sc, { type: 'trolley', bass: 4, style: 'r95' }, { finish: 'go-den' }, { x: -6, z: -9, ry: .35 });
  placeModel(sc, { type: 'acc', kind: 'battery' }, { finish: 'huyen' }, { x: 2.6, y: 0, z: -4.2, ry: -.5, scale: 2.4 });
  const camera = cam(34, [7.5, 5.5, 5], [-1.8, 4.2, -8]);
  return { scene: sc, camera, focus: dist(camera, [2.6, 1.5, -4.2]), aper: 9, maxC: 22, aoR: .2, grade: { expo: .95, wb: [1.03, 1, .96], contrast: 1.08, vig: .38 } };
};

/* ============ Ảnh minh hoạ trong bài (2 ảnh / bài) ============ */
const G = (o = {}) => ({ expo: 1, wb: [1.03, 1, .96], vig: .32, ...o });
SHOTS['material-1'] = async (R) => { const sc = deskRoom(R); placeModel(sc, { type: 'halong' }, { finish: 'ngoc-trai', knob: 'champagne', strap: 'bo' }, { ry: .15 });
  const camera = cam(24, [1.3, 1.25, 4.2], [-.1, .55, 0]); return { scene: sc, camera, focus: dist(camera, [.2, .6, .5]), aper: 10, maxC: 24, aoR: .1, grade: G({ expo: .85 }) }; };
SHOTS['material-2'] = async (R) => { const sc = deskRoom(R); placeModel(sc, { type: 'hifi', size: 's' }, { finish: 'oc-cho', knob: 'champagne' }, { ry: -.35 });
  const camera = cam(24, [2.2, 3.2, 3.6], [0, 1.7, -.2]); return { scene: sc, camera, focus: dist(camera, [0, 1.95, 0]), aper: 10, maxC: 24, aoR: .1, grade: G({ expo: .85 }) }; };
SHOTS['home-1'] = async (R) => { const { sc, woodTop } = livingRoom(R); placeModel(sc, { type: 'hifi', size: 's' }, { finish: 'oc-cho', knob: 'champagne' }, { x: -2, y: woodTop, z: -13, ry: .3 }); const v = P.vase('#e9e2d6', 2.6, .9); v.position.set(2.2, woodTop, -13.6); sc.add(v);
  const camera = cam(30, [-4.5, 7.6, -4], [-1.5, 7.4, -13]); return { scene: sc, camera, focus: dist(camera, [-2, 7.4, -12.6]), aper: 12, maxC: 24, aoR: .2, grade: G({ expo: .9 }) }; };
SHOTS['home-2'] = async (R) => { const { sc, woodTop } = livingRoom(R); placeModel(sc, { type: 'hifi', size: 'l' }, { finish: 'huyen', knob: 'champagne' }, { x: -10, y: woodTop, z: -13.2, ry: .35 });
  const camera = cam(30, [-1, 7.4, 2], [-11, 8, -13]); return { scene: sc, camera, focus: dist(camera, [-10, 7.8, -12.4]), aper: 10, maxC: 22, aoR: .2, grade: G({ expo: .9 }) }; };
SHOTS['wave-1'] = async (R) => { const { sc, ground } = beach(R); const t = P.towel('#f3eee4', '#2f5d86'); t.position.set(0, ground(0, 0), 0); t.rotation.y = .2; sc.add(t);
  placeModel(sc, { type: 'wave' }, { finish: 'suong-som', knob: 'champagne' }, { x: .3, y: ground(0, 0) + .12, z: 0, ry: -.7 });
  const g0 = ground(0, 0); const camera = cam(26, [2.4, g0 + 1.3, 2.6], [.1, g0 + .4, -.4]); return { scene: sc, camera, focus: dist(camera, [.3, g0 + .5, 0]), aper: 10, maxC: 24, aoR: .1, grade: G({ expo: .4, contrast: 1.1, sat: 1.08 }) }; };
SHOTS['wave-2'] = async (R) => { const { sc, ground } = beach(R, { sunEl: .22 }); placeModel(sc, { type: 'halong' }, { finish: 'suong-som', knob: 'champagne', strap: 'kem' }, { x: 0, y: ground(0, -8) - .05, z: -8, ry: -.5 });
  const g8 = ground(0, -8); const camera = cam(26, [2.6, g8 + 1.2, -3.2], [-.3, g8 + .6, -10]); return { scene: sc, camera, focus: dist(camera, [0, ground(0, -8) + .6, -8]), aper: 10, maxC: 24, aoR: .1, grade: G({ expo: .4, contrast: 1.1, sat: 1.08 }) }; };
SHOTS['water-1'] = async (R) => { const { sc, ground } = beach(R, { sunEl: .38 }); placeModel(sc, { type: 'pebble' }, { finish: 'huyen', knob: 'champagne' }, { x: .2, y: ground(0, -27), z: -27, ry: .4 });
  const g7 = ground(0, -27); const camera = cam(24, [-1.6, g7 + .9, -23], [.4, g7 + .5, -29]); return { scene: sc, camera, focus: dist(camera, [.2, ground(0, -27) + .6, -27]), aper: 12, maxC: 24, aoR: .08, grade: G({ expo: .42, contrast: 1.1, sat: 1.08 }) }; };
SHOTS['water-2'] = async (R) => { const { sc } = pool(R); placeModel(sc, { type: 'halong' }, { finish: 'ngoc-trai', knob: 'champagne', strap: 'kem' }, { x: -1, y: .3, z: -2.0, ry: .35 });
  const camera = cam(28, [-4.6, 2.4, 4], [.6, .6, -6]); return { scene: sc, camera, focus: dist(camera, [-1, 1, -2]), aper: 12, maxC: 24, aoR: .1, grade: G({ expo: .42, contrast: 1.08, sat: 1.06 }) }; };
SHOTS['bar-1'] = async (R) => { const S = await SHOTS['blog-bar'](R); S.camera = cam(28, [3.2, 7.2, -6.5], [0, 6.5, -12.6]); S.focus = dist(S.camera, [0, 6.6, -12.2]); return S; };
SHOTS['bar-2'] = async (R) => { const S = await SHOTS['blog-bar'](R); S.camera = cam(38, [-9, 9, 12], [0, 10, -13]); S.focus = dist(S.camera, [0, 8, -12.2]); S.aper = 6; return S; };
SHOTS['karaoke-1'] = async (R) => { const S = await SHOTS['blog-karaoke'](R); S.camera = cam(32, [-12, 7.5, 17], [0, 5.5, -8]); S.focus = dist(S.camera, [0, 7, -6]); return S; };
SHOTS['karaoke-2'] = async (R) => { const { sc } = patio(R); const m1 = P.mic(); m1.position.set(0, .3, 0); m1.rotation.set(0, .4, 1.5); sc.add(m1); const m2 = P.mic(); m2.position.set(.9, .3, .9); m2.rotation.set(0, -.3, 1.52); sc.add(m2);
  placeModel(sc, { type: 'trolley', bass: 4, style: 'vip' }, { finish: 'go-den' }, { x: -4, z: -8, ry: .3 });
  const camera = cam(28, [2.8, 2.4, 3.6], [0, .4, 0]); return { scene: sc, camera, focus: dist(camera, [.4, .5, .4]), aper: 12, maxC: 30, aoR: .1, grade: G({ expo: 1.15, wb: [1.06, 1, .9], contrast: 1.12, vig: .5, bloom: 3 }) }; };
SHOTS['knobs-1'] = async (R) => { const S = await SHOTS['blog-knobs'](R); S.camera = cam(30, [-9, 5.5, 11], [0, 5.5, -8]); S.focus = dist(S.camera, [0, 5.5, -6]); S.aper = 10; return S; };
SHOTS['knobs-2'] = async (R) => { const S = await SHOTS['blog-knobs'](R); S.camera = cam(32, [6, 6.5, 8], [0, 5.5, -8]); S.focus = dist(S.camera, [0, 5.5, -6]); S.aper = 10; return S; };
SHOTS['battery-1'] = async (R) => { const S = await SHOTS['blog-battery'](R); S.camera = cam(26, [5.6, 2.8, -.8], [2.6, 1.2, -4.2]); S.focus = dist(S.camera, [2.6, 1.4, -4.2]); return S; };
SHOTS['battery-2'] = async (R) => { const S = await SHOTS['blog-battery'](R); S.camera = cam(32, [-12, 7, 6], [-5, 5, -9]); S.focus = dist(S.camera, [-6, 5, -8]); return S; };

/* ============ Ảnh sản phẩm: studio sạch + ảnh trong bối cảnh (khung vuông) ============ */
function sweep(color = '#eee8de') { // phông nền cong liền mạch kiểu studio
  const g = new A.Plane(400, 220, 4, 220); g.rotateX(-Math.PI / 2); const p = g.attributes.position, Rr = 26, flat = 120;
  for (let i = 0; i < p.count; i++) { const s0 = 110 - p.getZ(i); // khoảng cách tính từ mép trước
    let y = 0, z; if (s0 < flat) z = 110 - s0 - 0; else { const a = Math.min((s0 - flat) / Rr, Math.PI / 2); if (a < Math.PI / 2) { z = 110 - flat - Math.sin(a) * Rr; y = Rr - Math.cos(a) * Rr; } else { z = 110 - flat - Rr; y = Rr + (s0 - flat - Rr * Math.PI / 2); } }
    p.setY(i, y); p.setZ(i, z - 60); }
  g.computeVertexNormals(); const m = mesh(g, phys({ color, roughness: .9, normalMap: T.plaster(color).normal, normalScale: new A.V2(.08, .08) })); m.castShadow = false; return m;
}
function studio(R, { tone = '#efe9df' } = {}) {
  const sc = new A.Scene(); sc.background = col(tone);
  const env = new A.Scene(); env.add(new A.Mesh(new A.Box(80, 50, 80), new A.Basic({ color: col('#d8d2c8').multiplyScalar(.35), side: A.Back })));
  const box = (w, h, pos, k) => { const m = new A.Mesh(new A.Plane(w, h), new A.Basic({ color: col('#fffaf2').multiplyScalar(k), side: A.Double })); m.position.set(...pos); m.lookAt(0, 4, 0); env.add(m); };
  box(26, 18, [-28, 18, 24], 6); box(30, 30, [0, 39, 0], 2.2); box(6, 30, [34, 10, -12], 4.5); box(40, 12, [0, 4, 39], 1.2);
  sc.environment = envFromScene(R, env, .025);
  sc.add(sweep(tone));
  const key = sunLight(V(-.75, 1.25, .9), '#fff6ea', 2.6, { size: 26, radius: 14, dist: 90, target: [0, 2, -3] }); key.shadow.blurSamples = 32; sc.add(key, key.target);
  const rim = new A.Dir('#f2f6ff', 1.3); rim.position.set(30, 22, -40); sc.add(rim);
  sc.add(new A.Hemi('#ffffff', '#cbbfae', .55));
  return { sc, at: [0, 0, 0] };
}
function fitCam(obj, dir, { fov = 26, margin = 1.18, lift = 0, aimY = .45 } = {}) {
  const b = new A.Box3().setFromObject(obj), c = b.getCenter(V(0, 0, 0)), sz = b.getSize(V(0, 0, 0)), r = sz.length() / 2;
  const t = V(c.x, b.min.y + sz.y * aimY, c.z), d = r * margin / Math.sin(fov * Math.PI / 360);
  const camera = cam(fov, [t.x + dir[0] * d, t.y + dir[1] * d + lift, t.z + dir[2] * d], [t.x, t.y, t.z]);
  return { camera, focus: d, target: t };
}
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
// Bối cảnh cho từng loại loa
const LIFE = {
  pebble: 'beach', wave: 'beachTowel', halong: 'desk', 'hifi-s': 'desk', 'hifi-m': 'living', 'hifi-l': 'living', stone: 'living',
  bar: 'evening', cube: 'livingFloor', tower: 'patio', trolley: 'patio',
};
async function lifeScene(R, kind) {
  if (kind === 'desk') { const sc = deskRoom(R); const bk = P.books([[3.4, .32, 4.6, '#2c3e52'], [3.1, .26, 4.3, '#c9b48a']]); bk.position.set(-6.4, 0, -2.4); bk.rotation.y = .3; sc.add(bk); const v = P.vase('#efe9df', 3.2, 1.1); v.position.set(6.6, 0, -4.2); sc.add(v);
    return { sc, at: [0, 0, 0], dir: norm([.42, .36, 1]), g: G({ expo: .9 }), margin: 1.55 }; }
  if (kind === 'living' || kind === 'livingFloor' || kind === 'evening') {
    const ev = kind === 'evening', { sc, woodTop } = livingRoom(R, { evening: ev });
    if (ev) { const scr = cv(1600, 900), sx = scr.getContext('2d'); const sg = sx.createLinearGradient(0, 0, 0, 900); sg.addColorStop(0, '#0d2a4a'); sg.addColorStop(.55, '#d98b52'); sg.addColorStop(.58, '#2b5e86'); sg.addColorStop(1, '#0b2236'); sx.fillStyle = sg; sx.fillRect(0, 0, 1600, 900);
      sc.add(mesh(A.rbox(19.4, 11.2, .35, .06), phys({ color: '#0c0d10', metalness: .6, roughness: .3 }), [0, 14.2, -15.6])); sc.add(mesh(new A.Plane(19, 10.8), phys({ color: '#000', roughness: .1, clearcoat: 1, emissive: col('#ffffff'), emissiveMap: tex(scr, { srgb: true }), emissiveIntensity: 1.4 }), [0, 14.2, -15.42]));
      const tvl = new A.Point('#8fb0d8', 300, 40, 2); tvl.position.set(0, 13, -12); sc.add(tvl); }
    const v = P.vase('#e9e2d6', 2.8, .95); v.position.set(-7.5, woodTop, -13.6); sc.add(v);
    if (kind === 'livingFloor') return { sc, at: [8.5, 0, -8.5], dir: norm([-.5, .3, 1]), g: G({ expo: .95 }), margin: 1.7, aimY: .55 };
    return { sc, at: [0, woodTop, -12.9], dir: norm([-.32, .18, 1]), g: G({ expo: ev ? 1.25 : .95, bloom: ev ? 2 : 1 }), margin: ev ? 2.6 : 1.7, aimY: ev ? .9 : .55 };
  }
  if (kind === 'beach' || kind === 'beachTowel') { const { sc, ground } = beach(R, { sunEl: .32 }); const z = kind === 'beach' ? -24 : 0;
    if (kind === 'beachTowel') { const t = P.towel('#f3eee4', '#2f5d86'); t.position.set(-.6, ground(0, 0), .3); t.rotation.y = .25; sc.add(t); }
    return { sc, at: [0, ground(0, z) + (kind === 'beachTowel' ? .1 : 0), z], dir: norm([.35, .2, 1]), g: G({ expo: .42, contrast: 1.1, sat: 1.1 }), margin: 1.7, aimY: .45 }; }
  if (kind === 'patio') { const { sc } = patio(R); const m1 = P.mic(); m1.position.set(4.6, .3, -4.5); m1.rotation.set(0, .4, 1.5); sc.add(m1);
    return { sc, at: [0, 0, -8], dir: norm([.5, .2, 1]), g: G({ expo: 1.15, wb: [1.06, 1, .9], contrast: 1.12, vig: .48, bloom: 3 }), margin: 1.45, aimY: .5 }; }
}
SHOTS['prod'] = async (R) => {
  const q = new URLSearchParams(location.search), model = JSON.parse(q.get('model')), finish = q.get('finish'), mode = q.get('mode');
  const opts = { finish, knob: 'champagne', strap: finish === 'huyen' ? 'kem' : 'bo' };
  if (mode === 'studio') {
    const { sc } = studio(R); const o = placeModel(sc, model, opts, { ry: model.type === 'trolley' ? -.1 : 0 });
    const { camera, focus } = fitCam(o, norm([.62, .34, 1]), { margin: 1.12, aimY: .47 });
    return { scene: sc, camera, focus, aper: 3, maxC: 10, aoR: .15, aoK: .5, grade: G({ expo: .92, wb: [1.01, 1, .99], contrast: 1.04, vig: .16, grain: .012 }) };
  }
  const key = model.type === 'hifi' ? 'hifi-' + model.size : model.type, L = await lifeScene(R, LIFE[key] || 'desk');
  const o = placeModel(L.sc, model, opts, { x: L.at[0], y: L.at[1], z: L.at[2], ry: -.25 });
  if (key === 'hifi-l') placeModel(L.sc, model, opts, { x: L.at[0] + 9, y: L.at[1], z: L.at[2], ry: -.4 });
  const { camera, focus } = fitCam(o, L.dir, { margin: L.margin, aimY: L.aimY ?? .5 });
  return { scene: L.sc, camera, focus, aper: 9, maxC: 26, aoR: .15, grade: L.g };
};
SHOTS['about'] = async (R) => {
  const sc = deskRoom(R);
  placeModel(sc, { type: 'halong' }, { finish: 'huyen', knob: 'champagne', strap: 'kem' }, { x: -.4, z: 1.2, ry: .32 });
  placeModel(sc, { type: 'hifi', size: 's' }, { finish: 'oc-cho', knob: 'champagne' }, { x: 2.3, z: -2.6, ry: -.4 });
  const bk = P.books([[3.4, .32, 4.6, '#2c3e52'], [3.1, .26, 4.3, '#c9b48a']]); bk.position.set(-3.3, 0, -2.6); bk.rotation.y = .3; sc.add(bk);
  const cp = P.cup(); cp.position.set(-2.5, 0, 3.4); sc.add(cp);
  const camera = cam(32, [1.1, 4.3, 12.2], [.5, 1.5, -.5]);
  return { scene: sc, camera, focus: dist(camera, [-.4, 1, 1.2]), aper: 10, maxC: 20, aoR: .12, grade: { expo: .95, wb: [1.03, 1, .96], vig: .3 } };
};
