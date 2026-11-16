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
  // sideshow tent, interior at night: striped canvas wall behind, sawdust floor, bulb strings, a red pedestal for Mike (z = 1.0), the big sign far right at [7, 3, 2.2]
  box('sawdust_floor', 'ground', 30, 14, .1, [0, 2, -.1], '#c9a46a', { cast: false, mat: 'dirt' });
  for (let i = -8; i <= 8; i++) box('canvas_stripe', 'cloth', 1.6, .2, 5.4, [i * 1.6, 7.2, 0], i % 2 ? '#d8473c' : '#f3e9d0', { cast: false });
  for (const s of [-1, 1]) for (let j = 0; j < 8; j++) box('canvas_stripe_side', 'cloth', .2, 1.6, 5.4, [s * 13, -.5 + j * 1.6, 0], j % 2 ? '#d8473c' : '#f3e9d0', { cast: false });
  for (let i = -8; i <= 8; i++) box('canvas_roof', 'cloth', 1.6, 14, .15, [i * 1.6, 1, 5.3 + Math.abs(i) * .12], i % 2 ? '#d8473c' : '#f3e9d0', { cast: false });
  cyl('tent_pole', 'wood', .14, 5.4, [-7, 3.5, 0], '#7a5a3e'); cyl('tent_pole', 'wood', .14, 5.4, [7, 5.5, 0], '#7a5a3e');
  // pedestal where Mike stands (top z = 1.0) with a red cloth and a gold rim
  cyl('pedestal', 'cloth', .55, 1.0, [.8, .1, 0], '#b3262e', { r2: .5, seg: 20 }); cyl('pedestal_rim', 'metal', .6, .08, [.8, .1, .98], '#e2b13c', { mat: 'metal' }); cyl('pedestal_base', 'metal', .62, .08, [.8, .1, 0], '#e2b13c', { mat: 'metal' });
  // the big sign: two posts, a board with painted letters, bulbs around it that flash
  cyl('sign_post', 'wood', .09, 3.0, [5.9, 3, 0], '#7a5a3e'); cyl('sign_post', 'wood', .09, 3.0, [8.1, 3, 0], '#7a5a3e');
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), new THREE.MeshBasicMaterial({ map: sign('SEE THE\nHEADLESS\nCHICKEN!\n25 CENTS', 2.6, 1.5, '#2a1a1f', '#f3d37a', 72) })); sm.position.copy(B2T([7, 2.92, 2.2])); add(sm, 'sign_board', 'cloth', { cast: false }); box('sign_back', 'wood', 2.7, .1, 1.6, [7, 3.0, 1.4], '#7a5a3e');
  const bulbs = []; for (let i = 0; i < 16; i++) { const a = i / 16, px = i < 8 ? 5.75 + a * 2 * 2.5 : 8.25 - (a - .5) * 2 * 2.5, pz = i < 8 ? 1.45 : 2.95; const b = flat('sign_bulb', 'lamp', new THREE.SphereGeometry(.07, 8, 6), '#fff2a8', B2T([px, 2.86, pz]), {}); bulbs.push(b); }
  // string of party bulbs across the tent, a rope barrier in front of the pedestal, a ticket booth left
  for (let k = 0; k < 14; k++) { const x = -9 + k * 1.4, z = 4.3 - Math.sin(k / 13 * Math.PI) * .5; flat('string_bulb', 'lamp', new THREE.SphereGeometry(.09, 8, 6), ['#ffd45a', '#ff8a6a', '#8ad0ff'][k % 3], B2T([x, 2.5, z]), {}); }
  for (const x of [-1.9, 2.8]) cyl('rope_post', 'metal', .05, .9, [x, -1.3, 0], '#e2b13c', { mat: 'metal' }); box('rope', 'cloth', 4.7, .05, .05, [.45, -1.3, .75], '#b3262e', { cast: false });
  box('booth', 'wood', 1.8, 1.2, 2.2, [-8.5, 2.5, 0], '#7a2f2f', { mat: 'wood_grain' }); box('booth_awning', 'cloth', 2.2, 1.4, .12, [-8.5, 2.3, 2.2], '#f3e9d0');
  return { anchors: { sign: [7, 2.9, 2.2], pedestal: [.8, .1, 1.0] }, update: (f, t) => { bulbs.forEach((b, i) => { b.visible = ((Math.floor(t * 4) + i) % 2) === 0; }); } };
}
