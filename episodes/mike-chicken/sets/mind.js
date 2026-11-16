// Mike set (storyboard toon set). Plan coordinates: metres, Z up, Y away from the opening camera, ground where actors stand is z = 0.
// Cameras live at negative Y: nothing taller than 0.3 m in the strip y < 0.6 except the marked actor props.
export function build(THREE, scene, film, ctx) {
  const { B2T, toon } = ctx, n = {}, movers = [];
  const add = (m, name, role, o = {}) => { n[name] = (n[name] || 0) + 1; m.name = n[name] > 1 ? `${name}_${String(n[name]).padStart(2, '0')}` : name; m.userData.role = role; if (o.mat) m.userData.mat = o.mat; m.castShadow = o.cast ?? true; m.receiveShadow = true; (o.parent || scene).add(m); return m; };
  const box = (name, role, w, d, h, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(col)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); if (o.rot) m.rotation.y = o.rot; return add(m, name, role, o); };
  const cyl = (name, role, r, h, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg ?? 16), toon(col)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); return add(m, name, role, o); };
  const ball = (name, role, r, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.seg ?? 14, o.seg ?? 10), toon(col)); m.position.copy(B2T(at)); if (o.sy) m.scale.y = o.sy; if (o.sx) m.scale.x = o.sx; return add(m, name, role, o); };
  const flat = (name, role, geo, col, at, o = {}) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, ...(o.mp || {}) })); if (at) m.position.copy(at); return add(m, name, role, { cast: false, ...o }); };
  const sign = (text, w, h, bg, fg, font) => { const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w); const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = fg; g.font = `900 ${font}px Arial Black, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; const lines = text.split('\n'); lines.forEach((t, i) => g.fillText(t, c.width / 2, c.height * (i + 1) / (lines.length + 1))); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; };
  const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // "you see" analogy stage: a pastel round stage in a soft void. LEFT: the giant brain + spine + beating heart model on a pedestal (aim target [-5, 2, 1.5]); CENTRE: a walking strip where the lady walks while she thinks.
  ball('void_dome', 'ground', 60, [0, 10, 0], '#bfe0e8', { sy: .8, cast: false, seg: 24 }); (scene.children[scene.children.length - 1].material.side = THREE.BackSide);
  cyl('stage_disc', 'ground', 9, .2, [-1, 3, -.2], '#f6d9c4', { seg: 40 }); cyl('stage_ring', 'ground', 9.2, .08, [-1, 3, -.08], '#e8a07a', { seg: 40 });
  box('walk_strip', 'ground', 9, 1.8, .04, [.5, 0, .06], '#e2a2b0', { cast: false });
  for (let i = -4; i <= 4; i++) box('walk_tick', 'ground', .1, 1.8, .045, [.5 + i, 0, .075], '#f6d9c4', { cast: false });
  // pedestal + brain (two lobes with bumps), brain stem, spine of stacked discs, heart that beats
  cyl('pedestal', 'stone', 1.2, 1.0, [-5, 2, 0], '#e8d6f0', { r2: 1.35, seg: 24 });
  const brain = new THREE.Group(); brain.position.copy(B2T([-5, 2, 2.1])); scene.add(brain);
  for (const s of [-1, 1]) { const lobe = new THREE.Mesh(new THREE.SphereGeometry(.85, 18, 14), toon('#f08aa8')); lobe.position.x = s * .5; lobe.scale.set(1, .9, 1.15); brain.add(lobe); for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, b = new THREE.Mesh(new THREE.SphereGeometry(.2, 8, 6), toon('#f4a3bb')); b.position.set(s * .5 + Math.cos(a) * .7, .25 + Math.sin(a * 2) * .3, Math.sin(a) * .8); brain.add(b); } }
  add(brain, 'brain_model', 'cloth');
  cyl('brain_stem', 'cloth', .24, 1.0, [-5, 2.2, 1.0], '#e86a8a', { r2: .16 });
  for (let k = 0; k < 6; k++) cyl('spine_disc', 'stone', .2 - k * .008, .12, [-5, 2.2, .2 + k * .0], '#f3efe6', { seg: 12 }).position.copy(B2T([-5, 2.2, .06 + k * .14]));
  const heart = new THREE.Mesh(new THREE.SphereGeometry(.55, 16, 12), toon('#d8473c')); heart.scale.set(1, 1.1, .9); heart.position.copy(B2T([-3.2, 1.2, 1.5])); add(heart, 'heart_model', 'cloth');
  // thought bubbles that float up beside the lady's mark
  const th = []; for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.18 + i * .12, 12, 10), toon('#ffffff')); b.position.copy(B2T([1.4 + i * .3, 0, 2.2 + i * .35])); add(b, 'thought_bubble', 'cloth', { cast: false }); th.push([b, i]); }
  // a few soft clouds for background parallax
  for (let i = 0; i < 6; i++) { const x = -18 + i * 7 + hash(i) * 3; ball('cloud', 'cloth', 1.6 + hash(i + 4), [x, 22 + hash(i + 8) * 8, 6 + hash(i + 2) * 5], '#ffffff', { sx: 1.8, sy: .6, cast: false }); }
  return { anchors: { brain: [-5, 2, 2.1], heart: [-3.2, 1.2, 1.5], spine: [-5, 2.2, .5] }, update: (f, t) => { const k = 1 + Math.max(0, Math.sin(t * 7)) * .12; heart.scale.set(k, 1.1 * k, .9 * k); brain.rotation.y = Math.sin(t * .6) * .25; for (const [b, i] of th) b.position.y = B2T([0, 0, 2.2 + i * .35 + Math.sin(t * 1.4 + i) * .06]).y; } };
}
