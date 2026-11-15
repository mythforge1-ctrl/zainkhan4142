"""Install the skill and its two agents for Claude Code, and check the PC.
    python tools/install.py          install + check
    python tools/install.py --check  only check what is installed
Run it again after every change to SKILL.md or agents/.

The folder this file lives in stays the working copy (tools, templates, episodes). The installer writes a copy of SKILL.md
to ~/.claude/skills/cartoon-3d-short/ with every path made absolute, so Claude finds the tools from any folder, and copies
agents/*.md to ~/.claude/agents/ the same way. Nothing else on the PC is changed."""
import os, re, glob, sys, shutil, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))).replace("\\", "/")
HOME = os.path.expanduser("~")
FRONT = re.compile(r"\A---\n(.*?)\n---\n", re.S)
ABS = lambda s: re.sub(r"(?<![\w/\\.:-])(templates|tools|references|library|episodes|agents)/", ROOT + r"/\1/", s)


def install():
    master = open(os.path.join(ROOT, "SKILL.md"), encoding="utf-8").read()
    m = FRONT.match(master)
    body = ABS(master[m.end():])
    body = re.sub(r"\]\((WORKFLOW|DENSITY_RULES|CINEMATOGRAPHY|SETUP|README)\.md\)", lambda k: "](%s/%s.md)" % (ROOT.replace(" ", "%20"), k.group(1)), body)
    note = "\n> **This is an installed copy.** The working folder is `%s`. Edit the SKILL.md there, then run `python \"%s/tools/install.py\"` again.\n" % (ROOT, ROOT)
    dst = os.path.join(HOME, ".claude", "skills", "cartoon-3d-short")
    os.makedirs(dst, exist_ok=True)
    open(os.path.join(dst, "SKILL.md"), "w", encoding="utf-8", newline="\n").write(m.group(0) + note + body)
    print("installed skill ->", os.path.join(dst, "SKILL.md"))
    adst = os.path.join(HOME, ".claude", "agents")
    os.makedirs(adst, exist_ok=True)
    for p in sorted(glob.glob(os.path.join(ROOT, "agents", "*.md"))):
        a = open(p, encoding="utf-8").read()
        k = FRONT.match(a)
        a = k.group(0) + ABS(a[k.end():]).replace("`CINEMATOGRAPHY.md`", "`%s/CINEMATOGRAPHY.md`" % ROOT).replace("`SKILL.md`", "`%s/SKILL.md`" % ROOT)
        open(os.path.join(adst, os.path.basename(p)), "w", encoding="utf-8", newline="\n").write(a)
        print("installed agent ->", os.path.basename(p))


def ver(cmd):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30, shell=(os.name == "nt" and cmd[0] in ("npm", "npx")))
        return (r.stdout or r.stderr).strip().splitlines()[0] if r.returncode == 0 else None
    except Exception:
        return None


def check():
    ok = True
    print("\nChecking this PC")

    def line(name, found, need, fix):
        nonlocal ok
        print("  %-4s %-22s %s" % ("ok" if found else need, name, found or fix))
        if not found and need == "MISS":
            ok = False

    line("Python 3.10+", sys.version.split()[0] if sys.version_info >= (3, 10) else None, "MISS", "install Python 3.10 or newer from python.org")
    for mod, pipname, need in (("numpy", "numpy", "MISS"), ("PIL", "pillow", "MISS"), ("scipy", "scipy", "MISS"), ("cv2", "opencv-python", "opt"), ("faster_whisper", "faster-whisper", "opt")):
        try:
            __import__(mod); found = "installed"
        except Exception:
            found = None
        line("python: " + pipname, found, need, "pip install " + pipname + (" (needed for word timing of the voice)" if mod == "faster_whisper" else " (needed for the look checks)" if mod == "cv2" else ""))
    node = ver(["node", "--version"])
    line("Node 18+", node if node and int(node.lstrip("v").split(".")[0]) >= 18 else None, "MISS", "install Node LTS from nodejs.org")
    line("ffmpeg", (ver(["ffmpeg", "-version"]) or "")[:40] or None, "MISS", "install ffmpeg and put it on the PATH")
    pw = os.path.isdir(os.path.join(ROOT, "node_modules", "playwright")) or bool(os.environ.get("PLAYWRIGHT_DIR"))
    line("playwright (film kit)", "installed" if pw else None, "MISS", 'in "%s" run: npm install   then: npx playwright install chromium' % ROOT)
    blender = shutil.which("blender") or next(iter(sorted(glob.glob(r"C:\Program Files\Blender Foundation\Blender*\blender.exe"), reverse=True)), None) or next(iter(glob.glob("/Applications/Blender.app/Contents/MacOS/Blender")), None)
    line("Blender", blender, "opt", "install Blender 4.2 or newer from blender.org (needed for the final look and render, not for storyboard or animatic)")
    print("\nAll needed parts are there." if ok else "\nInstall the parts marked MISS, then run this again.")
    print("Next: python tools/film_plan.py check episodes/baboon-signalman/film.json")
    return ok


if __name__ == "__main__":
    if "--check" not in sys.argv:
        install()
    sys.exit(0 if check() else 1)
