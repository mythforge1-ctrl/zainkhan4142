"""look_frames.py <blender.exe> <tag> [res %] [samples] [only=n,n]: the LOOK GATE pictures. One finished frame (look + grade + drawn layer) for every camera
station of the film, numbered in film order, as JPEGs and as contact sheets of six. System Python on the PC; runs one Blender job at a time.
Writes out/look/<tag>/: frames/NN_f#####.jpg, sheets/look_sheet_N.jpg, status.json. only=11,13 renders just those numbered shots again and rebuilds the sheets. Places: junction (look_junction.py, grade day), office (look_office.py, grade interior)."""
import sys, os, json, subprocess, time, glob
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); EP = os.path.dirname(HERE); SK = os.path.dirname(os.path.dirname(EP)); BL, tag = sys.argv[1], sys.argv[2]
res = sys.argv[3] if len(sys.argv) > 3 else "100"; smp = sys.argv[4] if len(sys.argv) > 4 else "64"
ONLY = next((set(int(x) for x in a[5:].split(",")) for a in sys.argv if a.startswith("only=")), None)
OUT = os.path.join(EP, "out", "look", tag); os.makedirs(OUT, exist_ok=True); st = {"tag": tag, "t0": time.time()}
def save(): json.dump(st, open(os.path.join(OUT, "status.json"), "w"), indent=1)
PICK = {("t1", 0): 2, ("t1b", 0): 508, ("t2", 0): 1977, ("t3", 0): 2114}          # stations whose rest begins under a transition: a frame after it
cam = json.load(open(os.path.join(EP, "out", "plan", "camera_baked.json"))); order, rest, place = [], {}, {}
for fr in cam["frames"]:
    k = (fr["take"], fr["station"])
    if k not in order: order.append(k); place[k] = fr["place"]
    if fr["state"] == "rest": rest.setdefault(k, []).append(fr["f"])
shots = [(i + 1, PICK.get(k) or rest[k][len(rest[k]) * 2 // 5], place[k]) for i, k in enumerate(order) if k in rest]
st["shots"] = shots; save(); NO = 0x08000000 if os.name == "nt" else 0
try:
    for pl, script, grade in (("junction", "look_junction.py", "day"), ("office", "look_office.py", "interior")):
        fs = [f for n, f, p in shots if p == pl and (ONLY is None or n in ONLY)]
        if not fs: continue
        sub = tag + "_" + pl; d = os.path.join(EP, "out", "look", sub); os.makedirs(d, exist_ok=True); st["step"] = "render " + pl; save()
        with open(os.path.join(d, "log.txt"), "w") as lg: subprocess.run([BL, "--background", "--factory-startup", "--python", os.path.join(HERE, script), "--", sub, res, smp, ",".join(map(str, fs)), "save"], stdout=lg, stderr=subprocess.STDOUT, creationflags=NO)
        r = json.load(open(os.path.join(d, "result.json"))); st[pl] = {k: r.get(k) for k in ("done", "error", "build_s", "look_s", "render_s")}; save()
        if not r.get("done"): raise RuntimeError(pl + " look render failed")
        a = subprocess.run([sys.executable, os.path.join(SK, "tools", "pc_post.py"), d, "--preset", grade, "--vig", "0.3", "--only", ",".join(map(str, fs))], capture_output=True, text=True, creationflags=NO); st[pl]["post"] = (a.stdout + a.stderr)[-200:]; save()
    fd = os.path.join(OUT, "frames"); sd = os.path.join(OUT, "sheets"); os.makedirs(fd, exist_ok=True); os.makedirs(sd, exist_ok=True); fps = cam.get("fps", 30); tiles = []
    try: font = ImageFont.truetype("arialbd.ttf", 34)
    except Exception: font = ImageFont.load_default()
    for n, f, pl in shots:
        im = Image.open(os.path.join(EP, "out", "look", tag + "_" + pl, "graded", "f_%05d.png" % f)).convert("RGB"); im.save(os.path.join(fd, "%02d_f%05d.jpg" % (n, f)), quality=92)
        t = im.resize((720, round(720 * im.height / im.width)), Image.LANCZOS); dr = ImageDraw.Draw(t); s = f / fps; lab = "%d   %d:%02d" % (n, s // 60, s % 60)
        w = dr.textlength(lab, font=font) if hasattr(dr, "textlength") else 120; dr.rectangle((0, 0, w + 28, 52), fill=(20, 20, 24)); dr.text((14, 7), lab, fill=(255, 255, 255), font=font); tiles.append(t)
    for i in range(0, len(tiles), 6):
        g = tiles[i:i + 6]; W, H = g[0].size; o = Image.new("RGB", (W * 3, H * ((len(g) + 2) // 3)), (20, 20, 24))
        for j, t in enumerate(g): o.paste(t, (W * (j % 3), H * (j // 3)))
        o.save(os.path.join(sd, "look_sheet_%d.jpg" % (i // 6 + 1)), quality=86)
    st["sheets"] = sorted(os.listdir(sd)); st["done"] = True
except Exception as e:
    import traceback; st["error"] = traceback.format_exc()
st["s"] = round(time.time() - st["t0"]); save()
