// THREE.JS FILM PLAYER: plays the baked plan (tools/film_plan.py) with the vector2d puppets on simple toon sets.
// It owns NO timing and NO camera maths: camera_baked.json and performance_baked.json are the single source, so the
// Blender look pass can read the same two files and nothing drifts. Stage in the workflow: storyboard + animatic.
//   window.setup(cfg) -> info        cfg = { film: '/ep/film.json', W, H, captions: true, puppets: '/puppets/' }
//   await window.renderFrame(f)      draws frame f (WebGL canvas + caption overlay), ready for a screenshot
//   window.stations()                every station with its START / END frame, for the storyboard
//   window.visibility(f)             projected centre + height of every character and named prop
import * as THREE from './vendor/three.module.js';
import { initPuppets, svgFor, stateKey, metrics, CARD } from './puppets.mjs';

const B2T = p => new THREE.Vector3(p[0], p[2], -p[1]);          // plan is metres, Z up, Y forward (Blender) -> three is Y up, -Z forward
const LIGHTS = {                                                 // preview light only; the real look is the Blender pass
  night:    { top: '#0b1026', hor: '#27345c', sun: '#9fb6ff', si: 1.1, amb: '#3a4a7a', ai: 1.0, dir: [-4, 9, -3], tint: '#cfd8ff' },
  morning:  { top: '#6fa8dc', hor: '#fbe3c4', sun: '#fff0d6', si: 2.2, amb: '#b8cbe6', ai: 1.3, dir: [-6, 8, 5], tint: '#fff6ea' },
  day:      { top: '#3e7fd2', hor: '#b8d0ec', sun: '#ffffff', si: 2.6, amb: '#b9c8de', ai: 1.3, dir: [-3, 10, 4], tint: '#ffffff' },
  golden:   { top: '#8a6f8a', hor: '#ffc47c', sun: '#ffb36b', si: 2.4, amb: '#8f86b8', ai: 1.1, dir: [-9, 4, 2], tint: '#ffe6c8' },
  interior: { top: '#2a2420', hor: '#5a4a3c', sun: '#ffd9a0', si: 1.8, amb: '#6a5a4c', ai: 1.2, dir: [-3, 8, 4], tint: '#ffeedd' },
};
let R = null;

function T(word, n = 1) { const h = R.words.filter(w => w._k === String(word).toLowerCase()); if (h.length < n) throw new Error(`word "${word}" (#${n}) is not in words.json`); return Math.round(h[n - 1].s * R.fps); }
const fr = t => typeof t === 'number' ? Math.round(t) : Array.isArray(t) ? T(t[0], t[1] ?? 1) + (t[2] ?? 0) : Math.round(t.s * R.fps);   // same time rule as film_plan.fr
// In-betweens: for N frames after a pose change the puppet is drawn part-way from the old pose to the new one.
// film.json "tween": { "frames": 6, "ease": "out" | "inout" | "linear", "walk_frames": 8 }; frames 0 = snap (the old behaviour).
const EASE = { out: u => 1 - Math.pow(1 - u, 3), inout: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, linear: u => u, back: u => { const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); } };
function tweened(who, f) {
  const runs = R.perf[who], st0 = perfAt(runs, f), T = R.film.tween; if (!T || !T.frames) return st0;
  const st = T.idle && !/^walk/.test(st0.pose || '') ? { ...st0, idle: Math.round(8 * Math.sin(f / (R.fps * (T.idle_s || 2.6)) * 2 * Math.PI + who.length)) / 8 * T.idle } : st0;   // optional slow sway (sample C): head and body breathe on a ~2.6 s cycle
  const C = (R.poseCh ||= {})[who] ||= (() => { const out = []; let prev = null; for (const r of runs) { const s = r.state, k = [s.pose, s.prop, s.hand, s.dir].join('|'); if (prev && k !== prev.k) out.push({ f0: r.f0, from: { pose: prev.s.pose, prop: prev.s.prop, hand: prev.s.hand } }); if (!prev || k !== prev.k) prev = { k, s }; } return out; })();
  // face: a change between two calm kit faces ("k:...") or from the standard face is eased over T.face_frames (brows slide, eyes and mouth swap half-way)
  const FC = (R.faceCh ||= {})[who] ||= (() => { const out = []; let prev = null; for (const r of runs) { const fc = r.state.face || 'standard'; if (prev !== null && fc !== prev) out.push({ f0: r.f0, from: prev }); prev = fc; } return out; })();
  let fl = -1; for (let i = 0; i < FC.length && FC[i].f0 <= f; i++) fl = i;
  let face = {}; if (fl >= 0 && T.face_frames && f - FC[fl].f0 < T.face_frames && /^k:/.test(st.face || '')) face = { fw: { face: FC[fl].from }, fu: Math.round(EASE.inout((f - FC[fl].f0 + 1) / (T.face_frames + 1)) * 10) / 10 };
  let lo = -1; for (let i = 0; i < C.length && C[i].f0 <= f; i++) lo = i; if (lo < 0) return { ...st, ...face };
  const walk = /^walk/.test(st.pose || ''), N = walk ? (T.walk_frames ?? T.frames) : T.frames, d = f - C[lo].f0; if (d >= N) return { ...st, ...face };
  const u = (EASE[walk ? 'inout' : T.ease || 'out'] || EASE.out)((d + 1) / (N + 1));
  return { ...st, ...face, tw: C[lo].from, u: Math.round(u * 20) / 20 };
}
function perfAt(runs, f) { let lo = 0, hi = runs.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (runs[mid].f0 <= f) lo = mid; else hi = mid - 1; } return runs[lo].state; }
const getJSON = async u => { const r = await fetch(u); if (!r.ok) throw new Error('cannot load ' + u); return r.json(); };

window.setup = async (cfg) => {
  const dir = cfg.film.replace(/[^/]*$/, ''), film = await getJSON(cfg.film);
  const [camB, perf] = await Promise.all([getJSON(dir + 'out/plan/camera_baked.json'), getJSON(dir + 'out/plan/performance_baked.json')]);
  const words = await getJSON(dir + (film.words || 'voice/words.json')).catch(() => []);
  words.forEach(w => w._k = w.w.replace(/^[ .,?!"';:-]+|[ .,?!"';:-]+$/g, '').toLowerCase());
  const pk = cfg.puppets || '/puppets/', imp = n => import(pk + n + '.mjs');
  const [char2d, memes, memes2, bodies, cast] = await Promise.all([imp('char2d'), imp('memes'), imp('memes2'), imp('bodies'), imp('cast').catch(() => ({}))]);
  // the cast (150 characters on sheets): loaded only when film.json names one, as "cast:<name>" or "cast:sheet04/<name>" when two sheets share a name
  const castIndex = {}; let castkit = null, memes3 = null;
  if (Object.values(film.cast || {}).some(c => (c.puppet || '').startsWith('cast:'))) {
    castkit = await imp('castkit').catch(e => (console.warn('film.js: castkit.mjs missing from the puppet package: ' + e.message), null));
    for (const sh of (castkit ? cfg.sheets || [] : [])) { const m = await import(pk + 'sheets/' + sh).catch(e => (console.warn('film.js: ' + sh + ' did not load: ' + e.message), null)); for (const spec of (m && m.CAST) || []) { castIndex[sh.replace('.mjs', '') + '/' + spec.name] = spec; castIndex[spec.name] ??= spec; } }
  }
  memes3 = await imp('memes3').catch(() => null);
  initPuppets({ char2d, memes, memes2, memes3, bodies, cast, castkit, castIndex });

  const W = cfg.W || 540, H = cfg.H || 960, stage = document.getElementById('stage'); stage.innerHTML = ''; stage.style.width = W + 'px'; stage.style.height = H + 'px';
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
  const over = document.createElement('canvas'); over.width = W; over.height = H; stage.append(renderer.domElement, over);
  const cam = new THREE.PerspectiveCamera(60, W / H, .05, 600);
  R = { cfg, dir, film, cam: camB.frames, stationRows: camB.stations || null, perf, words, fps: film.fps || camB.fps || 30, W, H, renderer, over, camera: cam, places: {}, cards: {}, tex: new Map(), place: null, frame: -1 };
  R.end = R.cam.length;

  // one scene per place, built once by its set module (episode sets win over kit sets)
  for (const [name, pl] of Object.entries(film.places || {})) {
    const scene = new THREE.Scene(), L = LIGHTS[pl.light] || LIGHTS.day, set = pl.set || name;
    const own = cfg.epSets ? cfg.epSets.includes(set + '.js') : (await fetch(dir + 'sets/' + set + '.js', { method: 'HEAD' })).ok;      // the episode's own sets/ folder wins over the kit's
    const mod = await import((own ? dir : './') + 'sets/' + set + '.js');
    const ctx = { THREE, B2T, film, place: pl, light: L, toon: toonMat };
    baseLight(scene, L); const built = (await mod.build(THREE, scene, film, ctx)) || {};
    R.places[name] = { scene, L, set, update: built.update, anchors: built.anchors || {} };
    // lamps bloom (Rick: every lamp, headlight and lens glows): a soft additive halo on each lit lens or globe, depth-tested so things in front hide it
    scene.updateMatrixWorld(true); const lamps = []; scene.traverse(o => { if (o.isMesh && o.userData.role === 'lamp' && /lens|globe/.test(o.name) && !/halo/.test(o.name)) lamps.push(o); });
    for (const o of lamps) { o.geometry.computeBoundingSphere(); const r = o.geometry.boundingSphere.radius, sp = glowSprite('#' + o.material.color.getHexString(), .6); sp.scale.setScalar(r * 9); sp.position.set(0, 0, o.geometry.type === 'CircleGeometry' ? r * 1.2 : 0); o.add(sp); }
  }
  // one card per character (a flat plane that turns to the lens about the vertical axis only, like Rick's cut-outs)
  for (const [who, entry] of Object.entries(film.cast || {})) {
    if (!perf[who]) continue;
    const m = metrics(entry), k = (entry.height || 1.7) / m.px;                       // metres per rig pixel, from the character's own height
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5 - (CARD.H - CARD.GY) / CARD.H, 0);   // origin on the ground line: feet stand on state.pos
    const mat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: .03, toneMapped: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat); mesh.scale.set(CARD.W * k, CARD.H * k, 1); mesh.castShadow = true;
    mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: .5 });
    const blob = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: '#1a1028', transparent: true, opacity: .22, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.scale.set(m.headPx * k * .42, m.headPx * k * .2, 1);   // contact shadow so feet never float
    mesh.userData.noExport = blob.userData.noExport = true; R.cards[who] = { entry, mesh, blob, k, m, key: null };
  }
  R.fx = (film.fx || []).map(e => ({ ...e, f: fr(e.at) })); R.moods = (film.moods || []).map(e => ({ ...e, f: fr(e.at) })); R.trans = (film.transitions || []).map(e => ({ ...e, f: fr(e.at) }));
  R.hl = (film.highlights || []).map(e => ({ ...e, f: fr(e.at), n: Math.max(2, Math.round((e.s ?? 1.2) * (film.fps || 30))) }));
  return { frames: R.end, fps: R.fps, W, H, cast: Object.keys(R.cards), places: Object.keys(R.places) };
};

function toonMat(color, opt = {}) {                                                  // 3-step toon shading shared by every set
  if (!toonMat.g) { const d = new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]); toonMat.g = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); toonMat.g.minFilter = toonMat.g.magFilter = THREE.NearestFilter; toonMat.g.needsUpdate = true; }
  return new THREE.MeshToonMaterial({ color, gradientMap: toonMat.g, ...opt });
}
function baseLight(scene, L) {
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true, fog: false, toneMapped: false }));
  const top = new THREE.Color(L.top), hor = new THREE.Color(L.hor), pos = sky.geometry.attributes.position, col = [];
  for (let i = 0; i < pos.count; i++) { const t = Math.max(0, Math.min(1, pos.getY(i) / 400 * 2.2)), c = hor.clone().lerp(top, Math.pow(t, .7)); col.push(c.r, c.g, c.b); }
  sky.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); sky.userData.noExport = true; scene.add(sky);
  scene.fog = new THREE.Fog(L.hor, 30, 260);                                          // fog = horizon colour, so far things sink into the sky
  scene.add(new THREE.HemisphereLight(L.amb, '#6b6258', L.ai));
  const sun = new THREE.DirectionalLight(L.sun, L.si); sun.position.set(...L.dir).multiplyScalar(3); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: .5, far: 90 }); sun.shadow.bias = -.0008; sun.shadow.radius = 3; scene.add(sun);
}

async function texture(key, svg, scale) {
  const id = key + '@' + scale, hit = R.tex.get(id); if (hit) { R.tex.delete(id); R.tex.set(id, hit); return hit; }   // refresh LRU order
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
  const c = document.createElement('canvas'); c.width = Math.round(CARD.W * scale); c.height = Math.round(CARD.H * scale); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  R.tex.set(id, t); if (R.tex.size > 60) { const [old, ot] = R.tex.entries().next().value; ot.dispose(); R.tex.delete(old); }   // holds are dead still, so a film needs few drawings; cap the rest
  return t;
}

function setCamera(c) {
  const cam = R.camera, p = B2T(c.pos), a = B2T(c.aim), fwd = a.clone().sub(p).normalize();
  cam.fov = c.fov_v; cam.updateProjectionMatrix(); cam.position.copy(p);
  cam.up.copy(c.up ? B2T(c.up) : Math.abs(fwd.y) > .97 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0));   // top-down: "up" = world Y, as in film_plan._basis
  cam.lookAt(a); if (c.roll) cam.rotateZ(-c.roll * Math.PI / 180);                    // + roll = the picture turns counter-clockwise (film_plan.project)
  cam.updateMatrixWorld(true);
}

window.renderFrame = async (f, opt = {}) => {
  f = Math.max(0, Math.min(R.end - 1, f)); const c = R.cam[f], pl = R.places[c.place] || Object.values(R.places)[0], t = f / R.fps;
  setCamera(c);
  R.renderer.domElement.style.visibility = opt.overlayOnly ? 'hidden' : 'visible';
  if (opt.overlayOnly) { document.documentElement.style.background = document.body.style.background = 'transparent'; R.placeNow = pl; if (pl.update) pl.update(f, t, R); pl.scene.updateMatrixWorld(true); overlay(f, opt.captions ?? R.cfg.captions ?? true); R.frame = -1; return true; }   // the drawn layer alone (effects, glints, transitions, captions) on a clear ground: laid over the Blender picture
  for (const [who, card] of Object.entries(R.cards)) {
    const st = tweened(who, f), show = st.visible && (!st.place || st.place === c.place);
    if (card.mesh.parent !== pl.scene) { pl.scene.add(card.mesh); pl.scene.add(card.blob); }
    card.mesh.visible = card.blob.visible = show; if (!show) continue;
    const pos = B2T(st.pos); card.mesh.position.copy(pos); card.blob.position.set(pos.x, pos.y + .012, pos.z);
    card.mesh.rotation.order = 'YXZ'; card.mesh.rotation.y = Math.atan2(R.camera.position.x - pos.x, R.camera.position.z - pos.z);                       // face the lens
    { const hm = (card.entry.height || 1.7) * .55, hd = Math.hypot(R.camera.position.x - pos.x, R.camera.position.z - pos.z); card.mesh.rotation.x = -Math.atan2(R.camera.position.y - (pos.y + hm), hd); }   // CB 2026-11-10: NEVER squash a character: the card also tips to the lens, so a high or low camera still sees the full silhouette
    const dist = R.camera.position.distanceTo(pos), px = CARD.H * card.k / dist * (R.H / (2 * Math.tan(c.fov_v * Math.PI / 360)));
    const scale = [.25, .5, 1, 2].find(s => s * CARD.H >= px * 1.2) || 2;                                               // drawing resolution follows the card's size on screen, so close-ups stay sharp
    const key = stateKey(who, st), tex = await texture(key, svgFor(card.entry, st), scale);
    const tn = cardTint(who, f); let tx = tex; if (tn && tn.a > 0) tx = tintedTexture(key + '@' + scale + '|' + tn.hex + tn.a, tex, card, tn);
    if (card.mesh.material.map !== tx) { card.mesh.material.map = tx; card.mesh.customDepthMaterial.map = tx; card.mesh.material.needsUpdate = true; card.mesh.customDepthMaterial.needsUpdate = true; }
    card.mesh.material.color.set(pl.L.tint);                                                                           // scene tint: cards are mostly self-lit, tinted by the place
  }
  if (pl.update) pl.update(f, t, R);
  R.placeNow = pl; const lit = applyHighlights(f, pl);
  R.renderer.render(pl.scene, R.camera); R.frame = f;
  for (const [mt, col, em] of lit) { mt.color.copy(col); if (em) mt.emissive.copy(em); }
  overlay(f, opt.captions ?? R.cfg.captions ?? true);
  return true;
};

function project(v3) { const p = v3.clone().project(R.camera); return p.z > 1 || p.z < -1 ? null : [(p.x + 1) / 2, (1 - p.y) / 2]; }
function propPos(name, f) {
  const pr = (R.film.props || {})[name], anc = R.placeNow && R.placeNow.anchors[name];
  if (anc) return B2T(typeof anc === 'function' ? anc(f) : anc);
  if (pr && pr.pos) return B2T([pr.pos[0], pr.pos[1], pr.pos[2] + (pr.h ?? 1.2)]);
  if (pr && pr.held_by && R.cards[pr.held_by]) { const st = perfAt(R.perf[pr.held_by], f), c = R.cards[pr.held_by]; return B2T([st.pos[0], st.pos[1], st.pos[2] + (c.entry.height || 1.7) * .5]); }   // roughly at the hands
  if (R.cards[name]) { const st = perfAt(R.perf[name], f); return B2T([st.pos[0], st.pos[1], st.pos[2] + (R.cards[name].entry.height || 1.7) * .6]); }
  return null;
}

// HIGHLIGHTS (2026-11-10, CB: "what about highlight vfx, I didn't see anything"; measured in Rick's railroad clip: the thing the line talks about
// lights up in a saturated glowing colour for about a second). film.json "highlights": [{ at, s (seconds, default 1.2), on, color, size, amp }].
//   on    = a set object by name (a group or a mesh: "lever3", "signal_arm"), a list of names, "/regex/" over object names, a character, a held prop or an anchor
//   color = one colour or a list the glow runs through (Rick: purple, magenta, pink, yellow, white)
// The object itself is tinted (a character card too: a face that goes purple), and a soft additive glow with twinkles is drawn over it.
const hlColor = (c, k) => { const L = Array.isArray(c) ? c : [c || '#ffd23f']; if (L.length === 1) return new THREE.Color(L[0]); const x = Math.min(.9999, Math.max(0, k)) * (L.length - 1), i = Math.floor(x); return new THREE.Color(L[i]).lerp(new THREE.Color(L[i + 1]), x - i); };
const hlAmp = (h, k) => Math.min(1, k / .12, (1 - k) / .3) * (h.amp ?? 1) * (.82 + .18 * Math.sin(k * h.n * .9));
function hlMeshes(h, pl) {
  const key = '_hl_' + pl.set; if (h[key]) return h[key]; const out = [], names = [].concat(h.on || []);
  for (const nm of names) { const rx = /^\/.*\/$/.test(nm) ? new RegExp(nm.slice(1, -1)) : null;
    if (rx) pl.scene.traverse(o => { if (o.isMesh && !o.isInstancedMesh && rx.test(o.name)) out.push(o); });
    else { const o = pl.scene.getObjectByName(nm); if (o) o.traverse(m => { if (m.isMesh && !m.isInstancedMesh) out.push(m); }); } }
  for (const m of out) if (!m.userData.ownMat) { m.material = m.material.clone(); m.userData.ownMat = true; }       // sets share one material per colour: a lit thing gets its own
  return h[key] = out;
}
function glowTex() { if (glowTex.t) return glowTex.t; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.22, 'rgba(255,255,255,.5)'); gr.addColorStop(.55, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return glowTex.t = new THREE.CanvasTexture(c); }
// a soft additive light bloom that lives IN the scene (depth-tested: a figure in front of the lit thing stays clean)
const glowSprite = (col = '#ffffff', op = 1) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: col, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false })); sp.userData.noExport = true; return sp; };
function hlPoints(h, f, pl) {                                         // where the bloom sits: a typed point, an anchor, or three points along a single lit object (a lever glows along its length)
  if (Array.isArray(h.pos)) return [B2T(h.pos)];
  if (h.glow_on) { const p = propPos(h.glow_on, f); return p ? [p] : []; }
  if (typeof h.on !== 'string' || /^\//.test(h.on) || R.cards[h.on]) return [];
  const o = pl.scene.getObjectByName(h.on); if (!o) return [];
  if (!o.userData.hlBox) { const inv = new THREE.Matrix4().copy(o.matrixWorld).invert(), bx = new THREE.Box3(); o.updateWorldMatrix(true, true);
    o.traverse(m => { if (!m.isMesh) return; m.geometry.computeBoundingBox(); const q = m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)); bx.union(q); }); o.userData.hlBox = bx; }
  const bx = o.userData.hlBox, sz = bx.getSize(new THREE.Vector3()), c = bx.getCenter(new THREE.Vector3()), ax = sz.x >= sz.y && sz.x >= sz.z ? 'x' : sz.y >= sz.z ? 'y' : 'z';
  o.updateWorldMatrix(true, false); return [.2, .55, .9].map(t => { const q = c.clone(); q[ax] = bx.min[ax] + sz[ax] * t; return q.applyMatrix4(o.matrixWorld); });
}
function applyHighlights(f, pl) {
  const lit = [];
  if (!pl.hlSprites) { pl.hlSprites = Array.from({ length: 9 }, () => { const sp = glowSprite(); sp.visible = false; pl.scene.add(sp); return sp; }); }
  for (const sp of pl.hlSprites) sp.visible = false; let si = 0;
  for (const h of R.hl || []) { const k = (f - h.f) / h.n; if (k < 0 || k >= 1) continue; const a = hlAmp(h, k), col = hlColor(h.color, k);
    for (const m of hlMeshes(h, pl)) { const mt = m.material; lit.push([mt, mt.color.clone(), mt.emissive ? mt.emissive.clone() : null]);
      if (mt.emissive) { mt.emissive.copy(col).multiplyScalar(a * .9); mt.color.lerp(col, a * .7); } else mt.color.lerp(col, a * .85); }
    if (h.glow === false || h.flare) continue;
    for (const p of hlPoints(h, f, pl)) { const sp = pl.hlSprites[si++]; if (!sp) break; sp.visible = true; sp.position.copy(p); sp.scale.setScalar((h.size ?? .6) * (1 + .1 * Math.sin(f * .7))); sp.material.color.copy(col); sp.material.opacity = Math.min(1, a * (h.bloom ?? .8)); } }
  return lit;
}
// a face that changes colour (Rick: "his face goes purple"): only the bare head of the card is tinted, the hat, hair and clothes keep their colours
function cardTint(who, f) { for (const h of R.hl || []) { if (![].concat(h.on || []).includes(who)) continue; const k = (f - h.f) / h.n; if (k < 0 || k >= 1) continue;
  return { hex: hlColor(h.color, Math.round(k * 6) / 6).getHexString(), a: Math.round(Math.min(1, k / .15, (1 - k) / .25) * 5) / 5 * (h.card ?? .8) }; } return null; }
function tintedTexture(id, tex, card, tint) {
  const hit = R.tex.get(id); if (hit) return hit; const src = tex.image, c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const sc = src.height / CARD.H, y1 = Math.min(c.height, Math.round((card.m.hy + card.m.headPx * .56) * sc)), im = g.getImageData(0, 0, c.width, y1), d = im.data, n = parseInt(tint.hex, 16), tr = (n >> 16) / 255, tg = ((n >> 8) & 255) / 255, tb = (n & 255) / 255, A = tint.a;
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 40 || d[i] < 150 || d[i + 1] < 150 || d[i + 2] < 150 || Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 40) continue; d[i] *= 1 - A + A * tr; d[i + 1] *= 1 - A + A * tg; d[i + 2] *= 1 - A + A * tb; }   // skin = the near-white, unsaturated pixels of the head
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; R.tex.set(id, t); return t;
}
// Held things (a coin, a bottle, the letter in a hand) have no set object: they get a small lens glint drawn over the picture, no star, no outline.
function drawHighlights(g, f, W, H) {
  const pl = R.placeNow; if (!pl) return;
  for (const h of R.hl || []) { if (!h.flare) continue; const k = (f - h.f) / h.n; if (k < 0 || k >= 1) continue; const p3 = Array.isArray(h.pos) ? B2T(h.pos) : propPos(h.glow_on || h.on, f), p = p3 && project(p3); if (!p) continue;
    drawFx(g, 'glint', p[0] * W, p[1] * H, k, W * (h.size ?? 1), h.f, '#' + hlColor(h.color, k).getHexString()); }
}

// Drawn 2D effects for the animatic (2026-11-10: CB wants to SEE the effects, not timing rings). k = 0..1 through the effect, u = W-relative unit.
// The look pass may replace them with particles; the timing and the place stay.
function drawFx(g, kind, x, y, k, W, seed, tintCol) {
  // 2026-11-10 (CB: "too much cartoon highlight effects, like stars; it needs to look cool, like Rick's Clips"): NO drawn stars, bursts, ink outlines or
  // speed lines. Like Rick: light (a soft bloom, a thin lens streak), small hot sparks that fall, soft steam, thin ripples in the air.
  const u = W / 540, rnd = n => { const v = Math.sin((seed + 1) * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); }, out = 1 - (1 - k) * (1 - k);
  const rgba = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a)).toFixed(3)})`; };
  const bloom = (px, py, r, col, a) => { if (r < .5 || a <= 0) return; const gr = g.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(.35, rgba(col, a * .5)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); };
  const sparks = (n, speed) => { for (let i = 0; i < n; i++) { const a = -Math.PI * (.08 + .84 * rnd(i)), v = speed * (.35 + rnd(i + 5)) * u, life = .5 + .5 * rnd(i + 11); if (k > life) continue; const q = k / life, px = Math.cos(a) * v * k, py = Math.sin(a) * v * k + 520 * u * k * k, vx = Math.cos(a) * v, vy = Math.sin(a) * v + 1040 * u * k, L = Math.hypot(vx, vy) || 1, tl = (10 + 16 * rnd(i + 3)) * u * (1 - q);
    g.strokeStyle = rgba(i % 3 ? '#ffd27a' : '#ff8a3a', 1 - q * q); g.lineWidth = (1.4 + 1.6 * rnd(i + 7)) * u * (1 - q * .6); g.beginPath(); g.moveTo(px, py); g.lineTo(px - vx / L * tl, py - vy / L * tl); g.stroke(); } };
  const puffs = (n, col, kk, ox) => { const o2 = 1 - (1 - kk) * (1 - kk); for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(i) - .5) * 1.5, d = (10 + 90 * o2 * (.5 + rnd(i + 9))) * u, r = (22 + 46 * o2 * (.6 + rnd(i + 3))) * u; bloom(ox + Math.cos(a) * d, Math.sin(a) * d - 34 * u * o2, r, col, (1 - kk * kk) * .8); } };
  g.save(); g.translate(x, y); g.lineCap = 'round';
  if (/clank|knock|hit|stamp|kick/.test(kind)) {                      // impact: a white-hot flash of light for 5 frames, a thin ring of air, a few sparks
    g.globalCompositeOperation = 'lighter'; if (k < .28) bloom(0, 0, (50 + 260 * k) * u, '#fff3d0', (1 - k / .28) * .95);
    g.strokeStyle = rgba('#ffffff', .4 * (1 - k)); g.lineWidth = 2.2 * u * (1 - k); g.beginPath(); g.arc(0, 0, (20 + 120 * out) * u, 0, 7); g.stroke();
    if (/dust/.test(kind)) { g.globalCompositeOperation = 'source-over'; puffs(5, '#e6cfae', k, 0); } else sparks(/knock|stamp/.test(kind) ? 7 : 16, 420);
  } else if (/dust|puff|steam|whistle|smoke/.test(kind)) {            // soft steam, no outline; "x2" / "x4" in the name = that many bursts one after the other (counted toots)
    const m = /x(\d)/.exec(kind), n = m ? +m[1] : /counted/.test(kind) ? 3 : 1, span = 1 / (1 + .55 * (n - 1)), ear = /ear/.test(kind);
    for (let j = 0; j < n; j++) { const kj = (k - j * .55 * span) / span; if (kj < 0 || kj >= 1) continue; if (ear) { for (const sx of [-1, 1]) { g.save(); g.translate(sx * 70 * u, 0); g.rotate(sx * .5); puffs(6, '#ffffff', kj, 0); puffs(4, '#ffffff', Math.min(.999, kj * 1.3), 0); g.restore(); } } else puffs(6, /dust/.test(kind) ? '#e6cfae' : '#ffffff', kj, (j - (n - 1) / 2) * 26 * u); }
  } else if (/glint|coin|glow|shine/.test(kind)) {                    // lens glint: a small bloom and ONE thin horizontal streak (anamorphic), never a cross: a cross reads as a cartoon star
    g.globalCompositeOperation = 'lighter'; const a = Math.sin(Math.PI * Math.min(1, k * 1.25)), col = tintCol || '#fff2cc';
    bloom(0, 0, 52 * u, col, a * .8); bloom(0, 0, 13 * u, '#ffffff', a);
    for (const [lw, lh, al, c2] of [[250, 1.6, .75, '#ffffff'], [150, 5, .22, col]]) { const gr = g.createLinearGradient(-lw * u * a, 0, lw * u * a, 0); gr.addColorStop(0, rgba(c2, 0)); gr.addColorStop(.5, rgba(c2, al * a)); gr.addColorStop(1, rgba(c2, 0)); g.fillStyle = gr; g.fillRect(-lw * u * a, -lh * u * a, lw * 2 * u * a, lh * 2 * u * a); }
  } else if (/spark/.test(kind)) {                                    // grinding metal: many fine sparks
    g.globalCompositeOperation = 'lighter'; bloom(0, 0, 30 * u, '#ffd27a', (1 - k) * .7); sparks(26, 380);
  } else if (/scream|sound|ring|toot/.test(kind)) {                   // sound: thin ripples in the air
    for (let i = 0; i < 3; i++) { const kk = k - i * .14; if (kk <= 0) continue; g.strokeStyle = rgba('#ffffff', .55 * (1 - kk)); g.lineWidth = 2.4 * u; g.beginPath(); g.arc(0, 0, (30 + 210 * (1 - (1 - kk) * (1 - kk))) * u, 0, 7); g.stroke(); }
  } else if (/sweat|spit|drop|ink/.test(kind)) {                      // a few small drops, no outline
    for (let i = 0; i < 5; i++) { const a = -Math.PI * (.15 + .7 * rnd(i)), v = (50 + 90 * rnd(i + 2)) * u, px = Math.cos(a) * v * out, py = Math.sin(a) * v * out + 160 * u * k * k; g.fillStyle = rgba(/ink/.test(kind) ? '#b3261e' : '#bfe6ff', (1 - k * k) * .9); g.beginPath(); g.ellipse(px, py, 3.2 * u, 5.5 * u, a + Math.PI / 2, 0, 7); g.fill(); }
  } else if (/paper|letter/.test(kind)) {                             // sheets of paper tumbling up, lit from one side
    for (let i = 0; i < 7; i++) { const px = (rnd(i) - .5) * 260 * u * out, py = -(60 + 260 * rnd(i + 4)) * u * out, sq = Math.abs(Math.cos(k * 9 * (rnd(i) - .5) + i)); g.save(); g.translate(px, py); g.rotate((rnd(i + 8) - .5) * 3 + k * 4 * (rnd(i) - .5)); g.globalAlpha = 1 - k * k; g.fillStyle = sq > .5 ? '#fbf6e8' : '#d8d0bd'; g.fillRect(-15 * u, -21 * u * sq, 30 * u, 42 * u * sq); g.restore(); }
  } else { g.globalCompositeOperation = 'lighter'; bloom(0, 0, (30 + 60 * k) * u, '#fff2cc', (1 - k) * .7); }
  g.restore(); g.globalAlpha = 1;
}

function drawTransition(g, e, k, f, W, H) {
  const u = W / 540, INK = '#231218', a = k < .5 ? k * 2 : (1 - k) * 2, ez = a * a * (3 - 2 * a), diag = Math.hypot(W, H);
  const at = name => { const p3 = name && propPos(name, f), p = p3 && project(p3); return p && p[0] > -.2 && p[0] < 1.2 && p[1] > -.2 && p[1] < 1.2 ? [p[0] * W, p[1] * H] : [W / 2, H * .55]; };
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  if (/match/.test(e.kind)) {                                             // OBJECT MATCH (CB 2026-11-10: push in to the contract, then it becomes the one in his hand): the story object itself
    // lifts off where it lies (from), grows until it covers the frame (the cut or the hidden jump sits there), and shrinks onto the same object in the next picture (to).
    const closing = k < .5, P = closing ? e.from : e.to, sz = (closing ? e.from_size : e.to_size) || [.3, .21], rot = ((closing ? e.from_rot : e.to_rot) || 0) * Math.PI / 180;
    const p3 = Array.isArray(P) ? B2T(P) : propPos(P, f), p = p3 && project(p3), x0 = p ? p[0] * W : W / 2, y0 = p ? p[1] * H : H / 2, dist = p3 ? R.camera.position.distanceTo(p3) : 1, foc = H / (2 * Math.tan(R.camera.fov * Math.PI / 360));
    const w0 = sz[0] / dist * foc, h0 = sz[1] / dist * foc, e2 = ez * ez, x = x0 + (W / 2 - x0) * ez, y = y0 + (H / 2 - y0) * ez, w = w0 + (W * 1.5 - w0) * e2, h = h0 + (H * 1.5 - h0) * e2, r = rot * (1 - ez);
    g.translate(x, y); g.rotate(r); g.globalAlpha = Math.min(1, a * 5);
    g.fillStyle = e.color || '#fbf6e8'; g.strokeStyle = INK; g.lineWidth = Math.max(3 * u, w * .012); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.fill(); g.stroke();
    g.globalAlpha = Math.min(1, a * 5) * Math.max(0, 1 - ez * 1.25);                                                    // the writing fades as the sheet fills the frame: the middle is plain paper
    g.fillStyle = '#8c2a24'; g.fillRect(-w * .22, -h * .40, w * .44, h * .07); g.fillStyle = '#3a2a30'; for (let i = 0; i < 5; i++) g.fillRect(-w * .40, -h * .24 + i * h * .10, w * (i === 4 ? .5 : .8), h * .035);
    g.fillStyle = '#c4261c'; g.beginPath(); g.arc(w * .26, h * .33, Math.min(w, h) * .09, 0, 7); g.fill(); g.lineWidth = Math.max(2 * u, w * .006); g.stroke();
  } else if (/calendar/.test(e.kind)) {                                   // TIME PASSES (Rick dissolves over a calendar): a wall calendar drops over the frame, its days flip, the last page tears away
    const n = e.days || 30, cover = k < .5, b = cover ? Math.min(1, k / .3) : (k - .5) * 2, eb = b * b * (3 - 2 * b), day = cover ? Math.max(1, Math.min(n, Math.round(1 + (n - 1) * Math.max(0, (k - .22) / .26)))) : n;
    if (cover) g.translate(0, -H * 1.05 * (1 - eb)); else { g.translate(-W * .1, 0); g.rotate(-eb * .55); g.translate(W * .1, eb * eb * H * 1.5); }
    g.fillStyle = '#fbf6e8'; g.strokeStyle = INK; g.lineWidth = 6 * u; g.beginPath(); g.rect(-W * .03, -H * .03, W * 1.06, H * 1.06); g.fill(); g.stroke();
    g.fillStyle = '#c4261c'; g.fillRect(-W * .03, -H * .03, W * 1.06, H * .21); g.beginPath(); g.moveTo(-W * .03, H * .18); g.lineTo(W * 1.03, H * .18); g.stroke();
    for (const x of [.28, .72]) { g.fillStyle = INK; g.beginPath(); g.arc(W * x, H * .075, 20 * u, 0, 7); g.fill(); g.strokeStyle = '#cfd6dd'; g.lineWidth = 9 * u; g.beginPath(); g.arc(W * x, H * .04, 26 * u, Math.PI * .9, Math.PI * 2.1); g.stroke(); g.strokeStyle = INK; g.lineWidth = 6 * u; }
    if (e.label) { g.fillStyle = '#fbf6e8'; g.font = `900 ${H * .05}px "Arial Black", Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e.label, W / 2, H * .135); }
    g.fillStyle = INK; g.font = `900 ${H * .3}px "Arial Black", Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(day), W / 2, H * .5);
    g.globalAlpha = .25; for (let i = 0; i < 3; i++) g.fillRect(W * .2, H * (.74 + i * .045), W * (i === 2 ? .35 : .6), H * .012); g.globalAlpha = 1;
  } else if (/steam/.test(e.kind)) {
    const rnd = i => { const v = Math.sin((e.f + 1) * 12.9898 + i * 78.233) * 43758.5453; return v - Math.floor(v); };
    if (a > .86) { g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, W, H); }
    for (let i = 0; i < 26; i++) { const cx = ((i % 5) + .5 + (rnd(i) - .5) * .7) / 5 * W, cy = (Math.floor(i / 5) + .5 + (rnd(i + 40) - .5) * .6) / 5.2 * H + (1 - ez) * H * (.25 + .3 * rnd(i + 9)), r = ez * W * (.2 + .12 * rnd(i + 80));
      if (r < 2) continue; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.25), c0 = i % 3 ? '244,241,234' : '226,222,214'; gr.addColorStop(0, `rgba(${c0},1)`); gr.addColorStop(.55, `rgba(${c0},.92)`); gr.addColorStop(1, `rgba(${c0},0)`); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r * 1.25, 0, 7); g.fill(); }   // soft steam, no drawn outline (CB 2026-11-10: not cartoonish)
  } else {                                                                 // wheel / iris
    const closing = k < .5, [x, y] = at(closing ? e.from : e.to), col = e.color || '#2b2d36', rim = '#cfd6dd';
    if (closing) { const r = 14 * u + ez * ez * diag * 1.05; g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = col; g.fill(); g.lineWidth = Math.max(5 * u, r * .09); g.strokeStyle = rim; g.stroke(); g.lineWidth = 4 * u; g.strokeStyle = INK; g.stroke();
      g.strokeStyle = rim; g.lineWidth = Math.max(4 * u, r * .05); for (let i = 0; i < 6; i++) { const t = i * Math.PI / 3 + k * 9; g.beginPath(); g.moveTo(x + Math.cos(t) * r * .16, y + Math.sin(t) * r * .16); g.lineTo(x + Math.cos(t) * r * .9, y + Math.sin(t) * r * .9); g.stroke(); }
      g.beginPath(); g.arc(x, y, r * .16, 0, 7); g.fillStyle = rim; g.fill(); g.lineWidth = 3 * u; g.strokeStyle = INK; g.stroke(); }
    else { const b = (k - .5) * 2, eb = b * b * (3 - 2 * b), r = eb * diag * 1.05, T = Math.PI * 2; g.beginPath(); g.rect(0, 0, W, H); g.moveTo(x + r, y); g.arc(x, y, r, 0, T, true); g.closePath(); g.fillStyle = col; g.fill('evenodd'); g.beginPath(); g.arc(x, y, r, 0, T); g.lineWidth = Math.max(5 * u, r * .06); g.strokeStyle = rim; g.stroke(); g.lineWidth = 4 * u; g.strokeStyle = INK; g.stroke(); }
  }
  g.restore();
}

function overlay(f, captions) {
  const g = R.over.getContext('2d'), W = R.W, H = R.H, t = f / R.fps; g.clearRect(0, 0, W, H);
  // PLACEHOLDER mood: a short colour wash on the word, so the animatic shows WHERE the light changes. The real change is a light/grade key in the look pass.
  for (const m of R.moods) { const k = (f - m.f) / (R.fps * .5); if (k >= 0 && k < 1) { g.fillStyle = /red/.test(m.look) ? '#ff3b30' : /warm|gold/.test(m.look) ? '#ffb347' : /spot|dark/.test(m.look) ? '#000000' : /cold|blue/.test(m.look) ? '#3b82f6' : '#ffffff'; const col = g.fillStyle, gr = g.createRadialGradient(W / 2, H * .45, H * .18, W / 2, H * .45, H * .75); gr.addColorStop(0, col + '00'); gr.addColorStop(1, col + 'ff'); g.fillStyle = gr; g.globalAlpha = .34 * (1 - k) * (1 - k); g.fillRect(0, 0, W, H); g.globalAlpha = 1; } }
  // PLACEHOLDER fx: an expanding ring at the named thing, so effects are timed and placed before they are designed.
  drawHighlights(g, f, W, H);
  for (const e of R.fx) { const k = (f - e.f) / (R.fps * (e.s ?? .8)); if (k >= 0 && k < 1) { const p3 = Array.isArray(e.pos) ? B2T(e.pos) : propPos(e.on, f), p = p3 && project(p3); if (p) drawFx(g, e.kind || '', p[0] * W, p[1] * H, k, W * (e.size ?? 1.25) * Math.max(.3, Math.min(1.5, 3 / R.camera.position.distanceTo(p3))), e.f); } }   // an effect is a thing in the world: it is smaller when the camera is far
  // DRAWN TRANSITIONS (2026-11-10, CB: transitions through a form or an object, like Rick's): film.json "transitions": [{ at, kind, frames, from, to }].
  //   "wheel": the picture closes into a spoked wheel that grows out of the thing named in "from", and opens again as a round hole on the thing named in "to".
  //   "steam": drawn steam puffs boil up over the frame and clear again. The middle frame (at) is fully covered: put the hidden jump or the cut there.
  for (const e of R.trans || []) { const n = e.frames || 16, k = (f - (e.f - n / 2)) / n; if (k < 0 || k >= 1) continue; drawTransition(g, e, k, f, W, H); }
  if (!captions || !R.words.length) return;
  // one bold word, shown 0.1 s before it is spoken, popping 108 % -> 100 % in 0.09 s; no punctuation on screen
  let w = null, i = -1; for (let j = 0; j < R.words.length; j++) if (R.words[j].s - .1 <= t) { w = R.words[j]; i = j; }
  if (!w) return; const next = R.words[i + 1]; if (t > (next ? next.s - .1 : w.e + .35) || t > w.e + .6) return;
  const k = Math.min(1, (t - (w.s - .1)) / .09), sc = 1.08 - .08 * k, size = H * .062 * sc * (R.film.caption_scale ?? 1), txt = w.w.replace(/[.,?!"';:]/g, '');
  g.font = `900 ${size}px "Arial Black", "Arial Bold", Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = size * .26; g.strokeStyle = '#000'; g.strokeText(txt, W / 2, H * .67); g.fillStyle = '#fff'; g.fillText(txt, W / 2, H * .67);
}

// Stations with their START (camera arrives at rest) and END (last resting frame before it leaves) frames, read from the bake.
// The word and its frame come from the bake's stations table; for a bake without one they are re-derived from film.json in film_plan's order.
window.stations = () => {
  const out = [], takes = {}; R.cam.forEach(c => (takes[c.take] ||= []).push(c));
  const planTakes = (R.film.takes || []).map((tk, i) => ({ id: tk.id || 't' + i, S: tk.stations.map(s => ({ ...s, _at: fr(s.at) })).map(s => ({ ...s, _arr: s._at - (s.lead ?? ((s.word || typeof s.at !== 'number') ? 3 : 0)) })).sort((a, b) => a._arr - b._arr) }));
  for (const [id, frames] of Object.entries(takes)) {
    const pt = planTakes.find(t => t.id === id), n = Math.max(...frames.map(c => c.station)) + 1;
    for (let j = 0; j < n; j++) {
      const mine = frames.filter(c => c.station === j), trav = mine.filter(c => c.state === 'travel'); let rest = mine.filter(c => c.state === 'rest'); if (!mine.length) continue;
      const passes = !rest.length; if (passes) rest = [mine[0]];        // hold 0: the camera passes this pose without stopping; still shown (often frame 0)
      const row = (R.stationRows || []).find(x => x.take === id && x.station === j), s = row ? { word: row.word, _at: row.at } : (pt && pt.S[j] || {}), start = rest[0].f, end = rest[rest.length - 1].f, who = rest[0].subject, st = who && R.perf[who] ? perfAt(R.perf[who], start) : null, st2 = who && R.perf[who] ? perfAt(R.perf[who], end) : null;
      out.push({ take: id, place: rest[0].place, station: j, start, end, framing: rest[0].framing, lens: rest[0].lens, rest_s: passes ? 0 : +(rest.length / R.fps).toFixed(2), passes, travel_s: +(trav.length / R.fps).toFixed(2), next: frames.find(c => c.station === j + 1)?.framing || null,
        subject: who, shows: rest[0].shows, word: s.word || (Array.isArray(s.at) ? s.at[0] : null), at: s._at ?? start,
        move_start: st ? `${who}: ${st.pose}, ${st.face}${st.mouth ? ', talking' : ''}` : (who || 'place'), move_end: st2 ? `${who}: ${st2.pose}, ${st2.face}${st2.mouth ? ', talking' : ''}` : (who || 'place') });
    }
  }
  return out;
};

// Projection only (no occlusion test): tells the checks whether a thing is INSIDE the frame and how big, not whether a prop hides it.
window.visibility = (f) => {
  const c = R.cam[f]; setCamera(c); R.placeNow = R.places[c.place] || Object.values(R.places)[0]; const o = {};
  for (const [who, card] of Object.entries(R.cards)) {
    const st = perfAt(R.perf[who], f); if (!st.visible) { o[who] = null; continue; }
    const H = card.entry.height || 1.7, a = project(B2T([st.pos[0], st.pos[1], st.pos[2] + H])), b = project(B2T(st.pos)), m = project(B2T([st.pos[0], st.pos[1], st.pos[2] + H / 2]));
    o[who] = a && b && m && m[0] > -.1 && m[0] < 1.1 && m[1] > -.2 && m[1] < 1.2 ? { x: +m[0].toFixed(3), y: +m[1].toFixed(3), h: +(b[1] - a[1]).toFixed(3), head_y: +a[1].toFixed(3) } : null;
  }
  for (const name of Object.keys(R.film.props || {})) { const p3 = propPos(name, f), p = p3 && project(p3); o[name] = p && p[0] >= 0 && p[0] <= 1 && p[1] >= 0 && p[1] <= 1 ? { x: +p[0].toFixed(3), y: +p[1].toFixed(3) } : null; }
  return o;
};

// ---- THE LOCK (render.mjs --export-lock): what the Blender look pass reads, so layout can never drift ----
// Set -> .glb, exported as the three.js scene is (Y up). Blender's glTF importer turns (x, y, z) into (x, -z, y), which is exactly the
// plan's (x, y, z): a prop at plan [1.5, 0.6, 2.62] sits at three [1.5, 2.62, -0.6] and lands in Blender at [1.5, 0.6, 2.62].
// Materials are named mat:<library name> (mesh.userData.mat, else the role table below, else mat:untagged_<hex>); when one library
// material is used in several colours each gets mat:<name>.<rrggbb> (read the name up to the first dot). The colour is the base colour.
const ROLE_MAT = { ground: 'turf', wood: 'wood_grain', metal: 'painted_metal_chipped', cloth: 'burlap', glass: 'glass', stone: 'cobble', brick: 'brick', plaster: 'plaster', roof: 'roof_tile', water: 'water', foliage: 'foliage', lamp: 'emissive_lamp' };
window.exportSet = async (place) => {
  const { GLTFExporter } = await import('./vendor/GLTFExporter.js'), pl = R.places[place], root = new THREE.Scene(); root.name = 'set_' + place;
  if (pl.update) pl.update(0, 0, R);                                                  // moving set parts are exported in their frame 0 pose
  for (const ch of pl.scene.children) if (!ch.isLight && !ch.isCamera && !ch.userData.noExport) root.add(ch.clone(true));
  const meshes = [], uses = {}; root.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) { const hex = (Array.isArray(o.material) ? o.material[0] : o.material).color.getHexString(), lib = o.userData.mat || ROLE_MAT[o.userData.role] || 'untagged_' + hex; o.userData.mat = lib; o.userData.color = '#' + hex; (uses[lib] ||= new Set()).add(hex); }
  const mats = {};
  for (const o of meshes) {
    const lib = o.userData.mat, hex = o.userData.color.slice(1), name = 'mat:' + lib + (uses[lib].size > 1 ? '.' + hex : '');
    mats[name] ||= Object.assign(new THREE.MeshStandardMaterial({ color: '#' + hex, roughness: .8, metalness: 0, ...(o.userData.role === 'lamp' ? { emissive: '#' + hex } : {}) }), { name, userData: { lib, color: '#' + hex } });
    o.material = mats[name];
  }
  const buf = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true, trs: true }), u8 = new Uint8Array(buf); let bin = '';
  for (let i = 0; i < u8.length; i += 32768) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
  return { b64: btoa(bin), meshes: meshes.length, materials: Object.keys(mats).sort() };
};
// Cards -> one drawing per UNIQUE state (the same key as the texture cache; keys that draw the same picture share an image) and the runs that say which drawing stands where.
// The rig draws both facings itself (dir is part of the state), so flip is always false.
window.cardIndex = (who, px = 2) => {
  // LOCK v2: one run per stretch of frames that shows the same drawing at the same place. The drawing is the one the animatic drew:
  // in-betweens (tween), eased faces and the face tint of a highlight are all part of it, so the Blender card moves exactly as approved.
  const card = R.cards[who], byKey = {}, bySvg = new Map(), states = [], runs = [];
  for (let f = 0; f < R.end; f++) {
    const c = R.cam[f], st = tweened(who, f), tn = cardTint(who, f), tint = tn && tn.a > 0 ? tn : null, tk = tint ? '|tint' + tint.hex + tint.a : '';
    const key = stateKey(who, st) + tk; let i = byKey[key];
    if (i === undefined) { const svg = svgFor(card.entry, st), sk = svg + tk; i = bySvg.get(sk); if (i === undefined) { i = states.push({ img: states.length + 1, keys: [], svg, tint }) - 1; bySvg.set(sk, i); } states[i].keys.push(key); byKey[key] = i; }
    const run = { f0: f, f1: f, img: i + 1, pos: st.pos.map(v => +(+v).toFixed(4)), flip: false, visible: !!st.visible && (!st.place || st.place === c.place) }, last = runs[runs.length - 1];
    if (last && last.f1 + 1 === run.f0 && last.img === run.img && last.visible === run.visible && String(last.pos) === String(run.pos)) last.f1 = run.f1; else runs.push(run);
  }
  card.lock = states;
  return { who, puppet: card.entry.puppet ?? card.entry.char ?? null, px: [CARD.W * px, CARD.H * px], ground_px: CARD.GY * px, centre_px: CARD.CX * px, height_m: card.entry.height || 1.7, metres_per_px: +(card.k / px).toPrecision(8),
    tip: { head_k: .55, note: 'the card turns to the lens about the vertical axis AND tips to it: yaw = atan2(cam - pos), tilt = atan2(cam height - (pos height + head_k * height_m), ground distance)' },
    images: states.map(s => ({ img: s.img, file: 's' + String(s.img).padStart(4, '0') + '.png', keys: s.keys })), runs };
};
window.cardPNG = async (who, n, px = 2) => {
  const card = R.cards[who], S = card.lock[n - 1], img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(S.svg); await img.decode();
  const c = document.createElement('canvas'); c.width = CARD.W * px; c.height = CARD.H * px; const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
  if (S.tint) { const y1 = Math.min(c.height, Math.round((card.m.hy + card.m.headPx * .56) * px)), im = g.getImageData(0, 0, c.width, y1), d = im.data, q = parseInt(S.tint.hex, 16), tr = (q >> 16) / 255, tg = ((q >> 8) & 255) / 255, tb = (q & 255) / 255, A = S.tint.a;   // the same head-only tint as tintedTexture
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 40 || d[i] < 150 || d[i + 1] < 150 || d[i + 2] < 150 || Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 40) continue; d[i] *= 1 - A + A * tr; d[i + 1] *= 1 - A + A * tg; d[i + 2] *= 1 - A + A * tb; }
    g.putImageData(im, 0, 0); }
  return c.toDataURL('image/png').split(',')[1];
};

// ---- LOCK v2 (2026-11-10, first real episode): the lock also carries what MOVES and what GLOWS ----
// lockIds numbers every set node (userData.lock_id, written to the .glb as a custom property), exportMotion lists the nodes the set's
// update() moves with their local position / rotation / scale / opacity on every frame of the place (three.js axes, Y up: the Blender side
// converts like its glTF importer), exportHighlights lists every highlight with its meshes, colour, strength and bloom points per frame.
const T2B = v => [+v.x.toFixed(4), +(-v.z).toFixed(4), +v.y.toFixed(4)];
window.lockIds = (place) => { const pl = R.places[place]; let n = 0; pl.scene.traverse(o => { if (o.isLight || o.isCamera || o.isSprite || o.userData.noExport) return; o.userData.lock_id = ++n; }); return n; };
window.exportMotion = (place) => {
  const pl = R.places[place], nodes = []; pl.scene.traverse(o => { if (o.userData.lock_id) nodes.push(o); });
  const frames = R.cam.filter(c => c.place === place).map(c => c.f); if (!pl.update || !frames.length) return { place, frames: [], nodes: {} };
  const snap = o => [o.position.x, o.position.y, o.position.z, o.quaternion.x, o.quaternion.y, o.quaternion.z, o.quaternion.w, o.scale.x, o.scale.y, o.scale.z, o.isMesh && o.material && o.material.transparent ? o.material.opacity : 1];
  pl.update(0, 0, R); const base = nodes.map(snap), dyn = new Set();
  for (const f of frames) { pl.update(f, f / R.fps, R); nodes.forEach((o, i) => { if (dyn.has(i)) return; const s = snap(o), b = base[i]; for (let k = 0; k < 11; k++) if (Math.abs(s[k] - b[k]) > 1e-6) { dyn.add(i); break; } }); }
  const out = {}; for (const i of dyn) out[nodes[i].userData.lock_id] = { name: nodes[i].name, trs: [] };
  for (const f of frames) { pl.update(f, f / R.fps, R); for (const i of dyn) out[nodes[i].userData.lock_id].trs.push(snap(nodes[i]).map(v => +v.toFixed(5))); }
  pl.update(0, 0, R); return { place, frames, channels: 'px py pz qx qy qz qw sx sy sz opacity (local, three.js axes)', nodes: out };
};
window.exportHighlights = () => {
  const out = [];
  for (const h of R.hl || []) {
    const place = R.cam[Math.min(R.end - 1, h.f)].place, pl = R.places[place]; R.placeNow = pl;
    const isCard = [].concat(h.on || []).some(n => R.cards[n]), ids = isCard ? [] : hlMeshes(h, pl).map(m => m.userData.lock_id).filter(Boolean), rows = [];
    for (let f = h.f; f < h.f + h.n && f < R.end; f++) { const k = (f - h.f) / h.n; setCamera(R.cam[f]); if (pl.update) pl.update(f, f / R.fps, R); pl.scene.updateMatrixWorld(true);
      rows.push({ f, a: +hlAmp(h, k).toFixed(3), col: '#' + hlColor(h.color, k).getHexString(), pts: (h.glow === false || h.flare) ? [] : hlPoints(h, f, pl).map(T2B) }); }
    out.push({ at: h.f, n: h.n, place, on: h.on, ids, card: isCard, flare: !!h.flare, glow: h.glow !== false, size: h.size ?? .6, bloom: h.bloom ?? .8, frames: rows });
  }
  for (const pl of Object.values(R.places)) if (pl.update) pl.update(0, 0, R);
  return out;
};
window.placeLight = (place) => R.places[place].L;
// instanced set parts (ballast pebbles, sleepers, grass): glTF carries their places but not their colours, so the lock lists the colour of every instance in order
window.exportInstances = (place) => { const out = [], c = new THREE.Color(); R.places[place].scene.traverse(o => { if (!o.isInstancedMesh || !o.userData.lock_id) return; const cols = []; for (let i = 0; i < o.count; i++) { if (o.instanceColor) o.getColorAt(i, c); else c.set('#ffffff'); cols.push(c.getHexString()); } out.push({ id: o.userData.lock_id, name: o.name, n: o.count, mat: o.userData.mat || null, colors: cols }); }); return out; };

// open film_page.html?film=/ep/film.json to watch it play (render.mjs --serve); space = pause, arrows = step
const q = new URLSearchParams(location.search);
if (q.get('film')) (async () => {
  const H = Math.min(960, innerHeight), info = await window.setup({ film: q.get('film'), W: Math.round(H * 9 / 16), H, captions: q.get('captions') !== '0' });
  const audio = new Audio(R.dir + 'voice/voice.wav'); let f = +(q.get('f') || 0), play = q.get('play') !== '0', busy = false, t0 = performance.now() - f / R.fps * 1000;
  addEventListener('keydown', e => { if (e.key === ' ') { play = !play; t0 = performance.now() - f / R.fps * 1000; play ? (audio.currentTime = f / R.fps, audio.play().catch(() => {})) : audio.pause(); } if (e.key === 'ArrowRight') f = Math.min(info.frames - 1, f + 1); if (e.key === 'ArrowLeft') f = Math.max(0, f - 1); });
  const tick = async () => { if (play) { f = Math.floor((performance.now() - t0) / 1000 * R.fps); if (f >= info.frames) { f = 0; t0 = performance.now(); audio.currentTime = 0; } } if (!busy && f !== R.frame) { busy = true; await window.renderFrame(f); busy = false; } requestAnimationFrame(tick); };
  if (play) audio.play().catch(() => {}); tick();
})();
