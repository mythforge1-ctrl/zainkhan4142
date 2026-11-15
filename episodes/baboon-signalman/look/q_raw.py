import bpy, sys, json, re, collections, os
out = sys.argv[sys.argv.index("--") + 1]
C = collections.Counter(); ex = {}
for o in bpy.data.objects:
    if o.type != "MESH": continue
    nm = re.sub(r"[._]\d+$", "", o.name); mats = tuple(sorted(set(re.sub(r"_\d+$", "", s.material.name) if s.material else "None" for s in o.material_slots)))
    C[(nm, mats)] += 1; ex.setdefault(nm, dict(verts=len(o.data.vertices), users=o.data.users, parent=o.parent.name if o.parent else None, dims=[round(v, 2) for v in o.dimensions], loc=[round(v, 2) for v in o.matrix_world.translation], id=o.get("lock_id"), cols=[a.name for a in o.data.color_attributes]))
rows = sorted(C.items(), key=lambda x: -x[1])
json.dump({"n": len(bpy.data.objects), "types": collections.Counter(o.type for o in bpy.data.objects), "rows": [[k[0], list(k[1]), v, ex[k[0]]] for k, v in rows[:60]], "matte": [[k[0], v] for k, v in rows if any(m.startswith("matte") for m in k[1])][:80]}, open(out, "w"), indent=0)
