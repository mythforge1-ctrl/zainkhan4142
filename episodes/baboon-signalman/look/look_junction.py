"""look_junction.py: the LOOK of the junction (Karoo, clear day) on the locked film. Layout, camera, cards, motion and glows come from the
lock (templates/blender_look/lock2.py); this file adds only what the look pass may add: materials, ground detail, sky, far background, light, air.
    blender --background --factory-startup --python look_junction.py -- <tag> <res %> <samples> <frames: 5,9 or 0-99 or none> [save] [mb] [skip]
Writes out/look/<tag>/raw/f_#####.png (+ junction_look.blend with "save"). Grade and overlay: tools/pc_post.py.
"""
import bpy, bmesh, sys, os, json, time, math, random, traceback, re
SK = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")); sys.path.insert(0, os.path.join(SK, "templates"))
EP = os.path.join(SK, "episodes", "baboon-signalman"); A = sys.argv[sys.argv.index("--") + 1:]
tag, res, samples = A[0], int(A[1]), int(A[2]); SAVE = "save" in A; MB = "mb" in A; SKIP = "skip" in A      # skip = leave frames that are already rendered (resume a long render)
frames = [] if A[3] == "none" else [f for x in A[3].split(",") for f in (range(int(x.split("-")[0]), int(x.split("-")[1]) + 1) if "-" in x else [int(x)])]   # 0-1962,2104-2328 or 5,9,12
OUT = os.path.join(EP, "out", "look", tag); RAW = os.path.join(OUT, "raw"); os.makedirs(RAW, exist_ok=True); log = {"place": "junction", "tag": tag}
def save_log(): json.dump(log, open(os.path.join(OUT, "result.json"), "w"), indent=1)
from mathutils import Matrix, Vector, Euler

def build():
    from blender_look import lock2, from_lock as FL, materials as M, look as LOOK, lights, scatter as S, render as R
    sc = bpy.context.scene; rnd = random.Random(7)
    # ---------------- recipes this set needs (tags the set already carries)
    M.LIB.update({
        "paint":  dict(color=(34, 160, 87), rough=.46, coat=.3, height=("noise", 150, .07), chips=.71, vary=.16),
        "tin":    dict(color=(169, 182, 187), rough=.4, metal=.75, height=("noise", 60, .3), vary=.3),
        "leaf":   dict(color=(95, 143, 60), rough=.6, sheen=.3, height=("noise", 6, 1.1), vary=.5),
        "grass":  dict(color=(201, 178, 74), rough=.78, sheen=.3, vary=.22, cull=False),
        "rock":   dict(color=(185, 84, 42), rough=.86, height=("noise", 2.6, 1.9), vary=.45),
        "petal":  dict(color=(230, 90, 40), rough=.6, sheen=.5, vary=.1),
        "paper":  dict(color=(240, 234, 214), rough=.8, height=("noise", 200, .1), vary=.06),
        "gravel": dict(color=(117, 102, 95), rough=.9, height=("voronoi", 11, 1.5), vary=.4, voronoi_tint=True),
        "smoke":  dict(color=(240, 238, 232), rough=1, vary=.05),
    })
    FL.ALIAS.pop("gravel", None)
    LOOK.PRESETS["karoo_day"] = dict(sky=[(0, (.88, .80, .70)), (.06, (.66, .76, .92)), (.26, (.22, .46, .9)), (.7, (.075, .22, .66))], stars=False, world=.85,
        key=(4.6, (1.0, .93, .82)), fill=(.5, (.6, .75, 1.0)), haze=(.76, .72, .72), haze_range=(34, 300, .8), cloud=((.98, .96, .94), (.56, .64, .84)), mist=(.8, .78, .8), air=((1.0, .9, .78), .2))
    t = time.time()
    K = lock2.build(sc, EP, "junction", preset="karoo_day", samples=samples, res=res, motion_blur=MB, key_dir=(-3, -4, 5.2))
    log.update(build_s=round(time.time() - t, 1), materials=K["materials"], motion=K["motion"], highlights=K["highlights"], ranges=K["ranges"]); save_log()
    N = lambda nt, kind: nt.nodes.new(kind)

    # ---------------- ground: one earth material in world space (big colour drifts, pebble patches, clay cracks, fine grain)
    def ground_material():
        m = bpy.data.materials.new("karoo_ground"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
        b = N(nt, "ShaderNodeBsdfPrincipled"); pos = N(nt, "ShaderNodeNewGeometry").outputs["Position"]
        def ramp(src, stops):
            r = N(nt, "ShaderNodeValToRGB"); c = r.color_ramp; c.elements[0].position = stops[0][0]; c.elements[0].color = (*M.lin(stops[0][1]), 1); c.elements[1].position = stops[-1][0]; c.elements[1].color = (*M.lin(stops[-1][1]), 1)
            for p, col in stops[1:-1]: c.elements.new(p).color = (*M.lin(col), 1)
            L(src, r.inputs[0]); return r.outputs[0]
        def mixc(fac, a, bb):
            mx = N(nt, "ShaderNodeMix"); mx.data_type = "RGBA"; L(fac, mx.inputs[0]); L(a, mx.inputs[6]); L(bb, mx.inputs[7]); return mx.outputs[2]
        def math(op, a, bb=None, v=None):
            n = N(nt, "ShaderNodeMath"); n.operation = op; L(a, n.inputs[0])
            if bb is not None: L(bb, n.inputs[1])
            if v is not None: n.inputs[1].default_value = v
            return n.outputs[0]
        big = M._noise(nt, pos, .06, 3); mid = M._noise(nt, pos, .7, 5); fine = M._noise(nt, pos, 150, 2)
        col = ramp(big, [(.32, (196, 108, 58)), (.48, (220, 138, 76)), (.62, (228, 152, 92)), (.74, (236, 176, 118))])
        col = M._scale(nt, col, M._range(nt, mid, .25, .75, .8, 1.16))
        v = N(nt, "ShaderNodeTexVoronoi"); v.inputs["Scale"].default_value = 46; L(pos, v.inputs["Vector"]); sp = N(nt, "ShaderNodeSeparateColor"); L(v.outputs["Color"], sp.inputs[0])
        peb = math("MULTIPLY", M._range(nt, v.outputs["Distance"], .13, .22, 1, 0), M._range(nt, M._noise(nt, pos, 1.3, 3), .47, .6, 0, 1))
        peb = math("MULTIPLY", peb, M._range(nt, sp.outputs[1], .35, .4, 0, 1))                    # only some cells hold a pebble
        col = mixc(math("MULTIPLY", peb, v=.9), col, ramp(sp.outputs[0], [(0, (120, 112, 108)), (.35, (168, 158, 146)), (.6, (150, 88, 62)), (1, (96, 84, 80))]))
        ce = N(nt, "ShaderNodeTexVoronoi"); ce.feature = "DISTANCE_TO_EDGE"; ce.inputs["Scale"].default_value = 2.4; L(pos, ce.inputs["Vector"])
        crack = math("MULTIPLY", M._range(nt, ce.outputs["Distance"], 0, .02, 1, 0), M._range(nt, M._noise(nt, pos, .1, 2), .56, .68, 0, 1))
        col = M._scale(nt, col, M._range(nt, crack, 0, 1, 1, .5))
        L(col, b.inputs["Base Color"]); L(M._range(nt, fine, 0, 1, .8, .97), b.inputs["Roughness"])
        h = math("MULTIPLY", mid, v=.5); h = math("ADD", h, math("MULTIPLY", peb, v=.6)); h = math("ADD", h, math("MULTIPLY", crack, v=-.8)); h = math("ADD", h, math("MULTIPLY", fine, v=.14))
        bp = N(nt, "ShaderNodeBump"); bp.inputs["Distance"].default_value = .03; bp.inputs["Strength"].default_value = 1.0; L(h, bp.inputs["Height"]); L(bp.outputs[0], b.inputs["Normal"])
        return M._finish(m, nt, b.outputs[0])
    GM = ground_material(); n_g = 0
    for o in list(K["set"]):
        try: nm = o.name
        except ReferenceError: continue
        base = re.sub(r"[._]\d+$", "", nm)
        if base == "ground":
            for s in o.material_slots: s.material = GM
            n_g += 1
        elif base == "earth_patch": o.hide_render = o.hide_viewport = True      # flat colour discs of the storyboard: the earth material has its own drifts
    # inside of the engine cab: plain dark paint (the chipped-metal recipe put bright specks into the dark window)
    dark = {}
    for o in K["set"]:
        try:
            if re.sub(r"[._]\d+$", "", o.name) in ("cab_inner", "cab_front_inner", "cab_side"):
                for s_ in o.material_slots:
                    m = s_.material
                    if m and m.name.startswith("painted_metal_chipped"):
                        c = next((tuple(n.outputs[0].default_value[:3]) for n in m.node_tree.nodes if n.type == "RGB"), (.02, .02, .02))
                        s_.material = dark.setdefault(c, M.get("matte", color=tuple(int(round(255 * v ** (1 / 2.2))) for v in c)))
        except ReferenceError: pass
    # table mountains: layered rock (bands that follow the height, with a wobble)
    def strata(m):
        if m.get("strata"): return
        nt = m.node_tree; b = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if b is None or not b.inputs["Base Color"].links: return
        L = nt.links.new; pos = N(nt, "ShaderNodeNewGeometry").outputs["Position"]; w = N(nt, "ShaderNodeTexWave"); w.bands_direction = "Z"; w.inputs["Scale"].default_value = .55; w.inputs["Distortion"].default_value = 1.6; w.inputs["Detail"].default_value = 3; w.inputs["Detail Scale"].default_value = .25; L(pos, w.inputs["Vector"])
        L(M._scale(nt, b.inputs["Base Color"].links[0].from_socket, M._range(nt, w.outputs[1], 0, 1, .74, 1.14)), b.inputs["Base Color"])
        bp = next((n for n in nt.nodes if n.type == "BUMP"), None)
        if bp is not None and bp.inputs["Height"].links:
            a = N(nt, "ShaderNodeMath"); a.operation = "MULTIPLY_ADD"; L(w.outputs[1], a.inputs[0]); a.inputs[1].default_value = 2.2; L(bp.inputs["Height"].links[0].from_socket, a.inputs[2]); L(a.outputs[0], bp.inputs["Height"]); bp.inputs["Distance"].default_value = .12
        m["strata"] = True
    for o in K["set"]:
        try:
            if re.sub(r"[._]\d+$", "", o.name) in ("koppie_cliff", "koppie_slope"):
                for s_ in o.material_slots: strata(s_.material)
        except ReferenceError: pass
    # the plain runs on to the horizon
    me = bpy.data.meshes.new("far_plain"); bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=64, radius=2600); bm.to_mesh(me); bm.free(); me.materials.append(GM)
    fp = bpy.data.objects.new("far_plain", me); sc.collection.objects.link(fp); fp.location = (0, 0, -.03)
    log["ground_objects"] = n_g

    # ---------------- smoke: soft lit puffs, their fade comes from the lock (object colour alpha)
    sm = bpy.data.materials.new("smoke_soft"); sm.use_nodes = True; nt = sm.node_tree; nt.nodes.clear(); L = nt.links.new
    o_ = N(nt, "ShaderNodeOutputMaterial"); d = N(nt, "ShaderNodeBsdfPrincipled"); d.inputs["Base Color"].default_value = (.9, .88, .85, 1); d.inputs["Roughness"].default_value = 1; d.inputs["Emission Color"].default_value = (.9, .88, .86, 1); d.inputs["Emission Strength"].default_value = .35
    lw = N(nt, "ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = .35; oi = N(nt, "ShaderNodeObjectInfo"); a1 = N(nt, "ShaderNodeMath"); a1.operation = "SUBTRACT"; a1.inputs[0].default_value = 1; L(lw.outputs["Facing"], a1.inputs[1])
    a2 = N(nt, "ShaderNodeMath"); a2.operation = "MULTIPLY"; L(a1.outputs[0], a2.inputs[0]); L(oi.outputs["Alpha"], a2.inputs[1]); a3 = N(nt, "ShaderNodeMath"); a3.operation = "MULTIPLY"; a3.inputs[1].default_value = .9; L(a2.outputs[0], a3.inputs[0])
    tr = N(nt, "ShaderNodeBsdfTransparent"); mx = N(nt, "ShaderNodeMixShader"); L(a3.outputs[0], mx.inputs[0]); L(tr.outputs[0], mx.inputs[1]); L(d.outputs[0], mx.inputs[2]); L(mx.outputs[0], o_.inputs[0])
    try: sm.surface_render_method = "DITHERED"
    except Exception: pass
    for o in K["set"]:
        try:
            if o.name.startswith("smoke_puff"):
                for s in o.material_slots: s.material = sm
                for p in o.data.polygons: p.use_smooth = True
                o.visible_shadow = False
        except ReferenceError: pass

    # ---------------- ground detail in the round: stones, pebbles, dry grass, twigs (merged meshes, never on a path or a mark)
    BLOCK = [(1.1, 4.3, .8, 3.3), (-2.0, .8, -.15, .95), (8.7, 21.3, -2.7, 3.4), (-400, 400, 2.15, 6.65)]          # hut, lever frame, boardwalk, track bed
    KC = K["keep_clear"]
    def free(x, y, pad=0.0, clear=True):
        if any(a - pad < x < b + pad and c - pad < y < d2 + pad for a, b, c, d2 in BLOCK): return False
        return not (clear and any((x - a) ** 2 + (y - b) ** 2 < (r * .55 + pad) ** 2 for a, b, r in KC))
    def spots(n, area, pad=0.0, clear=True):
        out = []
        for _ in range(n * 5):
            if len(out) >= n: break
            x, y = rnd.uniform(area[0], area[1]), rnd.uniform(area[2], area[3])
            if free(x, y, pad, clear): out.append((x, y))
        return out
    def rock_mesh(name, sub, jitter):
        bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1)
        for v in bm.verts: v.co *= 1 + rnd.uniform(-jitter, jitter)
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        for p in me.polygons: p.use_smooth = True
        return me
    STONE = [(163, 154, 140), (143, 131, 118), (176, 105, 74), (156, 90, 60), (194, 161, 132), (119, 112, 106), (205, 150, 104)]
    stone_mat = lock2.with_inst_col(M.get("rock", color=(160, 150, 140), height=("noise", 9, 1.2), vary=.3))
    def scatter_rocks(name, pts, size, sub=2):
        base = rock_mesh(name + "_base", sub, .22); mats, cols = [], []
        for x, y in pts:
            r = rnd.uniform(*size); s = (r * rnd.uniform(1, 1.6), r * rnd.uniform(.85, 1.3), r * rnd.uniform(.45, .8))
            mats.append(Matrix.Translation((x, y, s[2] * .25)) @ Euler((rnd.uniform(-.2, .2), rnd.uniform(-.2, .2), rnd.uniform(0, 6.28))).to_matrix().to_4x4() @ Matrix.Diagonal((*s, 1))); cols.append(M.lin(rnd.choice(STONE)))
        ob = lock2.merged(sc, name, base, mats, cols, stone_mat); ob.visible_shadow = True; return len(pts)
    near = (-22, 30, -9, 2.1); north = (-30, 40, 6.7, 20)
    cnt = {}
    cnt["pebbles"] = scatter_rocks("look_pebbles", spots(2600, near, clear=False) + spots(1200, north, clear=False), (.012, .035), 1)
    cnt["stones"] = scatter_rocks("look_stones", spots(260, near, .12) + spots(200, north, .1), (.05, .13))
    cnt["rocks"] = scatter_rocks("look_rocks", spots(26, (-22, 30, -9, -1.2), .5) + spots(40, (-40, 50, 8, 30), .4), (.18, .42))
    # dry grass tufts with real blades
    GRASS = [(201, 178, 74), (169, 173, 76), (191, 154, 60), (215, 196, 98), (143, 159, 72), (226, 204, 130)]
    blade_mat = lock2.with_inst_col(M.get("grass", color=(200, 180, 80)))
    tb = S.blades("look_tuft_base", None, n=13, h=.34, seed=5); mats, cols = [], []
    for x, y in spots(520, near, .25) + spots(640, north, .2) + spots(500, (-70, 80, 8, 45), .2):
        s = rnd.uniform(.55, 1.25) * (1.4 if y > 8 else 1); mats.append(Matrix.Translation((x, y, 0)) @ Euler((0, 0, rnd.uniform(0, 6.28))).to_matrix().to_4x4() @ Matrix.Diagonal((s, s, s * rnd.uniform(.8, 1.3), 1))); cols.append(M.lin(rnd.choice(GRASS)))
    g = lock2.merged(sc, "look_tufts", tb, mats, cols, blade_mat); cnt["tufts"] = len(mats)
    # twigs
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=5, radius1=.008, radius2=.004, depth=.34); bmesh.ops.rotate(bm, verts=bm.verts, matrix=Euler((0, math.pi / 2, 0)).to_matrix()); tw = bpy.data.meshes.new("look_twig_base"); bm.to_mesh(tw); bm.free()
    mats, cols = [], []
    for x, y in spots(260, near, .1) + spots(160, north, .1):
        s = rnd.uniform(.5, 1.5); mats.append(Matrix.Translation((x, y, .008)) @ Euler((0, rnd.uniform(-.06, .06), rnd.uniform(0, 6.28))).to_matrix().to_4x4() @ Matrix.Diagonal((s, 1, 1, 1))); cols.append(M.lin(rnd.choice([(120, 88, 60), (150, 120, 90), (96, 70, 50)])))
    lock2.merged(sc, "look_twigs", tw, mats, cols, lock2.with_inst_col(M.get("wood_grain", color=(120, 90, 60)))); cnt["twigs"] = len(mats)
    log["scatter"] = cnt

    # ---------------- sky: stylised clouds all round, far table mountains in the haze
    def cloud_material():
        m = bpy.data.materials.new("cloud_day"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new; o = N(nt, "ShaderNodeOutputMaterial"); d = N(nt, "ShaderNodeBsdfDiffuse"); s2 = N(nt, "ShaderNodeShaderToRGB"); L(d.outputs[0], s2.inputs[0])
        bw = N(nt, "ShaderNodeRGBToBW"); L(s2.outputs[0], bw.inputs[0]); r = N(nt, "ShaderNodeValToRGB"); c = r.color_ramp; c.interpolation = "EASE"
        c.elements[0].position = .12; c.elements[0].color = (.36, .46, .72, 1); c.elements[1].position = 1.5 if False else 1.0; c.elements[1].color = (1.0, .97, .93, 1); e1 = c.elements.new(.5); e1.color = (.74, .8, .93, 1)
        L(bw.outputs[0], r.inputs[0]); e = N(nt, "ShaderNodeEmission"); L(r.outputs[0], e.inputs[0]); e.inputs[1].default_value = 1.0; L(e.outputs[0], o.inputs[0]); return m
    cm = cloud_material(); n_c = 0
    def cumulus(center, w, seed, n, az):
        r3 = random.Random(seed); h = w * .34; bm = bmesh.new()
        for i in range(n):
            x = r3.uniform(-w / 2, w / 2); k = 1.35 - abs(x) / w * 1.6; rr = r3.uniform(.2, .36) * h * k; ret = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=rr)
            bmesh.ops.translate(bm, verts=ret["verts"], vec=(x, r3.uniform(-h * .35, h * .35), r3.uniform(0, h * .5) * k + rr * .55))
        me = bpy.data.meshes.new("Cloud"); bm.to_mesh(me); bm.free(); me.materials.append(cm); o = bpy.data.objects.new("Cloud", me); sc.collection.objects.link(o); o.location = center; o.rotation_euler = (0, 0, az + math.pi / 2)
        a = o.modifiers.new("R", "REMESH"); a.mode = "VOXEL"; a.voxel_size = max(2.5, w / 60); s3 = o.modifiers.new("S", "SMOOTH"); s3.iterations = 8; s3.factor = .6; return o
    for i in range(22):
        az = i / 22 * math.tau + rnd.uniform(-.12, .12); dist = rnd.uniform(700, 1150); w = rnd.uniform(130, 300); alt = rnd.uniform(70, 330)
        cumulus((math.cos(az) * dist, math.sin(az) * dist, alt), w, 20 + i, rnd.randint(12, 20), az); n_c += 1
    for i in range(14):                                                        # small high clouds
        az = rnd.uniform(0, math.tau); dist = rnd.uniform(800, 1200); cumulus((math.cos(az) * dist, math.sin(az) * dist, rnd.uniform(380, 620)), rnd.uniform(70, 130), 60 + i, 8, az); n_c += 1
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get()
    for o in [o for o in bpy.data.objects if o.name.startswith("Cloud")]:
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); o.modifiers.clear(); o.data = me; o.visible_shadow = False
        zmin = min(v.co.z for v in me.vertices); zmax = max(v.co.z for v in me.vertices); base = zmin + (zmax - zmin) * .2
        for v in me.vertices:
            if v.co.z < base: v.co.z = base - (base - v.co.z) * .12                    # a cumulus has a flat base
        for p in me.polygons: p.use_smooth = True
    log["clouds"] = n_c
    def ridge(name, radius, hmax, col, seed, base=-3):
        r2 = random.Random(seed); seg = 240; bm = bmesh.new(); hs = []; h = 0; run = 0
        for i in range(seg):
            if run <= 0: h = r2.choice([0, 0, .25, .45, .7, 1, .55, .3]) * hmax * r2.uniform(.7, 1.1); run = r2.randint(3, 14)
            run -= 1; hs.append(h)
        hs = [(hs[i - 2] + hs[i - 1] * 2 + hs[i] * 3 + hs[(i + 1) % seg] * 2 + hs[(i + 2) % seg]) / 9 + r2.uniform(0, hmax * .04) for i in range(seg)]
        lo = [bm.verts.new((math.cos(i / seg * math.tau) * radius, math.sin(i / seg * math.tau) * radius, base)) for i in range(seg)]
        mid = [bm.verts.new((math.cos(i / seg * math.tau) * (radius + hmax * .25), math.sin(i / seg * math.tau) * (radius + hmax * .25), base + hs[i] * .72)) for i in range(seg)]
        hi = [bm.verts.new((math.cos(i / seg * math.tau) * (radius + hmax * .3), math.sin(i / seg * math.tau) * (radius + hmax * .3), base + hs[i])) for i in range(seg)]
        bk = [bm.verts.new((math.cos(i / seg * math.tau) * (radius + hmax * 1.6), math.sin(i / seg * math.tau) * (radius + hmax * 1.6), base + hs[i])) for i in range(seg)]
        for i in range(seg):
            j = (i + 1) % seg
            for a, b in ((lo, mid), (mid, hi), (hi, bk)): bm.faces.new((a[i], a[j], b[j], b[i]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(M.get("rock", color=col, height=("noise", .08, 1.2), vary=.25))
        o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); return o
    ridge("far_range_1", 340, 26, (176, 96, 62), 3); ridge("far_range_2", 520, 46, (150, 84, 70), 4); ridge("far_range_3", 760, 74, (128, 84, 92), 5)
    return sc, K, R

try:
    t0 = time.time(); sc, K, R = build(); log["look_s"] = round(time.time() - t0, 1); log["objects"] = len(bpy.data.objects); save_log(); log["render_s"] = {}
    KF = set(K["frames"]); log["todo"] = len(frames)
    for f in frames:
        p = os.path.join(RAW, "f_%05d.png" % f)
        if f not in KF or (SKIP and os.path.exists(p)): continue
        log["render_s"][f] = R.still(sc, p, f); log["last"] = f
        if len(log["render_s"]) % 10 == 0 or len(frames) < 60: save_log()
    if SAVE: bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "junction_look.blend"))
    log["done"] = True
except Exception:
    log["error"] = traceback.format_exc()
save_log()
