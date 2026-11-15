// Episode cast: Jack the baboon signalman (baboon-signalman). New spec on the LOCKED rig, same style rules.
import { INK, P, L, f1, fillPts, circ, cloud, WOOD, fist, pole } from '../castkit.mjs';
export const TITLE = 'Jack the baboon (CB picked option D, 2026-11-10)';
const FUR = '#8c8a6a', FURD = '#6d6b50', MANE = '#a7a585', SNOUT = '#c98f86', SNOUTD = '#a46a62';
// fur ring behind the head (mane), head space r=100
const mane = (col = MANE, big = 1) => ({ cx, hy }) => [cloud([...Array(14)].map((_, k) => { const a = Math.PI * (0.05 + k / 13 * 0.9) + Math.PI; return [cx + Math.cos(a) * 92 * big, hy - 6 + Math.sin(a) * 88 * big, 40 * big]; })
  .concat([[cx - 108 * big, hy + 30, 36 * big], [cx + 108 * big, hy + 30, 36 * big], [cx - 96 * big, hy + 66, 30 * big], [cx + 96 * big, hy + 66, 30 * big]]), col, 5)];
// long dog-like muzzle over the lower face, nostrils at the tip
const muzzle = (col = SNOUT, long = 1) => ({ cx, hy }) => [
  fillPts([[cx - 24, hy + 14], [cx - 34, hy + 44 * long], [cx - 30, hy + 80 * long], [cx, hy + 90 * long], [cx + 30, hy + 80 * long], [cx + 34, hy + 44 * long], [cx + 24, hy + 14], [cx, hy + 8]], col, 6),
  L(`M${cx - 14},${hy + 24} L${cx - 18},${hy + 58 * long} M${cx + 14},${hy + 24} L${cx + 18},${hy + 58 * long}`, 3, SNOUTD),
  `<ellipse cx="${f1(cx - 12)}" cy="${f1(hy + 74 * long)}" rx="6" ry="4.5" fill="${INK}"/><ellipse cx="${f1(cx + 12)}" cy="${f1(hy + 74 * long)}" rx="6" ry="4.5" fill="${INK}"/>`,
  L(`M${cx - 26},${hy + 98 * long} Q${cx},${hy + 106 * long} ${cx + 26},${hy + 98 * long}`, 4.5, INK)];
// brow ridge over the eyes (baboons look stern even when calm)
const brow = ({ cx, hy }) => [L(`M${cx - 64},${hy - 30} Q${cx - 34},${hy - 46} ${cx - 8},${hy - 30} M${cx + 8},${hy - 30} Q${cx + 34},${hy - 46} ${cx + 64},${hy - 30}`, 7, FURD)];
const ears = ({ cx, hy }) => [-1, 1].map(s => circ(cx + s * 96, hy - 10, 18, SNOUT, 5));
// signalman cap: the silhouette signature
const cap = (col = '#2f4f86') => ({ cx, hy }) => [P(`M${cx - 74},${hy - 50} Q${cx - 76},${hy - 112} ${cx},${hy - 116} Q${cx + 76},${hy - 112} ${cx + 74},${hy - 50} Z`, col, INK, 7),
  P(`M${cx - 80},${hy - 50} L${cx + 80},${hy - 50} L${cx + 112},${hy - 34} L${cx - 70},${hy - 36} Z`, '#24222c', INK, 6), circ(cx, hy - 70, 12, '#e2b13c', 4)];
// tail: one-colour ink stick with a tuft (limbs-one-colour rule)
const tail = (up = 1) => ({ cx, bot }) => [L(`M${cx + 30},${bot - 30} Q${cx + 150},${bot - 150 * up} ${cx + 200},${bot + 40 * up} Q${cx + 215},${bot + 120 * up} ${cx + 250},${bot + 110 * up}`, 13, INK), circ(cx + 250, bot + 110 * up, 13, FURD, 4)];
const furTufts = ({ cx, top, bot }) => [...Array(5)].map((_, k) => L(`M${cx - 60 + k * 30},${top + 60 + (k % 2) * 40} l10,22 l10,-22`, 3.5, FURD));
const belly = col => ({ cx, top, bot }) => [fillPts([[cx - 50, top + 90], [cx, top + 70], [cx + 50, top + 90], [cx + 54, bot - 40], [cx, bot - 20], [cx - 54, bot - 40]], col, 4)];
// ---- VIEWS (2026-11-10, CB: "the parallax needs to show the full silhouette every time, from front, 3/4, side or back").
// Every head part reads view / dir / turn. Face-space parts (ears, muzzle) are slid to the facing side by the rig, so they are drawn round cx.
const flip = (cx, on, parts) => on ? [`<g transform="translate(${2 * cx},0) scale(-1,1)">${parts.join('')}</g>`] : parts;
const maneV = (col = MANE, big = 1) => o => { const { cx, hy, view, dir = 1 } = o;
  if (view === 'side') return mane(col, big)({ ...o, cx: cx - dir * 34 });                      // the ruff sits behind the profile
  // 3/4 (CB 2026-11-10 03:22): head and body exactly as the front view; only eyes, brows and mouth (his muzzle) shift
  return mane(col, big)(o); };
const muzzleSide = (col, dir, { cx, hy }) => { const X = v => cx + dir * v; return [
  fillPts([[X(20), hy + 2], [X(96), hy + 10], [X(150), hy + 22], [X(166), hy + 44], [X(158), hy + 66], [X(110), hy + 82], [X(40), hy + 90], [X(8), hy + 60]], col, 6),
  `<ellipse cx="${f1(X(150))}" cy="${f1(hy + 36)}" rx="7" ry="5" fill="${INK}"/>`,
  L(`M${X(160)},${hy + 62} Q${X(110)},${hy + 74} ${X(64)},${hy + 66}`, 4.5, INK), L(`M${X(40)},${hy + 22} L${X(118)},${hy + 30}`, 3, SNOUTD)]; };
const backFur = ({ cx, hy }) => [cloud([...Array(12)].map((_, k) => { const a = k / 12 * 2 * Math.PI; return [cx + Math.cos(a) * 62, hy + 6 + Math.sin(a) * 60, 44]; }).concat([[cx, hy + 4, 70]]), MANE, 5),
  L(`M${cx - 30},${hy + 10} l12,26 l12,-26 M${cx + 8},${hy + 34} l12,26 l12,-26 M${cx - 8},${hy - 24} l10,22 l10,-22`, 3.5, FURD)];
const faceTopV = o => { const { cx, hy, view, dir = 1 } = o;
  if (view === 'back') return [...[-1, 1].map(s => circ(cx + s * 104, hy - 6, 17, SNOUT, 5)), ...backFur(o)];                  // from behind: fur over the whole head, ear tips showing
  if (view === 'side') return [circ(cx - dir * 62, hy - 8, 19, SNOUT, 5), ...muzzleSide(SNOUT, dir, o)];                        // profile: one ear, the long snout sticks out past the head
  if (view === '34') { const k = 1 - .22 * .55, sl = .55 * 100 * .42 * dir, ex = sgn => cx + (sgn * 96 - sl) / k; return [...[-1, 1].map(sgn => circ(ex(sgn), hy - 10, 18, SNOUT, 5)), ...muzzle(SNOUT, 0.9)(o)]; }   // the rig slides this layer with the face: the ears are pre-shifted so they stay where the front view has them
  return [...ears(o), ...muzzle(SNOUT, 0.9)(o)]; };
const capV = (col = '#2f4f86') => o => { const { cx, hy, view, dir = 1 } = o;
  const dome = P(`M${cx - 74},${hy - 50} Q${cx - 76},${hy - 112} ${cx},${hy - 116} Q${cx + 76},${hy - 112} ${cx + 74},${hy - 50} Z`, col, INK, 7);
  if (view === 'back') return [dome, P(`M${cx - 80},${hy - 50} L${cx + 80},${hy - 50} L${cx + 76},${hy - 36} L${cx - 76},${hy - 36} Z`, '#24222c', INK, 6), L(`M${cx - 16},${hy - 43} L${cx + 16},${hy - 43}`, 5, '#e2b13c')];
  if (view === 'side') return flip(cx, dir < 0, [dome, P(`M${cx - 78},${hy - 50} L${cx + 80},${hy - 50} L${cx + 150},${hy - 30} L${cx - 70},${hy - 36} Z`, '#24222c', INK, 6), circ(cx + 52, hy - 72, 11, '#e2b13c', 4)]);
  return cap(col)(o); };
const tailV = (up = 1) => o => flip(o.cx, o.view === 'side' && (o.dir || 1) > 0, tail(up)(o));     // the tail trails behind him
export const CAST = [
  // CB 2026-11-10: option D (toddler size). Jack never speaks: the muzzle covers the mouth on purpose; blinks still work.
  { name: 'jack', label: 'Jack (baboon signalman)', form: 'toddler', coat: FUR, face: 'standard', headBack: maneV(MANE, 1.05), hat: capV(), faceTop: faceTopV, behind: tailV(0.5), details: furTufts, views: true },
];
