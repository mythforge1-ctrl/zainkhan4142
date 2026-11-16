// Mike set (storyboard toon set). Plan coordinates: metres, Z up, Y away from the opening camera, ground where actors stand is z = 0.
// Cameras live at negative Y: nothing taller than 0.3 m in the strip y < 0.6 except the marked actor props.
export function build(THREE, scene, film, ctx) {
  const { B2T, toon } = ctx, n = {}, movers = [];
  const add = (m, name, role, o = {}) => { n[name] = (n[name] || 0) + 1; m.name = n[name] > 1 ? `${name}_${String(n[name]).padStart(2, '0')}` : name; m.userData.role = role; if (o.mat) m.userData.mat = o.mat; m.castShadow = o.cast ?? true; m.receiveShadow = true; (o.parent || scene).add(m); return m; };
  const rbox = (w, h, d, r) => { const g = new THREE.BoxGeometry(w, h, d, 8, 8, 8), p = g.attributes.position, v = new THREE.Vector3(), q = new THREE.Vector3(), hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); q.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z))); v.sub(q); if (v.lengthSq() > 1e-9) v.setLength(r); p.setXYZ(i, q.x + v.x, q.y + v.y, q.z + v.z); } g.computeVertexNormals(); return g; };
  const box = (name, role, w, d, h, at, col, o = {}) => { const m = new THREE.Mesh(rbox(w, h, d, Math.min(o.round ?? .14, Math.min(w, h, d) * .35)), toon(col)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); if (o.rot) m.rotation.y = o.rot; return add(m, name, role, o); };
  const cyl = (name, role, r, h, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg ?? 16), toon(col)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); return add(m, name, role, o); };
  const ball = (name, role, r, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.seg ?? 14, o.seg ?? 10), toon(col)); m.position.copy(B2T(at)); if (o.sy) m.scale.y = o.sy; if (o.sx) m.scale.x = o.sx; return add(m, name, role, o); };
  const flat = (name, role, geo, col, at, o = {}) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, ...(o.mp || {}) })); if (at) m.position.copy(at); return add(m, name, role, { cast: false, ...o }); };
  const sign = (text, w, h, bg, fg, font) => { const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * h / w); const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = fg; g.font = `900 ${font}px Arial Black, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; const lines = text.split('\n'); lines.forEach((t, i) => g.fillText(t, c.width / 2, c.height * (i + 1) / (lines.length + 1))); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; };
  const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // lab, interior: open front (y = -1.6 side), back wall y = 4, side walls x = -6 / 6, ceiling lamps. Mike stands on the steel table at z = 0.9.
  box('floor', 'ground', 14, 9, .1, [0, 1.6, -.1], '#9aa8a2', { cast: false, mat: 'tile' });
  box('back_wall', 'plaster', 14, .2, 3.6, [0, 4.1, 0], '#d6e3da'); box('left_wall', 'plaster', .2, 9, 3.6, [-6.1, 1.6, 0], '#cfdcd2'); box('right_wall', 'plaster', .2, 9, 3.6, [6.1, 1.6, 0], '#cfdcd2'); box('ceiling', 'plaster', 14, 9, .15, [0, 1.6, 3.6], '#e8efe9', { cast: false });
  box('wall_stripe', 'plaster', 14, .22, .5, [0, 4.0, 1.0], '#6aa28f');
  // window on the back wall (daylight) and an anatomy chart (the "you see" hint)
  box('window_frame', 'wood', 2.2, .12, 1.7, [2.8, 3.95, 1.3], '#f3efe6'); flat('window_glass', 'glass', new THREE.PlaneGeometry(2.0, 1.5), '#bfe3f2', B2T([2.8, 3.88, 2.15]), { mat: 'glass' });
  flat('anatomy_chart', 'cloth', new THREE.PlaneGeometry(1.5, 1.9), '#f3e6c8', B2T([-2.4, 3.9, 1.75]));
  // the left bench (aim target of the lab world view at [-5, 2, 1.0]): glassware, a microscope, a rack of test tubes, a skeleton model
  box('bench_top', 'wood', 1.6, 4.4, .08, [-5.0, 2.0, .92], '#b78a58', { mat: 'wood_grain' }); box('bench_body', 'wood', 1.5, 4.2, .9, [-5.0, 2.0, 0], '#8a6a46', { mat: 'wood_grain' });
  for (let i = 0; i < 6; i++) { const y = .6 + i * .65, c = ['#e86a6a', '#6ac2e8', '#8ee86a', '#e8d86a', '#c46ae8', '#6ae8c8'][i]; cyl('flask', 'glass', .16, .3, [-5.0, y, 1.0], c, { r2: .05, mat: 'glass' }); ball('flask_bulb', 'glass', .17, [-5.0, y, 1.18], c, { sy: .9, mat: 'glass' }); }
  box('microscope_base', 'metal', .3, .4, .06, [-4.6, 3.4, 1.0], '#2b2d3a'); cyl('microscope_arm', 'metal', .05, .5, [-4.6, 3.5, 1.06], '#2b2d3a'); cyl('microscope_tube', 'metal', .06, .38, [-4.5, 3.4, 1.4], '#3b3f4a');
  for (let i = 0; i < 5; i++) cyl('test_tube', 'glass', .03, .22, [-5.3 + i * .11, 3.7, 1.0], '#d8f0fa', { mat: 'glass' });
  // steel operating table (Mike's stand), top at 0.9
  box('table_top', 'metal', 1.1, .9, .06, [.45, .05, .86], '#c9d0d8', { mat: 'metal' }); for (const [x, y] of [[-.05, -.3], [.95, -.3], [-.05, .4], [.95, .4]]) cyl('table_leg', 'metal', .04, .86, [x, y, 0], '#aeb4c2', { mat: 'metal' });
  // shelves of jars and a ceiling lamp that sways a little (secondary motion)
  for (const z of [1.2, 1.9, 2.6]) box('shelf', 'wood', 4.4, .35, .06, [-.6, 3.8, z], '#a77544');
  for (let i = 0; i < 14; i++) { const x = -2.7 + (i % 7) * .62, z = [1.26, 1.96][i < 7 ? 0 : 1]; cyl('jar', 'glass', .13, .3, [x, 3.8, z], ['#cfe8a8', '#e8c8a8', '#a8d0e8'][i % 3], { mat: 'glass' }); }
  const lamp = new THREE.Group(); lamp.position.copy(B2T([.5, .6, 3.4])); scene.add(lamp); const shade = new THREE.Mesh(new THREE.ConeGeometry(.5, .35, 20, 1, true), toon('#e8efe9')); shade.position.y = -.2; lamp.add(shade); const bulb = flat('lab_lamp_bulb', 'lamp', new THREE.SphereGeometry(.12, 10, 8), '#fff6d0', null); lamp.add(bulb); bulb.position.y = -.28; const cord = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, .4, 4), toon('#2b2d3a')); cord.position.y = .15; lamp.add(cord); add(lamp, 'lab_lamp', 'metal', { cast: false });
  return { anchors: { bench: [-5, 2, 1.2], table: [.45, .05, .9], window: [2.8, 3.9, 2.1] }, update: (f, t) => { lamp.rotation.z = Math.sin(t * .9) * .04; } };
}
