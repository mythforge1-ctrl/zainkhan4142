// 2D VECTOR PUPPET: every part is coded curves (SVG). One unit = head width D = 200 px.
// The sheet is drawn in "puppet space"; in 3D each part group becomes a flat card at depth.
export const INK = '#2a1a1f';
const LINE = 13, THIN = 5.5;

// --- tiny colour helpers ---
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const shade = (h, k, cool = 0) => { const [r, g, b] = hx(h); return toHex([r * k - cool * 6, g * k - cool * 4, b * k + cool * 10]); };
export const tint = (h, k) => { const [r, g, b] = hx(h); return toHex([r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k]); };

let GID = 0;
// soft "light from the left" gradient used on all clothing
function clothGrad(defs, col, x0, x1) {
  const id = 'g' + (GID++);
  defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x0}" y1="0" x2="${x1}" y2="0">
    <stop offset="0" stop-color="${tint(col, .1)}"/><stop offset=".45" stop-color="${col}"/><stop offset="1" stop-color="${shade(col, .68, 1)}"/></linearGradient>`);
  return `url(#${id})`;
}
function skinGrad(defs, cx, cy, r) {
  const id = 'g' + (GID++);
  defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx - r * .35}" cy="${cy - r * .4}" r="${r * 1.55}">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#f9f4f2"/><stop offset="1" stop-color="#d9d2e3"/></radialGradient>`);
  return `url(#${id})`;
}
// three hard hair tones + streaks, clipped to the hair shape
function hairFill(defs, col, y0, y1) {
  const id = 'g' + (GID++), dk = shade(col, .66, 1), lt = tint(col, .22);
  defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">
    <stop offset="0" stop-color="${lt}"/><stop offset=".34" stop-color="${lt}"/><stop offset=".34" stop-color="${col}"/><stop offset=".72" stop-color="${col}"/><stop offset=".72" stop-color="${dk}"/><stop offset="1" stop-color="${dk}"/></linearGradient>`);
  return `url(#${id})`;
}
const path = (d, fill, stroke = INK, sw = LINE, extra = '') => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const clip = (defs, d) => { const id = 'c' + (GID++); defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return id; };

// smooth closed curve through points (Catmull-Rom -> cubic bezier)
export function smooth(pts, closed = true, t = .5) {
  const n = pts.length, P = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${P(0)[0].toFixed(1)},${P(0)[1].toFixed(1)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3], c2 = [p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + (closed ? 'Z' : '');
}

// ---- body bean: shoulders round into the head, widest low, flat-ish bottom ----

// sample the same Catmull-Rom curve smooth() draws, as a dense polyline
export function sampleSmooth(pts, closed = true, per = 14, t = .5) {
  const n = pts.length, P = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))], out = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3], c2 = [p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3];
    for (let k = 0; k < per; k++) { const u = k / per, v = 1 - u;
      out.push([v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0], v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1]]); }
  }
  return out;
}
// Rick-style ink: thin on the lit top-left, thick where the shade falls (bottom-right). Drawn as a filled ring.
export function inkRing(pts, w, { thin = .72, thick = 1.32, light = [-.62, -.78], nib = .5, wob = .06, seed = 1 } = {}) {
  const S = sampleSmooth(pts, true, 16), n = S.length; let cxm = 0, cym = 0;
  for (const [x, y] of S) { cxm += x / n; cym += y / n; }
  const o = [], i = [];
  for (let k = 0; k < n; k++) {
    const a = S[(k - 1 + n) % n], b = S[(k + 1) % n]; let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1;
    let nx = ty / L, ny = -tx / L; if ((S[k][0] - cxm) * nx + (S[k][1] - cym) * ny < 0) { nx = -nx; ny = -ny; }  // outward
    const lit = -(nx * light[0] + ny * light[1]);                       // 1 = faces away from light (shade side)
    let f = thin + (thick - thin) * Math.pow(Math.max(0, (lit + 1) / 2), 1.4);
    f *= (1 - nib * .5) + nib * Math.abs(ty / L);                        // brush nib: up-down strokes thicker than across strokes
    f *= 1 + wob * Math.sin(k * .29 + seed) * Math.sin(k * .07 + seed * 2.3);  // hand-drawn unevenness
    const ww = w * f / 2;
    o.push([S[k][0] + nx * ww, S[k][1] + ny * ww]); i.push([S[k][0] - nx * ww * .85, S[k][1] - ny * ww * .85]);
  }
  const poly = A => 'M' + A.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
  return `<path d="${poly(o)}${poly(i.reverse())}" fill="${INK}" fill-rule="evenodd"/>`;
}
// a tapered brush stroke along a quadratic curve (thin ends, fat middle; 'bias' moves the fat part)
export function brush(x0, y0, qx, qy, x1, y1, w, { bias = .5, col = INK, tip = .25 } = {}) {
  const N = 18, L = [], Rr = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N, u = 1 - t, x = u * u * x0 + 2 * u * t * qx + t * t * x1, y = u * u * y0 + 2 * u * t * qy + t * t * y1;
    const dx = 2 * u * (qx - x0) + 2 * t * (x1 - qx), dy = 2 * u * (qy - y0) + 2 * t * (y1 - qy), l = Math.hypot(dx, dy) || 1;
    const tt = t < bias ? t / bias : (1 - t) / (1 - bias), h = w / 2 * (tip + (1 - tip) * Math.sin(Math.min(1, tt) * Math.PI / 2));
    L.push([x - dy / l * h, y + dx / l * h]); Rr.push([x + dy / l * h, y - dx / l * h]);
  }
  const pts = L.concat(Rr.reverse());
  return `<path d="M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z" fill="${col}" stroke="${col}" stroke-width="1.2" stroke-linejoin="round"/>`;
}
// Rick heads are NOT circles: hand-drawn eggs. Bigger end low, slightly tilted, lumpy, one cheek fuller.
// egg > 0 = fuller bottom, < 0 = fuller top; tilt in degrees; lumps = [harmonic, amount, phase]
export const HEADS = {
  rick:   { egg: .085, aspect: 1.0,  tilt: -7, lumps: [[2, .022, .4], [3, .03, 1.9], [5, .012, 3.1]] },
  potato: { egg: .06,  aspect: 1.04, tilt: 9,  lumps: [[2, .035, 2.2], [3, .025, .3], [4, .015, 1.2]] },
  bun:    { egg: .12,  aspect: 1.06, tilt: -4, lumps: [[2, .02, 1.1], [3, .022, 2.6], [5, .01, .2]] },
  egg:    { egg: -.09, aspect: .96,  tilt: 6,  lumps: [[2, .02, 2.9], [3, .028, .9], [4, .012, 2.0]] },
  round:  { egg: 0, aspect: 1, tilt: 0, lumps: [] },
};
export function headPts(cx, hy, R, shape = 'rick', mirror = false) {
  const H = typeof shape === 'string' ? HEADS[shape] : shape, n = 24, P = [], tl = H.tilt * Math.PI / 180;
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2, sa = Math.sin(a);
    let r = 1 + H.egg * sa;                                  // y-down: sin>0 is the lower half
    for (const [h, amt, ph] of H.lumps) r += amt * Math.sin(h * a + ph);
    let x = Math.cos(a) * r * H.aspect, y = sa * r * .97 - H.egg * .35;   // keep the centre steady
    [x, y] = [x * Math.cos(tl) - y * Math.sin(tl), x * Math.sin(tl) + y * Math.cos(tl)];
    P.push([cx + (mirror ? -x : x) * R, hy + y * R]);
  }
  return mirror ? P.reverse() : P;
}

export function beanPts(cx, top, bot, wTop, wBot, lean = 0) {
  const h = bot - top, P = [];
  const prof = [[0, .0], [.62, .03], [.9, .12], [1, .32], [1.03, .6], [.97, .82], [.78, .95], [.45, 1.0]];
  for (const [w, t] of prof) P.push([cx + lean * t * h + (wTop + (wBot - wTop) * t) * w, top + t * h]);
  P.push([cx + lean * h, bot + 1]);
  for (const [w, t] of prof.slice().reverse()) P.push([cx + lean * t * h - (wTop + (wBot - wTop) * t) * w, top + t * h]);
  return P;
}

// ---- STANDARD FACE KIT (from Rick close-ups; head width W = 200 before the 1.5 head scale) ----
// standard eye = a lid line with the pupil hanging under it (they touch). Brows are uneven brush strokes,
// one flatter, one higher and arched. Mouth = small lens, slightly down, low on the face.
// brows: [raise, tilt, arch] per eye (left, right); tilt > 0 pulls the inner end down
export const FACES = {
  standard:  { eyes: 'lid',   brows: [[0, 1, 1], [4, -1.5, 5]],   mouth: 'lens' },
  open:      { eyes: 'oval',  brows: [[2, 0, 3], [5, -1, 5]],     mouth: 'lens' },
  smirk:     { eyes: 'lid',   brows: [[-1, 2, 1], [7, -3, 6]],    mouth: 'smirk' },
  happy:     { eyes: 'happy', brows: [[5, -2, 5], [7, -2, 6]],    mouth: 'grin' },
  angry:     { eyes: 'lid',   brows: [[-3, 7, 0], [-2, 6, 1]],    mouth: 'flat', lidTilt: 3 },
  sad:       { eyes: 'oval',  brows: [[2, -6, 2], [3, -7, 2]],    mouth: 'frown' },
  surprised: { eyes: 'wide',  brows: [[10, -2, 6], [12, -2, 7]],  mouth: 'o' },
  talk:      { eyes: 'lid',   brows: [[1, 0, 2], [5, -1, 5]],     mouth: 'talk' },
};
export function faceKit(face, fx, ey, turn = 0, mouthY, view = 'front', head = null) {
  if (view === 'back') return [];
  const F = typeof face === 'string' ? FACES[face] : { ...FACES[(face && face.expr) || 'standard'], ...(face || {}) };
  const o = [], at = Math.abs(turn), dir = Math.sign(turn) || 1;
  const dx = 28 * (1 - .22 * at);                                   // eyes close up when the head turns
  const look = turn * 3.5;                                         // pupils slide toward the facing side
  for (const [i, s] of [[0, -1], [1, 1]]) {
    const far = s * turn < 0, k = far ? 1 - .3 * at : 1;          // far eye narrower
    const ex = fx + s * dx * (far ? 1 - .15 * at : 1);
    const et = Array.isArray(F.eyes) ? F.eyes[i] : F.eyes;
    if (et === 'lid') {
      const ly = ey - 3, lw = 14 * k, pr = 7.6 * k, py = ly + 1, lt = F.lidTilt || 0;
      o.push(`<path d="M${ex + look - pr},${py} A${pr},${10.5} 0 0,0 ${ex + look + pr},${py} Z" fill="${INK}"/>`);
      o.push(brush(ex - s * lw, ly + lt, ex, ly - 1.2 + lt * .4, ex + s * lw, ly, 4.6, { tip: .45 }));   // lid sits right on the pupil
    } else if (et === 'happy') {
      o.push(brush(ex - 10 * k, ey + 4, ex, ey - 13, ex + 10 * k, ey + 4, 5.5, { tip: .5 }));
    } else if (et === 'wide') {
      o.push(`<ellipse cx="${ex}" cy="${ey}" rx="${12 * k}" ry="13" fill="#ffffff" stroke="${INK}" stroke-width="4.3"/><circle cx="${ex + look}" cy="${ey + 1}" r="4.6" fill="${INK}"/>`);
    } else if (EXT.eye[et]) o.push(...EXT.eye[et]({ ex, ey, s, k, look, F }));
    else o.push(`<ellipse cx="${ex + look * .6}" cy="${ey}" rx="${7.8 * k}" ry="11"/>`.replace('/>', ` fill="${INK}"/>`));
    if (F.brows && F.brows[i]) { const [raise, tilt, arch, bw = 1] = F.brows[i], by = ey - 21 - raise, L = 13 * k * (bw > 1 ? 1.12 : 1);
    const xi = ex - s * L, xo = ex + s * L, yi = by + tilt, yo = by - tilt * .4;
    o.push(brush(xi, yi, ex + s * 2, (yi + yo) / 2 - arch, xo, yo, 7.2 * bw, { bias: .4, tip: .3 })); }
  }
  const mx = fx + turn * 7, my = ey + (mouthY ?? 41), m = F.mouth, sq = 1 - .25 * at;
  if (m === 'lens') o.push(`<path d="M${mx - 8 * sq},${my + 1.5} Q${mx},${my - 4} ${mx + 8 * sq},${my + 1.5} Q${mx},${my + 4} ${mx - 8 * sq},${my + 1.5} Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`);
  else if (m === 'smirk') o.push(brush(mx - 9 * sq, my, mx + 1, my + 6, mx + 11 * sq, my - 5, 4.6, { bias: .6, tip: .4 }));
  else if (m === 'flat') o.push(brush(mx - 8 * sq, my + 1, mx, my - 1, mx + 8 * sq, my + 1, 4.4, { tip: .45 }));
  else if (m === 'frown') o.push(brush(mx - 9 * sq, my + 3, mx, my - 6, mx + 9 * sq, my + 3, 4.4, { tip: .4 }));
  else if (m === 'o') o.push(`<ellipse cx="${mx}" cy="${my + 2}" rx="${6 * sq}" ry="7.5" fill="${INK}"/>`);
  else if (m === 'talk') o.push(`<path d="M${mx - 12 * sq},${my - 3} Q${mx},${my - 6} ${mx + 12 * sq},${my - 3} Q${mx + 10 * sq},${my + 11} ${mx},${my + 11} Q${mx - 10 * sq},${my + 11} ${mx - 12 * sq},${my - 3} Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="${mx + 1}" cy="${my + 7}" rx="${5.5 * sq}" ry="3" fill="#b8475a"/>`);
  else if (m === 'grin') {
    o.push(`<path d="M${mx - 22 * sq},${my - 6} Q${mx},${my - 1} ${mx + 22 * sq},${my - 6} Q${mx + 17 * sq},${my + 16} ${mx},${my + 16} Q${mx - 17 * sq},${my + 16} ${mx - 22 * sq},${my - 6} Z" fill="${INK}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`);
    o.push(`<path d="M${mx - 17 * sq},${my - 3.5} Q${mx},${my + 1} ${mx + 17 * sq},${my - 3.5} L${mx + 15 * sq},${my + 3} Q${mx},${my + 7} ${mx - 15 * sq},${my + 3} Z" fill="#ffffff"/>`);
    for (const t of [-8.5, 0, 8.5]) o.push(`<path d="M${mx + t * sq},${my - 1} L${mx + t * sq},${my + 5}" stroke="${INK}" stroke-width="1.8"/>`);
  } else if (EXT.mouth[m]) o.push(...EXT.mouth[m]({ mx, my, sq, F }));
  const hc = head || { cx: fx - turn * 50, hy: ey + 14 };
  for (const f of F.fx || []) if (EXT.fx[f]) o.push(...EXT.fx[f]({ ...hc, fx, ey, dx, turn, F }));
  return o;
}

// VIEWS: front | 34 (body front, face to the side) | side (body + face to the side) | back (no face)
// dir = 1 faces screen-right, -1 faces screen-left
export const VIEWS = { front: 0, '34': .55, side: 1, back: 0 };
export function drawCharacter(S) {
  GID = 0; const defs = [], back = [], mid = [], front = [];
  const view = S.view || 'front', dir = S.dir || 1;
  const cx = S.x ?? 300, R = 100;                       // head is DRAWN at R=100, then scaled by K
  const K = S.headK ?? 1.5;                              // head scale (CB 20:07: heads 50% bigger)
  const turn = (S.turn ?? VIEWS[view]) * dir, at = Math.abs(turn), side = view === 'side';
  const bodyTop = S.bodyTop ?? 333, bodyBot = S.bodyBot ?? 640;
  const wT = (S.wTop ?? 74) * (side ? .78 : 1), wB = (S.wBot ?? 104) * (side ? .8 : 1);
  const headY = bodyTop - R * K * .78;                   // head overlaps the shoulders by .22 R
  const ground = S.ground ?? 900;
  const LEG = S.legW ?? 17, lc = INK;   // CB 21:53: legs and arms ALWAYS the same colour (ink); S.legs ignored
  const ctx = { view, dir, turn, defs, path, clothGrad, hairFill, smooth, shade, tint, THIN, brush };

  // legs: one line from hip to toe, sharp L at the ankle (LOCKED look 20:18)
  // front/back: feet point outward. 34: body front, feet slightly to the facing side. side: legs close, both feet forward, knees bend.
  const legs = side
    ? [[cx - 12 * dir, cx - 26 * dir, -dir, .7, true], [cx + 10 * dir, cx + 18 * dir, dir, 1, false]]
    : [[cx - (S.hipW ?? 13), cx - 36 - (S.stance ?? 0) + turn * 10, -1, 1, false], [cx + (S.hipW ?? 13), cx + 34 + (S.stance ?? 0) + turn * 10, 1, 1, false]];
  if (S.behind) back.push(...S.behind({ ...ctx, cx, bodyTop, bodyBot }));   // capes, wings, quivers: behind legs + body
  let legI = 0;
  for (const [hx0, ax0, sd, depth, far] of (S.noLegs ? [] : legs)) {   // S.noLegs: ghosts / floating forms
    const LP = (S.legPose && S.legPose[legI++]) || [0, 0, 0];           // optional motion hook (2026-11-10): per leg [foot dx, foot lift, knee bend]; default = the locked standing legs
    const ax = ax0 + LP[0], top = bodyBot - 20, ay = ground - 7 - LP[1], mx = (hx0 + ax) / 2;
    const knee = (side ? dir * 48 * depth : sd * 6 + (view === '34' ? turn * 14 : 0)) + LP[2];
    const leg = `M${hx0},${top} C${mx + knee},${top + (ay - top) * .3} ${ax + knee * .35},${top + (ay - top) * .72} ${ax},${ay}`;
    const fdir = side ? dir : view === '34' ? (sd === dir ? dir : sd * .6) : sd, fl = side ? 44 : view === '34' && sd === dir ? 40 : 28;
    const line = `${leg} L${ax + fdir * fl},${ay}`;
    const col = far ? shade(lc, .8) : lc;
    back.push(`<path d="${line}" fill="none" stroke="${INK}" stroke-width="${LEG}" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4"/>`);
    back.push(`<path d="${line}" fill="none" stroke="${col}" stroke-width="${LEG - 7}" stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="4"/>`);
  }
  const armPath = (a) => `<path d="${a.d}" fill="none" stroke="${INK}" stroke-width="${S.armW ?? 15}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${a.hand[0]}" cy="${a.hand[1]}" r="${S.handR ?? 15}" fill="${INK}"/>`;
  const arms = S.arms ? S.arms({ cx, view, dir, turn }) : {};
  if (arms.back) back.push(armPath(arms.back));

  // body (side view: narrower, belly to the front)
  const B = S.bodyPts ? S.bodyPts({ cx, bodyTop, bodyBot, side, dir, view }) : beanPts(cx + (side ? dir * 4 : 0), bodyTop, bodyBot, wT, wB, S.lean || 0);   // optional custom silhouette (bodies.mjs)
  const bodyD = smooth(B);
  mid.push(path(bodyD, clothGrad(defs, S.coat, cx - wB, cx + wB), 'none', 0));
  const bodyClip = clip(defs, bodyD);
  const det = [];
  if (view !== 'back') det.push(`<ellipse cx="${cx + 14}" cy="${bodyTop + 6}" rx="${R * K * .7}" ry="${R * K * .26}" fill="#1a1028" opacity=".22"/>`);
  det.push(`<path d="${smooth(B.slice(9, 14).map(([x, y]) => [x + 9, y]), false)}" fill="none" stroke="#ffffff" stroke-opacity=".32" stroke-width="7" stroke-linecap="round"/>`);
  const dcx = cx + (side ? dir * wT * .62 : turn * 34);
  if (S.details) det.push(...S.details({ ...ctx, cx: dcx, bodyTop, bodyBot, wT, wB, side }));
  mid.push(`<g clip-path="url(#${bodyClip})">${det.join('')}</g>`);
  mid.push(inkRing(B, LINE * 1.05, { seed: 2 }));

  for (const a of [].concat(arms.front || [])) front.push(armPath(a));
  if (S.props && view !== 'back') front.push(...S.props({ ...ctx, cx }));
  const afterHead = S.over && view !== 'back' ? S.over({ ...ctx, cx }) : [];   // props that must sit in front of the head (raised swords, torches)

  // head
  const hy = headY, hstart = front.length, HP = headPts(cx, hy, R, S.head || 'rick', dir < 0), hd = smooth(HP);
  if (S.hairBack) front.push(...S.hairBack({ ...ctx, cx, hy, R }));
  const M = S.meme && view !== 'back' ? S.meme(cx, hy, { view, dir, turn }) : null;   // meme-level expression (memes.mjs)
  if (M && M.under) front.push(...M.under);
  front.push(path(hd, M && M.skin ? `url(#${M.skin})` : skinGrad(defs, cx, hy, R), 'none', 0));
  if (S.extraDefs) defs.push(S.extraDefs);
  const headInkAt = front.length;
  const fx = cx + turn * R * (side ? .4 : .5), ey = hy + (S.eyeY ?? -14);
  if (M) front.push(`<g transform="translate(${(turn * R * (M.turned ? 0 : side ? .34 : .42)).toFixed(1)},${S.memeDy || 0}) translate(${cx},0) scale(${M.turned ? 1 : (1 - .22 * at).toFixed(3)},1) translate(${-cx},0)">${M.over.join('')}</g>`);
 else front.push(...faceKit(S.face, fx, ey, turn, S.mouthY, view, { cx, hy }));   // views hook (2026-11-10): a drawn face slides to the facing side and narrows a little, like the rig's own face kit, so 3/4 and side read as turned
  if (S.faceExtras) { const fe = S.faceExtras({ ...ctx, fx, ey, hy, R, cx }); front.push(M || !turn || !S.slideExtras ? fe.join('') : `<g transform="translate(${(turn * R * (side ? .34 : .42)).toFixed(1)},0) translate(${cx},0) scale(${(1 - .22 * at).toFixed(3)},1) translate(${-cx},0)">${fe.join('')}</g>`); }   // same slide as a drawn face, so muzzles, beards and glasses turn with the head
  if (S.hat) front.push(...S.hat({ ...ctx, cx, fx, hy, R }));
  front.splice(headInkAt, 0, inkRing(HP, LINE * 1.12 / K, { seed: 5 }));
  const headParts = front.splice(hstart).join('').replace(/stroke-width="([\d.]+)"/g, (m, w) => `stroke-width="${(+w / Math.sqrt(K)).toFixed(2)}"`);
  front.push(`<g transform="translate(${cx},${hy}) scale(${K}) rotate(${(M ? M.rot || 0 : 0) + (S.headTilt || 0)}) scale(${M ? M.sx || 1 : 1},${M ? M.sy || 1 : 1}) translate(${-cx},${-hy})">${headParts}</g>`);

  front.push(...afterHead);
  const shadow = `<ellipse cx="${cx + 12}" cy="${ground}" rx="${side ? 80 : 105}" ry="16" fill="#2a1a1f" opacity=".18"/>`;
  const all = shadow + back.join('') + mid.join('') + front.join('');
  return { defs: defs.join(''), body: S.dy ? `<g transform="translate(0,${S.dy})">${all}</g>` : all };
}

export function svgDoc(chars, W, H, bg = 'none') {
  const parts = chars.map(c => drawCharacter(c));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${parts.map(p => p.defs).join('')}</defs>${bg !== 'none' ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ''}${parts.map(p => p.body).join('')}</svg>`;
}

// =====================================================================================
// EXPRESSION PARTS (from Rick's sheets, pushed EXTRA HUGE per CB 20:39). Head space: R = 100.
// =====================================================================================
const PINK = '#c94a5f', BLUE = '#8fd3f4', RED = '#e0453a';
const ell = (x, y, rx, ry, f, st = '', sw = 0) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"${st ? ` stroke="${st}" stroke-width="${sw}"` : ''}/>`;
const P = (d, f = INK, st = INK, sw = 2.2) => `<path d="${d}" fill="${f}" stroke="${st}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const drop = (x, y, sz, col = BLUE) => `<path d="M${x},${y - sz * 1.5} Q${x + sz},${y - sz * .2} ${x + sz},${y + sz * .35} A${sz},${sz} 0 0,1 ${x - sz},${y + sz * .35} Q${x - sz},${y - sz * .2} ${x},${y - sz * 1.5} Z" fill="${col}" stroke="${INK}" stroke-width="3"/><path d="M${x - sz * .45},${y + sz * .1} q0,${sz * .45} ${sz * .3},${sz * .6}" fill="none" stroke="#ffffff" stroke-width="${Math.max(1.6, sz * .22)}" stroke-linecap="round"/>`;
const star4 = (x, y, r, col = '#ffe066') => `<path d="M${x},${y - r} Q${x + r * .18},${y - r * .18} ${x + r},${y} Q${x + r * .18},${y + r * .18} ${x},${y + r} Q${x - r * .18},${y + r * .18} ${x - r},${y} Q${x - r * .18},${y - r * .18} ${x},${y - r} Z" fill="${col}" stroke="${INK}" stroke-width="2.6"/>`;
export const EXT = {
  eye: {
    lidHalf: ({ ex, ey, s, k, look }) => { const ly = ey + 1, pr = 7.2 * k; return [`<path d="M${ex + look - pr},${ly} A${pr},${7} 0 0,0 ${ex + look + pr},${ly} Z" fill="${INK}"/>`, brush(ex - 15 * k, ly, ex, ly - 1.5, ex + 15 * k, ly - .5, 4.8, { tip: .45 })]; },
    angry: ({ ex, ey, s, k, look }) => {   // pupil cut by a lid that slants down to the nose
      const ly = ey - 2, yIn = ly + 7, yOut = ly - 5, xIn = ex - s * 15 * k, xOut = ex + s * 15 * k;
      const lineY = x => yIn + (yOut - yIn) * (x - xIn) / (xOut - xIn), pts = [];
      for (let a = 0; a <= Math.PI * 2 + 1e-6; a += Math.PI / 36) { const x = ex + look + Math.cos(a) * 8.6 * k, y = ey + 2 + Math.sin(a) * 11.5; pts.push([x, Math.max(y, lineY(x))]); }
      return [`<path d="M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z" fill="${INK}"/>`, brush(xIn, yIn, ex, (yIn + yOut) / 2 - 1, xOut, yOut, 5.6, { tip: .45 })];
    },
    bigOval: ({ ex, ey, k, look }) => [ell(ex + look, ey, 10.5 * k, 15, INK), ell(ex + look - 3, ey - 6, 3, 3.6, '#ffffff')],
    dot: ({ ex, ey, k, look }) => [ell(ex + look, ey + 1, 5.6 * k, 6.4, INK)],
    wideXL: ({ ex, ey, k, look }) => [ell(ex, ey, 17 * k, 19, '#ffffff', INK, 4.6), ell(ex + look, ey + 1, 5.8, 6.4, INK)],
    shock: ({ ex, ey, k }) => [ell(ex, ey - 2, 19 * k, 22, '#ffffff', INK, 4.8), ell(ex, ey - 1, 2.8, 3.2, INK)],
    sparkle: ({ ex, ey, k }) => [ell(ex, ey, 12.5 * k, 17, INK), ell(ex - 4 * k, ey - 6, 4.6, 5.4, '#ffffff'), ell(ex + 4 * k, ey + 6, 2.2, 2.4, '#ffffff')],
    happyXL: ({ ex, ey, k }) => [brush(ex - 15 * k, ey + 6, ex, ey - 17, ex + 15 * k, ey + 6, 7, { tip: .45 })],
    squeeze: ({ ex, ey, s, k }) => [brush(ex - s * 12 * k, ey - 10, ex + s * 3 * k, ey - 3, ex + s * 12 * k, ey + 1, 6, { tip: .4 }), brush(ex + s * 12 * k, ey + 1, ex + s * 3 * k, ey + 4, ex - s * 12 * k, ey + 10, 6, { tip: .4 })],
    closed: ({ ex, ey, k }) => [brush(ex - 13 * k, ey, ex, ey + 6, ex + 13 * k, ey, 5.4, { tip: .45 })],
    cry: ({ ex, ey, k }) => [brush(ex - 14 * k, ey + 4, ex, ey - 8, ex + 14 * k, ey + 4, 6.2, { tip: .4 }), brush(ex - 9 * k, ey + 1, ex - 2, ey + 3, ex + 4 * k, ey + 8, 3.5, { tip: .3 })],
    spiral: ({ ex, ey }) => { let d = `M${ex},${ey}`; for (let a = 0; a < Math.PI * 5; a += .3) { const r = 1.3 * a; d += ` L${(ex + Math.cos(a) * r).toFixed(1)},${(ey + Math.sin(a) * r * 1.1).toFixed(1)}`; } return [`<path d="${d}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`]; },
    x: ({ ex, ey, k }) => [brush(ex - 11 * k, ey - 11, ex, ey, ex + 11 * k, ey + 11, 6, { tip: .5 }), brush(ex + 11 * k, ey - 11, ex, ey, ex - 11 * k, ey + 11, 6, { tip: .5 })],
    tearful: ({ ex, ey, k, look }) => [ell(ex + look, ey, 11 * k, 15, INK), ell(ex - 3.5, ey - 6, 3.8, 4.4, '#ffffff'), ell(ex + 3.5, ey + 5, 2, 2.2, '#ffffff'), `<path d="M${ex - 13 * k},${ey + 9} Q${ex},${ey + 17} ${ex + 13 * k},${ey + 9}" fill="none" stroke="${BLUE}" stroke-width="4.5" stroke-linecap="round"/>`],
  },
  mouth: {
    smile: ({ mx, my }) => [P(`M${mx - 16},${my - 4} Q${mx},${my + 2} ${mx + 16},${my - 4} Q${mx + 12},${my + 16} ${mx},${my + 16} Q${mx - 12},${my + 16} ${mx - 16},${my - 4} Z`), ell(mx + 2, my + 11, 7, 3.6, PINK)],
    smileXL: ({ mx, my }) => [P(`M${mx - 30},${my - 8} Q${mx},${my} ${mx + 30},${my - 8} Q${mx + 24},${my + 26} ${mx},${my + 27} Q${mx - 24},${my + 26} ${mx - 30},${my - 8} Z`), ell(mx + 3, my + 18, 13, 6, PINK)],
    smirkXL: ({ mx, my }) => [brush(mx - 20, my - 2, mx + 2, my + 12, mx + 24, my - 10, 6.4, { bias: .62, tip: .35 })],
    flatXL: ({ mx, my }) => [brush(mx - 18, my + 2, mx, my - 2, mx + 18, my + 2, 6, { tip: .45 })],
    smileSmall: ({ mx, my }) => [brush(mx - 12, my - 2, mx, my + 10, mx + 12, my - 2, 5, { tip: .4 })],
    grinXL: ({ mx, my }) => [P(`M${mx - 34},${my - 10} Q${mx},${my - 2} ${mx + 34},${my - 10} Q${mx + 28},${my + 28} ${mx},${my + 30} Q${mx - 28},${my + 28} ${mx - 34},${my - 10} Z`), P(`M${mx - 28},${my - 6} Q${mx},${my + 1} ${mx + 28},${my - 6} L${mx + 25},${my + 5} Q${mx},${my + 11} ${mx - 25},${my + 5} Z`, '#ffffff', 'none', 0), ...[-16, -6, 4, 14].map(t => `<path d="M${mx + t},${my - 2} L${mx + t},${my + 8}" stroke="${INK}" stroke-width="2"/>`), ell(mx + 3, my + 22, 11, 5, PINK)],
    teeth: ({ mx, my, F }) => { const w = (F.teethW || 25), h = (F.teethH || 12); const o = [P(`M${mx - w},${my - h} Q${mx},${my - h - 3} ${mx + w},${my - h} Q${mx + w + 3},${my} ${mx + w},${my + h} Q${mx},${my + h + 3} ${mx - w},${my + h} Q${mx - w - 3},${my} ${mx - w},${my - h} Z`, '#ffffff', INK, 4.4), `<path d="M${mx - w + 1},${my} L${mx + w - 1},${my}" stroke="${INK}" stroke-width="2.4"/>`]; for (let t = -w + w / 3; t < w - 2; t += w / 3) o.push(`<path d="M${mx + t},${my - h + 1} L${mx + t},${my + h - 1}" stroke="${INK}" stroke-width="2.2"/>`); return o; },
    gasp: ({ mx, my }) => [P(`M${mx},${my - 12} C${mx + 17},${my - 12} ${mx + 17},${my + 30} ${mx},${my + 30} C${mx - 17},${my + 30} ${mx - 17},${my - 12} ${mx},${my - 12} Z`), ell(mx + 1, my + 22, 8.5, 5, PINK)],
    gaspXL: ({ mx, my }) => [P(`M${mx},${my - 16} C${mx + 25},${my - 16} ${mx + 25},${my + 42} ${mx},${my + 42} C${mx - 25},${my + 42} ${mx - 25},${my - 16} ${mx},${my - 16} Z`), ell(mx + 1, my + 32, 12, 7, PINK), P(`M${mx - 12},${my - 9} Q${mx},${my - 13} ${mx + 12},${my - 9} L${mx + 10},${my - 4} Q${mx},${my - 7} ${mx - 10},${my - 4} Z`, '#ffffff', 'none', 0)],
    wavy: ({ mx, my, F }) => { const w = F.wavyW || 20; let d = `M${mx - w},${my}`; for (let k = 0; k < 4; k++) d += ` q${w / 4},${k % 2 ? 7 : -7} ${w / 2},0`; return [`<path d="${d}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`]; },
    frownXL: ({ mx, my }) => [brush(mx - 22, my + 10, mx, my - 14, mx + 22, my + 10, 6.5, { tip: .35 })],
    wail: ({ mx, my }) => [P(`M${mx - 26},${my + 18} Q${mx - 20},${my - 14} ${mx},${my - 14} Q${mx + 20},${my - 14} ${mx + 26},${my + 18} Q${mx},${my + 8} ${mx - 26},${my + 18} Z`), ell(mx, my + 10, 10, 4.5, PINK)],
    shout: ({ mx, my }) => [P(`M${mx - 30},${my - 10} L${mx + 30},${my - 10} Q${mx + 26},${my + 30} ${mx},${my + 32} Q${mx - 26},${my + 30} ${mx - 30},${my - 10} Z`), P(`M${mx - 26},${my - 7} L${mx + 26},${my - 7} L${mx + 24},${my} L${mx - 24},${my} Z`, '#ffffff', 'none', 0), ell(mx + 2, my + 24, 13, 6, PINK)],
    evil: ({ mx, my }) => { const o = [P(`M${mx - 36},${my - 14} Q${mx},${my + 4} ${mx + 36},${my - 14} Q${mx + 22},${my + 22} ${mx},${my + 22} Q${mx - 22},${my + 22} ${mx - 36},${my - 14} Z`)]; let d = `M${mx - 30},${my - 8}`; for (let k = 0; k < 8; k++) d += ` L${mx - 30 + k * 7.5 + 3.75},${my + (k % 2 ? -1 : 6)}`; d += ` L${mx + 30},${my - 8} Q${mx},${my + 6} ${mx - 30},${my - 8} Z`; o.push(P(d, '#ffffff', 'none', 0)); return o; },
    tongue: ({ mx, my }) => [brush(mx - 16, my - 2, mx, my + 9, mx + 16, my - 2, 5, { tip: .4 }), P(`M${mx - 1},${my + 3} Q${mx - 2},${my + 20} ${mx + 7},${my + 20} Q${mx + 15},${my + 19} ${mx + 13},${my + 2}`, PINK, INK, 3.5)],
    sideways: ({ mx, my }) => [brush(mx - 2, my + 3, mx + 10, my + 3, mx + 20, my - 5, 5, { tip: .4 })],
    tiny: ({ mx, my }) => [ell(mx, my + 2, 4.2, 4.8, INK)],
    kiss: ({ mx, my }) => [brush(mx - 4, my - 6, mx + 8, my - 1, mx - 3, my + 2, 4.2, { tip: .5 }), brush(mx - 3, my + 2, mx + 8, my + 5, mx - 4, my + 10, 4.2, { tip: .5 })],
  },
  fx: {
    sweat: ({ cx, hy }) => [drop(cx + 74, hy - 46, 10)],
    sweats: ({ cx, hy }) => [drop(cx + 78, hy - 50, 11), drop(cx - 82, hy - 30, 8), drop(cx + 92, hy - 14, 6)],
    vein: ({ cx, hy }) => { const x = cx + 58, y = hy - 62, a = (dx1, dy1, dx2, dy2) => `<path d="M${x + dx1},${y + dy1} Q${x + (dx1 + dx2) * .2},${y + (dy1 + dy2) * .2} ${x + dx2},${y + dy2}" fill="none" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>`; return [a(-4, -14, -4, -4), a(-14, -4, -4, -4), a(4, -14, 4, -4), a(14, -4, 4, -4), a(-4, 14, -4, 4), a(-14, 4, -4, 4), a(4, 14, 4, 4), a(14, 4, 4, 4)]; },
    redMarks: ({ cx, hy }) => [[118, -60, 132, -74], [126, -38, 145, -42], [126, -16, 144, -8], [-118, -60, -132, -74], [-126, -38, -145, -42]].map(([a, b, c, d]) => `<path d="M${cx + a},${hy + b} L${cx + c},${hy + d}" stroke="${RED}" stroke-width="5.5" stroke-linecap="round"/>`),
    steam: ({ cx, hy }) => { const puff = (x, y, s) => { const d = smooth([[x - 18 * s, y + 4 * s], [x - 14 * s, y - 10 * s], [x - 2 * s, y - 15 * s], [x + 12 * s, y - 12 * s], [x + 19 * s, y - 1 * s], [x + 12 * s, y + 11 * s], [x - 3 * s, y + 13 * s], [x - 14 * s, y + 11 * s]]); return P(d, '#e9e6ee', INK, 3.4); }; return [puff(cx - 118, hy - 8, 1.1), puff(cx - 140, hy - 34, .7), puff(cx + 118, hy - 8, 1.1), puff(cx + 140, hy - 34, .7)]; },
    blush: ({ fx, ey, dx }) => [-1, 1].flatMap(s => [ell(fx + s * (dx + 12), ey + 20, 15, 8, '#f39aac'), ...[-6, 0, 6].map(t => `<path d="M${fx + s * (dx + 12) + t - 2},${ey + 23} l4,-7" stroke="#e0607a" stroke-width="2" stroke-linecap="round"/>`)]),
    tears: ({ fx, ey, dx }) => [-1, 1].map(s => `<path d="M${fx + s * dx},${ey + 8} Q${fx + s * (dx + 4)},${ey + 40} ${fx + s * (dx + 2)},${ey + 76}" fill="none" stroke="${BLUE}" stroke-width="9" stroke-linecap="round" opacity=".95"/>`),
    joyTears: ({ fx, ey, dx }) => [drop(fx - dx - 22, ey - 4, 6), drop(fx + dx + 22, ey - 4, 6)],
    sparkles: ({ cx, hy }) => [star4(cx - 112, hy - 66, 13), star4(cx + 116, hy - 52, 16), star4(cx + 96, hy - 98, 9)],
    shockLines: ({ cx, hy }) => [[-.5, 1], [-.25, 1.15], [0, 1.2], [.25, 1.15], [.5, 1]].map(([a, l]) => { const ang = -Math.PI / 2 + a; return `<path d="M${cx + Math.cos(ang) * 112},${hy + Math.sin(ang) * 112} L${cx + Math.cos(ang) * (112 + 28 * l)},${hy + Math.sin(ang) * (112 + 28 * l)}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`; }),
    gloom: ({ cx, hy }) => [`<g opacity=".5">${[-48, -32, -16, 0, 16, 32, 48].map(t => `<path d="M${cx + t},${hy - 90 + Math.abs(t) * .5} L${cx + t},${hy - 40}" stroke="#5a5fa8" stroke-width="4" stroke-linecap="round"/>`).join('')}</g>`],
    stars: ({ cx, hy }) => [`<ellipse cx="${cx}" cy="${hy - 108}" rx="70" ry="14" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="6 7" opacity=".6"/>`, star4(cx - 62, hy - 110, 11), star4(cx + 8, hy - 96, 13), star4(cx + 60, hy - 118, 10)],
    zzz: ({ cx, hy }) => [[cx + 92, hy - 70, 14], [cx + 118, hy - 98, 18], [cx + 148, hy - 132, 22]].map(([x, y, z]) => `<path d="M${x - z / 2},${y - z / 2} L${x + z / 2},${y - z / 2} L${x - z / 2},${y + z / 2} L${x + z / 2},${y + z / 2}" fill="none" stroke="${INK}" stroke-width="${z * .26}" stroke-linecap="round" stroke-linejoin="round"/>`),
    exclaim: ({ cx, hy }) => [P(`M${cx + 96},${hy - 150} L${cx + 112},${hy - 150} L${cx + 106},${hy - 108} L${cx + 102},${hy - 108} Z`, RED, INK, 3.5), ell(cx + 104, hy - 96, 7, 7, RED, INK, 3.5)],
    question: ({ cx, hy }) => [`<path d="M${cx + 88},${hy - 136} Q${cx + 92},${hy - 158} ${cx + 110},${hy - 156} Q${cx + 130},${hy - 152} ${cx + 124},${hy - 134} Q${cx + 118},${hy - 124} ${cx + 108},${hy - 120} L${cx + 108},${hy - 108}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`, ell(cx + 108, hy - 94, 5.5, 5.5, INK)],
    heart: ({ cx, hy }) => [P(`M${cx + 108},${hy - 84} C${cx + 86},${hy - 100} ${cx + 92},${hy - 124} ${cx + 108},${hy - 112} C${cx + 124},${hy - 124} ${cx + 130},${hy - 100} ${cx + 108},${hy - 84} Z`, '#f05a78', INK, 3.5)],
  },
};

// 24 expression presets, pushed bigger than Rick's (features ~1.3-1.8x, brows travel further, effects added)
Object.assign(FACES, {
  smug:      { eyes: 'lidHalf', brows: [[-3, 3, 1, 1.15], [15, -5, 9, 1.15]], mouth: 'smirkXL' },
  happy:     { eyes: 'happyXL', brows: [[10, -3, 7], [12, -3, 8]], mouth: 'smileXL' },
  laugh:     { eyes: 'squeeze', brows: [[12, -4, 6], [12, -4, 6]], mouth: 'grinXL', fx: ['joyTears'] },
  cheer:     { eyes: 'happyXL', brows: [[12, -3, 7], [12, -3, 7]], mouth: 'teeth', fx: ['sparkles'] },
  excited:   { eyes: 'sparkle', brows: [[14, -3, 8], [14, -3, 8]], mouth: 'grinXL', fx: ['sparkles'] },
  shy:       { eyes: 'happyXL', brows: [[4, -5, 4], [4, -5, 4]], mouth: 'smileSmall', fx: ['blush'] },
  love:      { eyes: 'closed', brows: [[6, -4, 5], [6, -4, 5]], mouth: 'kiss', fx: ['blush', 'heart'] },
  surprised: { eyes: 'wideXL', brows: [[18, -2, 9, 1.1], [20, -2, 9, 1.1]], mouth: 'gaspXL', fx: ['exclaim'] },
  shocked:   { eyes: 'shock', brows: [[22, -1, 9, 1.1], [22, -1, 9, 1.1]], mouth: 'gaspXL', fx: ['shockLines', 'sweat'] },
  scared:    { eyes: 'shock', brows: [[14, -9, 4], [14, -9, 4]], mouth: 'wavy', fx: ['gloom', 'sweats'], wavyW: 26 },
  worried:   { eyes: 'bigOval', brows: [[12, -12, 3, 1.1], [12, -12, 3, 1.1]], mouth: 'wavy', wavyW: 26, fx: ['sweats'] },
  nervous:   { eyes: 'dot', brows: [[8, -8, 3], [8, -8, 3]], mouth: 'teeth', teethW: 30, teethH: 10, fx: ['sweats'] },
  sad:       { eyes: 'bigOval', brows: [[8, -13, 2, 1.1], [8, -13, 2, 1.1]], mouth: 'frownXL', fx: ['gloom'] },
  crying:    { eyes: 'cry', brows: [[8, -11, 2], [8, -11, 2]], mouth: 'wail', fx: ['tears'] },
  teary:     { eyes: 'tearful', brows: [[8, -10, 2], [8, -10, 2]], mouth: 'wavy', wavyW: 14 },
  angry:     { eyes: 'angry', brows: [[-6, 12, -2, 1.25], [-6, 12, -2, 1.25]], mouth: 'teeth', teethW: 24, teethH: 9, fx: ['vein'] },
  furious:   { eyes: 'squeeze', brows: [[-8, 15, -2, 1.35], [-8, 15, -2, 1.35]], mouth: 'shout', fx: ['steam', 'vein', 'redMarks'] },
  annoyed:   { eyes: 'lidHalf', brows: [[-6, 6, 0, 1.15], [-5, 7, 0, 1.15]], mouth: 'flatXL', fx: ['redMarks', 'vein'] },
  frustrated:{ eyes: 'dot', brows: [[0, 9, 0, 1.15], [0, 9, 0, 1.15]], mouth: 'wavy', fx: ['steam'] },
  skeptical: { eyes: ['lidHalf', 'oval'], brows: [[-6, 5, 0], [18, -3, 9, 1.1]], mouth: 'sideways' },
  confused:  { eyes: ['dot', 'oval'], brows: [[12, -4, 6], [-2, 6, 0]], mouth: 'wavy', wavyW: 14, fx: ['question'] },
  evil:      { eyes: 'angry', brows: [[-4, 14, -3, 1.3], [-4, 14, -3, 1.3]], mouth: 'evil' },
  dizzy:     { eyes: ['spiral', 'x'], brows: null, mouth: 'tongue', fx: ['stars'] },
  sleepy:    { eyes: 'closed', brows: [[-2, 0, 1], [-2, 0, 1]], mouth: 'gasp', fx: ['zzz'] },
  wink:      { eyes: ['happyXL', 'oval'], brows: [[4, -2, 5], [12, -3, 7]], mouth: 'tongue', fx: ['sparkles'] },
});
