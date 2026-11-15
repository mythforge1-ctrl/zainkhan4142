// SET: `junction` for "The Signalman Who Was a Baboon" (South Africa, 1880s, dry veld). ONE long set, the camera travels along +X.
// Layout contract: episodes/baboon-signalman/SET_MAP.md, "Place 1: junction". Plan coordinates: metres, Z up, cameras at negative Y.
// Zones: A signal box (x -3..4)  B main line y=4.4 + branch at x=-5  C boardwalk (x 9..21)  D far veld (y 7..40 and beyond).
// Movers (film.places.junction.events): train (cab x), trolley ([x, y, z]), lever1..lever5 (0..1), signal_arm (0..1).
// Useful numbers for the layout: rail top z=0.29, carriage floor z=1.15 (stand a card at y=4.0 on it), cab footplate z=1.0.
export function build(THREE, scene, film, ctx) {
  const { B2T, toon } = ctx, n = {}, mats = {}, PI = Math.PI;
  const M = (c, two) => mats[c + (two ? '|2' : '')] ||= toon(c, two ? { side: THREE.DoubleSide } : {});
  const add = (m, name, role, o = {}) => { n[name] = (n[name] || 0) + 1; m.name = n[name] > 1 ? `${name}_${String(n[name]).padStart(2, '0')}` : name; m.userData.role = role; if (o.mat) m.userData.mat = o.mat; m.castShadow = o.cast ?? true; m.receiveShadow = true; (o.parent || scene).add(m); return m; };
  const turn = (m, o) => { if (o.rot) m.rotation.y = o.rot; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; return m; };
  // box: w along X, d along Y, h along Z; `at` is the centre of its base (o.c: the centre)
  const box = (name, role, w, d, h, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(col)); m.position.copy(B2T([at[0], at[1], at[2] + (o.c ? 0 : h / 2)])); return add(turn(m, o), name, role, o); };
  // cyl: upright, `at` = base centre; o.axis 'x' | 'y' lays it down and `at` is then its centre
  const cyl = (name, role, r, h, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg ?? 14, 1, false, o.t0 ?? 0, o.tl ?? PI * 2), M(col, !!o.tl)); m.position.copy(B2T([at[0], at[1], at[2] + (o.axis ? 0 : h / 2)])); if (o.axis === 'x') m.rotation.z = PI / 2; if (o.axis === 'y') m.rotation.x = PI / 2; return add(turn(m, o), name, role, o); };
  const sph = (name, role, r, at, col, o = {}) => { const m = new THREE.Mesh(o.rock ? new THREE.DodecahedronGeometry(r, 0) : new THREE.SphereGeometry(r, o.seg ?? 12, o.seg2 ?? 8), M(col)); m.position.copy(B2T(at)); const s = o.s || [1, 1, 1]; m.scale.set(s[0], s[2], s[1]); return add(turn(m, o), name, role, o); };
  const UP = new THREE.Vector3(0, 1, 0);
  const setBeam = (m, a, b) => { const A = B2T(a), Bv = B2T(b), d = Bv.clone().sub(A), L = d.length(); m.position.copy(A).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(UP, d.normalize()); m.scale.y = L; return m; };
  // beam: a bar from a to b, w wide (o.t thick), o.round = a rod
  const beam = (name, role, a, b, w, col, o = {}) => add(setBeam(new THREE.Mesh(o.round ? new THREE.CylinderGeometry(w / 2, w / 2, 1, 8) : new THREE.BoxGeometry(w, 1, o.t ?? w), M(col)), a, b), name, role, o);
  // prism: a convex [y, z] outline pushed along X from x0 to x1
  const prism = (name, role, prof, x0, x1, col, o = {}) => { const v = [], P = (x, p) => { const q = B2T([x, p[0], p[1]]); v.push(q.x, q.y, q.z); }, k = prof.length;
    for (let i = 0; i < k; i++) { const a = prof[i], b = prof[(i + 1) % k]; P(x0, a); P(x1, a); P(x1, b); P(x0, a); P(x1, b); P(x0, b); }
    for (let i = 1; i < k - 1; i++) { P(x0, prof[0]); P(x0, prof[i]); P(x0, prof[i + 1]); P(x1, prof[0]); P(x1, prof[i + 1]); P(x1, prof[i]); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return add(new THREE.Mesh(g, M(col, true)), name, role, o); };
  // inst: many copies in one draw call. list = [{ p: [x, y, z], s: 1 | [sx, sy, sz], rx, ry, rz, c: colour }]
  const inst = (name, role, geo, list, o = {}) => { const m = new THREE.InstancedMesh(geo, toon('#ffffff'), list.length), d = new THREE.Object3D(), c = new THREE.Color();
    list.forEach((it, i) => { d.position.copy(B2T(it.p)); d.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0); const s = it.s ?? 1; Array.isArray(s) ? d.scale.set(s[0], s[2], s[1]) : d.scale.setScalar(s); d.updateMatrix(); m.setMatrixAt(i, d.matrix); m.setColorAt(i, c.set(it.c || o.col || '#ffffff')); });
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.frustumCulled = false; return add(m, name, role, o); };
  const grp = (name, at, parent) => { const g = new THREE.Group(); g.name = name; g.position.copy(B2T(at)); (parent || scene).add(g); return g; };
  const glow = (name, geo, col, at, o = {}) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col })); m.position.copy(B2T(at)); return add(turn(m, o), name, 'lamp', { cast: false, ...o }); };
  let seed = 20261110; const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const R = (a, b) => a + (b - a) * rnd(), pick = a => a[Math.floor(rnd() * a.length)];
  // planked surfaces: boards over a dark backing, so the gaps read as plank lines
  const planksX = (name, role, x0, x1, y, z0, z1, cols, o = {}) => { const k = Math.max(1, Math.round((x1 - x0) / (o.pw ?? .2))), w = (x1 - x0) / k; for (let i = 0; i < k; i++) box(name, role, w - .014, o.t ?? .05, z1 - z0, [x0 + (i + .5) * w, y, z0], cols[i % cols.length], o); };
  const planksY = (name, role, y0, y1, x, z0, ztop, cols, o = {}) => { const k = Math.max(1, Math.round((y1 - y0) / (o.pw ?? .2))), w = (y1 - y0) / k; for (let i = 0; i < k; i++) { const y = y0 + (i + .5) * w, z1 = typeof ztop === 'function' ? ztop(y) : ztop; box(name, role, o.t ?? .05, w - .014, z1 - z0, [x, y, z0], cols[i % cols.length], o); } };

  // ---------- colours (reference board: warm orange earth, chunky ballast, dark sleepers, saturated green furniture) ----------
  const C = { earth: '#dc8a4c', earth2: '#cf7a3e', bed: '#75665f', sleeper: '#4a3226', rail: '#4d5664', railTop: '#9eabb9', iron: '#2b2a30', rust: '#6b3f2c',
    green: '#22a057', green2: '#1c8a4a', greenD: '#15603a', tin: '#a9b6bb', tinD: '#86949b', wood: '#a8733f', wood2: '#96642f', woodD: '#5f3d22', cream: '#efe2bd',
    car: '#84301f', car2: '#93392a', carD: '#4a1a12', inside: '#3a2018', brass: '#e2b23c', red: '#d2372c', blue: '#2f62c8', yellow: '#f0c232', white: '#f1ece0', black: '#222127',
    board: '#b98a55', board2: '#a97a48', boardD: '#5a3c25', rock: '#b9542a', rock2: '#9c4424', scrub: '#8f9a4a', leaf: '#5f8f3c', leaf2: '#74a148', aloe: '#5f9c7c' };
  const PEB = ['#8c4a3a', '#a9a29a', '#6e6a70', '#c9b59a', '#7a8796', '#b0694a', '#5d5350', '#9a7b66'];
  const RAIL_Z = .17, RAIL_TOP = .29, YC = 4.4, GA = .535;

  // ---------- ground: orange earth with a hole for the boardwalk (its planks sit flush at z = 0) ----------
  const ground = (x0, x1, y0, y1) => box('ground', 'ground', x1 - x0, y1 - y0, .5, [(x0 + x1) / 2, (y0 + y1) / 2, -.5], C.earth, { cast: false, mat: 'dirt' });
  ground(-360, 360, -360, -2.5); ground(-360, 360, 3.2, 360); ground(-360, 9, -2.5, 3.2); ground(21, 360, -2.5, 3.2);
  for (let i = 0; i < 46; i++) { const x = R(-70, 80), y = rnd() < .3 ? R(-14, -3.2) : R(6.6, 38); cyl('earth_patch', 'ground', R(1.2, 4.5), .012, [x, y, 0], pick([C.earth2, '#e39a5a', '#c9713a']), { seg: 9, cast: false, mat: 'dirt', rot: R(0, 3) }).scale.x = R(1.2, 2.6); }

  // ---------- B. main line: ballast bed, sleepers, chairs, rails, pebbles ----------
  const bedA = [[2.7, 0], [3.1, .12], [5.7, .12], [6.1, 0]], bedP = [[3.2, 0], [3.2, .12], [5.7, .12], [6.1, 0]];
  prism('ballast_bed', 'ground', bedA, -220, 9, C.bed, { cast: false, mat: 'gravel' }); prism('ballast_bed', 'ground', bedP, 9, 21, C.bed, { cast: false, mat: 'gravel' }); prism('ballast_bed', 'ground', bedA, 21, 220, C.bed, { cast: false, mat: 'gravel' });
  const sl = [], ch = []; for (let x = -119.7; x <= 120; x += .7) { sl.push({ p: [x, YC, .145], c: rnd() < .25 ? '#553a2b' : C.sleeper, ry: R(-.012, .012) }); if (Math.abs(x) < 62) for (const s of [-1, 1]) ch.push({ p: [x, YC + s * GA, .19], c: C.rust }); }
  inst('sleeper', 'wood', new THREE.BoxGeometry(.25, .055, 2.0), sl, { cast: false });
  inst('rail_chair', 'metal', new THREE.BoxGeometry(.13, .05, .2), ch, { cast: false, mat: 'metal' });
  for (const s of [-1, 1]) { box('rail', 'metal', 440, .06, .1, [0, YC + s * GA, RAIL_Z], C.rail, { mat: 'metal' }); box('rail_head', 'metal', 440, .075, .022, [0, YC + s * GA, RAIL_TOP - .022], C.railTop, { cast: false, mat: 'metal' });
    for (let x = -58.5; x <= 60; x += 9) { box('fishplate', 'metal', .42, .1, .06, [x, YC + s * GA, .2], C.rust, { cast: false, mat: 'metal' }); for (const k of [-.14, -.05, .05, .14]) box('fishplate_bolt', 'metal', .03, .12, .03, [x + k, YC + s * GA, .215], C.iron, { cast: false, mat: 'metal' }); } }
  // ballast pebbles: instanced, only where the camera works (x -12..24)
  const peb = []; for (let i = 0; i < 3800; i++) { const x = R(-16, 24), y = R(2.72, 6.08); if (x > 8.9 && x < 21.1 && y < 3.24) continue; if (Math.abs(Math.abs(y - YC) - GA) < .07) continue;
    const z = y < 3.1 ? (y - 2.7) / .4 * .12 : y > 5.7 ? (6.1 - y) / .4 * .12 : .12, r = R(.035, .078); peb.push({ p: [x, y, z + r * .15], s: [r * R(.9, 1.5), r * R(.9, 1.4), r * R(.5, .75)], ry: R(0, 3), c: pick(PEB) }); }
  for (let i = 0; i < 260; i++) { const x = R(-12, 24), y = rnd() < .6 ? R(2.2, 2.75) : R(6.05, 6.6); if (x > 8.8 && x < 21.2 && y < 3.3) continue; if (x > 1.1 && x < 4.1 && y < 3.0) continue; const r = R(.03, .07); peb.push({ p: [x, y, r * .2], s: [r * 1.2, r, r * .6], ry: R(0, 3), c: pick(PEB) }); }
  inst('ballast_pebble', 'stone', new THREE.IcosahedronGeometry(1, 0), peb, { cast: false, mat: 'gravel' });

  // ---------- B. branch line: leaves the main line at the points (x = -5) and curves away to about [-40, 16] ----------
  const bz = (t) => { const p = [[-3.5, YC], [-14, YC], [-28, 9.5], [-40, 16]], u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]]; };
  const br = []; { let acc = 0, last = bz(0); br.push({ p: last, s: 0 }); for (let i = 1; i <= 2000; i++) { const q = bz(i / 2000); acc += Math.hypot(q[0] - last[0], q[1] - last[1]); last = q; br.push({ p: q, s: acc }); } }
  const brAt = s => { let i = br.findIndex(e => e.s >= s); if (i < 1) i = 1; const a = br[i - 1], b = br[i], d = [b.p[0] - a.p[0], b.p[1] - a.p[1]], L = Math.hypot(d[0], d[1]) || 1; return { p: b.p, t: [d[0] / L, d[1] / L], nrm: [-d[1] / L, d[0] / L] }; };
  const brLen = br[br.length - 1].s, nearBranch = (x, y, r) => { if (x > -3 || x < -42) return false; for (let i = 0; i < br.length; i += 25) if (Math.hypot(br[i].p[0] - x, br[i].p[1] - y) < r) return true; return false; };
  { const bsl = [], bch = [];
    for (let s = 0; s < brLen; s += 1.2) { const a = brAt(s), b = brAt(Math.min(brLen, s + 1.25)), off = a.p[1] - YC, yaw = Math.atan2(b.p[1] - a.p[1], b.p[0] - a.p[0]);
      if (off > .9) box('branch_bed', 'ground', 1.3, 3.0, .115, [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2, 0], C.bed, { cast: false, mat: 'gravel', rot: yaw }); }
    for (let s = 0; s < brLen; s += .6) { const a = brAt(s), b = brAt(Math.min(brLen, s + .62)), off = a.p[1] - YC;
      for (const sd of [-1, 1]) { if (off < .09 && sd < 0) continue; if (off < .02) continue; const A = [a.p[0] + a.nrm[0] * GA * sd, a.p[1] + a.nrm[1] * GA * sd], Bq = [b.p[0] + b.nrm[0] * GA * sd, b.p[1] + b.nrm[1] * GA * sd];
        if (sd > 0 && Math.abs(A[1] - (YC + GA)) < .012) continue; if (sd < 0 && Math.abs(A[1] - (YC + GA)) < .1) continue;
        beam('branch_rail', 'metal', [A[0], A[1], RAIL_Z + .05], [Bq[0], Bq[1], RAIL_Z + .05], .06, C.rail, { t: .1, mat: 'metal', cast: false }); beam('branch_rail_head', 'metal', [A[0], A[1], RAIL_TOP - .011], [Bq[0], Bq[1], RAIL_TOP - .011], .075, C.railTop, { t: .022, mat: 'metal', cast: false }); } }
    for (let s = 0; s < brLen; s += .7) { const a = brAt(s), off = a.p[1] - YC, yaw = Math.atan2(a.t[1], a.t[0]); if (off < 2.05) continue; bsl.push({ p: [a.p[0], a.p[1], .145], ry: yaw, c: C.sleeper }); for (const sd of [-1, 1]) bch.push({ p: [a.p[0] + a.nrm[0] * GA * sd, a.p[1] + a.nrm[1] * GA * sd, .19], ry: yaw, c: C.rust }); }
    inst('branch_sleeper', 'wood', new THREE.BoxGeometry(.25, .055, 2.0), bsl, { cast: false }); inst('branch_chair', 'metal', new THREE.BoxGeometry(.13, .05, .2), bch, { cast: false, mat: 'metal' });
    // long timbers under the turnout, where both lines share sleepers
    for (let x = -3.5 - .35; x > -24; x -= .7) { let off = 0; for (const e of br) if (e.p[0] <= x) { off = e.p[1] - YC; break; } if (off >= 2.05) break; if (off > .12) box('points_timber', 'wood', .25, off + .2, .056, [x, YC + 1.0 + off / 2 - .1 + .1, .118], C.sleeper, { cast: false }); }
    prism('points_bed', 'ground', [[5.6, .118], [8.4, .118], [8.8, 0], [5.6, 0]], -23, -6, C.bed, { cast: false, mat: 'gravel' });
    // the point lever (ground throw) with its weight, and the rod to the blades
    box('point_lever_base', 'metal', .5, .3, .08, [-4.6, 2.45, 0], C.iron, { mat: 'metal' }); beam('point_lever', 'metal', [-4.6, 2.45, .08], [-4.25, 2.45, .95], .05, C.white, { mat: 'metal' }); sph('point_lever_weight', 'metal', .13, [-4.2, 2.45, 1.0], C.red, { mat: 'metal' });
    beam('point_rod', 'metal', [-4.6, 2.5, .1], [-4.6, 3.8, .2], .035, C.iron, { round: true, mat: 'metal', cast: false }); box('point_stretcher', 'metal', .06, 1.1, .03, [-4.6, YC, .19], C.iron, { cast: false, mat: 'metal' });
    cyl('point_target_post', 'metal', .03, 1.3, [-5.3, 2.5, 0], C.iron, { mat: 'metal' }); cyl('point_target', 'metal', .2, .03, [-5.3, 2.47, 1.3], C.white, { axis: 'y', mat: 'metal' }); cyl('point_target_dot', 'metal', .09, .035, [-5.3, 2.465, 1.3], C.red, { axis: 'y', mat: 'metal', cast: false });
  }

  // ---------- A. the lever frame, outdoors: 5 levers on a wooden base ----------
  const LX = [-1.4, -1.0, -.6, -.2, .2], LY = .9, LCOL = [C.red, C.blue, C.yellow, C.red, C.blue], levers = [];
  box('lever_base_backing', 'wood', 2.3, .58, .06, [-.6, LY, 0], C.woodD, { cast: false });
  for (const [k, y] of [.71, .9, 1.09].entries()) box('lever_base_plank', 'wood', 2.3, .175, .1, [-.6, y, 0], k % 2 ? C.wood2 : C.wood);
  for (const x of [-1.72, .52]) box('lever_base_end', 'wood', .1, .62, .13, [x, LY, 0], C.woodD);
  box('lever_floor_plate', 'metal', 2.0, .34, .014, [-.6, LY, .1], '#4b4d58', { cast: false, mat: 'metal' });
  LX.forEach((x, i) => {
    cyl('lever_quadrant', 'metal', .34, .024, [x + .085, LY, .1], '#8d949e', { axis: 'x', t0: PI * 40 / 180, tl: PI * 100 / 180, seg: 12, mat: 'metal' });
    const tor = new THREE.Mesh(new THREE.TorusGeometry(.34, .014, 5, 12, PI * 100 / 180), M(C.iron)); tor.position.copy(B2T([x + .085, LY, .1])); tor.rotation.set(0, -PI / 2, PI * 40 / 180, 'YXZ'); add(tor, 'lever_quadrant_rack', 'metal', { mat: 'metal', cast: false });
    box('lever_slot', 'metal', .05, .3, .004, [x, LY, .114], C.black, { cast: false });
    const g = grp('lever' + (i + 1), [x, LY, .1]);
    box('lever_rod', 'metal', .06, .034, .2, [0, 0, 0], C.iron, { parent: g, mat: 'metal' }); box('lever_paint', 'metal', .065, .038, .76, [0, 0, .2], LCOL[i], { parent: g, mat: 'paint' });
    cyl('lever_handle', 'metal', .026, .19, [0, 0, .96], '#cfd6dd', { parent: g, mat: 'metal', seg: 8 }); sph('lever_knob', 'metal', .042, [0, 0, 1.15], '#cfd6dd', { parent: g, mat: 'metal', seg: 8, seg2: 6 });
    beam('lever_catch', 'metal', [0, -.04, .82], [0, -.075, 1.06], .018, '#cfd6dd', { parent: g, round: true, mat: 'metal', cast: false }); beam('lever_catch_rod', 'metal', [0, -.04, .82], [0, -.035, .12], .012, C.iron, { parent: g, round: true, mat: 'metal', cast: false });
    box('lever_number_plate', 'metal', .085, .012, .085, [0, -.026, .58], C.white, { parent: g, cast: false, mat: 'paint' });
    levers.push(g);
  });
  // rodding from the frame to the track, an oil can on the base
  for (const [i, x] of [-1.2, -.4, .1].entries()) { beam('rodding', 'metal', [x, 1.2, .06], [x, 2.55 - i * .08, .06], .03, C.iron, { round: true, mat: 'metal', cast: false }); }
  for (const k of [0, 1, 2]) beam('rodding', 'metal', [-1.2 + k * .65, 2.55 - k * .08, .06], [-4.5, 2.55 - k * .08, .06], .03, C.iron, { round: true, mat: 'metal', cast: false });
  for (const x of [-4, -2.6, -1.3, 0]) box('rodding_stool', 'metal', .08, .32, .05, [x, 2.47, 0], C.rust, { cast: false, mat: 'metal' });
  cyl('oil_can', 'metal', .05, .1, [.42, 1.08, .1], C.brass, { r2: .035, mat: 'metal', seg: 8 }); beam('oil_can_spout', 'metal', [.42, 1.08, .2], [.5, 1.02, .3], .012, C.brass, { round: true, mat: 'metal', cast: false });

  // ---------- A. the signal hut: green boards, tin roof, open front toward the camera ----------
  { const X0 = 1.3, X1 = 3.9, Y0 = 1.1, Y1 = 2.9, HF = 2.6, HB = 2.25, G2 = [C.green, C.green2], zt = y => HF + (HB - HF) * (y - Y0) / (Y1 - Y0);
    box('hut_floor', 'wood', 2.6, 1.8, .06, [2.6, 2.0, 0], C.woodD, { cast: false }); for (let k = 0; k < 9; k++) box('hut_floor_plank', 'wood', 2.56, .185, .02, [2.6, Y0 + .1 + k * .2, .06], k % 2 ? C.wood2 : C.wood, { cast: false });
    for (const x of [X0, X1]) { prism('hut_wall_backing', 'wood', [[Y0, .06], [Y1, .06], [Y1, HB], [Y0, HF]], x - .012, x + .012, C.greenD); planksY('hut_board', 'wood', Y0 + .02, Y1 - .02, x, .06, y => zt(y) - .05, G2, { mat: 'paint' });
      beam('hut_wall_rail', 'wood', [x, Y0, 1.2], [x, Y1, 1.2], .07, C.greenD, { t: .08 }); }
    // back wall with a window toward the track
    for (const [a, b, z0, z1] of [[X0, X1, .06, 1.15], [X0, 1.9, 1.15, 2.0], [3.3, X1, 1.15, 2.0], [X0, X1, 2.0, HB]]) { box('hut_wall_backing', 'wood', b - a, .024, z1 - z0, [(a + b) / 2, Y1, z0], C.greenD); planksX('hut_board', 'wood', a, b, Y1, z0, z1, G2, { mat: 'paint' }); }
    for (const z of [1.13, 1.98]) box('hut_window_frame', 'wood', 1.5, .09, .06, [2.6, Y1, z], C.cream, { mat: 'paint' }); for (const x of [1.88, 2.6, 3.32]) box('hut_window_frame', 'wood', .05, .09, .85, [x, Y1, 1.15], C.cream, { mat: 'paint' });
    for (const [x, y] of [[X0, Y0], [X1, Y0], [X0, Y1], [X1, Y1]]) box('hut_post', 'wood', .12, .12, zt(y) - .02, [x, y, 0], C.greenD);
    box('hut_front_beam', 'wood', 2.72, .1, .12, [2.6, Y0, HF - .16], C.greenD); planksX('hut_valance', 'wood', X0 + .06, X1 - .06, Y0, HF - .42, HF - .16, G2, { mat: 'paint', pw: .2, t: .04 });
    for (let x = X0 + .16; x < X1; x += .2) box('hut_valance_tooth', 'wood', .1, .04, .1, [x, Y0, HF - .42], C.green2, { c: true, rz: PI / 4, mat: 'paint', cast: false });
    // tin roof with corrugation ridges, a stove pipe through it
    const ra = [Y0 - .28, HF + .07 + .28 * (HF - HB) / 1.8], rb = [Y1 + .16, HB + .07 - .16 * (HF - HB) / 1.8];
    beam('hut_roof', 'roof', [2.6, ra[0], ra[1]], [2.6, rb[0], rb[1]], 2.95, C.tin, { t: .04, mat: 'tin' });
    for (let x = X0 - .1; x <= X1 + .12; x += .2) beam('hut_roof_ridge', 'roof', [x, ra[0], ra[1] + .03], [x, rb[0], rb[1] + .03], .07, C.tinD, { t: .03, mat: 'tin', cast: false });
    box('hut_fascia', 'wood', 2.95, .04, .1, [2.6, ra[0], ra[1] - .09], C.cream, { mat: 'paint' });
    cyl('stove', 'metal', .2, .7, [3.5, 2.5, .08], C.black, { mat: 'metal' }); cyl('stove_pipe', 'metal', .06, 2.5, [3.5, 2.5, .78], C.black, { mat: 'metal', seg: 8 }); cyl('stove_pipe_cap', 'metal', .13, .1, [3.5, 2.5, 3.28], C.black, { r2: .02, mat: 'metal', seg: 8 });
    glow('stove_fire', new THREE.PlaneGeometry(.14, .1), '#ff8a2a', [3.5, 2.295, .4]);
    // inside: desk shelf with log book and bell, stool, flags, a hanging lantern
    box('hut_desk', 'wood', 1.5, .4, .05, [2.45, 2.66, .85], C.wood); for (const x of [1.78, 3.1]) beam('hut_desk_bracket', 'wood', [x, 2.86, .5], [x, 2.5, .85], .04, C.woodD);
    box('log_book', 'cloth', .34, .26, .05, [2.2, 2.62, .9], '#7a2a2a', { rot: .2 }); box('log_book_page', 'cloth', .3, .22, .012, [2.2, 2.62, .95], C.cream, { rot: .2, cast: false, mat: 'paper' });
    cyl('desk_bell_base', 'wood', .08, .03, [2.8, 2.62, .9], C.woodD, { seg: 10 }); sph('desk_bell', 'metal', .07, [2.8, 2.62, .95], C.brass, { mat: 'metal', s: [1, 1, .8] }); sph('desk_bell_button', 'metal', .018, [2.8, 2.62, 1.015], C.iron, { mat: 'metal', cast: false });
    cyl('stool_seat', 'wood', .17, .05, [2.2, 2.05, .5], C.wood, { seg: 10 }); for (const a of [0, 2.1, 4.2]) beam('stool_leg', 'wood', [2.2 + Math.cos(a) * .17, 2.05 + Math.sin(a) * .17, .06], [2.2 + Math.cos(a) * .09, 2.05 + Math.sin(a) * .09, .5], .035, C.woodD, { round: true });
    for (const [x, col] of [[1.5, C.red], [1.66, '#2f9a50']]) { beam('flag_stick', 'wood', [x, 2.6, .06], [x - .06, 2.82, 1.3], .028, C.wood2, { round: true }); box('flag_cloth', 'cloth', .1, .1, .46, [x - .05, 2.76, .8], col, { rx: .17, cast: false }); }
    beam('lantern_hook', 'metal', [2.6, Y0 + .12, HF - .2], [2.6, Y0 + .12, HF - .45], .012, C.iron, { round: true, cast: false }); cyl('hut_lantern_cap', 'metal', .07, .05, [2.6, Y0 + .12, HF - .5], C.iron, { r2: .03, mat: 'metal', seg: 8 });
    glow('hut_lantern_glass', new THREE.CylinderGeometry(.055, .055, .13, 8), '#ffe9a8', [2.6, Y0 + .12, HF - .565]); cyl('hut_lantern_base', 'metal', .07, .03, [2.6, Y0 + .12, HF - .66], C.iron, { mat: 'metal', seg: 8 });
    // the key board on the front post: 4 big brass keys on hooks
    box('key_board', 'wood', .62, .04, .48, [1.25, 1.03, 1.06], C.woodD); box('key_board_face', 'wood', .56, .02, .42, [1.25, 1.005, 1.09], '#7c5230', { cast: false }); box('key_board_cap', 'wood', .68, .07, .04, [1.25, 1.02, 1.54], C.woodD);
    for (const [k, x] of [1.04, 1.18, 1.32, 1.46].entries()) { cyl('key_hook', 'metal', .012, .06, [x, .98, 1.44], C.iron, { axis: 'y', seg: 6, mat: 'metal', cast: false });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.042, .013, 6, 12), M(C.brass)); ring.position.copy(B2T([x, .965, 1.4])); add(ring, 'key_ring', 'metal', { mat: 'brass' });
      box('key_shaft', 'metal', .022, .018, .17, [x, .965, 1.19], C.brass, { mat: 'brass' }); box('key_bit', 'metal', .06, .018, .055, [x + .03, .965, 1.2], C.brass, { mat: 'brass' }); box('key_tag', 'metal', .045, .008, .045, [x, .952, 1.3], k % 2 ? C.red : C.white, { cast: false, mat: 'paint' }); }
  }

  // ---------- A. the semaphore signal: 5.5 m post, red arm with a white stripe ----------
  const SP = [-3.2, 2.9];
  cyl('signal_post', 'wood', .11, 5.5, [SP[0], SP[1], 0], C.white, { r2: .075, seg: 8, mat: 'paint' }); cyl('signal_post_base', 'wood', .125, 1.0, [SP[0], SP[1], 0], C.black, { r2: .112, seg: 8, mat: 'paint' });
  cyl('signal_finial', 'metal', .1, .08, [SP[0], SP[1], 5.5], C.black, { seg: 8 }); sph('signal_finial_ball', 'metal', .09, [SP[0], SP[1], 5.66], C.red, { mat: 'paint' }); cyl('signal_finial_spike', 'metal', .03, .32, [SP[0], SP[1], 5.72], C.red, { r2: .004, seg: 6, mat: 'paint' });
  box('signal_lamp', 'metal', .2, .2, .24, [SP[0] + .2, SP[1] - .04, 4.86], C.black, { mat: 'metal' }); glow('signal_lamp_lens', new THREE.CircleGeometry(.07, 12), '#ffe9a8', [SP[0] + .2, SP[1] - .145, 4.98]); cyl('signal_lamp_cap', 'metal', .1, .1, [SP[0] + .2, SP[1] - .04, 5.1], C.black, { r2: .03, seg: 8 });
  for (const s of [-.14, .14]) beam('signal_ladder_rail', 'metal', [SP[0] + s, SP[1] + .75, 0], [SP[0] + s, SP[1] + .16, 4.6], .03, C.iron, { round: true, mat: 'metal' });
  for (let k = 1; k < 13; k++) { const u = k / 13.2; beam('signal_ladder_rung', 'metal', [SP[0] - .14, SP[1] + .75 - .59 * u, 4.6 * u], [SP[0] + .14, SP[1] + .75 - .59 * u, 4.6 * u], .022, C.iron, { round: true, mat: 'metal', cast: false }); }
  box('signal_platform', 'wood', .5, .34, .035, [SP[0], SP[1] + .26, 4.5], C.woodD, { cast: false });
  const arm = grp('signal_arm', [SP[0], SP[1] - .16, 5.0]);
  box('signal_arm_blade', 'wood', 1.5, .03, .27, [-.82, 0, -.135], C.red, { parent: arm, mat: 'paint' }); box('signal_arm_stripe', 'wood', .16, .036, .272, [-1.2, 0, -.136], C.white, { parent: arm, mat: 'paint', cast: false });
  box('signal_arm_tip', 'wood', .05, .036, .272, [-1.55, 0, -.136], C.white, { parent: arm, mat: 'paint', cast: false });
  box('signal_spectacle', 'metal', .5, .028, .3, [.2, 0, -.15], C.black, { parent: arm, mat: 'metal' }); cyl('signal_glass_red', 'glass', .085, .034, [.3, 0, .06], '#ff3b30', { parent: arm, axis: 'y', seg: 10, cast: false }); cyl('signal_glass_green', 'glass', .085, .034, [.3, 0, -.09], '#2fd27a', { parent: arm, axis: 'y', seg: 10, cast: false });
  cyl('signal_pivot', 'metal', .06, .1, [0, .02, 0], C.iron, { parent: arm, axis: 'y', seg: 8, mat: 'metal' });
  const bal = grp('signal_balance', [SP[0], SP[1] - .14, 1.0]); box('signal_balance_lever', 'metal', .8, .03, .05, [-.15, 0, -.025], C.iron, { parent: bal, mat: 'metal' }); cyl('signal_balance_weight', 'metal', .11, .08, [-.5, 0, 0], C.iron, { parent: bal, axis: 'y', seg: 10, mat: 'metal' });
  const downRod = beam('signal_down_rod', 'metal', [SP[0] + .3, SP[1] - .16, 1], [SP[0] + .3, SP[1] - .16, 5], .018, C.iron, { round: true, mat: 'metal', cast: false });

  // ---------- A. dressing round the box (all at y >= 1.4, off the marks) ----------
  // green lineside cabinet with a blue flag (the reference's trackside grammar)
  box('cabinet', 'metal', .72, .46, .9, [-2.25, 1.85, 0], C.green, { mat: 'paint' }); prism('cabinet_lid', 'metal', [[1.58, .9], [2.12, .9], [2.12, 1.04], [1.58, .94]], -2.65, -1.85, C.green2, { mat: 'paint' });
  for (const x of [-2.43, -2.07]) box('cabinet_door', 'metal', .31, .02, .74, [x, 1.615, .08], C.green2, { mat: 'paint', cast: false }); for (const x of [-2.3, -2.2]) sph('cabinet_knob', 'metal', .022, [x, 1.6, .5], C.brass, { mat: 'brass', cast: false });
  for (const x of [-2.55, -1.95]) for (const y of [1.68, 2.02]) box('cabinet_foot', 'metal', .08, .08, .06, [x, y, -.03], C.iron);
  cyl('flag_pole', 'wood', .018, 1.45, [-1.72, 1.9, 0], C.white, { seg: 6, mat: 'paint' }); box('flag_blue', 'cloth', .36, .012, .26, [-1.53, 1.9, 1.17], C.blue, { cast: false });
  // oil lamp on a post
  cyl('lamp_post', 'metal', .04, 1.9, [.78, 1.75, 0], C.greenD, { seg: 8, mat: 'paint' }); cyl('lamp_post_foot', 'metal', .1, .1, [.78, 1.75, 0], C.greenD, { r2: .05, seg: 8 }); box('oil_lamp_base', 'metal', .2, .2, .03, [.78, 1.75, 1.9], C.iron);
  glow('oil_lamp_glass', new THREE.CylinderGeometry(.06, .08, .22, 8), '#ffe9a8', [.78, 1.75, 2.04]); for (const [dx, dy] of [[-.09, -.09], [.09, -.09], [-.09, .09], [.09, .09]]) box('oil_lamp_bar', 'metal', .015, .015, .24, [.78 + dx, 1.75 + dy, 1.92], C.iron, { cast: false });
  cyl('oil_lamp_roof', 'metal', .16, .12, [.78, 1.75, 2.16], C.iron, { r2: .03, seg: 4, rot: PI / 4 });
  // bucket, water barrel, tool crate, coal pile with a shovel, sleeper stack, mile post
  cyl('bucket', 'metal', .13, .28, [-2.95, 1.5, 0], '#8e9aa3', { r2: .17, seg: 10, mat: 'metal' }); { const h = new THREE.Mesh(new THREE.TorusGeometry(.16, .01, 4, 10, PI), M(C.iron)); h.position.copy(B2T([-2.95, 1.5, .27])); add(h, 'bucket_handle', 'metal', { cast: false }); }
  cyl('water_barrel', 'wood', .3, .9, [4.4, 1.55, 0], C.wood, { seg: 12 }); for (const z of [.12, .45, .78]) cyl('barrel_hoop', 'metal', .31, .05, [4.4, 1.55, z], C.iron, { seg: 12, mat: 'metal', cast: false }); cyl('barrel_water', 'water', .27, .01, [4.4, 1.55, .895], '#4f9bd0', { seg: 12, cast: false });
  box('tool_crate', 'wood', .75, .45, .36, [5.35, 1.6, 0], C.wood, { rot: .25, mat: 'plywood' }); for (const z of [.06, .26]) box('tool_crate_band', 'wood', .78, .47, .04, [5.35, 1.6, z], C.woodD, { rot: .25, cast: false });
  beam('hammer_handle', 'wood', [5.2, 1.55, .3], [5.05, 1.5, .78], .03, C.wood2, { round: true }); box('hammer_head', 'metal', .16, .05, .06, [5.05, 1.5, .76], C.iron, { mat: 'metal', rot: .3 }); beam('spanner', 'metal', [5.5, 1.66, .3], [5.62, 1.72, .7], .035, '#aab3bb', { t: .012, mat: 'metal' });
  for (let i = 0; i < 26; i++) { const a = R(0, 6.28), d = Math.sqrt(rnd()) * .62, h = (1 - d / .62) * .36; sph('coal', 'stone', R(.07, .13), [5.1 + Math.cos(a) * d, 2.35 + Math.sin(a) * d * .7, h + .05], pick(['#1e1c22', '#2a2830', '#17161b']), { rock: true, rot: R(0, 3), cast: i < 6 }); }
  beam('shovel_handle', 'wood', [5.75, 2.1, .02], [5.45, 2.3, .95], .03, C.wood2, { round: true }); box('shovel_blade', 'metal', .2, .03, .26, [5.78, 2.08, 0], '#8e9aa3', { mat: 'metal', rot: -.6, rx: -.3 });
  for (let k = 0; k < 7; k++) box('sleeper_stack', 'wood', 2.0, .24, .13, [7.0 + (k % 2) * .06, 1.72 + (k % 3) * .27 + (k > 2 ? .13 : 0) - (k > 5 ? .2 : 0), k < 3 ? 0 : k < 5 ? .13 : .26], k % 2 ? C.sleeper : '#553a2b', { rot: k > 4 ? .06 : 0 });
  box('mile_post', 'stone', .16, .12, .85, [7.9, 2.5, 0], C.white, { mat: 'paint' }); box('mile_post_band', 'stone', .17, .13, .16, [7.9, 2.5, .55], C.black, { cast: false, mat: 'paint' });

  // ---------- C. boardwalk platform (x 9..21, y -2.5..3.2), flush with the ground ----------
  box('boardwalk_under', 'wood', 12, 5.7, .04, [15, .35, -.07], C.boardD, { cast: false });
  for (let k = 0; k < 60; k++) box('boardwalk_plank', 'wood', .186, 5.7, .04, [9.1 + k * .2, .35, -.04], k % 3 === 1 ? C.board2 : k % 7 === 3 ? '#c59862' : C.board, { cast: false, mat: 'wood_grain' });
  box('boardwalk_kerb', 'wood', 12, .1, .13, [15, 3.2, 0], C.woodD, { cast: false }); for (const x of [8.97, 21.03]) box('boardwalk_end', 'wood', .06, 5.7, .03, [x, .35, -.02], C.woodD, { cast: false });
  // station name board on two posts (plain, no text)
  for (const x of [9.55, 11.25]) { box('name_board_post', 'wood', .1, .1, 2.6, [x, 2.85, 0], C.greenD, { mat: 'paint' }); sph('name_board_finial', 'wood', .07, [x, 2.85, 2.66], C.greenD); }
  box('name_board', 'wood', 1.9, .05, .5, [10.4, 2.82, 1.9], C.cream, { mat: 'paint' }); for (const z of [1.86, 2.4]) box('name_board_frame', 'wood', 1.98, .07, .05, [10.4, 2.82, z], C.green, { mat: 'paint' }); for (const x of [9.43, 11.37]) box('name_board_frame', 'wood', .05, .07, .59, [x, 2.82, 1.86], C.green, { mat: 'paint' });
  box('name_board_band', 'wood', 1.5, .056, .16, [10.4, 2.82, 2.07], C.greenD, { cast: false, mat: 'paint' });
  // 2 platform lamp posts
  for (const x of [11.9, 13.9]) { cyl('platform_lamp_post', 'metal', .05, 2.7, [x, 2.75, 0], C.green, { r2: .035, seg: 8, mat: 'paint' }); cyl('platform_lamp_foot', 'metal', .1, .3, [x, 2.75, 0], C.green, { r2: .055, seg: 8, mat: 'paint' }); box('platform_lamp_arm', 'metal', .4, .03, .03, [x, 2.75, 2.5], C.green, { mat: 'paint' });
    glow('platform_lamp_glass', new THREE.CylinderGeometry(.11, .07, .26, 6), '#fff1c2', [x, 2.75, 2.83]); cyl('platform_lamp_roof', 'metal', .17, .12, [x, 2.75, 2.96], C.greenD, { r2: .02, seg: 6 }); sph('platform_lamp_knob', 'metal', .03, [x, 2.75, 3.1], C.brass, { cast: false }); }
  // canopy on 4 posts over x 15..21, y 1.4..3.2, roof at z = 3.2
  for (const x of [15.06, 20.94]) for (const y of [1.46, 3.1]) { box('canopy_post', 'wood', .12, .12, 3.1, [x, y, 0], C.green, { mat: 'paint' }); box('canopy_post_base', 'wood', .2, .2, .25, [x, y, 0], C.greenD, { mat: 'paint' }); for (const s of [-1, 1]) if ((s < 0 && x > 16) || (s > 0 && x < 20)) beam('canopy_bracket', 'wood', [x, y, 2.5], [x + s * .6, y, 3.08], .06, C.greenD); }
  for (const y of [1.46, 3.1]) box('canopy_beam', 'wood', 6.1, .1, .14, [18, y, 3.0], C.greenD);
  beam('canopy_roof', 'roof', [18, 1.2, 3.2], [18, 3.22, 3.3], 6.3, C.tin, { t: .04, mat: 'tin' }); for (let x = 14.95; x <= 21.1; x += .25) beam('canopy_roof_ridge', 'roof', [x, 1.2, 3.23], [x, 3.22, 3.33], .08, C.tinD, { t: .03, mat: 'tin', cast: false });
  box('canopy_fascia', 'wood', 6.3, .04, .16, [18, 1.2, 3.03], C.cream, { mat: 'paint' }); for (let x = 15; x < 21.05; x += .3) box('canopy_valance_tooth', 'wood', .2, .04, .2, [x, 1.2, 3.02], C.cream, { c: true, rz: PI / 4, mat: 'paint', cast: false });
  cyl('fire_bucket', 'metal', .1, .22, [20.94, 2.96, 1.2], C.red, { r2: .14, seg: 10, mat: 'paint' }); box('fire_bucket_hook', 'metal', .03, .14, .03, [20.94, 3.02, 1.44], C.iron, { cast: false });
  // bench, luggage trolley with trunks, crates, milk churns, mail sacks, a barrel
  { const bx = 17.3, by = 2.55; for (const k of [0, 1, 2]) box('bench_slat', 'wood', 1.7, .13, .04, [bx, by - .16 + k * .15, .44], k % 2 ? C.green2 : C.green, { mat: 'paint' }); for (const k of [0, 1]) box('bench_back_slat', 'wood', 1.7, .04, .14, [bx, by + .24, .62 + k * .2], C.green, { mat: 'paint' });
    for (const s of [-.75, .75]) { box('bench_leg', 'metal', .06, .5, .44, [bx + s, by, 0], C.iron, { mat: 'metal' }); box('bench_arm', 'metal', .06, .5, .04, [bx + s, by, .64], C.iron, { mat: 'metal' }); box('bench_back_post', 'metal', .06, .05, .55, [bx + s, by + .24, .44], C.iron, { mat: 'metal' }); } }
  { const tx = 19.75, ty = 2.2; box('luggage_trolley_deck', 'wood', 1.3, .7, .06, [tx, ty, .3], C.wood); for (const s of [-.45, .45]) for (const q of [-.37, .37]) { cyl('luggage_trolley_wheel', 'metal', .15, .05, [tx + s, ty + q, .15], C.iron, { axis: 'y', seg: 10, mat: 'metal' }); cyl('luggage_trolley_hub', 'metal', .05, .06, [tx + s, ty + q, .15], C.red, { axis: 'y', seg: 8, cast: false }); }
    for (const q of [-.3, .3]) beam('luggage_trolley_handle', 'metal', [tx + .63, ty + q, .33], [tx + .78, ty + q, 1.0], .03, C.green, { round: true, mat: 'paint' }); beam('luggage_trolley_grip', 'metal', [tx + .78, ty - .3, 1.0], [tx + .78, ty + .3, 1.0], .035, C.green, { round: true, mat: 'paint' });
    box('trunk', 'cloth', .8, .5, .42, [tx - .15, ty, .36], '#6a3f2a', { rot: .06 }); for (const k of [-.25, .25]) box('trunk_strap', 'cloth', .05, .52, .43, [tx - .15 + k, ty, .36], '#3a2418', { rot: .06, cast: false }); box('trunk_lock', 'metal', .07, .02, .07, [tx - .15, ty - .26, .6], C.brass, { cast: false });
    box('suitcase', 'cloth', .55, .36, .2, [tx - .2, ty, .78], '#2f6f8a', { rot: -.15 }); box('hat_box', 'cloth', .3, .3, .2, [tx + .38, ty + .05, .36], '#c9a0a8', { rot: .4 }); }
  box('crate', 'wood', .8, .6, .6, [10.3, 1.95, 0], '#b98a52', { rot: .2, mat: 'plywood' }); box('crate', 'wood', .6, .5, .5, [11.05, 2.05, 0], '#a87a45', { rot: -.25, mat: 'plywood' }); box('crate', 'wood', .5, .45, .42, [10.4, 1.98, .6], '#c79a62', { rot: .55, mat: 'plywood' });
  for (const [x, y, r] of [[10.3, 1.95, .2], [11.05, 2.05, -.25]]) box('crate_band', 'wood', r > 0 ? .83 : .63, r > 0 ? .63 : .53, .05, [x, y, .28], C.woodD, { rot: r, cast: false });
  for (const [x, y] of [[18.85, 2.75], [19.0, 1.75], [18.6, 2.3]]) { cyl('milk_churn', 'metal', .17, .5, [x, y, 0], '#9aa7b2', { seg: 12, mat: 'metal' }); cyl('milk_churn_neck', 'metal', .17, .16, [x, y, .5], '#9aa7b2', { r2: .1, seg: 12, mat: 'metal' }); cyl('milk_churn_lid', 'metal', .13, .05, [x, y, .66], '#7f8c97', { seg: 12, mat: 'metal' }); }
  sph('mail_sack', 'cloth', .28, [12.6, 2.2, .22], '#c7b58f', { s: [1, .85, .8] }); sph('mail_sack', 'cloth', .24, [12.95, 1.95, .19], '#b7a47c', { s: [1.1, .8, .8] }); cyl('mail_sack_neck', 'cloth', .07, .12, [12.6, 2.2, .42], '#c7b58f', { r2: .1, seg: 8, cast: false });
  cyl('platform_barrel', 'wood', .28, .8, [20.55, 2.75, 0], C.wood2, { seg: 12 }); for (const z of [.12, .62]) cyl('barrel_hoop', 'metal', .29, .05, [20.55, 2.75, z], C.iron, { seg: 12, cast: false });

  // ---------- D. far side: telegraph, water tower, windmill pump, veld, koppies ----------
  { const pts = [[], []]; for (let x = -108; x <= 108; x += 9) { cyl('telegraph_pole', 'wood', .09, 6.4, [x, 7, 0], '#6b4a33', { r2: .06, seg: 7, cast: Math.abs(x) < 20 }); box('telegraph_arm', 'wood', .08, 1.3, .08, [x, 7, 5.8], '#5a3d2a', { cast: false }); box('telegraph_arm', 'wood', .08, .9, .08, [x, 7, 5.3], '#5a3d2a', { cast: false });
      for (const [k, dy] of [-.55, .55].entries()) { cyl('telegraph_insulator', 'glass', .035, .12, [x, 7 + dy, 5.88], '#e9f1ee', { seg: 6, cast: false }); pts[k].push(B2T([x, 7 + dy, 6.0])); if (x < 108) pts[k].push(B2T([x + 4.5, 7 + dy, 5.55])); } }
    for (const p of pts) add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p), p.length * 4, .012, 4), M('#2a2a30')), 'telegraph_wire', 'metal', { cast: false, mat: 'metal' }); }
  { const wx = 13, wy = 9.5; for (const sx of [-1, 1]) for (const sy of [-1, 1]) { beam('water_tower_leg', 'wood', [wx + sx * 1.35, wy + sy * 1.35, 0], [wx + sx * 1.05, wy + sy * 1.05, 4.2], .18, '#6b4a33'); }
    for (const s of [-1, 1]) { beam('water_tower_brace', 'wood', [wx - 1.3, wy + s * 1.3, .5], [wx + 1.1, wy + s * 1.1, 3.8], .08, '#5a3d2a', { cast: false }); beam('water_tower_brace', 'wood', [wx + 1.3, wy + s * 1.3, .5], [wx - 1.1, wy + s * 1.1, 3.8], .08, '#5a3d2a', { cast: false }); beam('water_tower_brace', 'wood', [wx + s * 1.3, wy - 1.3, .5], [wx + s * 1.1, wy + 1.1, 3.8], .08, '#5a3d2a', { cast: false }); }
    cyl('water_tower_deck', 'wood', 1.75, .14, [wx, wy, 4.2], '#5a3d2a', { seg: 14 }); cyl('water_tower_tank', 'wood', 1.5, 2.3, [wx, wy, 4.34], '#a5673a', { seg: 16, r2: 1.58 }); for (const z of [4.6, 5.4, 6.3]) cyl('water_tower_hoop', 'metal', 1.5 + (z - 4.34) * .035 + .02, .08, [wx, wy, z], C.iron, { seg: 16, cast: false });
    for (let k = 0; k < 16; k++) { const a = k / 16 * PI * 2; beam('water_tower_stave', 'wood', [wx + Math.cos(a) * 1.515, wy + Math.sin(a) * 1.515, 4.36], [wx + Math.cos(a) * 1.59, wy + Math.sin(a) * 1.59, 6.62], .03, '#7a4826', { cast: false }); }
    cyl('water_tower_roof', 'roof', 1.8, .9, [wx, wy, 6.64], C.tinD, { r2: .05, seg: 16, mat: 'tin' }); sph('water_tower_finial', 'metal', .1, [wx, wy, 7.58], C.iron);
    beam('water_tower_spout', 'metal', [wx - .3, wy - 1.5, 4.7], [wx - .5, wy - 3.6, 4.0], .16, C.iron, { round: true, mat: 'metal' }); cyl('water_tower_hose', 'cloth', .1, .9, [wx - .5, wy - 3.6, 3.1], '#c7b58f', { seg: 8 });
    for (const s of [-.2, .2]) beam('water_tower_ladder', 'wood', [wx + 1.9 + s, wy - 1.75, 0], [wx + 1.3 + s, wy - 1.55, 4.3], .05, '#5a3d2a', { cast: false }); for (let k = 1; k < 11; k++) { const u = k / 11; box('water_tower_rung', 'wood', .42, .04, .04, [wx + 1.9 - .6 * u, wy - 1.75 + .2 * u, 4.3 * u], '#5a3d2a', { cast: false }); } }
  let fan; { const mx = -12, my = 11, top = 7.0; for (const sx of [-1, 1]) for (const sy of [-1, 1]) beam('windmill_leg', 'metal', [mx + sx * 1.1, my + sy * 1.1, 0], [mx + sx * .14, my + sy * .14, top], .07, '#8a959c', { mat: 'metal' });
    for (const z of [1.6, 3.4, 5.2]) { const w = 1.1 - (1.1 - .14) * z / top; for (const s of [-1, 1]) { beam('windmill_girt', 'metal', [mx - w, my + s * w, z], [mx + w, my + s * w, z], .04, '#7b868d', { cast: false }); beam('windmill_girt', 'metal', [mx + s * w, my - w, z], [mx + s * w, my + w, z], .04, '#7b868d', { cast: false }); } }
    for (const [z0, z1] of [[0, 1.6], [1.6, 3.4], [3.4, 5.2]]) { const w0 = 1.1 - .96 * z0 / top, w1 = 1.1 - .96 * z1 / top; beam('windmill_brace', 'metal', [mx - w0, my - w0, z0], [mx + w1, my - w1, z1], .03, '#7b868d', { cast: false }); beam('windmill_brace', 'metal', [mx + w0, my - w0, z0], [mx - w1, my - w1, z1], .03, '#7b868d', { cast: false }); }
    box('windmill_head', 'metal', .3, .7, .3, [mx, my - .1, top], C.iron, { mat: 'metal' }); beam('windmill_tail_boom', 'metal', [mx, my, top + .15], [mx, my + 1.9, top + .15], .04, C.iron, { cast: false }); box('windmill_tail', 'metal', .03, .9, .7, [mx, my + 1.9, top - .2], C.red, { mat: 'paint' });
    beam('windmill_pump_rod', 'metal', [mx, my, .4], [mx, my, top], .025, C.iron, { round: true, cast: false }); cyl('windmill_pump', 'metal', .1, .9, [mx, my, 0], C.green, { seg: 8, mat: 'paint' });
    fan = grp('windmill_fan', [mx, my - .55, top + .15]); for (let k = 0; k < 14; k++) { const g = grp('windmill_blade_arm', [0, 0, 0], fan); g.rotation.z = k / 14 * PI * 2; const b = new THREE.Mesh(new THREE.BoxGeometry(.3, .95, .02), M(k % 2 ? '#c5ced3' : '#aeb9bf')); b.position.set(0, .82, 0); b.rotation.y = .45; add(b, 'windmill_blade', 'metal', { parent: g, mat: 'tin', cast: false }); }
    for (const r of [.4, 1.3]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r, .02, 4, 20), M(C.iron)); add(t, 'windmill_rim', 'metal', { parent: fan, cast: false }); } cyl('windmill_hub', 'metal', .1, .16, [0, 0, 0], C.red, { parent: fan, axis: 'y', seg: 8 });
    cyl('dam_wall', 'stone', 1.9, .85, [mx + 3.4, my + .6, 0], '#b9a58c', { seg: 16, mat: 'plaster' }); cyl('dam_water', 'water', 1.75, .02, [mx + 3.4, my + .6, .84], '#3f8fd0', { seg: 16, cast: false }); beam('dam_pipe', 'metal', [mx + .1, my, .7], [mx + 1.7, my + .4, .95], .07, C.iron, { round: true, cast: false });
    box('trough', 'stone', 2.2, .6, .4, [mx + 3.6, my - 2.2, 0], '#b9a58c', { mat: 'plaster', cast: false }); box('trough_water', 'water', 2.0, .44, .02, [mx + 3.6, my - 2.2, .39], '#3f8fd0', { cast: false }); }
  // a small farmhouse far off, a stone kraal, a plate layer's hut
  box('farmhouse', 'plaster', 6, 4, 2.6, [34, 21, 0], '#efe6d2', { cast: false }); prism('farmhouse_roof', 'roof', [[18.7, 2.6], [23.3, 2.6], [21, 4.2]], 30.7, 37.3, '#9a4a34', { cast: false, mat: 'tin' }); box('farmhouse_door', 'wood', .9, .05, 1.8, [33.4, 18.98, 0], C.greenD, { cast: false }); for (const x of [31.7, 35.6]) box('farmhouse_window', 'glass', .8, .05, .9, [x, 18.98, 1.0], '#3a4a5a', { cast: false }); box('farmhouse_chimney', 'brick', .6, .6, 1.6, [36.3, 21, 3.0], '#b9a58c', { cast: false }); box('farmhouse_stoep', 'stone', 6.4, 1.2, .2, [34, 18.4, 0], '#c9b59a', { cast: false });
  for (let k = 0; k < 22; k++) { const a = k / 22 * PI * 2; if (a > 4.3 && a < 4.9) continue; sph('kraal_stone', 'stone', R(.4, .6), [-27 + Math.cos(a) * 4, 22 + Math.sin(a) * 3.2, .25], pick(['#a39a8c', '#8f8376', '#b0a08c']), { rock: true, rot: R(0, 3), s: [1.2, 1, .9], cast: false }); }
  // koppies: flat-topped hills. A talus slope, a darker cliff band, a scrub cap
  const koppie = (x, y, r, h, sx, far) => { const rot = R(0, 3), o = { seg: 9, cast: false, mat: 'rock', rot }, tint = far ? ['#c97a5a', '#b46a52', '#a9a06a'] : ['#cf6d34', C.rock2, C.scrub];
    cyl('koppie_slope', 'stone', r, h * .62, [x, y, 0], tint[0], { ...o, r2: r * .62 }).scale.x = sx; cyl('koppie_cliff', 'stone', r * .6, h * .38, [x, y, h * .6], tint[1], { ...o, r2: r * .52 }).scale.x = sx; cyl('koppie_top', 'foliage', r * .5, h * .03, [x, y, h * .975], tint[2], { ...o, mat: 'turf' }).scale.x = sx;
    if (!far) for (let k = 0; k < 5; k++) { const a = R(0, 6.28); sph('koppie_boulder', 'stone', R(.6, 1.4), [x + Math.cos(a) * r * sx * R(.75, 1.05), y + Math.sin(a) * r * R(.75, 1.05), .3], pick([C.rock, C.rock2, '#a8603a']), { rock: true, rot: R(0, 3), cast: false }); } };
  [[-52, 33, 13, 9, 1.8], [-22, 37, 11, 7, 1.5], [2, 31, 9, 6, 1.6], [24, 38, 14, 10, 1.7], [50, 30, 10, 7, 1.9], [78, 36, 15, 11, 1.6], [-84, 34, 16, 12, 1.5], [14, 27, 5, 3.2, 1.4], [-38, 26, 5, 3, 1.5]].forEach(k => koppie(...k));
  [[-140, 75, 30, 20, 2.2], [-80, 85, 26, 17, 2.4], [-25, 78, 24, 15, 2.6], [35, 90, 30, 19, 2.3], [95, 76, 26, 18, 2.2], [150, 88, 32, 21, 2.2], [-150, 22, 22, 15, 1.4], [150, 16, 22, 14, 1.4], [-120, -30, 24, 14, 1.6], [125, -34, 24, 15, 1.6], [-200, 5, 30, 18, 1.2], [200, 2, 30, 19, 1.2], [0, 130, 40, 24, 3], [-110, 135, 40, 26, 2.4], [110, 140, 40, 25, 2.4]].forEach(k => koppie(...k, true));
  // acacia thorn trees with flat crowns
  const acacia = (x, y, s) => { const lean = R(-.25, .25), h = 2.6 * s, tx = x + lean * h; beam('acacia_trunk', 'wood', [x, y, 0], [tx, y, h], .22 * s, '#5a4030', { round: true, cast: false });
    for (const a of [.6, 2.6, 4.4]) beam('acacia_branch', 'wood', [tx, y, h * .8], [tx + Math.cos(a) * 1.3 * s, y + Math.sin(a) * 1.3 * s, h + .55 * s], .09 * s, '#5a4030', { round: true, cast: false });
    sph('acacia_crown', 'foliage', 2.3 * s, [tx, y, h + .75 * s], C.leaf, { s: [1, 1, .22], cast: false, mat: 'leaf' }); sph('acacia_crown', 'foliage', 1.5 * s, [tx + .9 * s, y + .4, h + 1.05 * s], C.leaf2, { s: [1, 1, .22], cast: false, mat: 'leaf' }); sph('acacia_crown', 'foliage', 1.2 * s, [tx - 1.3 * s, y - .3, h + .55 * s], C.leaf2, { s: [1, 1, .24], cast: false, mat: 'leaf' }); };
  [[-33, 10.5, 1.1], [-20, 15, 1.3], [-6.5, 12.5, 1.0], [4, 17, 1.4], [20.5, 11.5, 1.1], [29, 14, 1.2], [41, 10, 1.0], [52, 17, 1.4], [-46, 14, 1.2], [9, 23, 1.5], [-14, 22, 1.3], [64, 11, 1.1], [-62, 10, 1.2], [26, 24, 1.3], [-36, -9, 1.2], [38, -10, 1.3], [-75, 18, 1.4], [80, 20, 1.4], [-18, -14, 1.3], [16, -17, 1.4], [60, -12, 1.3], [-60, -11, 1.2]].forEach(a => acacia(...a));
  // aloes with red flower spikes, thorn bushes, termite mounds
  const aloe = (x, y, s) => { for (let k = 0; k < 7; k++) { const a = k / 7 * PI * 2 + x; beam('aloe_leaf', 'foliage', [x + Math.cos(a) * .06 * s, y + Math.sin(a) * .06 * s, .5 * s], [x + Math.cos(a) * .5 * s, y + Math.sin(a) * .5 * s, .95 * s], .12 * s, k % 2 ? C.aloe : '#4f8a6c', { t: .05 * s, cast: false, mat: 'leaf' }); }
    cyl('aloe_stem', 'foliage', .09 * s, .55 * s, [x, y, 0], '#7a6a4a', { seg: 6, cast: false }); cyl('aloe_spike', 'foliage', .02 * s, .9 * s, [x, y, .6 * s], '#6f8a4a', { seg: 5, cast: false }); cyl('aloe_flower', 'foliage', .08 * s, .42 * s, [x, y, 1.4 * s], '#e8502a', { r2: .01, seg: 6, cast: false, mat: 'petal' }); };
  [[-8.5, 7.9, 1], [-1.5, 8.6, 1.2], [6, 7.7, .9], [17.5, 8.2, 1.1], [24, 9.3, 1.3], [-16.5, 8.4, 1.1], [31, 7.8, 1], [-25, 9, 1.2], [9.5, 12.5, 1.3], [-4, 14, 1.2], [37, 12, 1.2], [-13, -7.5, 1.1], [7.5, -8, 1], [27, -9.5, 1.2], [-21, -8.5, 1]].forEach(a => aloe(...a));
  for (const [x, y, s] of [[-4.5, 9.6, 1], [2.5, 11.2, 1.3], [19, 14.5, 1.2], [27, 8.4, .9], [-18, 11.5, 1.1], [-29, 13.5, 1.3], [34, 16.5, 1.2], [45, 13, 1], [8, 8.8, .8], [-10, 17, 1.2], [15, 19, 1.3], [-40, 20, 1.3], [56, 9, 1.1], [-55, 18, 1.2], [-9, -6.5, .9], [22, -7, 1], [-24, -5.5, 1], [4, -9, 1.1], [-16, -11, 1.3], [31, -5, .9], [12, -12, 1.2], [-30, -13, 1.3], [46, -8, 1.2], [-44, -6, 1.1], [58, -5, 1]]) { sph('thorn_bush', 'foliage', .7 * s, [x, y, .4 * s], pick(['#8a9a48', '#9aa350', '#7c8f44']), { s: [1.3, 1.1, .75], cast: false, rock: true, mat: 'leaf' }); sph('thorn_bush', 'foliage', .45 * s, [x + .6 * s, y + .2, .3 * s], '#a3a856', { s: [1.2, 1, .8], cast: false, rock: true, mat: 'leaf' }); }
  for (const [x, y, s] of [[-15, 9.5, 1], [22.5, 13, 1.3], [39, 8.6, .9], [1, 21, 1.4]]) { cyl('termite_mound', 'ground', .55 * s, 1.5 * s, [x, y, 0], '#c26a38', { r2: .12 * s, seg: 7, cast: false, mat: 'dirt' }); cyl('termite_mound', 'ground', .35 * s, .8 * s, [x + .4 * s, y + .1, 0], '#b85f30', { r2: .08 * s, seg: 6, cast: false, mat: 'dirt' }); }
  // wire fence along the far edge of the railway land
  { for (let x = -58; x <= 60; x += 4) cyl('fence_post', 'wood', .05, 1.15, [x, 6.75, 0], '#6b4a33', { seg: 6, cast: false }); for (const z of [.45, .8, 1.08]) box('fence_wire', 'metal', 118, .012, .012, [1, 6.75, z], '#3a3a40', { cast: false }); }
  // grass tufts and stones, instanced; kept off the marks, the track, the boardwalk, and low in the camera strip
  const MARKS = [[-.6, .35], [1.3, .45], [13.2, .3], [14.6, .4]];
  const free = (x, y, pad = 0) => { if (y > 2.5 - pad && y < 6.3 + pad) return false; if (x > 8.8 - pad && x < 21.2 + pad && y > -2.7 - pad && y < 3.3) return false; if (x > 1.0 && x < 4.2 && y > .9 && y < 3.1) return false; if (x > -2 && x < .8 && y > .45 && y < 1.4) return false; if (nearBranch(x, y, 2.1)) return false;
    for (const m of MARKS) if (Math.hypot(x - m[0], y - m[1]) < .75 + pad) return false; return true; };
  { const blades = [], stones = [], GC = ['#c9b24a', '#a9ad4c', '#bf9a3c', '#d7c462', '#8f9f48'];
    const tuft = (x, y, s) => { const c = pick(GC); for (let k = 0; k < 6; k++) { const a = R(0, 6.28), l = R(.25, .5); blades.push({ p: [x + Math.cos(a) * .04, y + Math.sin(a) * .04, 0], rx: Math.sin(a) * l, rz: Math.cos(a) * l, s: [s, s, s * R(.7, 1.1)], c: rnd() < .3 ? pick(GC) : c }); } };
    for (let i = 0; i < 560; i++) { const x = R(-34, 44), y = rnd() < .5 ? R(-12, 2.5) : R(6.3, 24); if (!free(x, y)) continue; tuft(x, y, y < .7 ? R(.6, 1.0) : R(.8, 1.8)); }
    for (let i = 0; i < 160; i++) { const x = R(-90, 100), y = R(6.5, 45); if (!free(x, y)) continue; tuft(x, y, R(1.2, 2.4)); }
    const cone = new THREE.ConeGeometry(.035, .26, 4); cone.translate(0, .13, 0); inst('grass_blade', 'foliage', cone, blades, { cast: false, mat: 'grass' });
    for (let i = 0; i < 300; i++) { const x = R(-36, 46), y = rnd() < .45 ? R(-9, 2.5) : R(6.2, 22); if (!free(x, y)) continue; const r = y < .7 && y > -3.2 ? R(.04, .1) : R(.05, .26); stones.push({ p: [x, y, r * .25], s: [r * R(1, 1.6), r * R(.9, 1.3), r * R(.5, .8)], ry: R(0, 3), c: pick(['#a39a8c', '#8f8376', '#b0694a', '#9c5a3c', '#c2a184', '#77706a']) }); }
    inst('veld_stone', 'stone', new THREE.DodecahedronGeometry(1, 0), stones, { cast: false, mat: 'rock' }); }

  // ---------- wheels (shared by the train and the trolley) ----------
  const wheels = [];
  const wheel = (parent, x, y, r, kind) => { const g = grp('wheel', [x, y, RAIL_TOP + r], parent), col = kind === 'driver' ? C.red : kind === 'cart' ? C.iron : '#5a3324';
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(r - .045, .045, 6, 22), M('#cfd6dd')); add(tyre, 'wheel_tyre', 'metal', { parent: g, mat: 'metal' });
    const fl = new THREE.Mesh(new THREE.CylinderGeometry(r + .035, r + .035, .025, 22), M('#8e99a3')); fl.rotation.x = PI / 2; fl.position.z = y > 0 ? .045 : -.045; add(fl, 'wheel_flange', 'metal', { parent: g, mat: 'metal', cast: false });
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * .2, r * .2, .13, 10), M(kind === 'driver' ? C.black : C.iron)); hub.rotation.x = PI / 2; add(hub, 'wheel_hub', 'metal', { parent: g, mat: 'metal' });
    if (kind === 'disc') { const d = new THREE.Mesh(new THREE.CylinderGeometry(r - .07, r - .07, .05, 18), M(col)); d.rotation.x = PI / 2; add(d, 'wheel_disc', 'wood', { parent: g }); for (const k of [0, 1, 2]) { const s = new THREE.Mesh(new THREE.BoxGeometry(2 * r - .2, .02, .062), M('#3f2318')); s.rotation.z = k * PI / 3; add(s, 'wheel_seam', 'wood', { parent: g, cast: false }); } }
    else for (let k = 0; k < (kind === 'cart' ? 2 : 5); k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(2 * r - .1, kind === 'cart' ? .03 : .055, .04), M(col)); s.rotation.z = k * PI / (kind === 'cart' ? 2 : 5); add(s, 'wheel_spoke', 'metal', { parent: g, mat: 'paint' }); }
    wheels.push({ g, r, parent }); return g; };

  // ---------- MOVER: the train. Local origin = cab centre on the track, nose toward +X ----------
  const train = grp('train', [3.4, YC, 0]), T = { parent: train }, W = 1.1, rods = [], DR = .6, DX = [1.35, 2.6, 3.85], DZ = RAIL_TOP + DR;
  { // engine: frame, footplate, boiler with brass bands, smokebox, chimney, dome, cab, tender, cowcatcher
    box('engine_frame', 'metal', 8.5, 1.3, .3, [.7, 0, .74], C.black, { ...T, mat: 'metal' }); box('engine_footplate', 'metal', 5.9, 2.2, .06, [2.05, 0, 1.03], C.black, { ...T, mat: 'metal' }); for (const s of [-1, 1]) box('engine_valance', 'metal', 5.9, .04, .12, [2.05, s * 1.08, .93], C.red, { ...T, mat: 'paint' });
    cyl('engine_boiler', 'metal', .62, 3.5, [2.65, 0, 1.92], C.green, { ...T, axis: 'x', seg: 18, mat: 'paint' }); for (const x of [1.25, 2.1, 2.95, 3.8]) cyl('boiler_band', 'metal', .632, .07, [x, 0, 1.92], C.brass, { ...T, axis: 'x', seg: 18, mat: 'brass', cast: false });
    cyl('engine_smokebox', 'metal', .67, .75, [4.75, 0, 1.92], C.black, { ...T, axis: 'x', seg: 18, mat: 'metal' }); cyl('smokebox_door', 'metal', .56, .08, [5.15, 0, 1.92], '#34333b', { ...T, axis: 'x', seg: 18, mat: 'metal' }); cyl('smokebox_door_ring', 'metal', .6, .03, [5.13, 0, 1.92], C.brass, { ...T, axis: 'x', seg: 18, mat: 'brass', cast: false });
    box('smokebox_handle', 'metal', .03, .05, .5, [5.2, 0, 1.67], C.brass, { ...T, mat: 'brass', cast: false }); box('smokebox_saddle', 'metal', .7, 1.0, .5, [4.75, 0, 1.06], C.black, { ...T, mat: 'metal' });
    cyl('engine_chimney', 'metal', .2, .85, [4.75, 0, 2.5], C.black, { ...T, r2: .17, seg: 12, mat: 'metal' }); cyl('chimney_flare', 'metal', .17, .22, [4.75, 0, 3.33], C.black, { ...T, r2: .3, seg: 12, mat: 'metal' }); cyl('chimney_cap', 'metal', .31, .06, [4.75, 0, 3.55], C.brass, { ...T, seg: 12, mat: 'brass' }); cyl('chimney_base', 'metal', .3, .12, [4.75, 0, 2.5], C.black, { ...T, r2: .2, seg: 12 });
    cyl('engine_dome', 'metal', .3, .4, [2.95, 0, 2.48], C.brass, { ...T, seg: 14, mat: 'brass' }); sph('engine_dome_top', 'metal', .3, [2.95, 0, 2.88], C.brass, { ...T, mat: 'brass', s: [1, 1, .8] });
    cyl('sand_box', 'metal', .22, .3, [3.85, 0, 2.5], C.green, { ...T, seg: 10, mat: 'paint' }); sph('sand_box_top', 'metal', .22, [3.85, 0, 2.8], C.green, { ...T, s: [1, 1, .6], mat: 'paint' });
    cyl('safety_valve', 'metal', .07, .35, [1.5, 0, 2.5], C.brass, { ...T, seg: 8, mat: 'brass' }); cyl('whistle', 'metal', .035, .3, [1.2, .25, 2.5], C.brass, { ...T, seg: 6, mat: 'brass' }); cyl('whistle_bell', 'metal', .05, .12, [1.2, .25, 2.8], C.brass, { ...T, seg: 6, mat: 'brass', cast: false });
    for (const s of [-1, 1]) { beam('engine_handrail', 'metal', [1.0, s * .66, 2.2], [4.9, s * .7, 2.2], .03, C.brass, { ...T, round: true, mat: 'brass', cast: false }); for (const x of [1.3, 2.5, 3.7, 4.8]) box('handrail_stanchion', 'metal', .03, .08, .03, [x, s * .66, 2.185], C.brass, { ...T, cast: false }); }
    box('headlamp', 'metal', .34, .36, .42, [5.0, 0, 2.62], C.black, { ...T, mat: 'metal' }); glow('headlamp_lens', new THREE.CircleGeometry(.13, 14), '#ffe9a8', [5.175, 0, 2.84], { ...T, rot: PI / 2 }); cyl('headlamp_cap', 'metal', .12, .1, [5.0, 0, 3.04], C.black, { ...T, r2: .04, seg: 8 });
    // cylinders, buffer beam, cowcatcher
    for (const s of [-1, 1]) { cyl('engine_cylinder', 'metal', .24, .8, [4.75, s * .93, DZ], C.green, { ...T, axis: 'x', seg: 12, mat: 'paint' }); for (const x of [4.34, 5.16]) cyl('cylinder_cover', 'metal', .26, .04, [x, s * .93, DZ], C.brass, { ...T, axis: 'x', seg: 12, mat: 'brass', cast: false }); box('slide_bar', 'metal', 1.0, .05, .04, [3.9, s * .93, DZ + .13], '#cfd6dd', { ...T, mat: 'metal', cast: false }); }
    box('buffer_beam', 'metal', .14, 2.2, .4, [5.3, 0, .72], C.red, { ...T, mat: 'paint' }); for (const s of [-.75, .75]) { cyl('buffer_stock', 'metal', .08, .3, [5.5, s, .95], C.black, { ...T, axis: 'x', seg: 8 }); cyl('buffer_head', 'metal', .16, .05, [5.67, s, .95], '#cfd6dd', { ...T, axis: 'x', seg: 12, mat: 'metal' }); }
    for (let k = -4; k <= 4; k++) beam('cowcatcher_bar', 'metal', [5.38, k * .26, .72], [6.25 - Math.abs(k) * .13, k * .09, .36], .05, C.black, { ...T, mat: 'metal' }); for (const s of [-1, 1]) beam('cowcatcher_rail', 'metal', [5.4, s * 1.06, .4], [6.27, 0, .34], .07, C.red, { ...T, mat: 'paint' }); box('cowcatcher_top', 'metal', .1, 2.14, .08, [5.38, 0, .68], C.black, { ...T });
    // drivers, coupling and connecting rods
    for (const x of DX) for (const s of [-1, 1]) { wheel(train, x, s * GA, DR, 'driver'); }
    for (const s of [-1, 1]) { const cr = box('coupling_rod', 'metal', DX[2] - DX[0] + .16, .04, .09, [0, 0, 0], '#cfd6dd', { ...T, c: true, mat: 'metal' }); const mr = beam('main_rod', 'metal', [0, 0, 0], [1, 0, 0], .07, '#b8c0c8', { ...T, t: .035, mat: 'metal' });
      const pins = DX.map(x => cyl('crank_pin', 'metal', .05, .1, [x, s * (GA + .13), DZ], C.black, { ...T, axis: 'y', seg: 8, cast: false })); rods.push({ cr, mr, pins, y: s * (GA + .13), ph: s > 0 ? PI / 2 : 0 }); }
    // cab: walls built round an OPEN side window (0.8 x 0.7, z 2.0..2.7) so the driver card inside shows
    const cabWall = (y, open) => { const o = { ...T, mat: 'paint' }; box('cab_side', 'metal', 1.8, .06, .94, [0, y, 1.06], C.green, o); box('cab_side', 'metal', 1.8, .06, .3, [0, y, 2.7], C.green, o);
      if (open) { for (const x of [-.65, .65]) box('cab_side', 'metal', .5, .06, .7, [x, y, 2.0], C.green, o); for (const z of [1.97, 2.69]) box('cab_window_frame', 'metal', .9, .09, .05, [0, y, z], C.brass, { ...T, mat: 'brass', cast: false }); for (const x of [-.42, .42]) box('cab_window_frame', 'metal', .05, .09, .74, [x, y, 1.98], C.brass, { ...T, mat: 'brass', cast: false }); }
      else box('cab_side', 'metal', 1.8, .06, .7, [0, y, 2.0], C.inside, T);
      box('cab_lining', 'metal', 1.5, .065, .04, [0, y, 1.3], C.yellow, { ...T, cast: false, mat: 'paint' }); box('cab_lining', 'metal', 1.5, .065, .04, [0, y, 1.86], C.yellow, { ...T, cast: false, mat: 'paint' }); };
    cabWall(-W + .03, true); cabWall(W - .03, false); box('cab_inner', 'metal', 1.7, .02, 1.9, [0, W - .08, 1.08], C.inside, { ...T, cast: false });
    box('cab_front', 'metal', .06, 2.2, 1.94, [.9, 0, 1.06], C.green, { ...T, mat: 'paint' }); box('cab_front_inner', 'metal', .02, 2.08, 1.9, [.86, 0, 1.08], C.inside, { ...T, cast: false }); for (const s of [-.6, .6]) cyl('cab_spectacle', 'glass', .17, .08, [.9, s, 2.5], '#bfe3f2', { ...T, axis: 'x', seg: 12, cast: false });
    cyl('backhead', 'metal', .55, .12, [.8, 0, 1.75], C.black, { ...T, axis: 'x', seg: 14 }); glow('fire_door', new THREE.CircleGeometry(.2, 12), '#ff8a2a', [.735, 0, 1.45], { ...T, rot: -PI / 2 }); cyl('cab_gauge', 'metal', .07, .03, [.73, -.3, 2.25], C.brass, { ...T, axis: 'x', seg: 10, cast: false });
    box('cab_floor', 'metal', 1.8, 2.2, .04, [0, 0, 1.0], '#3a2a22', T); box('cab_back_rail', 'metal', .05, .05, .9, [-.88, -W + .05, 1.06], C.brass, { ...T, mat: 'brass' });
    prism('cab_roof', 'roof', Array.from({ length: 9 }, (_, k) => { const a = PI * k / 8; return [-1.22 * Math.cos(a), 3.0 + .2 * Math.sin(a)]; }), -1.1, 1.1, '#3a3b44', { ...T, mat: 'tin' }); box('cab_roof_lip', 'roof', 2.2, 2.44, .04, [0, 0, 2.98], C.black, T);
    // tender with coal
    box('tender_frame', 'metal', 2.5, 2.0, .12, [-2.25, 0, .98], C.black, T); for (const s of [-1, 1]) { box('tender_side', 'metal', 2.4, .06, 1.0, [-2.25, s * (W - .03), 1.1], C.green, { ...T, mat: 'paint' }); box('tender_flare', 'metal', 2.44, .1, .08, [-2.25, s * (W - .01), 2.1], C.greenD, { ...T, mat: 'paint' }); box('tender_lining', 'metal', 2.0, .065, .04, [-2.25, s * (W - .03), 1.3], C.yellow, { ...T, cast: false }); box('tender_lining', 'metal', 2.0, .065, .04, [-2.25, s * (W - .03), 1.9], C.yellow, { ...T, cast: false }); for (const x of [-3.27, -1.23]) box('tender_lining', 'metal', .04, .065, .64, [x, s * (W - .03), 1.3], C.yellow, { ...T, cast: false }); }
    box('tender_back', 'metal', .06, 2.2, 1.0, [-3.45, 0, 1.1], C.green, { ...T, mat: 'paint' }); box('tender_front', 'metal', .06, 2.2, .7, [-1.05, 0, 1.1], C.greenD, { ...T, mat: 'paint' }); box('tender_floor', 'metal', 2.4, 2.1, .7, [-2.25, 0, 1.1], '#1d1c21', T);
    for (let i = 0; i < 22; i++) sph('tender_coal', 'stone', R(.14, .24), [R(-3.2, -1.3), R(-.8, .8), 1.85 + R(0, .25)], pick(['#1e1c22', '#2a2830', '#17161b']), { ...T, rock: true, rot: R(0, 3), cast: false });
    for (const x of [-3.0, -1.6]) for (const s of [-1, 1]) { wheel(train, x, s * GA, .42, 'driver'); box('axle_box', 'metal', .26, .1, .26, [x, s * .72, RAIL_TOP + .3], C.black, { ...T, cast: false }); }
    box('engine_step', 'metal', .5, .25, .04, [-1.0, -W - .1, .62], C.black, T); for (const x of [-1.2, -.8]) box('engine_step_hanger', 'metal', .04, .04, .4, [x, -W - .02, .64], C.black, { ...T, cast: false });
  }
  // carriages: dark red-brown planks, 3 OPEN arched windows each on the camera side, a hollow inside with a seat back
  const CAR_FLOOR = 1.15, CARX = [-7.4, -15.2], WINX = [-2.2, 0, 2.2], SILL = 1.75;
  const carriage = (cx) => { const L = 7.2, y0 = -W, CC = [C.car, C.car2], o = { ...T };
    box('carriage_underframe', 'metal', L, 1.9, .2, [cx, 0, .95], C.black, { ...o, mat: 'metal' }); for (const s of [-1, 1]) box('carriage_solebar', 'wood', L, .08, .22, [cx, s * 1.02, .93], '#3a2018', o);
    box('carriage_floor', 'wood', L - .1, 2.1, .04, [cx, 0, CAR_FLOOR - .04], '#5a3c25', { ...o, cast: false });
    // camera-side wall, pieces round the openings: lower band, 4 pillars, 3 arch spandrels, top band
    const yw = y0 + .04, wall = (a, b, z0, z1) => { box('carriage_wall_backing', 'wood', b - a, .03, z1 - z0, [cx + (a + b) / 2, yw, z0], C.carD, o); planksX('carriage_plank', 'wood', cx + a, cx + b, yw, z0, z1, CC, { ...o, t: .07, pw: .19 }); };
    wall(-L / 2, L / 2, CAR_FLOOR - .1, SILL); let e = -L / 2; for (const wx of WINX) { wall(e, wx - .45, SILL, 2.78); e = wx + .45; } wall(e, L / 2, SILL, 2.78);
    for (const wx of WINX) { const sh = new THREE.Shape(); sh.moveTo(-.45, 0); sh.absarc(0, 0, .45, PI, 0, true); sh.lineTo(.45, .5); sh.lineTo(-.45, .5); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: .07, bevelEnabled: false, curveSegments: 10 });
      const m = new THREE.Mesh(g, M(C.car, true)); m.position.copy(B2T([cx + wx, yw + .035, 2.3])); add(m, 'carriage_window_arch', 'wood', o);
      const tr = new THREE.Mesh(new THREE.TorusGeometry(.45, .035, 5, 14, PI), M(C.cream)); tr.position.copy(B2T([cx + wx, yw - .04, 2.3])); add(tr, 'carriage_window_trim', 'wood', { ...o, mat: 'paint', cast: false });
      for (const s of [-.45, .45]) box('carriage_window_trim', 'wood', .06, .05, .55, [cx + wx + s, yw - .04, SILL], C.cream, { ...o, mat: 'paint', cast: false }); box('carriage_window_sill', 'wood', 1.06, .12, .05, [cx + wx, yw - .05, SILL - .05], C.cream, { ...o, mat: 'paint' }); }
    box('carriage_cornice', 'wood', L + .04, .1, .27, [cx, yw, 2.78], C.carD, o); box('carriage_waist_band', 'wood', L, .09, .06, [cx, yw, 1.52], C.cream, { ...o, mat: 'paint', cast: false });
    for (const dx of [-1.1, 1.1]) { box('carriage_door_line', 'wood', .03, .085, 1.9, [cx + dx - .42, yw, CAR_FLOOR - .1], C.carD, { ...o, cast: false }); box('carriage_door_handle', 'metal', .16, .05, .04, [cx + dx - .3, yw - .06, 1.6], C.brass, { ...o, mat: 'brass', cast: false }); }
    // far wall, ends, the inside (dark, so a face reads), a seat back behind the standing mark
    box('carriage_far_wall', 'wood', L, .07, 2.0, [cx, W - .035, CAR_FLOOR - .1], C.inside, o); for (const s of [-1, 1]) { box('carriage_end', 'wood', .07, 2.2, 2.0, [cx + s * (L / 2 - .035), 0, CAR_FLOOR - .1], C.carD, o); for (const q of [-.75, .75]) { cyl('buffer_stock', 'metal', .07, .25, [cx + s * (L / 2 + .1), q, .98], C.black, { ...o, axis: 'x', seg: 8, cast: false }); cyl('buffer_head', 'metal', .15, .05, [cx + s * (L / 2 + .24), q, .98], '#cfd6dd', { ...o, axis: 'x', seg: 10, mat: 'metal', cast: false }); } box('coupling_hook', 'metal', .3, .06, .1, [cx + s * (L / 2 + .15), 0, .9], C.iron, { ...o, cast: false }); }
    for (const dx of [-2.4, 0, 2.4]) { box('carriage_seat', 'cloth', 1.9, .5, .1, [cx + dx, .6, 1.6], '#274a3c', { ...o, cast: false }); box('carriage_seat_back', 'cloth', 1.9, .1, .7, [cx + dx, .9, 1.7], '#274a3c', { ...o, cast: false }); box('carriage_seat_base', 'wood', 1.9, .45, .45, [cx + dx, .62, CAR_FLOOR], '#3a2018', { ...o, cast: false }); }
    for (const dx of [-1.2, 1.2]) box('carriage_partition', 'wood', .05, 1.2, 1.6, [cx + dx, .5, CAR_FLOOR], '#4a2a1c', { ...o, cast: false });
    // roof (arched, pale canvas) with lamp tops, footboard, wheels, axle boxes, springs
    prism('carriage_roof', 'roof', Array.from({ length: 9 }, (_, k) => { const a = PI * k / 8; return [-1.2 * Math.cos(a), 3.05 + .32 * Math.sin(a)]; }), cx - L / 2 - .08, cx + L / 2 + .08, '#d9cdb4', { ...o, mat: 'canvas' }); box('carriage_roof_lip', 'roof', L + .16, 2.4, .04, [cx, 0, 3.03], C.carD, o);
    for (const dx of [-2.2, 0, 2.2]) { cyl('roof_lamp_top', 'metal', .1, .16, [cx + dx, 0, 3.36], C.black, { ...o, seg: 8 }); cyl('roof_lamp_cap', 'metal', .14, .05, [cx + dx, 0, 3.52], C.black, { ...o, seg: 8, cast: false }); }
    box('carriage_footboard', 'wood', L - .4, .26, .04, [cx, -W - .16, .72], '#5a3c25', o); for (const dx of [-2.9, -1, 1, 2.9]) box('footboard_hanger', 'metal', .04, .04, .26, [cx + dx, -W - .05, .72], C.black, { ...o, cast: false });
    for (const dx of [-2.3, 2.3]) for (const s of [-1, 1]) { wheel(train, cx + dx, s * GA, .45, 'disc'); box('axle_box', 'metal', .24, .1, .26, [cx + dx, s * .74, RAIL_TOP + .33], C.black, { ...o, cast: false }); box('leaf_spring', 'metal', .9, .06, .06, [cx + dx, s * .74, RAIL_TOP + .62], C.iron, { ...o, cast: false }); box('leaf_spring', 'metal', .6, .06, .05, [cx + dx, s * .74, RAIL_TOP + .57], C.iron, { ...o, cast: false }); }
  };
  CARX.forEach(carriage);
  // smoke puffs: always rising from the chimney
  const puffs = []; for (let k = 0; k < 7; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 7), toon(k % 2 ? '#f2efe8' : '#dcd8d2', { transparent: true })); add(m, 'smoke_puff', 'cloth', { parent: train, cast: false, mat: 'smoke' }); puffs.push(m); }

  // ---------- MOVER: the signalman's hand trolley. Local origin = floor centre at ground level ----------
  const TROLLEY_HOME = [1.3, .45, 0], trolley = grp('trolley', TROLLEY_HOME), Q = { parent: trolley }, tWheels = [];
  { box('trolley_deck', 'wood', .9, .7, .05, [0, 0, .27], C.woodD, Q); for (const k of [-1, 0, 1]) box('trolley_deck_plank', 'wood', .28, .68, .02, [k * .3, 0, .32], k ? C.wood : C.wood2, { ...Q, cast: false });
    for (const [k, z] of [.32, .47, .62].entries()) box('trolley_front_board', 'wood', .9, .04, .14, [0, -.35, z - (k ? 0 : .06)], k % 2 ? C.green2 : C.green, { ...Q, mat: 'paint' }).scale.y = k ? 1 : 1.4;
    for (const x of [-.43, .43]) box('trolley_corner_post', 'wood', .05, .05, .5, [x, -.35, .27], C.greenD, Q); box('trolley_front_cap', 'wood', .94, .07, .03, [0, -.35, .755], C.greenD, Q);
    for (const s of [-1, 1]) for (const z of [.32, .46]) box('trolley_side_board', 'wood', .04, .7, .13, [s * .45, 0, z], s > 0 ? C.green : C.green2, { ...Q, mat: 'paint' }); for (const z of [.32, .46]) box('trolley_back_board', 'wood', .9, .04, .13, [0, .35, z], C.green2, { ...Q, mat: 'paint' });
    for (const y of [-.3, .3]) beam('trolley_push_post', 'metal', [-.45, y, .3], [-.62, y, .8], .03, C.iron, { ...Q, round: true, mat: 'metal' }); beam('trolley_push_bar', 'wood', [-.62, -.36, .8], [-.62, .36, .8], .045, C.wood2, { ...Q, round: true });
    for (const x of [-.3, .3]) { beam('trolley_axle', 'metal', [x, -GA - .04, .13], [x, GA + .04, .13], .035, C.iron, { ...Q, round: true, mat: 'metal' }); for (const y of [-.25, .25]) box('trolley_axle_hanger', 'metal', .08, .04, .16, [x, y, .12], C.iron, { ...Q, cast: false });
      for (const s of [-1, 1]) { const g = wheel(trolley, x, s * GA, .13, 'cart'); g.position.copy(B2T([x, s * GA, .13])); tWheels.push(g); } }
    box('trolley_lamp', 'metal', .1, .1, .14, [.38, -.4, .52], C.iron, Q); glow('trolley_lamp_lens', new THREE.CircleGeometry(.035, 8), '#ffe9a8', [.38, -.452, .59], Q);
  }

  // ---------- events: film.places.junction.events = [{ f0, f1, obj, from, to }] ----------
  const evs = ((ctx.place && ctx.place.events) || (film.places && film.places.junction && film.places.junction.events) || []).slice().sort((a, b) => a.f0 - b.f0), byObj = {};
  for (const e of evs) (byObj[e.obj] ||= []).push(e);
  const mix = (a, b, u) => Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * u) : a + (b - a) * u, sm = u => u * u * u * (u * (u * 6 - 15) + 10);
  const val = (obj, f, def) => { const l = byObj[obj]; if (!l) return def; if (f <= l[0].f0) return l[0].from; let e = l[0]; for (const k of l) if (k.f0 <= f) e = k; if (f >= e.f1) return e.to; return mix(e.from, e.to, sm((f - e.f0) / Math.max(1, e.f1 - e.f0))); };
  const TRAIN_HOME = 3.4, D2R = PI / 180, LEAN0 = -8, LEAN1 = 20;                     // lever: leans 8 deg to the track at rest, 20 deg toward the signalman when pulled
  const trainX = f => val('train', f, TRAIN_HOME);
  const trolleyP = f => { const p = val('trolley', f, TROLLEY_HOME), on = Math.abs(p[1] - YC) < .3; return [p[0], p[1], on ? Math.max(p[2], .12) + (RAIL_TOP - .12) : p[2]]; };   // on the track its wheels ride the rail head
  const leverA = (i, f) => (LEAN0 + (LEAN1 - LEAN0) * val('lever' + (i + 1), f, 0)) * D2R;
  const leverTop = (i, f) => { const a = leverA(i, f); return [LX[i], LY - Math.sin(a) * 1.02, .1 + Math.cos(a) * 1.02]; };
  const update = (f, t) => {
    const tx = trainX(f); train.position.copy(B2T([tx, YC, 0]));
    for (const w of wheels) if (w.parent === train) w.g.rotation.z = -tx / w.r;
    const ph = -tx / DR;
    for (const r of rods) { const a = ph + r.ph, px = .3 * Math.cos(a), pz = .3 * Math.sin(a); r.cr.position.copy(B2T([DX[1] + px, r.y, DZ + pz])); r.pins.forEach((p, i) => p.position.copy(B2T([DX[i] + px, r.y, DZ + pz])));
      const xh = DX[1] + px + Math.sqrt(1.9 * 1.9 - pz * pz); setBeam(r.mr, [DX[1] + px, r.y * 1.08, DZ + pz], [Math.min(xh, 4.3), r.y * 1.08, DZ]); }
    puffs.forEach((m, k) => { const u = (t * .32 + k / puffs.length) % 1, s = .16 + u * .75; m.position.copy(B2T([4.75 - u * u * 2.6 + Math.sin(k * 2.4 + u * 5) * .12, Math.cos(k * 1.7) * .1 * u, 3.7 + u * 3.4])); m.scale.setScalar(s); m.material.opacity = u < .08 ? u / .08 : 1 - Math.pow(u, 2.2); });
    const tp = trolleyP(f); trolley.position.copy(B2T(tp)); for (const g of tWheels) g.rotation.z = -tp[0] / .13;
    levers.forEach((g, i) => { g.rotation.x = leverA(i, f); });
    const av = val('signal_arm', f, 0); arm.rotation.z = -av * PI / 4; bal.rotation.z = av * .35; downRod.position.y = B2T([0, 0, 3 + av * .12]).y;
    fan.rotation.z = -t * 1.3;
  };
  update(0, 0);
  const anchors = {
    levers: [-.6, LY, 1.1], hut: [2.6, 2.0, 1.4], keys: [1.25, 1.0, 1.3], signal: f => { const a = val('signal_arm', f, 0) * PI / 4; return [SP[0] - .8 * Math.cos(a), SP[1] - .16, 5.0 + .8 * Math.sin(a)]; },
    platform: [15, .35, 0], points: [-5, YC, .3], canopy: [18, 2.3, 3.2], water_tower: [13, 9.5, 5.5], windmill: [-12, 10.45, 7.15],
    train: f => [trainX(f), YC - W, 2.35], window: f => [trainX(f) + CARX[0], YC - W, 2.25], trolley: f => { const p = trolleyP(f); return [p[0], p[1], p[2] + .5]; },
    cab_stand: f => [trainX(f), 4.0, 1.0], window_stand: f => [trainX(f) + CARX[0], 4.0, CAR_FLOOR], window2_stand: f => [trainX(f) + CARX[1], 4.0, CAR_FLOOR], chimney: f => [trainX(f) + 4.75, YC, 3.6],
  };
  LX.forEach((x, i) => { anchors['lever' + (i + 1)] = f => leverTop(i, f); });
  return { update, anchors };
}
