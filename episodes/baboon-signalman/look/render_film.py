"""render_film.py <blender.exe> <tag> [res %] [samples]: the FINAL RENDER of the film on the PC (only after CB's look OK). System Python.
One Blender job at a time, place by place, with motion blur. It can be stopped and started again: finished frames are kept.
While Blender renders, this script grades each finished frame and lays the drawn layer (captions, effects, transitions) over it.
Writes out/final/<tag>/frames/f_#####.png, status.json, then <tag>.mp4 with sound/mix.wav (or the voice alone if there is no mix yet).
    python render_film.py <blender.exe> v1            the whole film
    python render_film.py <blender.exe> v1 mux        only build the mp4 again from the finished frames (after a new sound mix)
    python render_film.py <blender.exe> t1 only=1955-1975   a short test of the whole chain on a stretch of frames"""
import sys, os, json, subprocess, time, shutil
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); EP = os.path.dirname(HERE); SK = os.path.dirname(os.path.dirname(EP)); sys.path.insert(0, os.path.join(SK, "tools"))
import pc_post
BL, tag = sys.argv[1], sys.argv[2]; rest = [a for a in sys.argv[3:] if a != "mux" and not a.startswith("only=")]; MUX = "mux" in sys.argv[3:]
ONLY = next((tuple(int(x) for x in a[5:].split("-")) for a in sys.argv[3:] if a.startswith("only=")), None)
res = rest[0] if rest else "100"; smp = rest[1] if len(rest) > 1 else "64"
OUT = os.path.join(EP, "out", "final", tag); FR = os.path.join(OUT, "frames"); os.makedirs(FR, exist_ok=True); OVD = os.path.join(EP, "out", "overlay")
NO = 0x08000000 if os.name == "nt" else 0; st = {"tag": tag, "t0": time.time(), "started": time.strftime("%Y-%m-%d %H:%M")}
def save():
    st["s"] = round(time.time() - st["t0"]); json.dump(st, open(os.path.join(OUT, "status.json"), "w"), indent=1)
cam = json.load(open(os.path.join(EP, "out", "plan", "camera_baked.json"))); fps = cam.get("fps", 30); by = {}
ALL = [fr["f"] for fr in cam["frames"] if ONLY is None or ONLY[0] <= fr["f"] <= ONLY[1]]
_A = set(ALL)
for fr in cam["frames"]:
    if fr["f"] in _A: by.setdefault(fr["place"], []).append(fr["f"])
TOTAL = len(ALL); st["total"] = TOTAL
def ranges(fs):
    out = []; a = b = fs[0]
    for f in fs[1:]:
        if f == b + 1: b = f
        else: out.append((a, b)); a = b = f
    out.append((a, b)); return ",".join("%d-%d" % r for r in out)
def good(p):
    try:
        with Image.open(p) as im: im.load()
        return True
    except Exception: return False
JOBS = [("junction", "look_junction.py", "day"), ("office", "look_office.py", "interior")]
def post_ready(pl, grade, fs, final=False):
    """grade the raw frames that are complete. While Blender still runs, a frame counts as complete when a later one exists."""
    raw = os.path.join(EP, "out", "look", tag + "_" + pl, "raw"); have = [f for f in fs if os.path.exists(os.path.join(raw, "f_%05d.png" % f))]; n = 0
    top = max(have) if have else -1
    for f in have:
        dst = os.path.join(FR, "f_%05d.png" % f); src = os.path.join(raw, "f_%05d.png" % f)
        if os.path.exists(dst) or (f == top and not final): continue
        if not good(src):
            if final: os.remove(src)
            continue
        pc_post.post_one(src, dst + ".tmp.png", grade, .3, os.path.join(OVD, "o_%05d.png" % f)); os.replace(dst + ".tmp.png", dst); n += 1
    return n
try:
    st["free_gb"] = round(shutil.disk_usage(OUT).free / 1e9, 1); save()
    for pl, script, grade in ([] if MUX else JOBS):
        fs = by.get(pl, [])
        if not fs: continue
        sub = tag + "_" + pl; d = os.path.join(EP, "out", "look", sub); os.makedirs(d, exist_ok=True)
        for attempt in range(1, 6):
            if all(os.path.exists(os.path.join(FR, "f_%05d.png" % f)) for f in fs): break
            st["step"] = "render %s, attempt %d" % (pl, attempt); save()
            with open(os.path.join(d, "log_%d.txt" % attempt), "w") as lg:
                p = subprocess.Popen([BL, "--background", "--factory-startup", "--python", os.path.join(HERE, script), "--", sub, res, smp, ranges(fs), "mb", "skip"], stdout=lg, stderr=subprocess.STDOUT, creationflags=NO)
                while p.poll() is None:
                    post_ready(pl, grade, fs); st["frames_done"] = len(os.listdir(FR)); save(); time.sleep(4)
            post_ready(pl, grade, fs, final=True); st["frames_done"] = len(os.listdir(FR)); save()
        missing = [f for f in fs if not os.path.exists(os.path.join(FR, "f_%05d.png" % f))]
        if missing: raise RuntimeError("%s: %d frames still missing after 5 attempts, first %d" % (pl, len(missing), missing[0]))
    missing = [f for f in ALL if not os.path.exists(os.path.join(FR, "f_%05d.png" % f))]
    if missing: raise RuntimeError("%d frames missing, first %d" % (len(missing), missing[0]))
    st["step"] = "mp4"; save(); mix = os.path.join(EP, "sound", "mix.wav"); audio = mix if os.path.exists(mix) else os.path.join(EP, "voice", "voice.wav"); st["audio"] = os.path.relpath(audio, EP)
    mp4 = os.path.join(OUT, "baboon_signalman_%s.mp4" % tag)
    a = subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(fps), "-start_number", str(ALL[0]), "-i", os.path.join(FR, "f_%05d.png"), "-ss", "%.3f" % (ALL[0] / fps), "-i", audio, "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k",
                        "-af", "apad", "-t", "%.3f" % (TOTAL / fps), "-movflags", "+faststart", mp4], capture_output=True, text=True, creationflags=NO)
    st["ffmpeg"] = a.stderr[-400:]; st["mp4"] = mp4 if os.path.exists(mp4) else None; st["done"] = bool(st["mp4"])
except Exception:
    import traceback; st["error"] = traceback.format_exc()
save()
