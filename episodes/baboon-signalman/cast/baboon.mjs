// Episode cast: Jack the baboon signalman (baboon-signalman). New spec on the LOCKED rig, same style rules.
import { INK, P, L, f1, fillPts, circ, cloud, WOOD, fist, pole } from '../castkit.mjs';
export const TITLE = 'Jack the baboon: 5 options (pick one)';
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
export const CAST = [
  { name: 'baboonA', label: 'A: kid size', form: 'kid', coat: FUR, face: 'standard', headBack: mane(), hat: cap(), faceTop: o => [...ears(o), ...muzzle()(o)], behind: tail(0.6), details: o => [...belly('#b9a98a')(o), ...furTufts(o)] },
  { name: 'baboonB', label: 'B: long arms, hunched', form: 'brute', coat: FUR, face: 'standard', headBack: mane(MANE, 1.1), hat: cap(), faceTop: o => [...ears(o), ...muzzle()(o)], behind: tail(0.8), details: furTufts },
  { name: 'baboonC', label: 'C: grown-up, uniform vest', form: 'standard', coat: '#2f4f86', face: 'standard', headBack: mane(), hat: cap(), faceTop: o => [...ears(o), ...muzzle()(o)], behind: tail(0.8), details: o => [P(`M${o.cx - 30},${o.top} L${o.cx},${o.top + 120} L${o.cx + 30},${o.top}`, '#d8473c', INK, 4)] },
  { name: 'baboonD', label: 'D: toddler size', form: 'toddler', coat: FUR, face: 'standard', headBack: mane(MANE, 1.05), hat: cap(), faceTop: o => [...ears(o), ...muzzle(SNOUT, 0.9)(o)], behind: tail(0.5), details: furTufts },
  { name: 'baboonE', label: 'E: kid, meme face (smug)', form: 'kid', coat: FUR, face: 'troll', headBack: mane(MANE, 1.1), hat: cap(), faceTop: o => [...ears(o), ...muzzle()(o)], behind: tail(0.6), details: furTufts },
];
