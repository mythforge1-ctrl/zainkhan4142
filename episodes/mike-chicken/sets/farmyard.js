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
  const party = ctx.place && ctx.place.light === 'day';
  // ground: dirt yard in front, green meadow behind, far hills
  box('ground_far', 'ground', 300, 300, .2, [0, 60, -.3], '#8fae5a', { cast: false, mat: 'turf' });
  box('yard_dirt', 'ground', 26, 9, .06, [0, -1.2, -.06], '#c79a63', { cast: false, mat: 'dirt' });
  for (const [x, r] of [[-30, 14], [-8, 18], [22, 16], [40, 20]]) ball('far_hill', 'ground', r, [x, 70, -4], '#7da05a', { cast: false, sy: .45, seg: 18 });
  // rail fence along y = 1.9 (the neighbour leans on it at x = 2.1)
  for (let x = -9; x <= 9; x += 1.5) cyl('fence_post', 'wood', .07, 1.15, [x, 1.9, 0], '#8a5a34', { mat: 'wood_grain' });
  for (const z of [.5, .95]) box('fence_rail', 'wood', 19, .06, .1, [0, 1.9, z], '#a77544', { mat: 'wood_grain' });
  // red barn with a windmill behind it (aim target of the yard world view at [-6, 3, 2.2])
  box('barn_body', 'wood', 7.5, 5, 4.2, [-6, 6.5, 0], '#b8402f', { mat: 'wood_grain' });
  const roofG = new THREE.BoxGeometry(8.2, .25, 5.8), rf = (s) => { const m = new THREE.Mesh(roofG, toon('#6b3b2a')); m.position.copy(B2T([-6, 6.5 + s * 1.5, 5.0])); m.rotation.x = s * .62; return add(m, 'barn_roof', 'roof'); }; rf(-1); rf(1);
  box('barn_door', 'wood', 2.4, .12, 3.0, [-6, 3.95, 0], '#f1e3c8', { mat: 'wood_grain' }); box('barn_door_x', 'wood', .18, .14, 3.2, [-6, 3.9, 0], '#8a2a1f', { rot: 0 });
  box('barn_loft', 'wood', 1.2, .12, 1.0, [-6, 3.95, 3.3], '#f1e3c8');
  cyl('windmill_tower', 'metal', .35, 9.5, [-11.5, 9, 0], '#d6d2c4', { r2: .16 });
  const wm = new THREE.Group(); wm.position.copy(B2T([-11.5, 8.7, 9.2])); scene.add(wm); for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.4, 2.1, .06), toon('#e8e2d0')); b.position.y = 1.2; const g = new THREE.Group(); g.rotation.z = k * Math.PI / 3; g.add(b); wm.add(g); } add(wm, 'windmill_wheel', 'metal', { cast: false }); movers.push(f => { wm.rotation.z = -f * .035; });
  // chopping block, feed barrel (Mike's stage), trough, hay bales, hen house
  cyl('chopping_block', 'wood', .34, .5, [-1.0, .7, 0], '#9a6a3c', { mat: 'wood_grain' }); box('axe_mark', 'wood', .5, .04, .03, [-1.0, .7, .5], '#4a2f18');
  cyl('feed_barrel', 'wood', .34, .85, [1.7, -.2, 0], '#6b8bb5', { r2: .38, mat: 'wood_grain' }); for (const z of [.2, .6]) cyl('barrel_hoop', 'metal', .39, .05, [1.7, -.2, z], '#3b3f4a', { mat: 'metal' });
  box('water_trough', 'metal', 1.8, .55, .45, [-3.6, 1.1, 0], '#7e8a96', { mat: 'metal' }); box('water_in_trough', 'water', 1.6, .4, .04, [-3.6, 1.1, .42], '#6bb2d6', { cast: false });
  for (const [x, y, k] of [[4.8, 1.2, 0], [5.9, 1.4, 1], [5.3, 1.3, 2]]) box('hay_bale', 'foliage', 1.1, .7, .55, [x, y, k === 2 ? .55 : 0], '#e1c15a', { rot: k * .3 });
  box('hen_house', 'wood', 2.4, 1.8, 1.5, [7.6, 4.5, 0], '#d9b27a', { mat: 'wood_grain' }); box('hen_house_roof', 'roof', 2.8, 2.1, .18, [7.6, 4.5, 1.5], '#7a3f2a'); box('hen_ramp', 'wood', .5, .9, .06, [7.6, 3.4, 0], '#a77544', { rot: 0 });
  // trees and the whole yard of chickens behind the fence (they bob: secondary motion)
  for (const [x, y, s] of [[10, 9, 1.2], [14, 12, 1.5], [-15, 12, 1.4], [-2, 16, 1.6]]) { cyl('tree_trunk', 'wood', .22 * s, 2.2 * s, [x, y, 0], '#6d4a2c'); ball('tree_crown', 'foliage', 1.5 * s, [x, y, 3.2 * s], '#5d8f4a', { cast: false }); }
  const hens = []; for (let i = 0; i < 9; i++) { const x = -6 + i * 1.9 + hash(i) * .8, y = 3.0 + hash(i + 9) * 3.4, col = i % 3 ? '#f1e7d3' : '#c0763a';
    const g = new THREE.Group(); g.position.copy(B2T([x, y, 0.18])); const body = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), toon(col)); body.scale.set(1, .85, 1.2); g.add(body); const tl = new THREE.Mesh(new THREE.ConeGeometry(.1, .25, 6), toon('#8a5a34')); tl.position.set(0, .12, .22); tl.rotation.x = -.8; g.add(tl); const hd = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), toon(col)); hd.position.set(0, .15, -.2); g.add(hd);
    const cm = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 5), toon('#d8473c')); cm.position.set(0, .26, -.2); g.add(cm); g.rotation.y = hash(i + 3) * 6; add(g, 'hen', 'cloth', { cast: false }); hens.push([g, i]); }
  movers.push((f, t) => { for (const [g, i] of hens) g.position.y = B2T([0, 0, .18 + Math.max(0, Math.sin(t * 5 + i * 1.7)) * .05]).y; });
  if (party) {   // the town's party: bunting, picnic table with a cake, balloons
    const pts = [[-5.5, 3.0, 3.0], [-2.5, 2.4, 2.4], [0.5, 2.3, 2.25], [3.5, 2.5, 2.5], [6.0, 3.0, 3.1]]; const cols = ['#d8473c', '#e2b13c', '#3b8ad8', '#58b36a', '#c45bd0'];
    cyl('bunting_pole', 'wood', .07, 3.3, [-5.5, 3.0, 0], '#8a5a34'); cyl('bunting_pole', 'wood', .07, 3.3, [6.0, 3.0, 0], '#8a5a34');
    for (let i = 0; i < 4; i++) for (let k = 0; k < 7; k++) { const u = k / 7, a = pts[i], b = pts[i + 1], x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, z = a[2] + (b[2] - a[2]) * u - Math.sin(u * Math.PI) * .22; const m = new THREE.Mesh(new THREE.ConeGeometry(.2, .42, 3), toon(cols[(i * 7 + k) % 5])); m.position.copy(B2T([x, y, z - .2])); m.rotation.x = Math.PI; add(m, 'bunting_flag', 'cloth', { cast: false }); }
    box('party_table', 'wood', 2.4, .9, .08, [-3.2, 3.6, .75], '#b9855a', { mat: 'wood_grain' }); for (const x of [-4.2, -2.2]) box('party_table_leg', 'wood', .08, .7, .75, [x, 3.6, 0], '#8a5a34');
    cyl('cake', 'cloth', .35, .25, [-3.2, 3.6, .83], '#f4a6b8'); cyl('cake_top', 'cloth', .24, .18, [-3.2, 3.6, 1.08], '#fff2f6'); cyl('cake_candle', 'cloth', .02, .16, [-3.2, 3.6, 1.26], '#3b8ad8');
    for (const [x, y, c] of [[3.8, 3.4, '#d8473c'], [4.2, 3.6, '#3b8ad8'], [3.5, 3.7, '#e2b13c']]) { cyl('balloon_string', 'cloth', .008, 1.6, [x, y, 0], '#f3efe6'); ball('balloon', 'cloth', .26, [x, y, 1.85], c, { sy: 1.2, cast: false }); }
  }
  return { anchors: { barn: [-6, 3.9, 2.2], barrel: [1.7, -.2, .85], fence: [2.1, 1.9, 1.0], block: [-1, .7, .5], bunting: [-5.5, 3, 3] }, update: (f, t) => { for (const m of movers) m(f, t); } };
}
