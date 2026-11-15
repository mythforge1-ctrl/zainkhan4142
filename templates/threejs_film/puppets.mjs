// PUPPET ADAPTER: film state -> one SVG card, using the character package exactly as it is (never edited from here).
// The package is injected (initPuppets) so its folder is one config value: film.json "puppet_pkg" or --puppets.
// A new character = a new export in the package's cast.mjs, or a body form; nothing changes in this file.
import { applyPose } from './poses.mjs';
export const CARD = { W: 800, H: 1500, CX: 400, GY: 1440 };      // card canvas in rig pixels; GY = the ground line (feet), kept explicit so cards stand on the floor
let M = null;
export function initPuppets(mods) { M = mods; }                  // { char2d, memes, memes2, memes3?, bodies, cast, castkit?, castIndex? }

// which face set and hair a body form uses. The forms carry hair INSIDE their default meme, so the adapter has to
// re-attach it for every other face (rig hook wanted: forms export hair separately).
const FORM_SET = { lady: ['FEMALE', 'bob', 'egg'], elder: ['ELDER', 'gramps', 'potato'], baby: ['BABY', 'curl', 'BABY_HEAD'] };
const DROP_PROPS = { stationmaster: true };                      // its props() bakes an arm holding the watch; poses redraw arm + watch
const warned = new Set(); const warn = m => { if (!warned.has(m)) { warned.add(m); console.warn('puppets.mjs: ' + m); } };

function baseS(entry, view, dir) {
  const p = entry.puppet || 'form:standard'; let S, form = null;
  let spec = null;
  if (p.startsWith('cast:') && M.castkit && M.castIndex && M.castIndex[p.slice(5)]) { spec = M.castIndex[p.slice(5)]; S = M.castkit.buildChar({ ...spec, face: 'standard' }, CARD.CX); }   // hat, hair, costume and props from the sheet; the face is set per frame in svgFor
  else if (p.startsWith('form:') && M.bodies.FORMS[p.slice(5)]) { form = p.slice(5); S = M.bodies.formChar(form, CARD.CX, view, dir); }
  else if (M.cast && typeof M.cast[p] === 'function') S = M.cast[p](CARD.CX, view, dir, 'standard');
  else { warn('unknown puppet "' + p + '", using form:standard'); S = M.bodies.formChar('standard', CARD.CX, view, dir); }
  S = { ...S, x: CARD.CX, view, dir }; S.dy = CARD.GY - (S.ground ?? 900);       // feet always on the card's ground line
  return { S, form, name: p, spec };
}
function faceFn(setName, face) {
  const more = M.memes3 ? [M.memes3.TEEN, M.memes3.VILLAIN, M.memes3.MONSTER] : [];
  const order = setName ? [M.memes2[setName], M.memes.MEMES, M.memes2.FEMALE, M.memes2.ELDER, M.memes2.BABY, ...more] : [M.memes.MEMES, M.memes2.FEMALE, M.memes2.ELDER, M.memes2.BABY, ...more];
  for (const set of order) if (set && set[face]) return set[face];
  return null;
}
export const stateKey = (who, st) => [who, st.view, st.dir, st.pose, st.face, st.mouth, st.blink, st.prop, st.hand, st.tw ? st.tw.pose + '>' + st.tw.prop + '>' + st.tw.hand + '>' + st.u : '', st.idle || '', st.fw ? (st.fw.face || '') + '>' + st.fu : ''].join('|');

// character height in rig pixels (ground to top of the bare head), so a card can be sized in metres
export function metrics(entry) {
  const { S } = baseS(entry, 'front', 1), K = S.headK ?? 1.5, bodyTop = S.bodyTop ?? 333, hy = bodyTop - 100 * K * .78;
  const top = Math.min(...M.char2d.headPts(CARD.CX, hy, 100, S.head || 'rick').map(p => hy + (p[1] - hy) * K));
  return { px: (S.ground ?? 900) - top, headPx: 200 * K, hy: hy + S.dy };
}

// A cast character (castkit spec). Its sheet gives the hat, hair, beard, costume and held things; the film gives the face, mouth, blink and pose.
// "standard" (or no face) = the character's own face from its sheet. With pose "stand" it keeps its own arms, so a sword or a staff stays in the hand it was drawn in.
const SETS = () => ({ meme: M.memes.MEMES, female: M.memes2.FEMALE, baby: M.memes2.BABY, elder: M.memes2.ELDER, teen: M.memes3 && M.memes3.TEEN, villain: M.memes3 && M.memes3.VILLAIN, monster: M.memes3 && M.memes3.MONSTER });
// KIT FACES (2026-11-10, CB: one standard face that changes smoothly with the narration): "k:angry", "k:smirk", ... are the rig's own
// calm face family (char2d FACES). Their brows are numbers, so a change is in-betweened; eyes and mouth swap at the half-way frame.
function kitFace(st) {
  const F = M.char2d.FACES, n = st.face && st.face.startsWith('k:') ? st.face.slice(2) : null; if (!n || !F[n]) return null;
  const b = F[n], a = st.fw && st.fw.face && st.fw.face.startsWith('k:') ? F[st.fw.face.slice(2)] : st.fw && (!st.fw.face || st.fw.face === 'standard') ? F.standard : null, u = st.fu ?? 1;
  if (!a || u >= 1) return { expr: n };
  const L = (x, y) => x + (y - x) * u, src = u < .5 ? a : b, srcN = u < .5 ? (st.fw.face && st.fw.face.startsWith('k:') ? st.fw.face.slice(2) : 'standard') : n;
  return { expr: srcN, brows: b.brows.map((e, i) => e.map((v, j) => L(a.brows[i][j], v))), lidTilt: L(a.lidTilt || 0, b.lidTilt || 0) };
}
// 3/4 (CB 2026-11-10 03:22): head, hair and body stay exactly as in the front view; only eyes, brows and mouth shift. The rig slides the whole
// drawn-face layer, so hair that lives in that layer is wrapped in the inverse of that slide and stays where the front view has it.
const unslide = (parts, cx, view, dir) => { if (view !== '34' || !parts.length) return parts; const t = M.char2d.VIEWS['34'] * dir, k = 1 - .22 * Math.abs(t), sl = t * 100 * .42;
  return [`<g transform="translate(${cx},0) scale(${(1 / k).toFixed(4)},1) translate(${-cx},0) translate(${(-sl).toFixed(1)},0)">${parts.join('')}</g>`]; };
// TURNED HAIR (CB 2026-11-10: "the hair needs to cover the side view ... in 3/4 the head stays front, only the eyes point to the side"):
// in the SIDE view the hair is redrawn round the BACK of the head (it does not slide with the face). 3/4 keeps the front head (CB 03:22).
function turnedHair(key, shape, view, dir) {
  return ({ cx, hy }) => { const C = M.char2d, h = M.memes2.hairFor(key, cx, hy, shape), all = h.back.join('') + h.front.join(''), col = (all.match(/fill="(#[0-9a-fA-F]{6})"/) || [])[1], side = view === 'side';
    if (!col) return h.front;
    if (key !== 'bob') return [...h.front.join('').matchAll(/<circle cx="([-\d.]+)"[^>]*\/>/g)].filter(m => (parseFloat(m[1]) - cx) * dir < (side ? 10 : 60)).map(m => m[0]);   // tufts: only the ones on the back half
    const X = u => cx + dir * u, a0 = -46, a1 = 124;   // CB 2026-11-10 03:29: the women's side hair = the shape first drawn for 3/4 (more face, hair round the back)
    const HP = C.headPts(cx, hy, 100, typeof shape === 'string' ? shape : 'egg', dir < 0).map(([x, y]) => [cx + (x - cx) * 1.06, hy + (y - hy) * 1.06]);
    const A = ([x, y]) => { const a = Math.atan2(y - hy, (x - cx) * dir) * 180 / Math.PI; return a <= 0 ? a : a - 360; };       // 0 = the way the face looks, -90 = top, -180 = back of the head
    const rim = HP.map(p => [A(p), p]).filter(([a]) => a <= a0 && a >= a1 - 360).sort((p, q) => q[0] - p[0]).map(([, p]) => p);
    const line = [[X(-58), hy + 52], [X(-50), hy + 6], [X(-34), hy - 40], [X(-2), hy - 66], [X(40), hy - 70]];
    const bun = `<ellipse cx="${X(-26)}" cy="${hy - 124}" rx="34" ry="32" fill="${col}" stroke="${C.INK}" stroke-width="5"/>`;
    const strands = [0, 1, 2].map(i => `<path d="M${X(-30 - i * 22)},${hy - 78 + i * 16} q${-dir * (10 + i * 4)},40 ${-dir * (2 - i * 4)},${86 - i * 14}" fill="none" stroke="${C.shade(col, .68)}" stroke-width="3.4" stroke-linecap="round"/>`);
    return [bun, `<path d="${C.smooth([...rim, ...line])}" fill="${col}" stroke="${C.INK}" stroke-width="5" stroke-linejoin="round"/>`, ...strands]; };
}
// BACK VIEW (2026-11-10, CB: full silhouette from front, 3/4, side or back): from behind the head is covered by its hair, never bald,
// and face parts (beards, moustaches) go UNDER the head so only the ends that stick out past it show.
function backHair(key, shape) {
  return ({ cx, hy }) => { const h = M.memes2.hairFor(key, cx, hy, shape), col = ((h.back.join('') + h.front.join('')).match(/fill="(#[0-9a-fA-F]{6})"/) || [])[1];
    if (key !== 'bob' || !col) return h.front;                  // side tufts and a baby curl read the same from behind
    const C = M.char2d, HP = C.headPts(cx, hy, 100, typeof shape === 'string' ? shape : 'egg').map(([x, y]) => [cx + (x - cx) * 1.05, Math.min(hy + (y - hy) * 1.05, hy + 58 + 9 * Math.cos((x - cx) / 16))]);
    const strands = [-44, -14, 18, 46].map((dx, i) => `<path d="M${cx + dx},${hy - 70 + (i % 2) * 14} q${6 - i * 3},48 ${-4 + i * 2},${96 - (i % 2) * 10}" fill="none" stroke="${C.shade(col, .68)}" stroke-width="3.4" stroke-linecap="round"/>`);
    return [`<path d="${C.smooth(HP)}" fill="${col}" stroke="${C.INK}" stroke-width="5" stroke-linejoin="round"/>`, ...strands]; };
}
function castSvg(entry, st, S, spec, name) {
  const own = spec.face, ownSet = Array.isArray(own) ? own[0] : null, woman = ownSet === 'female' || spec.hair === 'bob' || spec.form === 'lady', B = M.memes2.BLINKS;
  const ownFn = !own || own === 'standard' ? null : typeof own === 'string' ? M.memes.MEMES[own] : (SETS()[own[0]] || {})[own[1]];
  let fn = null;
  if (st.mouth && M.memes2.VISEMES[st.mouth]) fn = M.memes2.VISEMES[st.mouth];
  else if (st.blink && (!st.face || st.face === 'standard') && !ownFn) fn = B[woman ? (st.blink === 'half' ? 'womanHalf' : 'womanClosed') : st.blink];
  else if (kitFace(st)) { fn = null; S.face = kitFace(st);
    if (S.meme) { const shape = S.head, V = c => ({ cx: c.cx, hy: c.hy, R: 100, view: c.view, dir: c.dir, turn: c.turn }); delete S.meme; S.slideExtras = true;       /* a sheet with its own drawn face: the calm kit face replaces it, hair, beard and hat stay */
      const tv = spec.hair && st.view === 'side', th = tv ? turnedHair(spec.hair, shape, st.view, st.dir || 1) : null;
      S.hairBack = c => [...(spec.headBack ? spec.headBack(V(c)) : []), ...(spec.hair && !tv ? M.memes2.hairFor(spec.hair, c.cx, c.hy, shape).back : [])];
      S.faceExtras = c => [...(tv ? th(c) : spec.hair ? unslide(M.memes2.hairFor(spec.hair, c.cx, c.hy, shape).front, c.cx, st.view, st.dir || 1) : []), ...(spec.faceTop ? spec.faceTop(V(c)) : [])]; } }
  else if (st.face && st.face !== 'standard') { fn = (ownSet && SETS()[ownSet] && SETS()[ownSet][st.face]) || faceFn(null, st.face); if (!fn) { warn('unknown face "' + st.face + '" for ' + name + ', using its own face'); fn = ownFn; } }
  else fn = ownFn;
  if (st.view === 'back') fn = null;                           // from behind there is no face: keep the sheet's own back-of-head layers (hair, mane, hat)
  if (fn) {                                                     // same layering as castkit.buildChar: headBack, face, hair, faceTop (the hat is its own layer)
    delete S.face; delete S.hairBack; delete S.faceExtras; const shape = S.head;
    const tv = spec.hair && st.view === 'side'; if (tv) S.faceExtras = turnedHair(spec.hair, shape, st.view, st.dir || 1);
    S.meme = (cx, hy, v = {}) => { const m = fn(cx, hy), h = spec.hair && !tv ? M.memes2.hairFor(spec.hair, cx, hy, shape) : { back: [], front: [] }, H = { cx, hy, R: 100, ...v }; return { ...m, under: [...(spec.headBack ? spec.headBack(H) : []), ...(m.under || []), ...h.back], over: [...unslide(h.front, cx, st.view, st.dir || 1), ...(m.over || []), ...(spec.faceTop ? spec.faceTop(H) : [])] }; };
  }
  if (st.view === 'back' && !spec.views) {                     // a sheet that is not view-aware: hair covers the head, face parts sit under it
    const shape = S.head, hb = S.hairBack, V = c => ({ cx: c.cx, hy: c.hy, R: 100, view: 'back', dir: c.dir, turn: 0 });
    delete S.meme; S.face = { expr: 'standard' };
    S.hairBack = c => [...(spec.faceTop ? spec.faceTop(V(c)) : []), ...(spec.headBack ? spec.headBack(V(c)) : []), ...(spec.hair ? M.memes2.hairFor(spec.hair, c.cx, c.hy, shape).back : [])];
    S.faceExtras = spec.hair ? backHair(spec.hair, shape) : () => [];
    S.details = S.behind || (() => []);                       // chest details are hidden; what hangs on the back (cape, pack) is also drawn across the body
  }
  if (!spec.views && S.hat && st.view === 'side') { const h0 = S.hat, dx = -(st.dir || 1) * 16; S.hat = c => [`<g transform="translate(${dx},0)">${h0(c).join('')}</g>`]; }   // a hat that is not view-aware sits a little back on a turned head
  const K = S.headK ?? 1.5, hy = (S.bodyTop ?? 333) - 100 * K * .78, ownArms = S.arms, ownProps = S.props, pose0 = !st.pose || st.pose === 'stand' || st.pose === 'own';
  const pose = applyPose(S, st, { INK: M.char2d.INK, headK: K, hy, dropProps: false });
  if (pose0 && !st.prop) { S.arms = ownArms; S.props = ownProps; }
  const r = M.char2d.drawCharacter(S), body = r.body.replace(/<ellipse [^>]*opacity="\.18"\/>/, '');
  const over = pose.over.length && !(pose0 && !st.prop) ? `<g transform="translate(0,${S.dy})">${pose.over.join('')}</g>` : '';
  const tf = pose.rot || pose.dy ? ` transform="translate(0,${pose.dy}) rotate(${pose.rot},${CARD.CX},${CARD.GY})"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.W}" height="${CARD.H}" viewBox="0 0 ${CARD.W} ${CARD.H}"><defs>${r.defs}</defs><g${tf}>${body}${over}</g></svg>`;
}

export function svgFor(entry, st) {
  const view = st.view || 'front', dir = st.dir || 1, { S, form, name, spec } = baseS(entry, view, dir), B = M.memes2.BLINKS, set = form && FORM_SET[form];
  if (spec) return castSvg(entry, st, S, spec, name);
  const woman = set && set[0] === 'FEMALE';
  let fn = null;
  if (st.mouth && M.memes2.VISEMES[st.mouth]) fn = M.memes2.VISEMES[st.mouth];                     // talking: the mouth shape replaces the face
  else if (st.blink && (!st.face || st.face === 'standard')) fn = B[woman ? (st.blink === 'half' ? 'womanHalf' : 'womanClosed') : st.blink];
  else if (kitFace(st) && !set) { fn = null; S.face = kitFace(st); }
  else if (st.face && st.face !== 'standard') { fn = faceFn(set && set[0], st.face); if (!fn) warn('unknown face "' + st.face + '" for ' + name + ', using standard'); }
  // (a blink on a meme face keeps the meme face: 4 frames, and the rig has no lids for those faces yet)
  if (!fn && set) fn = B[woman ? 'womanOpen' : 'open'];                                            // standard face on a form that needs its hair re-attached
  const turnedV = view === 'side';   // CB 2026-11-10 03:29: 3/4 = head, hair and body exactly as the front view for everyone (women too); only eyes, brows and mouth shift. Hair turns in the side view only.
  if (fn && set) { const f0 = fn, shape = set[2] === 'BABY_HEAD' ? M.memes2.BABY_HEAD : set[2]; fn = (cx, hy) => { const m = f0(cx, hy), h = M.memes2.hairFor(set[1], cx, hy, shape); return turnedV ? { ...m, under: [...(m.under || [])], over: [...m.over] } : { ...m, under: [...(m.under || []), ...h.back], over: [...unslide(h.front, cx, view, dir), ...m.over] }; };
    if (turnedV) S.faceExtras = turnedHair(set[1], shape, view, dir); }
  if (fn) S.meme = fn; else { delete S.meme; if (!S.face) S.face = { expr: 'standard' }; }
  if (view === 'back' && set) { const shape = set[2] === 'BABY_HEAD' ? M.memes2.BABY_HEAD : set[2]; delete S.meme; S.face = { expr: 'standard' }; S.hairBack = q => M.memes2.hairFor(set[1], q.cx, q.hy, shape).back; S.faceExtras = backHair(set[1], shape); }
  S.extraDefs = M.memes2.memes2Defs();
  const K = S.headK ?? 1.5, hy = (S.bodyTop ?? 333) - 100 * K * .78;
  const pose = applyPose(S, st, { INK: M.char2d.INK, headK: K, hy, dropProps: !!DROP_PROPS[name] });
  const r = M.char2d.drawCharacter(S);
  const body = r.body.replace(/<ellipse [^>]*opacity="\.18"\/>/, '');                             // the rig's flat floor shadow: the 3D scene casts a real one
  const over = pose.over.length ? `<g transform="translate(0,${S.dy})">${pose.over.join('')}</g>` : '';
  const tf = pose.rot || pose.dy ? ` transform="translate(0,${pose.dy}) rotate(${pose.rot},${CARD.CX},${CARD.GY})"` : '';   // lean and bob about the feet
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.W}" height="${CARD.H}" viewBox="0 0 ${CARD.W} ${CARD.H}"><defs>${r.defs}</defs><g${tf}>${body}${over}</g></svg>`;
}
