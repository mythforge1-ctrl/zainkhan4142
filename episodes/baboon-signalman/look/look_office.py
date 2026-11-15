"""look_office.py: the LOOK of the railway boss's office (day, sun through the window, warm oil lamps) on the locked film. Layout, camera, cards,
motion and glows come from the lock (templates/blender_look/lock2.py); this file adds only materials, light and air.
    blender --background --factory-startup --python look_office.py -- <tag> <res %> <samples> <frames: 5,9 or 0-99 or none> [save] [mb] [skip] [air=<density>]
Writes out/look/<tag>/raw/f_#####.png (+ office_look.blend with "save"). Grade and overlay: tools/pc_post.py --preset interior.
"""
import bpy, bmesh, sys, os, json, time, math, random, traceback, re
SK = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")); sys.path.insert(0, os.path.join(SK, "templates"))
EP = os.path.join(SK, "episodes", "baboon-signalman"); A = sys.argv[sys.argv.index("--") + 1:]
tag, res, samples = A[0], int(A[1]), int(A[2]); SAVE = "save" in A; MB = "mb" in A; SKIP = "skip" in A      # skip = leave frames that are already rendered (resume a long render)
frames = [] if A[3] == "none" else [f for x in A[3].split(",") for f in (range(int(x.split("-")[0]), int(x.split("-")[1]) + 1) if "-" in x else [int(x)])]   # 0-1962,2104-2328 or 5,9,12
AIR = next((float(a[4:]) for a in A if a.startswith("air=")), .028)
OUT = os.path.join(EP, "out", "look", tag); RAW = os.path.join(OUT, "raw"); os.makedirs(RAW, exist_ok=True); log = {"place": "office", "tag": tag}
def save_log(): json.dump(log, open(os.path.join(OUT, "result.json"), "w"), indent=1)

def build():
    from blender_look import lock2, from_lock as FL, materials as M, look as LOOK, lights, render as R
    sc = bpy.context.scene
    M.LIB.update({
        "carpet":    dict(color=(126, 38, 38), rough=.96, sheen=.22, height=("noise", 260, .6), vary=.2),
        "cast_iron": dict(color=(51, 51, 61), rough=.48, metal=.85, height=("noise", 120, .55), vary=.22),
        "felt":      dict(color=(47, 92, 71), rough=.96, sheen=.9, height=("noise", 300, .25), vary=.08),
        "leather":   dict(color=(47, 92, 71), rough=.42, coat=.22, height=("noise", 420, .14), vary=.16),
        "wax":       dict(color=(156, 47, 40), rough=.3, coat=.6, vary=.08),
        "wicker":    dict(color=(176, 140, 90), rough=.7, height=("weave", 40, .8), vary=.25),
        "paper":     dict(color=(240, 234, 214), rough=.8, height=("noise", 200, .1), vary=.06),
    })
    # day outside, a room that lives from the window and its lamps
    LOOK.PRESETS["office_day"] = dict(sky=[(0, (.62, .52, .42)), (.5, (.44, .46, .56)), (1, (.3, .36, .52))], stars=False, world=.3,
        key=(7.0, (1.0, .9, .72)), fill=(.22, (.62, .72, 1.0)), haze=(.34, .27, .2), haze_range=(5, 30, .22), cloud=((.9, .9, .9), (.4, .4, .5)), mist=(.3, .3, .3), air=((1.0, .88, .7), .3))
    t = time.time()
    K = lock2.build(sc, EP, "office", preset="office_day", samples=samples, res=res, motion_blur=MB, key_dir=(-.35, .8, .62), glow=dict(strength=1.1, mix=.7, watts=6.0))
    log.update(build_s=round(time.time() - t, 1), materials=K["materials"], motion=K["motion"], highlights=K["highlights"], ranges=K["ranges"]); save_log()
    N = lambda nt, kind: nt.nodes.new(kind); base = lambda o: re.sub(r"[._]\d+$", "", o.name)
    for o in bpy.data.objects:
        if o.type == "LIGHT" and o.name.startswith("Key"): o.data.angle = .02
        if o.type == "LIGHT" and o.name.startswith("Fill"): o.data.angle = .7
    S = [o for o in K["set"]]
    def alive(o):
        try: o.name; return True
        except ReferenceError: return False
    S = [o for o in S if alive(o)]
    def rgb_of(m):
        """the colour a library, flat or lamp material was made with (linear)"""
        if not m or not m.use_nodes: return (.5, .5, .5)
        for n in m.node_tree.nodes:
            if n.type == "RGB": return tuple(n.outputs[0].default_value[:3])
        for n in m.node_tree.nodes:
            if n.type == "BSDF_PRINCIPLED": return tuple(n.inputs["Base Color"].default_value[:3])
            if n.type == "EMISSION": return tuple(n.inputs[0].default_value[:3])
        return (.5, .5, .5)
    srgb = lambda c: tuple(max(0, min(255, int(round(255 * (v ** (1 / 2.2)))))) for v in c)

    # ---------------- the view behind the window is daylight: it shines by itself and lets the sun through
    view = {}
    def view_mat(col):
        k = tuple(round(v, 4) for v in col)
        if k not in view:
            m = bpy.data.materials.new("view_day"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); o = N(nt, "ShaderNodeOutputMaterial"); e = N(nt, "ShaderNodeEmission"); e.inputs[0].default_value = (*col, 1); e.inputs[1].default_value = 1.9; nt.links.new(e.outputs[0], o.inputs[0]); view[k] = m
        return view[k]
    n_view = 0
    for o in S:
        b = base(o)
        if b.startswith("view_"):
            for s in o.material_slots: s.material = view_mat(rgb_of(s.material))
            o.visible_shadow = False; n_view += 1
        elif b in ("window_pane", "clock_drop_window", "desk_lamp_chimney", "ceiling_lamp_shade_inside", "stove_fire_slot") or b.endswith("_globe"): o.visible_shadow = False
        if b == "stove_fire_slot":
            for s in o.material_slots: s.material = M.fire()
    log["view_objects"] = n_view

    # ---------------- floor: waxed boards that catch the window light; rug stays soft
    made = {}
    for o in S:
        b = base(o)
        if b in ("floor_board", "desk_top", "desk_top_moulding"):
            for s in o.material_slots:
                c = srgb(rgb_of(s.material)); k = (b == "floor_board", c)
                if k not in made: made[k] = M.get("wood_grain", color=c, rough=.34 if k[0] else .3, coat=.4 if k[0] else .5, height=("grain", 26, .16 if k[0] else .05), vary=.34 if k[0] else .2)
                s.material = made[k]
    # printed flats (map lines, clock face, letter ink) must not glow in a room: less self-light
    for m in bpy.data.materials:
        if m.name.startswith("flat_") and m.use_nodes:
            p = m.node_tree.nodes.get("Principled BSDF")
            if p: p.inputs["Emission Strength"].default_value = .1

    # ---------------- lamps: warm oil light with falloff (the globes themselves glow from the set)
    WARM = (1.0, .66, .32)
    def lamp(loc, watts, radius=.06, col=WARM, name="lamp"):
        l = lights.practical(sc, loc, col, watts, radius); l.name = "look_" + name; return l
    lamp((.35, .85, 2.36), 38, .1, name="ceiling")
    lamp((1.16, 1.1, 1.03), 8, .07, name="desk")
    for sx in (-1, 1): lamp((sx * 2.43, .35, 2.02), 9, .06, name="sconce")
    lamp((1.9, 1.9, .42), 7, .05, (1.0, .42, .14), "stove")
    # soft sky light through the window (the sun gives the shaft, this gives the glow around it)
    d = bpy.data.lights.new("look_window", "AREA"); d.shape = "RECTANGLE"; d.size = 1.5; d.size_y = 1.3; d.energy = 42; d.color = (.82, .9, 1.0)
    w = bpy.data.objects.new("look_window", d); sc.collection.objects.link(w); w.location = (-.9, 2.5, 1.7); w.rotation_euler = (math.radians(-75), 0, 0)      # shines into the room (-Y) and a little down
    # ---------------- air: a little dust so the sun shaft and the lamp halos show
    if AIR > 0: lights.air(sc, (0, .5, 1.55), (5.2, 4.3, 3.1), density=AIR, col=(1.0, .9, .76))
    log["air"] = AIR
    return sc, K, R

try:
    t0 = time.time(); sc, K, R = build(); log["look_s"] = round(time.time() - t0, 1); log["objects"] = len(bpy.data.objects); save_log(); log["render_s"] = {}
    KF = set(K["frames"]); log["todo"] = len(frames)
    for f in frames:
        p = os.path.join(RAW, "f_%05d.png" % f)
        if f not in KF or (SKIP and os.path.exists(p)): continue
        log["render_s"][f] = R.still(sc, p, f); log["last"] = f
        if len(log["render_s"]) % 10 == 0 or len(frames) < 60: save_log()
    if SAVE: bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "office_look.blend"))
    log["done"] = True
except Exception:
    log["error"] = traceback.format_exc()
save_log()
