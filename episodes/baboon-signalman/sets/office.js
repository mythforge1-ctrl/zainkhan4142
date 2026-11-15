// SET: the railway boss's office (baboon-signalman, Place 2 of SET_MAP.md). Simple toon set, real sizes, 1880s Cape railway office.
// Room x -2.6..2.6, y -1.6..2.6, 3.1 high; the y = -1.6 side is open (camera side). Plan coordinates: metres, Z up, Y away from the camera.
// Floor, side walls and ceiling run on to y = -3.2 as plain surfaces so a camera standing outside the open side never sees a void.
// Actor mark [-0.75, 0.55, 0]. Nothing taller than 0.3 m stands at y < 0.2. Movers: clock hands + pendulum (always), stamp (film.places.office.events).
export function build(THREE, scene, film, ctx) {
  const { B2T, toon } = ctx, n = {}, PI = Math.PI;
  const add = (m, name, role, o = {}) => { n[name] = (n[name] || 0) + 1; m.name = n[name] > 1 ? `${name}_${String(n[name]).padStart(2, '0')}` : name; m.userData.role = role; if (o.mat) m.userData.mat = o.mat; m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true; (o.parent || scene).add(m); return m; };
  const basic = (col, o = {}) => new THREE.MeshBasicMaterial({ color: col, ...o });
  const box = (name, role, w, d, h, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), o.basic ? basic(col) : toon(col)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); if (o.rot) m.rotation.y = o.rot; return add(m, name, role, o); };
  const cyl = (name, role, r, h, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg ?? 16), o.basic ? basic(col) : toon(col)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); return add(m, name, role, o); };
  const ball = (name, role, r, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), o.basic ? basic(col) : toon(col)); m.position.copy(B2T(at)); if (o.sq) m.scale.y = o.sq; return add(m, name, role, o); };
  const flat = (name, role, geo, col, at, o = {}) => { const m = new THREE.Mesh(geo, basic(col, o.m || {})); if (at) m.position.copy(at); return add(m, name, role, { cast: false, ...o }); };
  // a rod between two plan points (legs, hooks, quill, rolled maps)
  const rod = (name, role, r, a, b, col, o = {}) => { const A = B2T(a), B = B2T(b), d = B.clone().sub(A), m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, d.length(), o.seg ?? 10), o.basic ? basic(col) : toon(col)); m.position.copy(A).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return add(m, name, role, o); };
  // a flat line on a wall that faces the camera (plane x,z at depth y): the route map, the letter is separate
  const seg = (name, role, p, q, wd, col, y, o = {}) => { const dx = q[0] - p[0], dz = q[1] - p[1], m = new THREE.Mesh(new THREE.PlaneGeometry(Math.hypot(dx, dz) + wd * .6, wd), basic(col, { fog: o.fog ?? true })); m.position.copy(B2T([(p[0] + q[0]) / 2, y, (p[1] + q[1]) / 2])); m.rotation.z = Math.atan2(dz, dx); return add(m, name, role, { cast: false, mat: 'ink_flat', ...o }); };
  const line = (name, role, pts, wd, col, y, o) => { for (let i = 1; i < pts.length; i++) seg(name, role, pts[i - 1], pts[i], wd, col, y, o); };
  // a flat painted shape (points in x,z) at depth y: the far view behind the window
  const shape = (name, role, pts, col, y, o = {}) => { const s = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1]))), m = new THREE.Mesh(new THREE.ShapeGeometry(s), basic(col, { fog: false, side: THREE.DoubleSide })); m.position.set(0, 0, -y); return add(m, name, role, { cast: false, recv: false, mat: 'matte', ...o }); };
  const rnd = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  const X0 = -2.6, X1 = 2.6, YB = 2.6, YF = -3.2, H = 3.1;
  const C = { woodD: '#55301d', wood: '#74432a', woodL: '#935c36', woodP: '#84502f', plaster: '#5d8a78', plasterD: '#4d7767', brass: '#d0a548', iron: '#2a2a31', cream: '#f3e7c6', leather: '#2f5c47', red: '#9c2f28', glow: '#ffe9a6' };

  // ---- shell: floor boards, ceiling with beams, three walls -------------------------------------------------------------
  box('floor_base', 'wood', X1 - X0 + .4, YB - YF + .2, .1, [0, (YB + YF) / 2, -.12], C.woodD, { cast: false, mat: 'wood_grain' });
  { const bw = .2, cols = ['#5e3a26', '#684029', '#573421', '#6f462c']; let i = 0; for (let x = X0; x < X1 - .01; x += bw, i++) box('floor_board', 'wood', bw - .012, YB - YF, .02, [x + bw / 2, (YB + YF) / 2, -.02], cols[(i * 7 + (i % 3)) % 4], { cast: false, mat: 'wood_grain' });
    for (let k = 0; k < 26; k++) box('floor_board_joint', 'wood', bw - .012, .012, .004, [X0 + bw / 2 + ((k * 5) % 26) * bw, -2.9 + rnd(k) * 5.3, -.003], '#3a2114', { cast: false }); }
  box('ceiling', 'plaster', X1 - X0 + .4, YB - YF + .2, .1, [0, (YB + YF) / 2, H], '#bfa77a', { cast: false, recv: false });
  for (const y of [-2.2, -.9, .4, 1.7]) box('ceiling_beam', 'wood', X1 - X0, .16, .16, [0, y, H - .16], C.woodD, { cast: false });
  // wall helper: a strip lying on a wall. along = centre along the wall, len = length, z = bottom, h = height, t = how far it stands off the wall
  const W = { back: (a, len, z, h, t) => [len, t, h, [a, YB - t / 2, z]], left: (a, len, z, h, t) => [t, len, h, [X0 + t / 2, a, z]], right: (a, len, z, h, t) => [t, len, h, [X1 - t / 2, a, z]] };
  const wb = (wall, name, role, a, len, z, h, t, col, o = {}) => box(name, role, ...W[wall](a, len, z, h, t), col, { cast: false, ...o });
  const wallRun = (wall, a0, a1) => { const len = a1 - a0, mid = (a0 + a1) / 2;
    wb(wall, 'wainscot', 'wood', mid, len, 0, 1.0, .03, C.woodP, { mat: 'wood_grain' });
    wb(wall, 'skirting', 'wood', mid, len, 0, .16, .06, C.woodD); wb(wall, 'skirting_cap', 'wood', mid, len, .16, .03, .045, C.wood);
    wb(wall, 'wainscot_rail_low', 'wood', mid, len, .19, .09, .045, C.wood); wb(wall, 'wainscot_rail_top', 'wood', mid, len, .86, .1, .045, C.wood);
    wb(wall, 'dado_rail', 'wood', mid, len, .96, .07, .08, C.woodD); wb(wall, 'dado_rail_bead', 'wood', mid, len, 1.03, .025, .055, C.woodL);
    const k = Math.round(len / .62), st = len / k; for (let i = 0; i <= k; i++) wb(wall, 'wainscot_stile', 'wood', a0 + i * st, .09, .19, .77, .045, C.wood);
    for (let i = 0; i < k; i++) wb(wall, 'wainscot_panel', 'wood', a0 + (i + .5) * st, st - .2, .34, .46, .04, C.woodL, { mat: 'wood_grain' });
    wb(wall, 'picture_rail', 'wood', mid, len, 2.52, .05, .05, C.woodD); wb(wall, 'cornice', 'wood', mid, len, H - .14, .14, .09, C.woodD); wb(wall, 'frieze', 'plaster', mid, len, 2.57, H - .14 - 2.57, .012, '#d9c08a'); };
  for (const [wall, x] of [['left', X0 - .06], ['right', X1 + .06]]) { box('wall_' + wall, 'plaster', .12, YB - YF, H, [x, (YB + YF) / 2, 0], C.plaster, { cast: false }); wallRun(wall, YF, YB); }
  // back wall with the window opening x -1.7..-0.1, z 1.0..2.4
  const WX0 = -1.7, WX1 = -.1, WZ0 = 1.0, WZ1 = 2.4, WC = (WX0 + WX1) / 2;
  box('wall_back', 'plaster', X1 - X0 + .24, .12, WZ0, [0, YB + .06, 0], C.plaster, { cast: false });
  box('wall_back', 'plaster', WX0 - X0 + .12, .12, WZ1 - WZ0, [(X0 - .12 + WX0) / 2, YB + .06, WZ0], C.plaster, { cast: false });
  box('wall_back', 'plaster', X1 - WX1 + .12, .12, WZ1 - WZ0, [(X1 + .12 + WX1) / 2, YB + .06, WZ0], C.plaster, { cast: false });
  box('wall_back', 'plaster', X1 - X0 + .24, .12, H - WZ1, [0, YB + .06, WZ1], C.plaster, { cast: false });
  wallRun('back', X0, X1);

  // ---- window: casing, sill, sash bars, blind, pane; the far view is a painted board 0.65 m behind the glass -------------
  for (const x of [WX0 - .05, WX1 + .05]) box('window_casing', 'wood', .1, .2, WZ1 - WZ0 + .2, [x, YB + .02, WZ0 - .04], C.woodD, { cast: false });
  box('window_casing', 'wood', WX1 - WX0 + .32, .22, .12, [WC, YB + .01, WZ1], C.woodD, { cast: false }); box('window_pelmet', 'wood', WX1 - WX0 + .4, .1, .05, [WC, YB - .05, WZ1 + .12], C.wood, { cast: false });
  box('window_sill', 'wood', WX1 - WX0 + .34, .3, .05, [WC, YB - .03, WZ0 - .01], C.woodL, { cast: false });
  for (const x of [WX0 + .533, WX0 + 1.067]) box('window_bar', 'wood', .035, .04, WZ1 - WZ0, [x, YB + .06, WZ0], '#e9dcc0', { cast: false });
  for (const [z, t] of [[1.35, .03], [1.7, .06], [2.05, .03]]) box('window_bar', 'wood', WX1 - WX0, .045, t, [WC, YB + .06, z - t / 2], '#e9dcc0', { cast: false });
  for (const x of [WX0 + .02, WX1 - .02]) box('window_sash', 'wood', .04, .05, WZ1 - WZ0, [x, YB + .06, WZ0], '#e9dcc0', { cast: false });
  box('window_sash', 'wood', WX1 - WX0, .05, .04, [WC, YB + .06, WZ0 + .04], '#e9dcc0', { cast: false }); box('window_sash', 'wood', WX1 - WX0, .05, .04, [WC, YB + .06, WZ1 - .04], '#e9dcc0', { cast: false });
  box('window_blind', 'cloth', WX1 - WX0 - .02, .012, .26, [WC, YB + .03, WZ1 - .26], '#b9c4a0', { cast: false }); box('window_blind_lath', 'wood', WX1 - WX0 - .02, .02, .025, [WC, YB + .03, WZ1 - .285], C.woodL, { cast: false });
  rod('window_blind_cord', 'cloth', .004, [WC, YB + .02, WZ1 - .28], [WC, YB + .02, WZ1 - .52], '#e9dcc0', { cast: false }); ball('window_blind_pull', 'wood', .018, [WC, YB + .02, WZ1 - .54], C.woodL, { cast: false });
  flat('window_pane', 'glass', new THREE.PlaneGeometry(WX1 - WX0, WZ1 - WZ0), '#cfe8ff', B2T([WC, YB + .085, (WZ0 + WZ1) / 2]), { mat: 'glass', m: { transparent: true, opacity: .1, depthWrite: false } });
  // the far view: sky, koppies, orange veld, the line running to a vanishing point, a semaphore signal, telegraph poles, a thorn tree
  { const y = YB + .65, VX = WC + .05, HZ = 1.72, L = -4.4, Rr = 2.6, at = (s, off) => [VX + off * s, HZ - 1.75 * s];       // s = 1 / distance: 0 at the vanishing point
    shape('view_sky', 'plaster', [[L, HZ - .05], [Rr, HZ - .05], [Rr, 4.2], [L, 4.2]], '#2f72c9', y + .02);
    shape('view_sky_low', 'plaster', [[L, HZ - .05], [Rr, HZ - .05], [Rr, HZ + .34], [L, HZ + .34]], '#8fc3ea', y + .015); shape('view_sky_mid', 'plaster', [[L, HZ + .34], [Rr, HZ + .34], [Rr, HZ + .6], [L, HZ + .6]], '#5a9bdc', y + .015);
    for (const [cx, cz, r] of [[-1.5, 2.22, .13], [-1.3, 2.25, .17], [-1.08, 2.21, .12], [-.42, 2.02, .08], [-.3, 2.04, .1], [-2.3, 2.1, .12]]) { const c = flat('view_cloud', 'plaster', new THREE.CircleGeometry(r, 20), '#fdf6ea', B2T([cx, y + .01, cz]), { mat: 'matte', m: { fog: false } }); c.scale.y = .55; }
    shape('view_koppie_far', 'stone', [[L, HZ], [-2.9, HZ + .13], [-2.3, HZ + .14], [-2.05, HZ], [-.2, HZ], [.05, HZ + .1], [.7, HZ + .11], [.95, HZ], [Rr, HZ]], '#c88f6a', y + .008);
    shape('view_koppie', 'stone', [[-1.9, HZ], [-1.72, HZ + .17], [-1.25, HZ + .18], [-1.1, HZ]], '#b26a3e', y + .006); shape('view_koppie', 'stone', [[-.62, HZ], [-.5, HZ + .11], [-.22, HZ + .12], [-.1, HZ]], '#b97445', y + .006);
    shape('view_veld', 'ground', [[L, -.6], [Rr, -.6], [Rr, HZ], [L, HZ]], '#dc8a3c', y + .004); shape('view_veld_band', 'ground', [[L, HZ - .1], [Rr, HZ - .1], [Rr, HZ], [L, HZ]], '#e6a152', y + .003);
    shape('view_ballast', 'ground', [at(0, 0), at(1.3, -.95), at(1.3, .95)], '#8c6a58', y + .002);
    for (let k = 0; k < 46; k++) { const s = 1 / (1 + k * .22), a = at(s, -.72), b = at(s, .72), t = .05 * s; shape('view_sleeper', 'wood', [[a[0], a[1] - t], [b[0], b[1] - t], [b[0], b[1] + t], [a[0], a[1] + t]], '#4a2f20', y + .001); }
    for (const sgn of [-1, 1]) shape('view_rail', 'metal', [at(0, 0), at(1.3, sgn * .5 - .035), at(1.3, sgn * .5 + .035)], '#33333d', y);
    for (const s of [.42, .25, .15, .09]) { const p = at(s, -1.7); seg('view_telegraph_pole', 'wood', p, [p[0], HZ + 1.5 * s], .07 * s, '#4a3424', y - .002, { fog: false }); seg('view_telegraph_arm', 'wood', [p[0] - .25 * s, HZ + 1.3 * s], [p[0] + .25 * s, HZ + 1.3 * s], .05 * s, '#4a3424', y - .002, { fog: false }); }
    { const s = .3, p = at(s, 1.15), top = HZ + 1.55 * s; seg('view_signal_post', 'metal', p, [p[0], top], .028, '#f1ead8', y - .002, { fog: false }); seg('view_signal_post_base', 'metal', p, [p[0], p[1] + .12], .034, '#2a2a31', y - .003, { fog: false });
      seg('view_signal_arm', 'metal', [p[0] - .2, top - .08], [p[0] + .01, top - .08], .05, '#c92f26', y - .004, { fog: false }); seg('view_signal_arm_stripe', 'metal', [p[0] - .15, top - .105], [p[0] - .15, top - .055], .022, '#ffffff', y - .005, { fog: false });
      flat('view_signal_lamp', 'lamp', new THREE.CircleGeometry(.018, 12), '#ff5a3a', B2T([p[0] + .03, y - .005, top - .08]), { m: { fog: false } }); seg('view_signal_cap', 'metal', [p[0], top], [p[0], top + .03], .04, '#2a2a31', y - .003, { fog: false }); }
    { const p = at(.2, -2.7); seg('view_tree_trunk', 'wood', p, [p[0] + .02, p[1] + .2], 0.03, '#4a3424', y - .002, { fog: false }); const c = flat('view_tree_crown', 'foliage', new THREE.CircleGeometry(.17, 18), '#5f7d3a', B2T([p[0] + .02, y - .003, p[1] + .23]), { mat: 'matte', m: { fog: false } }); c.scale.y = .32; }
    { const p = at(.13, 2.6); seg('view_tree_trunk', 'wood', p, [p[0], p[1] + .12], .014, '#4a3424', y - .002, { fog: false }); const c = flat('view_tree_crown', 'foliage', new THREE.CircleGeometry(.1, 18), '#6d8a42', B2T([p[0], y - .003, p[1] + .14]), { mat: 'matte', m: { fog: false } }); c.scale.y = .32; }
  }
  // an aloe in a pot on the sill
  cyl('sill_pot', 'stone', .055, .1, [-1.5, YB - .06, WZ0 + .04], '#b5563a', { r2: .075, cast: false });
  for (let k = 0; k < 6; k++) { const a = k / 6 * PI * 2; rod('sill_aloe_leaf', 'foliage', .016, [-1.5, YB - .06, WZ0 + .13], [-1.5 + Math.cos(a) * .09, YB - .06 + Math.sin(a) * .05, WZ0 + .3 + (k % 2) * .05], '#6f9a5a', { r2: .003, cast: false }); }

  // ---- back wall: clock (hands turn, pendulum swings), framed route map ---------------------------------------------------
  const CK = [.3, YB - .1, 2.12], hands = {};
  { const [x, y, z] = CK; const oct = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .09, 8), toon(C.woodD)); oct.rotation.x = PI / 2; oct.rotation.y = PI / 8; oct.position.copy(B2T([x, YB - .075, z])); add(oct, 'clock_case', 'wood', { cast: false });
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(.195, .195, .03, 28), toon(C.brass)); ring.rotation.x = PI / 2; ring.position.copy(B2T([x, YB - .125, z])); add(ring, 'clock_bezel', 'metal', { cast: false, mat: 'metal' });
    box('clock_drop', 'wood', .2, .08, .34, [x, YB - .07, z - .52], C.woodD, { cast: false }); box('clock_drop_foot', 'wood', .14, .07, .05, [x, YB - .07, z - .56], C.wood, { cast: false });
    flat('clock_drop_window', 'glass', new THREE.PlaneGeometry(.12, .2), '#2b1a12', B2T([x, YB - .112, z - .36]), { mat: 'glass' });
    const d = flat('clock_face', 'glass', new THREE.CircleGeometry(.175, 28), '#fbf3df', B2T([x, YB - .142, z]), { mat: 'clock_face' });
    for (let k = 0; k < 12; k++) { const a = k / 12 * PI * 2, t = flat('clock_tick', 'metal', new THREE.PlaneGeometry(.012, k % 3 ? .025 : .045), '#2a1a1f', null, { parent: d, mat: 'ink_flat' }); t.position.set(Math.sin(a) * .145, Math.cos(a) * .145, .002); t.rotation.z = -a; }
    const hg = new THREE.PlaneGeometry(.022, .1); hg.translate(0, .04, 0); hands.h = flat('clock_hand_hour', 'metal', hg, '#2a1a1f', null, { parent: d, mat: 'ink_flat' }); hands.h.position.z = .004;
    const mg = new THREE.PlaneGeometry(.014, .15); mg.translate(0, .065, 0); hands.m = flat('clock_hand_minute', 'metal', mg, '#2a1a1f', null, { parent: d, mat: 'ink_flat' }); hands.m.position.z = .006;
    flat('clock_hub', 'metal', new THREE.CircleGeometry(.012, 12), C.brass, null, { parent: d, mat: 'metal' }).position.z = .008;
    const pg = new THREE.Group(); pg.position.copy(B2T([x, YB - .116, z - .2])); scene.add(pg); hands.p = pg;
    const pr = flat('clock_pendulum_rod', 'metal', new THREE.PlaneGeometry(.008, .2), C.brass, null, { parent: pg, mat: 'metal' }); pr.position.y = -.1; flat('clock_pendulum_bob', 'metal', new THREE.CircleGeometry(.03, 16), C.brass, null, { parent: pg, mat: 'metal' }).position.set(0, -.2, .001); }
  const MP = [1.3, YB - .06, 1.8];
  { const [x, , z] = MP, w = 1.3, h = .92, y = YB - .075, P = (u, v) => [x + u * w / 2, z + v * h / 2];
    box('map_frame', 'wood', w + .12, .05, h + .12, [x, YB - .055, z - h / 2 - .06], C.woodD, { cast: false }); box('map_frame_inner', 'metal', w + .03, .055, h + .03, [x, YB - .0575, z - h / 2 - .015], C.brass, { cast: false, mat: 'metal' });
    flat('map_paper', 'cloth', new THREE.PlaneGeometry(w, h), '#ecdcae', B2T([x, YB - .087, z]), { mat: 'paper' });
    const yl = YB - .089, sea = [P(-1, -1), P(-1, -.35), P(-.72, -.5), P(-.45, -.62), P(-.1, -.6), P(.2, -.74), P(.55, -.7), P(.8, -.56), P(1, -.5), P(1, -1)];
    const sm = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(sea.map(p => new THREE.Vector2(p[0], p[1])))), basic('#a9cfd6', { side: THREE.DoubleSide })); sm.position.set(0, 0, -yl); add(sm, 'map_sea', 'cloth', { cast: false, mat: 'paper' });
    line('map_coast', 'cloth', sea.slice(1, 9), .012, '#3d6f86', yl - .001);
    line('map_border', 'cloth', [P(-.94, -.92), P(.94, -.92), P(.94, .92), P(-.94, .92), P(-.94, -.92)], .008, '#6a4a2c', yl - .001);
    for (const u of [-.5, 0, .5]) seg('map_grid', 'cloth', P(u, -.92), P(u, .92), .004, '#cdb98a', yl - .0005); for (const v of [-.4, .2]) seg('map_grid', 'cloth', P(-.94, v), P(.94, v), .004, '#cdb98a', yl - .0005);
    const routes = [['#c0362c', .022, [[-.7, -.46], [-.42, -.3], [-.2, -.05], [.05, .1], [.3, .42], [.62, .6], [.84, .78]]],          // main line: port to the interior
      ['#1f3f8a', .018, [[.52, -.66], [.42, -.4], [.2, -.2], [.05, .1]]], ['#2f7a3f', .018, [[-.2, -.05], [-.5, .2], [-.74, .5], [-.8, .8]]],
      ['#2a2a31', .014, [[.3, .42], [.56, .28], [.82, .3]]], ['#d08a1c', .014, [[-.42, -.3], [-.1, -.42], [.2, -.2]]]];
    const dots = new Map(); for (const [col, wd, pts] of routes) { line('map_route', 'cloth', pts.map(p => P(...p)), wd, col, yl - .002); for (const p of pts) dots.set(p.join(), p); }
    for (const p of dots.values()) { const q = P(...p); flat('map_station_ring', 'cloth', new THREE.CircleGeometry(.022, 14), '#2a1a1f', B2T([q[0], yl - .003, q[1]]), { mat: 'ink_flat' }); flat('map_station', 'cloth', new THREE.CircleGeometry(.013, 14), '#fff8e6', B2T([q[0], yl - .004, q[1]]), { mat: 'paper' }); }
    const cr = P(-.76, .7); seg('map_compass', 'cloth', [cr[0], cr[1] - .08], [cr[0], cr[1] + .1], .008, '#6a4a2c', yl - .002); seg('map_compass', 'cloth', [cr[0] - .06, cr[1]], [cr[0] + .06, cr[1]], .008, '#6a4a2c', yl - .002); flat('map_compass_ring', 'cloth', new THREE.RingGeometry(.04, .048, 20), '#6a4a2c', B2T([cr[0], yl - .002, cr[1]]), { mat: 'ink_flat' });
    for (const k of [0, 1, 2, 3]) seg('map_scale_bar', 'cloth', P(.5 + k * .1, -.84), P(.6 + k * .1, -.84), .014, k % 2 ? '#fff8e6' : '#2a1a1f', yl - .002);
    rod('map_cord', 'cloth', .004, [x - .3, YB - .05, z + h / 2 + .06], [x, YB - .05, 2.53], '#3a2a20', { cast: false }); rod('map_cord', 'cloth', .004, [x + .3, YB - .05, z + h / 2 + .06], [x, YB - .05, 2.53], '#3a2a20', { cast: false }); }

  // ---- rug with a border, under the mark and the desk front -----------------------------------------------------------------
  { const c = [-.35, .45], w = 3.3, d = 2.1; box('rug_border', 'cloth', w, d, .012, [c[0], c[1], 0], '#d2a443', { cast: false, mat: 'carpet' }); box('rug_band', 'cloth', w - .12, d - .12, .003, [c[0], c[1], .012], '#283a5e', { cast: false, mat: 'carpet' });
    box('rug_field', 'cloth', w - .36, d - .36, .003, [c[0], c[1], .015], '#7e2626', { cast: false, mat: 'carpet' }); box('rug_inner_line', 'cloth', w - .6, d - .6, .002, [c[0], c[1], .018], '#d2a443', { cast: false, mat: 'carpet' }); box('rug_inner_field', 'cloth', w - .66, d - .66, .002, [c[0], c[1], .02], '#8a2c2a', { cast: false, mat: 'carpet' });
    box('rug_medallion', 'cloth', .62, .62, .002, [c[0], c[1], .022], '#d2a443', { cast: false, rot: PI / 4, mat: 'carpet' }); box('rug_medallion_core', 'cloth', .44, .44, .002, [c[0], c[1], .024], '#283a5e', { cast: false, rot: PI / 4, mat: 'carpet' });
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) box('rug_corner', 'cloth', .2, .2, .002, [c[0] + sx * (w / 2 - .55), c[1] + sy * (d / 2 - .55), .022], '#d2a443', { cast: false, rot: PI / 4, mat: 'carpet' });
    for (const sx of [-1, 1]) for (let k = 0; k < 26; k++) box('rug_fringe', 'cloth', .07, .02, .006, [c[0] + sx * (w / 2 + .035), c[1] - d / 2 + .04 + k * (d - .08) / 25, 0], '#efe0b8', { cast: false }); }

  // ---- the desk: 1.7 x 0.8 x 0.76 centred [0.55, 0.9]; drawers and knobs face the camera, leather top --------------------------
  const DX = .55, DY = .9, T = .76;
  box('desk_top', 'wood', 1.7, .8, .05, [DX, DY, .695], C.woodD, { mat: 'wood_grain' }); box('desk_top_moulding', 'wood', 1.66, .76, .02, [DX, DY, .675], C.wood);
  box('desk_leather', 'cloth', 1.46, .6, .015, [DX, DY, .745], C.leather, { cast: false, mat: 'leather' });
  for (const [w, d, yy, xx] of [[1.46, .012, DY - .28, DX], [1.46, .012, DY + .28, DX], [.012, .56, DY, DX - .71], [.012, .56, DY, DX + .71]]) box('desk_leather_gilt', 'metal', w, d, .002, [xx, yy, .76], C.brass, { cast: false, mat: 'metal' });
  for (const s of [-1, 1]) { const px = DX + s * .58; box('desk_plinth', 'wood', .5, .76, .08, [px, DY, 0], C.woodD); box('desk_pedestal', 'wood', .46, .72, .595, [px, DY, .08], C.wood, { mat: 'wood_grain' });
    for (let k = 0; k < 3; k++) { const z = .105 + k * .19; box('desk_drawer', 'wood', .4, .02, .165, [px, DY - .365, z], C.woodL, { mat: 'wood_grain' }); box('desk_drawer_bead', 'wood', .34, .008, .11, [px, DY - .378, z + .0275], C.woodP); ball('desk_knob', 'metal', .022, [px, DY - .395, z + .0825], C.brass, { mat: 'metal' }); }
    box('desk_side_panel', 'wood', .012, .56, .44, [px + s * .236, DY, .16], C.woodL, { cast: false }); box('desk_back_panel', 'wood', .36, .012, .44, [px, DY + .366, .16], C.woodL, { cast: false }); }
  box('desk_centre_drawer', 'wood', .66, .02, .1, [DX, DY - .365, .575], C.woodL, { mat: 'wood_grain' }); for (const s of [-1, 1]) ball('desk_knob', 'metal', .02, [DX + s * .18, DY - .392, .625], C.brass, { mat: 'metal' });
  box('desk_modesty_panel', 'wood', .7, .03, .5, [DX, DY + .3, .18], C.woodP);
  // the boss's chair behind the desk
  { const cx = DX + .05, cy = DY + .78; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) cyl('chair_leg', 'wood', .025, .44, [cx + sx * .21, cy + sy * .2, 0], C.woodD, { r2: .03 });
    box('chair_seat_frame', 'wood', .52, .5, .05, [cx, cy, .43], C.woodD); box('chair_seat', 'cloth', .46, .44, .05, [cx, cy, .47], '#7a2f2a', { mat: 'leather' });
    for (const sx of [-1, 1]) { box('chair_back_post', 'wood', .05, .05, .78, [cx + sx * .235, cy + .225, .48], C.woodD); box('chair_arm', 'wood', .05, .4, .035, [cx + sx * .255, cy + .02, .68], C.woodD); cyl('chair_arm_post', 'wood', .02, .2, [cx + sx * .255, cy - .15, .48], C.woodD); ball('chair_finial', 'wood', .035, [cx + sx * .235, cy + .225, 1.28], C.woodD); }
    box('chair_back', 'cloth', .42, .05, .56, [cx, cy + .225, .62], '#7a2f2a', { mat: 'leather' }); box('chair_back_rail', 'wood', .52, .055, .07, [cx, cy + .225, 1.18], C.woodD);
    for (const sx of [-1, 0, 1]) for (const zz of [.78, 1.0]) ball('chair_stud', 'metal', .012, [cx + sx * .13, cy + .198, zz], C.brass, { cast: false, mat: 'metal' }); }

  // ---- on the desk -----------------------------------------------------------------------------------------------------------
  // the letter (hero prop): cream sheet 0.3 x 0.21, letterhead rule, written lines, a signature, a red wax seal
  const LT = [.15, .75, .77], LR = .06;
  const letter = new THREE.Group(); letter.position.copy(B2T([LT[0], LT[1], T + .001])); letter.rotation.y = LR; scene.add(letter); letter.name = 'letter';
  { const L = (name, w, d, x, y, col, k = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), basic(col)); m.rotation.x = -PI / 2; m.position.set(x, .003 + k * .0008, -y); return add(m, name, 'cloth', { parent: letter, cast: false, mat: k ? 'ink_flat' : 'paper' }); };
    const sh = new THREE.Mesh(new THREE.BoxGeometry(.3, .003, .21), basic('#fff6dc')); sh.position.y = .0015; add(sh, 'letter_sheet', 'cloth', { parent: letter, mat: 'paper' });
    L('letter_head', .13, .017, 0, .078, '#8c2a24'); L('letter_head_rule', .25, .004, 0, .062, '#2a1a1f');
    [[.24, 0], [.25, 0], [.22, -.012], [.25, 0], [.16, -.045]].forEach(([w, x], i) => L('letter_line', w, .008, x, .04 - i * .021, '#3a2a30'));
    L('letter_signature', .075, .011, .075, -.078, '#1f3f8a').rotation.z = .12; L('letter_signature', .03, .007, .045, -.086, '#1f3f8a').rotation.z = -.3;
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(.02, .023, .006, 14), toon('#b3261e')); seal.position.set(-.1, .006, .078); add(seal, 'letter_seal', 'cloth', { parent: letter, cast: false, mat: 'wax' }); }
  // the stamp imprint (appears when the stamp has landed), the stamp and its ink pad
  const SREST = [.56, .66, T], SHIT = [LT[0] + .075, LT[1] - .02, T + .004];
  const imprint = new THREE.Group(); imprint.position.copy(B2T([SHIT[0], SHIT[1], T + .0048])); imprint.rotation.y = LR + .18; imprint.visible = false; scene.add(imprint);
  { const I = (w, d, x, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), basic('#c4261c')); m.rotation.x = -PI / 2; m.position.set(x, 0, -y); add(m, 'stamp_imprint', 'cloth', { parent: imprint, cast: false, mat: 'ink_flat' }); };
    I(.085, .006, 0, .022); I(.085, .006, 0, -.022); I(.006, .05, -.0395, 0); I(.006, .05, .0395, 0); I(.055, .012, 0, 0); }
  const stamp = new THREE.Group(); stamp.position.copy(B2T(SREST)); scene.add(stamp); stamp.name = 'stamp';
  { const P = (m, name, role, y) => { m.position.y = y; return add(m, name, role, { parent: stamp }); };
    P(new THREE.Mesh(new THREE.BoxGeometry(.09, .012, .055), toon('#3a1210')), 'stamp_rubber', 'cloth', .006); P(new THREE.Mesh(new THREE.BoxGeometry(.1, .022, .062), toon(C.woodL)), 'stamp_block', 'wood', .023);
    P(new THREE.Mesh(new THREE.CylinderGeometry(.014, .02, .06, 12), toon(C.woodD)), 'stamp_stem', 'wood', .064); P(new THREE.Mesh(new THREE.SphereGeometry(.03, 14, 10), toon(C.woodD)), 'stamp_knob', 'wood', .105); }
  box('ink_pad_tin', 'metal', .14, .1, .02, [.74, .66, T], '#3d4652', { rot: -.15, mat: 'metal' }); box('ink_pad', 'cloth', .12, .08, .006, [.74, .66, T + .02], '#b3261e', { rot: -.15, cast: false });
  // inkwell stand with a quill
  box('inkstand', 'wood', .24, .13, .022, [.48, 1.08, T], C.woodD); box('inkstand_groove', 'wood', .2, .025, .004, [.48, 1.04, T + .022], C.wood, { cast: false });
  for (const [x, col] of [[.42, '#1a2a5a'], [.54, '#5a1a1a']]) { cyl('inkwell', 'glass', .03, .045, [x, 1.1, T + .022], col, { mat: 'glass' }); cyl('inkwell_lid', 'metal', .024, .012, [x, 1.1, T + .067], C.brass, { r2: .015, mat: 'metal' }); }
  rod('quill_shaft', 'cloth', .004, [.42, 1.1, T + .07], [.3, 1.19, T + .36], '#f6efe0', { cast: false });
  { const q = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), toon('#fbf6ea')); q.scale.set(.5, 2.4, .12); const a = B2T([.42, 1.1, T + .07]), b = B2T([.3, 1.19, T + .36]), d = b.clone().sub(a); q.position.copy(a).addScaledVector(d, .68); q.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); add(q, 'quill_feather', 'cloth', { cast: false }); }
  rod('pen', 'wood', .006, [.4, 1.04, T + .03], [.58, 1.04, T + .03], '#2a1a1f', { r2: .003, cast: false });
  // the oil desk lamp: brass foot and font, burner, glowing globe (role lamp), glass chimney
  const LP = [1.16, 1.1, T], LAMP = [LP[0], LP[1], T + .265];
  cyl('desk_lamp_foot', 'metal', .085, .025, LP, C.brass, { r2: .07, mat: 'metal' }); cyl('desk_lamp_stem', 'metal', .02, .07, [LP[0], LP[1], T + .025], C.brass, { mat: 'metal' });
  ball('desk_lamp_font', 'metal', .07, [LP[0], LP[1], T + .13], C.brass, { sq: .72, mat: 'metal' }); cyl('desk_lamp_burner', 'metal', .035, .04, [LP[0], LP[1], T + .175], '#8a6a2a', { r2: .05, mat: 'metal' });
  rod('desk_lamp_wick_knob', 'metal', .006, [LP[0], LP[1], T + .195], [LP[0] + .075, LP[1] - .02, T + .195], C.brass, { cast: false }); ball('desk_lamp_wick_wheel', 'metal', .013, [LP[0] + .08, LP[1] - .02, T + .195], C.brass, { cast: false, mat: 'metal' });
  flat('desk_lamp_globe', 'lamp', new THREE.SphereGeometry(.078, 18, 12), C.glow, B2T(LAMP));
  { const h = flat('desk_lamp_halo', 'lamp', new THREE.SphereGeometry(.115, 18, 12), '#ffd27a', B2T(LAMP), { m: { transparent: true, opacity: .28, depthWrite: false } }); h.userData.noExport = true; }
  cyl('desk_lamp_chimney', 'glass', .03, .16, [LP[0], LP[1], T + .33], '#fff3cf', { r2: .024, basic: true, cast: false, mat: 'glass' }).material.setValues({ transparent: true, opacity: .45, depthWrite: false });
  // a stack of ledgers, a brass call bell, a paper tray, a pocket watch
  { const cols = ['#7a2f2a', '#2f4f6a', '#3f5f3a', '#5a3a6a'], rots = [.1, -.12, .2, -.04]; let z = T;
    cols.forEach((col, i) => { const w = .31 - i * .02, d = .23 - i * .012, h = .045 + (i % 2) * .012; box('ledger_stack_pages', 'cloth', w - .012, d - .012, h - .014, [1.12, .68, z + .007], '#efe3c2', { rot: rots[i], cast: false, mat: 'paper' }); box('ledger_stack_cover', 'cloth', w, d, .007, [1.12, .68, z], col, { rot: rots[i], cast: false, mat: 'leather' }); box('ledger_stack_cover', 'cloth', w, d, .007, [1.12, .68, z + h - .007], col, { rot: rots[i], mat: 'leather' });
      const sp = box('ledger_stack_spine', 'cloth', .012, d, h, [1.12 - (w / 2 - .006) * Math.cos(rots[i]), .68 - (w / 2 - .006) * Math.sin(rots[i]), z], col, { rot: rots[i], cast: false, mat: 'leather' }); z += h; });
    box('ledger_stack_label', 'cloth', .1, .06, .002, [1.12, .68, z], '#efe3c2', { rot: rots[3], cast: false, mat: 'paper' }); }
  cyl('bell_base', 'wood', .055, .012, [.84, 1.1, T], C.woodD); ball('bell_dome', 'metal', .045, [.84, 1.1, T + .012], C.brass, { sq: .8, mat: 'metal' }); cyl('bell_button', 'metal', .008, .02, [.84, 1.1, T + .045], '#2a2a31', { cast: false });
  box('paper_tray', 'wood', .3, .23, .012, [-.05, 1.1, T], C.wood); for (const [w, d, x, y] of [[.3, .012, -.05, .99], [.3, .012, -.05, 1.21], [.012, .23, -.2, 1.1], [.012, .23, .1, 1.1]]) box('paper_tray_side', 'wood', w, d, .05, [x, y, T], C.wood);
  for (let k = 0; k < 4; k++) box('paper_tray_sheet', 'cloth', .25, .19, .006, [-.05 + (k % 2) * .008, 1.1, T + .012 + k * .006], k % 2 ? '#f3e7c6' : '#e6d6ae', { rot: (k - 1.5) * .05, cast: false, mat: 'paper' });
  cyl('pocket_watch', 'metal', .028, .008, [-.12, .7, T], C.brass, { mat: 'metal', cast: false }); cyl('pocket_watch_face', 'glass', .022, .002, [-.12, .7, T + .008], '#fbf3df', { basic: true, cast: false, mat: 'clock_face' });
  for (let k = 0; k < 7; k++) ball('pocket_watch_chain', 'metal', .005, [-.15 - k * .016, .7 + Math.sin(k * 1.1) * .02 + k * .012, T + .004], C.brass, { cast: false, mat: 'metal' });

  // ---- ceiling lamp over the desk: rose, rod, enamel shade, glowing globe -------------------------------------------------------
  const CL = [.35, .85, 2.38];
  cyl('ceiling_rose', 'metal', .09, .03, [CL[0], CL[1], H - .03], '#a8842f', { cast: false, mat: 'metal', basic: true }); cyl('ceiling_lamp_rod', 'metal', .012, .5, [CL[0], CL[1], H - .53], '#a8842f', { cast: false, mat: 'metal', basic: true });
  cyl('ceiling_lamp_shade', 'metal', .32, .2, [CL[0], CL[1], 2.44], '#2c6a4c', { r2: .07, seg: 24, cast: false, basic: true }); cyl('ceiling_lamp_shade_rim', 'metal', .325, .015, [CL[0], CL[1], 2.43], C.brass, { seg: 24, cast: false, mat: 'metal' });
  cyl('ceiling_lamp_shade_inside', 'lamp', .3, .004, [CL[0], CL[1], 2.438], '#fff3cf', { seg: 24, basic: true, cast: false });
  cyl('ceiling_lamp_font', 'metal', .06, .1, [CL[0], CL[1], 2.62], '#a8842f', { r2: .04, cast: false, mat: 'metal', basic: true });
  flat('ceiling_lamp_globe', 'lamp', new THREE.SphereGeometry(.105, 18, 12), C.glow, B2T(CL));
  { const h = flat('ceiling_lamp_halo', 'lamp', new THREE.SphereGeometry(.16, 18, 12), '#ffd27a', B2T(CL), { m: { transparent: true, opacity: .25, depthWrite: false } }); h.userData.noExport = true; }
  // wall sconces on the side walls near the open side
  for (const s of [-1, 1]) { const x = s * 2.6, y = .35, z = 1.95; box('sconce_plate', 'metal', .03, .1, .2, [x - s * .015, y, z - .1], C.brass, { cast: false, mat: 'metal' }); rod('sconce_arm', 'metal', .01, [x - s * .02, y, z - .03], [x - s * .17, y, z - .03], C.brass, { cast: false });
    cyl('sconce_cup', 'metal', .03, .04, [x - s * .17, y, z - .03], C.brass, { r2: .045, cast: false, mat: 'metal' }); flat('sconce_globe', 'lamp', new THREE.SphereGeometry(.065, 14, 10), C.glow, B2T([x - s * .17, y, z + .07])); }

  // ---- left wall: bookshelf with individual ledgers, a model engine on top; coat stand with a top hat; umbrella stand -----------
  { const bx = X0 + .05, dp = .32, y0 = .75, y1 = 1.95, hh = 2.05, cx = bx + dp / 2, cols = ['#7a2f2a', '#2f4f6a', '#3f5f3a', '#5a3a6a', '#8a6a2a', '#6a2f3f', '#2f5c57', '#4a3424', '#a3472e', '#39456e'];
    box('bookshelf_back', 'wood', .02, y1 - y0, hh, [bx + .01, (y0 + y1) / 2, 0], C.woodD, { cast: false }); for (const y of [y0 + .02, y1 - .02]) box('bookshelf_side', 'wood', dp, .04, hh, [cx, y, 0], C.wood);
    box('bookshelf_plinth', 'wood', dp + .02, y1 - y0 + .04, .1, [cx + .01, (y0 + y1) / 2, 0], C.woodD); box('bookshelf_cornice', 'wood', dp + .06, y1 - y0 + .1, .07, [cx + .02, (y0 + y1) / 2, hh], C.woodD);
    const zs = [.1, .5, .88, 1.26, 1.64]; let bi = 0;
    zs.forEach((z, si) => { box('bookshelf_shelf', 'wood', dp, y1 - y0 - .08, .03, [cx, (y0 + y1) / 2, z], C.wood, { cast: false }); let y = y0 + .05;
      while (y < y1 - .1) { const r = rnd(++bi), th = .035 + rnd(bi + 50) * .04, bh = .24 + rnd(bi + 90) * .1, col = cols[Math.floor(rnd(bi + 7) * cols.length)];
        if (r < .09 && y < y1 - .3) { for (let k = 0; k < 3; k++) box('ledger_flat', 'cloth', .22, .26, .04, [cx + .03, y + .14, z + .03 + k * .04], cols[(bi + k * 3) % cols.length], { cast: false, mat: 'leather' }); y += .3; continue; }
        if (y + th > y1 - .05) break;
        box('ledger', 'cloth', .22, th, bh, [cx + .03 - rnd(bi + 3) * .03, y + th / 2, z + .03], col, { cast: false, mat: 'leather' });
        const fx = cx + .141 - rnd(bi + 3) * .03; if (bi % 2) box('ledger_label', 'cloth', .004, th * .7, .06, [fx, y + th / 2, z + .03 + bh * .55], '#efe3c2', { cast: false, mat: 'paper' }); if (bi % 3 === 0) for (const kz of [.12, .82]) box('ledger_band', 'metal', .004, th, .012, [fx, y + th / 2, z + .03 + bh * kz], C.brass, { cast: false, mat: 'metal' });
        y += th + .004; } });
    // a model engine on top of the shelf
    const my = 1.35, mz = hh + .07; box('model_engine_base', 'wood', .14, .5, .02, [cx, my, mz], C.woodD, { cast: false }); const b = cyl('model_engine_boiler', 'metal', .045, .22, [cx, my + .06, mz + .06 - .11 + .045], '#2f5c47', { cast: false }); b.rotation.x = PI / 2;
    box('model_engine_cab', 'metal', .1, .1, .12, [cx, my - .1, mz + .03], '#2f5c47', { cast: false }); box('model_engine_cab_roof', 'metal', .12, .13, .012, [cx, my - .1, mz + .15], C.iron, { cast: false }); cyl('model_engine_chimney', 'metal', .014, .07, [cx, my + .13, mz + .11], C.iron, { r2: .02, cast: false }); ball('model_engine_dome', 'metal', .02, [cx, my + .04, mz + .115], C.brass, { cast: false, mat: 'metal' });
    for (const yy of [-.1, .0, .1]) for (const s of [-1, 1]) { const w = cyl('model_engine_wheel', 'metal', .028, .012, [cx + s * .05, my + yy, mz + .02 + .028 - .006], '#9c2f28', { cast: false }); w.rotation.z = PI / 2; } }
  { const p = [-2.15, 2.2]; cyl('coat_stand_foot', 'wood', .2, .04, [p[0], p[1], 0], C.woodD, { r2: .16 }); cyl('coat_stand_pole', 'wood', .028, 1.86, [p[0], p[1], .04], C.woodD); ball('coat_stand_finial', 'wood', .04, [p[0], p[1], 1.93], C.woodD);
    for (let k = 0; k < 4; k++) { const a = k * PI / 2 + PI / 4; rod('coat_stand_hook', 'wood', .012, [p[0], p[1], 1.68], [p[0] + Math.cos(a) * .17, p[1] + Math.sin(a) * .17, 1.8], C.woodD); ball('coat_stand_hook_knob', 'wood', .02, [p[0] + Math.cos(a) * .17, p[1] + Math.sin(a) * .17, 1.8], C.woodD); }
    const hx = p[0] + .15, hy = p[1] - .15; cyl('top_hat_brim', 'cloth', .15, .014, [hx, hy, 1.8], '#1b1a22', { seg: 22, mat: 'felt' }); cyl('top_hat_crown', 'cloth', .095, .19, [hx, hy, 1.814], '#1b1a22', { r2: .105, seg: 22, mat: 'felt' }); cyl('top_hat_band', 'cloth', .098, .035, [hx, hy, 1.816], '#9c2f28', { seg: 22, cast: false });
    const coat = new THREE.Mesh(new THREE.CylinderGeometry(.09, .2, 1.0, 12), toon('#27324a')); coat.scale.z = .45; coat.rotation.y = -PI / 4; coat.position.copy(B2T([p[0] + .13, p[1] + .13, 1.22])); add(coat, 'hanging_coat', 'cloth', { mat: 'wool' });
    box('hanging_coat_collar', 'cloth', .16, .07, .1, [p[0] + .13, p[1] + .13, 1.7], '#1d2638', { rot: PI / 4, cast: false });
    const sc = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .7, 8), toon('#b3261e')); sc.scale.z = .4; sc.position.copy(B2T([p[0] - .14, p[1] - .14, 1.42])); add(sc, 'hanging_scarf', 'cloth', {});
    const u = [-1.92, 2.42]; cyl('umbrella_stand', 'metal', .12, .5, [u[0], u[1], 0], '#8a6a2a', { r2: .14, mat: 'metal' }); cyl('umbrella_stand_rim', 'metal', .145, .02, [u[0], u[1], .5], C.brass, { mat: 'metal', cast: false });
    rod('umbrella', 'cloth', .03, [u[0], u[1], .05], [u[0] + .04, u[1] - .03, .85], '#1b1a22', { r2: .018 }); rod('umbrella_handle', 'wood', .012, [u[0] + .04, u[1] - .03, .85], [u[0] + .05, u[1] - .04, 1.0], C.woodL); rod('umbrella_handle', 'wood', .012, [u[0] + .05, u[1] - .04, 1.0], [u[0] + .12, u[1] - .06, .96], C.woodL);
    rod('walking_cane', 'wood', .012, [u[0] - .03, u[1] - .02, .05], [u[0] - .1, u[1] - .06, .95], '#3a2a20'); ball('walking_cane_knob', 'metal', .028, [u[0] - .1, u[1] - .06, .97], C.brass, { mat: 'metal' }); }

  // ---- right wall: filing drawers with label holders, a globe, a portrait, the rolled-map basket, the stove ---------------------
  { const dp = .5, y0 = .7, y1 = 1.75, hh = 1.26, fx = X1 - .05 - dp, cx = X1 - .05 - dp / 2, cy = (y0 + y1) / 2;
    box('filing_plinth', 'wood', dp + .02, y1 - y0 + .04, .08, [cx - .01, cy, 0], C.woodD); box('filing_carcass', 'wood', dp, y1 - y0, hh - .08, [cx, cy, .08], C.wood, { mat: 'wood_grain' }); box('filing_top', 'wood', dp + .05, y1 - y0 + .06, .035, [cx - .01, cy, hh], C.woodD);
    const nc = 3, nr = 4, dw = (y1 - y0 - .06) / nc, dh = (hh - .14) / nr;
    for (let c = 0; c < nc; c++) for (let r = 0; r < nr; r++) { const y = y0 + .03 + (c + .5) * dw, z = .11 + r * dh;
      box('filing_drawer', 'wood', .02, dw - .03, dh - .03, [fx - .01, y, z], C.woodL, { cast: false, mat: 'wood_grain' }); box('filing_label_holder', 'metal', .006, .15, .06, [fx - .023, y, z + dh * .5], C.brass, { cast: false, mat: 'metal' }); box('filing_label', 'cloth', .003, .125, .04, [fx - .0275, y, z + dh * .5 + .01], '#f3e7c6', { cast: false, mat: 'paper' });
      rod('filing_handle', 'metal', .008, [fx - .035, y - .05, z + dh * .22], [fx - .035, y + .05, z + dh * .22], C.brass, { cast: false }); }
    // a globe and a letter box on top
    const g = [cx - .02, y0 + .25]; cyl('globe_foot', 'wood', .09, .025, [g[0], g[1], hh + .035], C.woodD, { r2: .06 }); cyl('globe_stem', 'wood', .015, .09, [g[0], g[1], hh + .06], C.woodD); ball('globe_ball', 'stone', .15, [g[0], g[1], hh + .3], '#4f8fb0');
    for (const [a, b, r] of [[.5, .5, .06], [2.2, -.2, .07], [3.6, .6, .05], [5.0, -.5, .06], [1.2, -.7, .04], [4.3, .1, .05]]) { const m = ball('globe_land', 'stone', r, [g[0] + Math.cos(a) * Math.cos(b) * .118, g[1] + Math.sin(a) * Math.cos(b) * .118, hh + .3 + Math.sin(b) * .118], '#c9a85a', { cast: false }); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.165, .008, 8, 28), toon(C.brass)); ring.position.copy(B2T([g[0], g[1], hh + .3])); ring.rotation.y = PI / 2; ring.rotation.x = .4; add(ring, 'globe_meridian', 'metal', { cast: false, mat: 'metal' });
    box('deed_box', 'metal', .3, .22, .16, [cx, y1 - .22, hh + .035], '#27324a', { rot: .1, mat: 'metal' }); box('deed_box_lid', 'metal', .31, .23, .02, [cx, y1 - .22, hh + .195], '#1d2638', { rot: .1 }); rod('deed_box_handle', 'metal', .008, [cx - .06, y1 - .22, hh + .225], [cx + .06, y1 - .22, hh + .225], C.brass, { cast: false });
    // portrait above
    const pz = 2.0, px = X1 - .03; box('portrait_frame', 'wood', .04, .56, .7, [px - .02, cy, pz - .35], '#b8902f', { cast: false, mat: 'metal' }); box('portrait_canvas', 'cloth', .01, .46, .6, [px - .042, cy, pz - .3], '#3a2a20', { cast: false, basic: true });
    const PF = (name, r, y, z, col, sx = 1, sy = 1) => { const m = flat(name, 'cloth', new THREE.CircleGeometry(r, 18), col, B2T([px - .049, y, z]), { mat: 'matte' }); m.rotation.y = -PI / 2; m.scale.set(sx, sy, 1); return m; };
    PF('portrait_shoulders', .17, cy, pz - .26, '#1d2638', 1, .75).position.x -= .0005; PF('portrait_head', .085, cy, pz + .04, '#f1dcc0').position.x -= .001; PF('portrait_whiskers', .075, cy, pz - .02, '#d9d4cc', 1.25, .6).position.x -= .0015; PF('portrait_face', .06, cy, pz + .035, '#f1dcc0').position.x -= .002; PF('portrait_sash', .05, cy + .03, pz - .2, '#b3261e', .5, 2).position.x -= .0025; }
  { const p = [2.22, .42]; cyl('map_basket', 'wood', .15, .5, [p[0], p[1], 0], '#b98a52', { r2: .19, seg: 14, mat: 'wicker' }); for (const z of [.12, .25, .38]) cyl('map_basket_band', 'wood', .165 + z * .08, .02, [p[0], p[1], z], '#8a6238', { seg: 14, cast: false }); cyl('map_basket_rim', 'wood', .2, .03, [p[0], p[1], .49], '#8a6238', { seg: 14 });
    const maps = [[-.06, -.05, -.1, -.06, '#efe3c2'], [.07, -.03, .12, -.03, '#e6d6ae'], [0, .07, .0, .14, '#f3e7c6'], [-.07, .05, -.14, .1, '#dccb9c'], [.05, .06, .1, .1, '#efe3c2'], [0, -.01, .02, -.01, '#e6d6ae']];
    maps.forEach(([ax, ay, bx, by, col], i) => { const zt = .9 + (i % 3) * .08; rod('rolled_map', 'cloth', .032, [p[0] + ax, p[1] + ay, .06], [p[0] + bx, p[1] + by, zt], col, { mat: 'paper' }); if (i % 2 === 0) rod('rolled_map_ribbon', 'cloth', .034, [p[0] + ax + (bx - ax) * .72, p[1] + ay + (by - ay) * .72, .06 + (zt - .06) * .72], [p[0] + ax + (bx - ax) * .76, p[1] + ay + (by - ay) * .76, .06 + (zt - .06) * .76], '#b3261e', { cast: false }); }); }
  { const p = [2.12, 2.14]; for (let k = 0; k < 3; k++) { const a = k / 3 * PI * 2 + .5; rod('stove_leg', 'metal', .02, [p[0] + Math.cos(a) * .2, p[1] + Math.sin(a) * .2, 0], [p[0] + Math.cos(a) * .15, p[1] + Math.sin(a) * .15, .16], C.iron); }
    box('stove_hearth', 'stone', .8, .8, .03, [p[0], p[1], 0], '#6f6a66', { cast: false, mat: 'stone' }); cyl('stove_base', 'metal', .23, .05, [p[0], p[1], .15], C.iron, { mat: 'cast_iron' }); cyl('stove_belly', 'metal', .21, .5, [p[0], p[1], .2], '#33333d', { r2: .25, mat: 'cast_iron' }); cyl('stove_belly_top', 'metal', .25, .2, [p[0], p[1], .7], '#33333d', { r2: .16, mat: 'cast_iron' }); cyl('stove_cap', 'metal', .17, .04, [p[0], p[1], .9], C.iron, { mat: 'cast_iron' });
    cyl('stove_flue', 'metal', .06, H - .94, [p[0], p[1], .94], '#3d3d47', { cast: false, mat: 'cast_iron' }); cyl('stove_flue_collar', 'metal', .075, .05, [p[0], p[1], 1.9], C.iron, { cast: false });
    const a = -2.3, dx = Math.cos(a), dy = Math.sin(a); box('stove_door', 'metal', .2, .03, .2, [p[0] + dx * .235, p[1] + dy * .235, .36], C.iron, { rot: a + PI / 2, cast: false });
    for (const k of [-1, 0, 1]) box('stove_fire_slot', 'lamp', .035, .01, .12, [p[0] + dx * .252 - dy * k * .055, p[1] + dy * .252 + dx * k * .055, .4], '#ff8a2a', { rot: a + PI / 2, basic: true, cast: false });
    const s = [1.55, 2.3]; cyl('coal_scuttle', 'metal', .11, .26, [s[0], s[1], 0], '#8a6a2a', { r2: .16, mat: 'metal' }); for (let k = 0; k < 6; k++) ball('coal', 'stone', .045, [s[0] + Math.cos(k * 1.1) * .07, s[1] + Math.sin(k * 1.1) * .07, .26 + (k % 2) * .02], '#1b1a22', { cast: false }); ball('coal', 'stone', .05, [s[0], s[1], .3], '#1b1a22', { cast: false });
    rod('coal_shovel', 'metal', .008, [s[0] + .2, s[1] + .2, .02], [s[0] + .24, s[1] + .26, .6], C.iron); box('coal_shovel_blade', 'metal', .1, .02, .14, [s[0] + .2, s[1] + .2, .0], C.iron, { rot: .5 }); }
  { const p = [1.72, 1.02]; cyl('waste_basket', 'wood', .11, .3, [p[0], p[1], 0], '#b98a52', { r2: .15, seg: 12, mat: 'wicker' }); cyl('waste_basket_rim', 'wood', .155, .02, [p[0], p[1], .29], '#8a6238', { seg: 12, cast: false }); for (const [dx, dy, dz] of [[.02, .03, .3], [-.05, -.02, .28], [.05, -.05, .27]]) ball('waste_paper', 'cloth', .05, [p[0] + dx, p[1] + dy, dz], '#f3e7c6', { cast: false, mat: 'paper' }); }

  // ---- warm lamp light (preview only, not exported) ----------------------------------------------------------------------------
  for (const [pos, i, d] of [[CL, 5, 9], [LAMP, 1.6, 3.5]]) { const l = new THREE.PointLight('#ffcf8a', i, d, 1.6); l.position.copy(B2T(pos)); l.userData.noExport = true; scene.add(l); }

  // ---- movers -------------------------------------------------------------------------------------------------------------------
  const evs = (((film.places || {}).office || ctx.place || {}).events || []).filter(e => e.obj === 'stamp').sort((a, b) => a.f0 - b.f0);
  const ss = x => { x = Math.max(0, Math.min(1, x)); return x * x * x * (x * (x * 6 - 15) + 10); };
  const stampAt = f => { if (!evs.length) return [0, false]; let v = evs[0].from ?? 0, hit = false; for (const e of evs) { if (f < e.f0) break; const k = e.f1 > e.f0 ? ss((f - e.f0) / (e.f1 - e.f0)) : 1; v = (e.from ?? 0) + ((e.to ?? 1) - (e.from ?? 0)) * k; if (f >= e.f1 && (e.to ?? 1) >= 1) hit = true; } return [v, hit]; };
  const update = (f, t) => {
    hands.m.rotation.z = -t * .9; hands.h.rotation.z = -1.0 - t * .075; hands.p.rotation.z = Math.sin(t * 5.2) * .32;
    const [v, hit] = stampAt(f); stamp.position.copy(B2T([SREST[0] + (SHIT[0] - SREST[0]) * v, SREST[1] + (SHIT[1] - SREST[1]) * v, SREST[2] + (SHIT[2] - SREST[2]) * v + .25 * Math.sin(PI * v)])); stamp.rotation.y = (LR + .18) * v; imprint.visible = hit;
  };
  update(0, 0);
  return { anchors: { letter: LT, desk: [DX, DY, T], lamp: LAMP, window: [WC, YB, (WZ0 + WZ1) / 2], map: MP, clock: CK, stamp: f => { const [v] = stampAt(f); return [SREST[0] + (SHIT[0] - SREST[0]) * v, SREST[1] + (SHIT[1] - SREST[1]) * v, T + .06 + .25 * Math.sin(PI * v)]; }, mark: [-.75, .55, 0], chair: [DX + .05, DY + .78, .5], ceiling_lamp: CL }, update };
}
