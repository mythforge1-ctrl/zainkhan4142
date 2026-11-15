// Episode cast: the railway inspector (baboon-signalman). One character on the shared rig; the face comes from faces_villain.mjs.
import { INK, P, L, ell, f1, smooth, brush, GOLD, GOLDL, STEEL, WOOD, WOODD, CREAM, RED, BLACK, fillPts, poly, rect, circ, hl, pole, fist, cloud, bands } from '../castkit.mjs';
export const TITLE = 'Baboon signalman: the inspector';

// head-space point -> screen point (face rot/sx/sy + head scale), so stick arms can reach hands drawn by a face
const hp = (B, f, dx, dy) => { const a = (f.rot || 0) * Math.PI / 180, x = dx * (f.sx || 1), y = dy * (f.sy || 1); return [B.cx + B.K * (x * Math.cos(a) - y * Math.sin(a)), B.hy + B.K * (x * Math.sin(a) + y * Math.cos(a))]; };
const rot = (a, x, y, o) => `<g transform="rotate(${a} ${f1(x)} ${f1(y)})">${[].concat(o).join('')}</g>`;
// thick rope / cable: ink edge + colour core
const rope = (d, col = '#c9a26b', w = 9) => L(d, w + 7) + L(d, w, col);
const PURPLE = '#4a2a6a', DARK = '#2a2733', ARMOR = '#3a3846', ARMOR2 = '#4c4a5c', CRIMSON = '#7a1c24', GLOW = '#7be05a';
const F = { laugh: { rot: -16, sy: 1.03 }, scheme: { rot: 6 }, greedy: { rot: -6 }, whisper: { rot: -10 }, gloat: { rot: -14, sx: 1.03 } };

export const CAST = [
  // 3 RAILWAY VILLAIN: towering top hat, curled handlebar moustache being twirled, swirling cape, coil of rope
  { name: 'railway', label: 'Railway Villain', form: 'noodle', coat: BLACK, face: ['villain', 'gloat'],
    hat: ({ cx, hy }) => [poly([[cx - 72, hy - 82], [cx - 80, hy - 236], [cx + 80, hy - 236], [cx + 72, hy - 82]], '#1d1b24', 6), ell(cx, hy - 236, 80, 14, '#2c2a36', INK, 5), rect(cx - 74, hy - 120, 148, 28, '#b8322a', 4.5, 2), hl(`M${cx - 54},${hy - 130} L${cx - 58},${hy - 222}`, 9, .3),
      P(`M${cx - 122},${hy - 74} Q${cx},${hy - 108} ${cx + 122},${hy - 74} Q${cx + 130},${hy - 58} ${cx + 104},${hy - 58} Q${cx},${hy - 84} ${cx - 104},${hy - 58} Q${cx - 130},${hy - 58} ${cx - 122},${hy - 74} Z`, '#1d1b24', INK, 5.5)],
    faceTop: ({ cx, hy }) => [-1, 1].map(s => P(`M${cx},${hy + 12} Q${cx + s * 34},${hy - 4} ${cx + s * 74},${hy + 12} Q${cx + s * 112},${hy + 26} ${cx + s * 126},${hy - 2} Q${cx + s * 132},${hy - 24} ${cx + s * 110},${hy - 28} Q${cx + s * 120},${hy - 4} ${cx + s * 94},${hy + 4} Q${cx + s * 60},${hy + 2} ${cx + s * 36},${hy + 22} Q${cx + s * 14},${hy + 30} ${cx},${hy + 22} Z`, '#1d1b24', INK, 4) + L(`M${cx + s * 20},${hy + 12} q${s * 20},-8 ${s * 40},0`, 3, '#5a5866')),
    behind: ({ cx, top }) => [P(`M${cx - 50},${top + 6} Q${cx},${top - 8} ${cx + 50},${top + 6} Q${cx + 110},${top + 300} ${cx + 96},${top + 600} Q${cx - 20},${top + 560} ${cx - 120},${top + 620} Q${cx - 200},${top + 560} ${cx - 238},${top + 470} Q${cx - 150},${top + 300} ${cx - 50},${top + 6} Z`, '#1d1b24', INK, 6),
      P(`M${cx - 238},${top + 470} Q${cx - 200},${top + 560} ${cx - 120},${top + 620} Q${cx - 150},${top + 520} ${cx - 120},${top + 400} Q${cx - 190},${top + 450} ${cx - 238},${top + 470} Z`, '#b8322a', INK, 5), L(`M${cx - 20},${top + 80} q-60,240 -120,420`, 4, '#3a3846')],
    details: ({ cx, top }) => [P(`M${cx - 30},${top - 4} L${cx},${top + 110} L${cx + 30},${top - 4} Z`, CREAM, INK, 4), P(`M${cx - 20},${top + 20} L${cx + 20},${top + 34} L${cx + 20},${top + 14} L${cx - 20},${top + 34} Z`, '#b8322a', INK, 3.5), ...[0, 1, 2].map(k => circ(cx + 18, top + 150 + k * 50, 6, GOLD, 3))],
    arms: B => { const [x, y] = hp(B, F.gloat, 128, -6); return { front: [B.arm(-1, B.cx - 116, B.top + 250, 24), B.arm(1, x + 6, y + 8, 70)] }; },
    props: ({ cx, top }) => { const x = cx - 116, y = top + 250, o = [];
      for (const [dx, dy, r] of [[-8, 10, 56], [6, 18, 52], [-4, 28, 48]]) o.push(`<ellipse cx="${x + dx}" cy="${y + dy}" rx="${r * .8}" ry="${r}" fill="none" stroke="${INK}" stroke-width="17"/><ellipse cx="${x + dx}" cy="${y + dy}" rx="${r * .8}" ry="${r}" fill="none" stroke="#c9a26b" stroke-width="9"/>`);
      o.push(rope(`M${x - 30},${y + 70} q-20,80 10,150 q20,40 -6,90`), fist(x, y - 40, 14));
      return o; },
    over: B => { const [x, y] = hp(B, F.gloat, 128, -6); return [fist(x + 6, y + 8, 14), L(`M${x + 26},${y - 20} a16,16 0 1,1 -6,-22`, 4), P(`M${x + 14},${y - 46} l10,-2 l-4,10 Z`)]; } }
];
