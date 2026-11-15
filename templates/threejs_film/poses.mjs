// POSES for the vector2d puppets, without touching the character package.
// The rig lets us plug in S.arms and S.props, so a pose = hand targets; the arm is one curved line shoulder -> hand
// ("every joint is a curve"). Anything the rig cannot do yet (legs for a walk, arms in front of the head) is handled
// here as an overlay or listed in README "rig hooks".
// Sides: 'R' = the character's right hand = screen-left in the front view (s = -1); 'L' = screen-right (s = +1).
// Targets are [out, down] in arm lengths from the shoulder; `abs` targets are worked out from the head or the other hand.
export const POSES = {
  stand:      {},
  hold_watch: { prop: [0.42, 0.34] },                                   // forearm raised, the held thing in front of the belly
  press_watch:{ prop: [0.42, 0.34], main: 'toProp' },                   // other hand comes across onto it
  point_up:   { main: [0.82, -0.74], finger: 1, over: 1 },
  point_out:  { main: [0.99, -0.12], finger: 1, toDir: 1 },             // points to the side the character faces
  hands_hips: { both: [0.16, 0.60], bow: 1.0 },
  flinch:     { both: [0.55, -0.42], rot: -5, over: 0 },
  finger_up:  { main: 'besideHead', finger: 1, over: 1 },
  show_wrist: { main: [0.05, 0.10], wrist: 1 },                         // forearm across the chest, wrist to the lens
  hand_mouth: { main: 'mouth', over: 1 },
  clap:       { both: 'centre', dy: -6 },
  reach_up:   { main: [0.30, -1.02], over: 1 },                             // stretches for something too high (a lever handle)
  hold_up:    { prop: [0.55, -0.80], over: 1 },                             // the held thing raised beside the head (key to the driver, letter, bottle)
  hold_out:   { prop: [0.88, 0.02], over: 1 },                                       // offers the held thing sideways (a coin)
  push:       { both: [0.80, 0.12], bow: 0.3 },                             // both hands forward on a push bar
  write:      { main: [0.62, 0.42], rot: 3 },                               // hand down on the desk, body tipped
  knock:      { main: [0.78, -0.34] },                                      // fist raised to a door
  walk0:      { swing: 1, dy: -10, rot: 2.5, legs: [[8, 0, 6], [-14, 36, -20]], head: 3 },     // step: one foot planted, the other lifted with a bent knee; the body bobs and rocks
  walk1:      { swing: -1, dy: 0, rot: -2.5, legs: [[14, 36, 20], [-8, 0, -6]], head: -3 },
  push0:      { both: [0.80, 0.12], bow: 0.3, dy: -10, rot: 7, legs: [[8, 0, 6], [-14, 36, -20]], head: 3 },      // pushing something while walking (film.json act "walk_pose": "push")
  push1:      { both: [0.80, 0.12], bow: 0.3, dy: 0, rot: 5, legs: [[14, 36, 20], [-8, 0, -6]], head: -2 },
  // ---- motion upgrade 2026-11-10 (CB: no gliding, whole-body acting). legs = per leg [foot dx, foot lift, knee bend] in rig px; head = head tilt in degrees; dy = body drop; rot = lean about the feet
  hang0:      { bothDir: 'aboveHead', over: 1, rot: 7, legs: [[18, 40, 12], [-6, 96, -28]], head: -9 },   // hanging off something high with both hands, legs kicking
  hang1:      { bothDir: 'aboveHead', over: 1, rot: 13, legs: [[8, 100, 26], [-16, 34, -10]], head: 7 },
  hang_s0:    { bothDir: 'aboveSide', over: 1, rot: 5, legs: [[18, 40, 12], [-6, 96, -28]], head: -8 },   // hanging BESIDE the thing: both hands on a rod up to one side of the head (the side he faces), so the lever stays in view next to the body (CB 2026-11-10: a body can never be inside a solid thing)
  hang_s1:    { bothDir: 'aboveSide', over: 1, rot: 10, legs: [[8, 100, 26], [-16, 34, -10]], head: 6 },
  heave:      { bothDir: 'besideHead', over: 1, rot: -15, legs: [[-34, 0, -20], [30, 0, 12]], head: -10 },  // feet braced, whole body leaning back on the pull
  crouch:     { both: [0.42, 0.50], bow: 1.2, drop: 0.42, spread: 0.10, head: 4 },                      // landing: knees out, body dropped (drop = share of the leg length)
  crouch_low: { both: [0.55, 0.42], bow: 1.3, drop: 0.68, spread: 0.14, head: -3 },
  kneel:      { both: [0.30, 0.56], drop: 0.80, spread: 0.18, rot: 3, head: -5, kneel: 1 },             // down on the knees
  sit:        { both: [0.24, 0.60], drop: 0.93, spread: 0.30, head: 2 },                                // sitting on the floor, legs out
  shrug:      { both: [0.78, -0.04], bow: 1.3, head: 9 },
  cool:       { both: [0.16, 0.60], bow: 1.0, rot: -3, legs: [[-10, 0, 0], [22, 0, 10]], head: -6 },           // weight on one leg, head cocked
  dust:       { both: 'centre', dy: 6, head: 5 },
  tiltL:      { head: -7 }, tiltR: { head: 7 },
  bend_down:  { both: [0.16, 0.60], bow: 1.0, rot: 12, dy: 96, legs: [[-28, 96, -44], [40, 96, 52]], head: 18 },   // bends right down to someone small (Rick's boss over the rail)
  lean_in:    { both: [0.16, 0.60], bow: 1.0, rot: 12, dy: 30, legs: [[-18, 30, -18], [30, 30, 26]], head: 8 },  // bends at the waist toward the facing side
};
const warned = new Set();
const num = s => parseFloat(s);
function restArms(S, cx) {
  // read shoulders and resting hands from the character's own arms function (front view), mirror if it only draws one
  const a = S.arms ? S.arms({ cx, view: 'front', dir: 1, turn: 0 }) : {};
  const list = [].concat(a.front || [], a.back || []).map(x => { const m = /M\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(x.d); return { sh: [num(m[1]), num(m[2])], hand: x.hand.slice() }; });
  if (!list.length) list.push({ sh: [cx - 60, (S.bodyTop ?? 333) + 52], hand: [cx - 120, (S.bodyTop ?? 333) + 240] });
  const side = s => { const hit = list.find(x => Math.sign(x.sh[0] - cx) === s); if (hit) return hit; const o = list[0]; return { sh: [2 * cx - o.sh[0], o.sh[1]], hand: [2 * cx - o.hand[0], o.hand[1]] }; };
  return { [-1]: side(-1), [1]: side(1) };
}
function arm(sh, hand, s, L, bow = 0.5) {
  // one smooth curve; the elbow swings out and down, more when the hand is close to the shoulder (keeps the arm length)
  const dx = hand[0] - sh[0], dy = hand[1] - sh[1], d = Math.hypot(dx, dy) || 1, off = Math.max(0.10 * L, Math.sqrt(Math.max(0, (L / 2) ** 2 - (d / 2) ** 2)) * 1.25) * bow * 2;
  let nx = -dy / d, ny = dx / d; if (nx * s + ny * 0.6 < 0) { nx = -nx; ny = -ny; }
  const f = v => v.toFixed(1);
  return { d: `M${f(sh[0])},${f(sh[1])} Q${f(sh[0] + dx / 2 + nx * off)},${f(sh[1] + dy / 2 + ny * off)} ${f(hand[0])},${f(hand[1])}`, hand: [+f(hand[0]), +f(hand[1])], fwd: [dx / d, dy / d] };
}
const PROPS = {
  key: (x, y, INK) => `<g transform="translate(${x},${y}) rotate(-20)"><circle cx="0" cy="-34" r="20" fill="none" stroke="${INK}" stroke-width="15"/><circle cx="0" cy="-34" r="20" fill="none" stroke="#e2b13c" stroke-width="8"/><path d="M0,-14 L0,44 M0,26 L18,26 M0,42 L22,42" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M0,-14 L0,44 M0,26 L18,26 M0,42 L22,42" stroke="#e2b13c" stroke-width="8" stroke-linecap="round"/></g>`,
  coin: (x, y, INK) => `<circle cx="${x}" cy="${y - 6}" r="30" fill="#e2b13c" stroke="${INK}" stroke-width="6"/><circle cx="${x}" cy="${y - 6}" r="20" fill="none" stroke="#b9862a" stroke-width="4"/><path d="M${x - 14},${y - 22} q10,-10 22,-6" stroke="#fff" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  bottle: (x, y, INK) => `<g transform="translate(${x},${y})"><path d="M-10,-96 L10,-96 L10,-62 Q26,-50 26,-28 L26,22 Q26,30 18,30 L-18,30 Q-26,30 -26,22 L-26,-28 Q-26,-50 -10,-62 Z" fill="#7a4a22" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><rect x="-12" y="-104" width="24" height="12" rx="3" fill="#e2b13c" stroke="${INK}" stroke-width="5"/><rect x="-26" y="-22" width="52" height="30" fill="#f3efe6" stroke="${INK}" stroke-width="4"/><path d="M-16,-52 L-16,16" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/></g>`,
  letter: (x, y, INK) => `<g transform="translate(${x},${y}) rotate(-8)"><rect x="-48" y="-92" width="96" height="124" rx="4" fill="#fbf6e8" stroke="${INK}" stroke-width="6"/><path d="M-32,-68 L32,-68 M-32,-48 L32,-48 M-32,-28 L32,-28 M-32,-8 L10,-8" stroke="${INK}" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/><circle cx="26" cy="12" r="13" fill="#d8473c" stroke="${INK}" stroke-width="4"/></g>`,
  notebook: (x, y, INK) => `<g transform="translate(${x},${y}) rotate(6)"><rect x="-36" y="-70" width="72" height="92" rx="5" fill="#fbf6e8" stroke="${INK}" stroke-width="6"/><rect x="-36" y="-70" width="72" height="18" fill="#2f4f86" stroke="${INK}" stroke-width="5"/><path d="M-22,-36 L22,-36 M-22,-18 L22,-18 M-22,0 L8,0" stroke="${INK}" stroke-opacity=".55" stroke-width="4.5" stroke-linecap="round"/></g>`,
  watch: (x, y, INK) => `<circle cx="${x}" cy="${y - 4}" r="24" fill="#e2b13c" stroke="${INK}" stroke-width="5"/><circle cx="${x}" cy="${y - 4}" r="16" fill="#fbf6e8" stroke="${INK}" stroke-width="2.5"/><path d="M${x},${y - 4} L${x},${y - 15} M${x},${y - 4} L${x + 8},${y}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${x}" cy="${y - 30}" r="5" fill="#e2b13c" stroke="${INK}" stroke-width="2.5"/>`,
};
const propSvg = (name, x, y, INK) => PROPS[name] ? PROPS[name](x, y, INK)
  : `<circle cx="${x}" cy="${y}" r="22" fill="#f3efe6" stroke="${INK}" stroke-width="4"/><text x="${x}" y="${y + 8}" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle" fill="${INK}">${String(name)[0].toUpperCase()}</text>`;   // placeholder for props nobody has drawn yet

// applyPose(S, state, { INK, headK, hy, dropProps }) -> mutates S.arms / S.props, returns { over: [svg], rot, dy }
export const SIDE_GRIP = [1.7, 1.05];   // side hang ('aboveSide'): the upper hand, in head radii from the head centre [sideways, up]. tools/film_plan.py apply_clings uses the same numbers.
export function applyPose(S, state, env) {
  const cx = S.x ?? 300, INK = env.INK, R = restArms(S, cx), over = [];
  const armW = S.armW ?? 15, handR = S.handR ?? 15;
  const draw = a => `<path d="${a.d}" fill="none" stroke="${INK}" stroke-width="${armW}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${a.hand[0]}" cy="${a.hand[1]}" r="${handR}" fill="${INK}"/>`;
  const finger = a => `<path d="M${a.hand[0]},${a.hand[1]} l${(a.fwd[0] * (handR + 20)).toFixed(1)},${(a.fwd[1] * (handR + 20)).toFixed(1)}" stroke="${INK}" stroke-width="${Math.max(6, armW * .5)}" stroke-linecap="round"/>`;
  const len = s => Math.hypot(R[s].hand[0] - R[s].sh[0], R[s].hand[1] - R[s].sh[1]) * 1.06;
  const at = (s, t) => [R[s].sh[0] + s * t[0] * len(s), R[s].sh[1] + t[1] * len(s)];
  // solve one pose (for this character's proportions) into numbers: hand targets, legs, head tilt, lean, drop
  const solve = (state) => {
    const name = state.pose || 'stand', parts = name.split('+'), P = parts.every(n => POSES[n]) ? Object.assign({}, ...parts.map(n => POSES[n])) : null;   // 'sit+reach_up': later parts win, so a seated or kneeling body can still gesture
    if (!P && !warned.has(name)) { warned.add(name); console.warn('poses.mjs: unknown pose "' + name + '", using stand'); }
    let p = P || {};
    const sProp = state.hand === 'L' ? 1 : -1;                                        // which side holds the prop
    let sMain = state.prop ? -sProp : -1;                                             // a gesture uses the free hand
    if (p.toDir && !state.prop) sMain = state.dir || 1;
    const tgt = {};                                                                   // side -> hand position
    if (p.both === 'centre') { tgt[-1] = [cx - handR * .8, R[-1].sh[1] + .34 * len(-1)]; tgt[1] = [cx + handR * .8, R[1].sh[1] + .34 * len(1)]; }
    else if (p.both) { tgt[-1] = at(-1, p.both); tgt[1] = at(1, p.both); }
    if (p.bothDir === 'aboveHead') { const HR = 100 * env.headK, y = env.hy - HR * 1.62; tgt[-1] = [cx - handR * .9, y]; tgt[1] = [cx + handR * .9, y]; }   // both hands on one thing straight above the head (hanging); the arms arc round the head, see `hang` below
    else if (p.bothDir === 'aboveSide') { const d = state.dir || 1, HR = 100 * env.headK, t = [cx + d * HR * SIDE_GRIP[0], env.hy - HR * SIDE_GRIP[1]]; tgt[d] = t; tgt[-d] = [t[0], t[1] + handR * 2.0]; }   // one hand over the other on a rod, up beside the head
    else if (p.bothDir) { const d = state.dir || 1, HR = 100 * env.headK, t = p.bothDir === 'besideHead' ? [cx + d * (HR + 46), env.hy + HR * .35] : at(d, p.bothDir); tgt[d] = t; tgt[-d] = [t[0] - d * handR * 1.3, t[1] + handR * 1.1]; }   // both hands on one thing beside the body; short-armed forms stretch to reach
    if (p.swing) for (const s of [-1, 1]) { const ph = p.swing * s; tgt[s] = [R[s].hand[0] - s * ph * 12, R[s].hand[1] - (ph > 0 ? 32 : 6)]; }   // walk: one hand forward (in and up), the other back
    if (state.prop && p.prop) tgt[sProp] = at(sProp, p.prop);
    if (p.main === 'toProp' && tgt[sProp]) tgt[sMain] = [tgt[sProp][0] - sProp * handR * 1.6, tgt[sProp][1] - 8];
    else if (p.main === 'mouth') tgt[sMain] = [cx + sMain * 26 * env.headK, env.hy + 44 * env.headK];
    else if (p.main === 'besideHead') tgt[sMain] = [cx + sMain * (100 * env.headK + handR + 10), env.hy - 30];
    else if (Array.isArray(p.main)) tgt[sMain] = at(sMain, p.main);
    if (p.drop) { const LL = (S.ground ?? 900) - (S.bodyBot ?? 640) + 13, d = p.drop * LL, sp = (p.spread || 0.1) * LL * 2; p = { ...p, dy: d, legs: p.kneel ? [[-sp * .9, d, -sp * 1.6], [sp * 1.3, d, sp * .5]] : [[-sp, d, -sp * 1.5], [sp, d, sp * 1.5]] }; }
    if (p.drop && !p.kneel && state.view === 'side') { const d = p.dy, sp = p.legs[1][0], dd = state.dir || 1; p = { ...p, legs: dd === -1 ? [[sp * 1.3, d, -sp * 1.5], [sp * .8, d, -sp * 1.1]] : [[sp * .8, d, sp * 1.1], [sp * 1.3, d, sp * 1.5]] }; }   // seated or crouched in profile: both knees point forward
    const legs = p.legs ? (state.dir === -1 ? [[-p.legs[1][0], p.legs[1][1], -p.legs[1][2]], [-p.legs[0][0], p.legs[0][1], -p.legs[0][2]]] : p.legs) : [[0, 0, 0], [0, 0, 0]];
    return { p, tgt, sMain, sProp, legs, head: (p.head || 0) * (state.dir || 1), rot: (p.rot || 0) * (state.dir || 1), dy: p.dy || 0, bow: p.bow ?? 0.5 };
  };
  const A = solve(state); let { p, tgt, sMain, sProp } = A, legs = A.legs, head = A.head, rot = A.rot, dy = A.dy;
  const bowOf = (Q, s) => Q.tgt[s] ? Q.bow : 0.42; let bow = s => bowOf(A, s);
  if (state.tw && state.u != null && state.u < 1) {                                   // IN-BETWEEN (2026-11-10): blend from the previous pose, so a pose change is a move and not a snap
    const B = solve({ ...state, ...state.tw }), u = state.u, L = (a, b) => a + (b - a) * u;
    const t2 = {}; for (const s of [-1, 1]) if (A.tgt[s] || B.tgt[s]) { const a = B.tgt[s] || R[s].hand, b = A.tgt[s] || R[s].hand; t2[s] = [L(a[0], b[0]), L(a[1], b[1])]; }
    tgt = t2; legs = legs.map((l, i) => l.map((v, j) => L(B.legs[i][j], v))); head = L(B.head, head); rot = L(B.rot, rot); dy = L(B.dy, dy); bow = s => L(bowOf(B, s), bowOf(A, s));
  }
  if (state.idle) { head += 2.2 * state.idle; rot += 0.7 * state.idle; }
  S.legPose = legs.some(l => l.some(v => v)) ? legs : null; S.headTilt = head;
  const made = {};
  for (const s of [-1, 1]) made[s] = arm(R[s].sh, tgt[s] || R[s].hand, s, len(s), bow(s));
  if (p.bothDir === 'aboveHead' && !(state.tw && state.u < 1)) for (const s of [-1, 1]) { const HR = 100 * env.headK, h = tgt[s], sh = R[s].sh, f = v => v.toFixed(1); made[s] = { d: `M${f(sh[0])},${f(sh[1])} C${f(cx + s * HR * 1.9)},${f(env.hy + HR * .7)} ${f(cx + s * HR * 1.75)},${f(env.hy - HR * 1.3)} ${f(h[0])},${f(h[1])}`, hand: h, fwd: [0, -1] }; }   // hang: each arm goes out and up round its own side of the head
  if (p.bothDir === 'aboveSide' && !(state.tw && state.u < 1)) { const d = state.dir || 1, HR = 100 * env.headK, h = tgt[d], sh = R[d].sh, f = v => v.toFixed(1); made[d] = { d: `M${f(sh[0])},${f(sh[1])} C${f(cx + d * HR * 1.25)},${f(env.hy + HR * 1.2)} ${f(cx + d * HR * 1.8)},${f(env.hy + HR * .1)} ${f(h[0])},${f(h[1])}`, hand: h, fwd: [0, -1] }; }   // side hang: the near arm goes out and up round the head; the far arm passes behind the head
  const isOver = s => !!(p.over && tgt[s] && (p.bothDir === 'aboveSide' ? s === (state.dir || 1) : (p.both || p.bothDir || s === sMain || (s === sProp && state.prop && p.prop))));
  const orig = S.arms, origProps = S.props, V = state.view || 'front', D = state.dir || 1;
  // SIDE and BACK views (2026-11-10, CB: full silhouette from front, 3/4, side or back): gestures and held things show in every view.
  // side: the hands reach to the facing side at the same heights as in the front view; back: mirrored left-right, the head hides what crosses it.
  const sideSh = (() => { if (V !== 'side' || !orig) return null; const o = orig({ cx, view: 'side', dir: D, turn: D }), base = o && [].concat(o.front || [])[0], m = base && /M\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(base.d); return m ? { o, sh: [num(m[1]), num(m[2])] } : null; })();
  const sideMade = {}, hangs = p.bothDir === 'aboveHead';
  if (sideSh) for (const s of [-1, 1]) if (tgt[s]) sideMade[s] = arm(sideSh.sh, [sideSh.sh[0] + D * (Math.abs(tgt[s][0] - R[s].sh[0]) + (hangs ? 0 : .45 * Math.max(0, R[s].sh[1] - tgt[s][1]))), sideSh.sh[1] + (tgt[s][1] - R[s].sh[1])], D, len(s), bow(s));   // a raised hand also goes forward, so it clears the face
  const backArm = s => arm([2 * cx - R[s].sh[0], R[s].sh[1]], [2 * cx - (tgt[s] || R[s].hand)[0], (tgt[s] || R[s].hand)[1]], -s, len(s), bow(s));
  S.arms = (c) => {
    if (c.view === 'back') return tgt[-1] || tgt[1] ? { front: [-1, 1].map(backArm) } : orig ? orig(c) : {};
    if (c.view === 'side') return sideMade[-1] || sideMade[1] ? { front: [-1, 1].filter(s => sideMade[s] && (hangs || !isOver(s))).map(s => sideMade[s]) } : sideSh ? sideSh.o : orig ? orig(c) : {};
    return { front: [-1, 1].filter(s => !isOver(s)).map(s => made[s]) };
  };
  const extras = (a, s) => [p.finger && s === sMain ? finger(a) : '', state.prop && s === sProp ? propSvg(state.prop, a.hand[0], a.hand[1], INK) : ''];   // drawn AT the hand every frame: a held prop can never float
  S.props = (c) => {
    const o = [...(origProps && !env.dropProps ? origProps(c) : [])];
    if (c.view === 'back') return o;
    if (c.view === 'side') { for (const s of [-1, 1]) if (sideMade[s] && !isOver(s)) o.push(...extras(sideMade[s], s)); return o; }
    for (const s of [-1, 1]) if (!isOver(s)) {
      if (tgt[s] || s === sProp) o.push(...extras(made[s], s));
      if (p.wrist && s === sMain) o.push(`<circle cx="${made[s].hand[0] - s * handR * 1.5}" cy="${made[s].hand[1] - 2}" r="${handR * .8}" fill="#e2b13c" stroke="${INK}" stroke-width="3.5"/>`);
    }
    return o;
  };
  if (V === 'side') { for (const s of [-1, 1]) if (sideMade[s] && isOver(s) && !hangs) over.push(draw(sideMade[s]), ...extras(sideMade[s], s)); }
  else if (V === 'back') { if (state.prop && tgt[sProp]) over.push(propSvg(state.prop, 2 * cx - tgt[sProp][0], tgt[sProp][1], INK)); }
  else for (const s of [-1, 1]) if (isOver(s)) over.push(draw(made[s]), ...extras(made[s], s));           // arms that must sit in front of the head
  return { over, rot, dy };
}
