// Episode cast: Mike the headless rooster (mike-chicken). A new spec on the LOCKED rig, same style rules.
// He has NO head: a golden feather ruff covers the whole head circle and a flat cartoon neck end pokes out of the top (no blood, a clean pale cut).
// So his acting is body and wings (and the rig's blink/mouth never show). Legs are the rig's ink sticks (chicken legs), wings and tail are shapes.
import { INK, P, L, f1, fillPts, circ, cloud } from '../castkit.mjs';
export const TITLE = 'Mike the headless rooster (look 1, 2026-11-15)';
const RUST = '#b5532a', RUSTD = '#7a2f17', GOLD1 = '#e08a2b', GOLD2 = '#f2b84a', GREEN = '#2f6b4f', NECK = '#f1d2bd', NECKD = '#d98f86';
const flip = (cx, on, parts) => on ? [`<g transform="translate(${2 * cx},0) scale(-1,1)">${parts.join('')}</g>`] : parts;
// head space, r=100: a thick feathered neck column that hides the whole head circle, scalloped hackle collar at the bottom, flat pale cut on top
const ruff = ({ cx, hy, view, dir = 1 }) => {
  const sh = view === 'side' ? -dir * 8 : 0, X = v => cx + sh + v;
  const col = P(`M${X(-112)},${hy + 74} Q${X(-126)},${hy + 10} ${X(-120)},${hy - 40} Q${X(-112)},${hy - 78} ${X(-84)},${hy - 98} L${X(-56)},${hy - 112} L${X(56)},${hy - 112} L${X(84)},${hy - 98} Q${X(112)},${hy - 78} ${X(120)},${hy - 40} Q${X(126)},${hy + 10} ${X(112)},${hy + 74} Z`, RUST, INK, 7);
  const streaks = [...Array(6)].map((_, k) => L(`M${X(-50 + k * 20)},${hy - 84 + Math.abs(k - 2.5) * 6} Q${X(-80 + k * 32)},${hy - 10} ${X(-96 + k * 38)},${hy + 50}`, 6, k % 2 ? GOLD1 : GREEN));
  const collar = cloud([...Array(7)].map((_, k) => [X(-84 + k * 28), hy + 78, 28]), GOLD2, 5);
  const cut = [`<ellipse cx="${f1(X(0))}" cy="${f1(hy - 112)}" rx="50" ry="15" fill="${NECK}" stroke="${INK}" stroke-width="6"/>`,
    `<ellipse cx="${f1(X(0))}" cy="${f1(hy - 112)}" rx="24" ry="7" fill="${NECKD}"/>`];
  return [col, ...streaks, collar, ...cut];
};
// tail: a fan of big leaf feathers, the silhouette signature (green, rust, gold), behind the body
const leaf = (x0, y0, a, len, wid, col) => { const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, x1 = x0 + ux * len, y1 = y0 + uy * len, mx = x0 + ux * len * .55, my = y0 + uy * len * .55;
  return P(`M${f1(x0)},${f1(y0)} Q${f1(mx + nx * wid)},${f1(my + ny * wid)} ${f1(x1)},${f1(y1)} Q${f1(mx - nx * wid)},${f1(my - ny * wid)} ${f1(x0)},${f1(y0)} Z`, col, INK, 6); };
const tailFan = ({ cx, bot, view, dir = 1 }) => {
  const x0 = cx + (view === 'side' ? -dir * 20 : 40), y0 = bot - 40;
  const parts = [leaf(x0, y0, -0.15, 300, 46, GREEN), leaf(x0, y0, -0.5, 340, 50, RUSTD), leaf(x0, y0, -0.85, 360, 52, GOLD1), leaf(x0, y0, -1.2, 340, 50, GREEN)];
  return view === 'side' ? flip(cx, dir < 0, parts) : parts;
};
// wings: rust feather shapes hanging at the sides, tips in gold
const wings = ({ cx, top, bot, view, dir = 1 }) => {
  const one = s => [P(`M${cx + s * 70},${top + 30} Q${cx + s * 190},${top + 60} ${cx + s * 175},${bot - 50} Q${cx + s * 110},${bot - 10} ${cx + s * 62},${bot - 100} Z`, RUST, INK, 6),
    L(`M${cx + s * 96},${top + 90} L${cx + s * 124},${top + 150} M${cx + s * 80},${top + 120} L${cx + s * 104},${bot - 100}`, 4, RUSTD)];
  return view === 'side' ? one(dir) : [...one(-1), ...one(1)];
};
const breast = ({ cx, top, bot }) => [fillPts([[cx - 52, top + 70], [cx, top + 54], [cx + 52, top + 70], [cx + 56, bot - 40], [cx, bot - 18], [cx - 56, bot - 40]], GOLD2, 4),
  L(`M${cx - 26},${top + 100} q10,14 20,0 M${cx + 6},${top + 100} q10,14 20,0 M${cx - 10},${top + 140} q10,14 20,0`, 3.5, GOLD1)];
export const CAST = [
  { name: 'mike', label: 'Mike (headless rooster, toddler size)', form: 'toddler', coat: RUST, face: 'standard', hat: ruff, behind: o => [...tailFan(o), ...wings(o)], details: breast },
];
