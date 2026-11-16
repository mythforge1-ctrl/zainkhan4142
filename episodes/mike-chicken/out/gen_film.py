"""Writes film.json for 'The Chicken That Skipped Dinner' from voice/words.json + SCRIPT.md.
Run from the skill folder:  python3 episodes/mike-chicken/out/gen_film.py
"""
import json, re, os
HERE = os.path.dirname(os.path.abspath(__file__)); EP = os.path.dirname(HERE)
words = json.load(open(os.path.join(EP, "voice", "words.json")))
key = lambda w: w.strip(" .,?!\"';:-").lower()
K = [key(w["w"]) for w in words]
script = open(os.path.join(EP, "SCRIPT.md"), encoding="utf-8").read()
LINES = re.findall(r'^\s*\d+\.\s+\[[^\]]*\]\s+(.*)$', script, re.M)
START = []; n = 0
for l in LINES: START.append(n); n += len(l.split())
assert n == len(words), (n, len(words))

def A(line, k=0, off=0):
    """anchor of word k of script line `line` (1-based) as [word, nth(, frame offset)]"""
    if isinstance(k, str):
        toks = [key(t) for t in LINES[line - 1].split()]; k = toks.index(k.lower()) if k.lower() in toks else (_ for _ in ()).throw(KeyError((line, k)))
    i = START[line - 1] + k; w = K[i]; nth = K[:i + 1].count(w)
    return [w, nth, off] if off else [w, nth]

# ---- cast (heights in metres) ----
H = {"farmer": 1.7, "mike": 0.55, "neighbour": 1.7, "sci1": 1.65, "sci2": 1.7, "showman": 1.8, "lady": 1.6, "kid": 1.05}
cast = {
 "farmer":    {"puppet": "form:dad", "height": 1.7, "heads_tall": 3.0},
 "mike":      {"puppet": "cast:mike", "height": 0.55, "heads_tall": 1.7},
 "neighbour": {"puppet": "cast:fishgramps", "height": 1.7, "heads_tall": 3.0},
 "sci1":      {"puppet": "cast:scientist", "height": 1.65, "heads_tall": 2.9},
 "sci2":      {"puppet": "cast:doctor", "height": 1.7, "heads_tall": 2.9},
 "showman":   {"puppet": "form:chad", "height": 1.8, "heads_tall": 3.0},
 "lady":      {"puppet": "form:lady", "height": 1.6, "heads_tall": 2.8, "walk_speed": 1.3},
}
places = {
 "yard":     {"set": "farmyard", "light": "golden", "backdrop": 9},
 "lab":      {"set": "lab", "light": "interior", "backdrop": 6},
 "tent":     {"set": "tent", "light": "interior", "backdrop": 6},
 "mind":     {"set": "mind", "light": "interior", "backdrop": 7},
 "party":    {"set": "farmyard", "light": "day", "backdrop": 9},
}
props = {
 "eyedropper": {"held_by": "farmer"},
 "axe": {"held_by": "farmer"},
 "quarter": {"held_by": "showman"},
 "clipboard": {"held_by": "sci1"},
 "block": {"pos": [-1.0, 0.7, 0], "h": 0.5, "kind": "chopping block with an axe mark (set)"},
 "barrel": {"pos": [1.2, -0.2, 0], "h": 0.85, "kind": "feed barrel Mike stands on, so his head clears the caption band (set)"},
 "fence": {"pos": [0, 1.9, 0], "h": 1.1, "kind": "rail fence along y=1.9 (set)"},
 "sign": {"pos": [7, 3, 2.2], "h": 1.2, "kind": "sideshow sign 'LIVE HEADLESS CHICKEN' (set)"},
 "barn": {"pos": [-6, 3, 2.2], "h": 5, "kind": "red barn with a windmill behind it (set)"},
 "bench": {"pos": [-5, 2, 1.0], "h": 1.5, "kind": "lab bench with glassware and a microscope (set)"},
 "brain": {"pos": [-5, 2, 1.5], "h": 2.0, "kind": "giant cartoon brain and spine model (the 'You see' analogy, set)"},
 "bunting": {"pos": [-5, 3, 3.0], "h": 1.2, "kind": "party bunting across the yard (set)"},
}

PLACE = {  # one world view per place: the camera looks away from the people, at the place itself (so the frame has no face)
 "yard":  dict(pos=[-0.5, -6.0, 1.3], aim=[-6.0, 3.0, 2.2], shows=["barn"]),
 "lab":   dict(pos=[0.5, -5.0, 1.4], aim=[-5.0, 2.0, 1.6], shows=["bench"]),
 "tent":  dict(pos=[-0.6, -5.0, 1.2], aim=[7.0, 3.0, 2.2], shows=["sign"]),
 "mind":  dict(pos=[0.0, -6.2, 1.5], aim=[-5.0, 2.0, 1.5], shows=["brain"]),
 "party": dict(pos=[0.0, -5.0, 1.2], aim=[-5.0, 3.0, 3.0], shows=["bunting"]),
}
def Pl(name, sub, **kw):
    d = dict(PLACE[name]); d.update(lens=24, subject=sub, framing="P", drift=[0.06, 0.0, 0.0], drift_aim=0.0); d.update(kw); return d
def Ob(sub, pos, aim, shows, **kw):
    d = dict(pos=pos, aim=aim, lens=35, subject=sub, framing="O", shows=shows); d.update(kw); return d

def R(sub, P, fr, dx=0.0, dy=0.0, dz=0.0, **kw):
    """Rest station on subject at P=(x,y), height from H: W whole body, M medium, C close."""
    h = H[sub]; x, y = P[0], P[1]; small = h < 0.8; bz = P[2] if len(P) > 2 else 0.0
    if fr == "W":   d, z, az = (1.6, 0.34, 0.78 * h) if small else (3.0, 0.85, 0.80 * h)
    elif fr == "M": d, z, az = (1.2, 0.34, 0.8 * h) if small else (2.1, 1.15, 0.84 * h)
    elif fr == "C": d, z, az = (1.0, 0.34, 0.86 * h) if small else (1.9, 1.3, 0.9 * h)
    else: raise ValueError(fr)
    z += bz; az += bz
    s = {"pos": [round(x + dx, 3), round(y - d + dy, 3), round(z + dz, 3)], "aim": [round(x, 3), round(y, 3), round(az, 3)],
         "lens": 24, "subject": sub, "framing": fr}
    s.update(kw); return s

F0, M0, N0 = (0.0, 0.0), (1.2, -0.2, 0.85), (2.1, 1.7)
def mk(lst):
    def f(at, s, **kw): s = dict(s); s["at"] = at; s.update(kw); lst.append(s)
    return f
t1, t2, t3, t4, t5 = [], [], [], [], []
st, s2, s3, s4, s5 = mk(t1), mk(t2), mk(t3), mk(t4), mk(t5)
# ---------------- take 1: the yard (lines 1-8, golden) ----------------
s0 = R("farmer", (0.85, 0.0), "W"); s0["shows"] = ["eyedropper", "mike"]; s0["hold"] = 0.0; s0["at"] = 0; t1.append(s0)
st(A(1, "head", -4), R("mike", M0, "M"), shows=["mike"], word="head", hold=0.6)                     # hook payoff
st(A(2, "yard", -4), Pl("yard", "farmer"), hold=0.8, travel=2.0)
st(A(3, "axe", -4), R("farmer", F0, "W"), shows=["axe"], word="axe", hold=0.5, travel=1.8)
st(A(4, "peck", -4), R("mike", M0, "W"), shows=["mike"], word="peck", hold=0.5, travel=5.0, via=[[-1.4, -3.6, 1.5], [0.6, -4.2, 1.9]])         # the long journey: farmer -> Mike
st(A(5, "eyedropper", -4), Ob("farmer", [0.25, -2.0, 1.0], [0.0, 0.0, 1.2], ["eyedropper"], lens=35), word="eyedropper", hold=0.8, travel=2.5)
st(A(6, "face", -4), R("neighbour", N0, "C"), shows=["fence"], word="face", hold=0.9, travel=3.0)  # the mocker, big close-up
st(A(7, "nothing", -4), R("farmer", F0, "W"), shows=["eyedropper"], word="nothing", hold=0.5, travel=0.7)
st(A(7, "drop", -4), R("mike", M0, "M"), shows=["eyedropper", "mike"], word="drop", hold=0.8, travel=0.7)
st(A(8, "strutting", -4), R("mike", M0, "W", dx=-0.4), shows=["mike"], word="strutting", hold=0.5, travel=1.0)
st(A(8, "crow", -4), R("mike", M0, "M"), shows=["mike"], word="crow", hold=0.6, travel=0.7)
# ---------------- take 2: the lab (line 9, interior) ----------------
S1, S2, ML = (-0.55, 0.0), (1.3, 0.2), (0.45, 0.05)
s2(A(9, "then"), Pl("lab", "sci1"), hold=0.6)
s2(A(9, "poke", -4), R("sci1", S1, "W", dx=0.4), shows=["clipboard", "mike"], word="poke", hold=0.6, travel=1.8)
# ---------------- take 3: the tent (lines 10-11, interior) ----------------
SH, MT, NT = (-0.4, 0.0), (0.8, 0.1), (-2.1, -0.2)
s3(A(10, "then"), Pl("tent", "showman"), hold=0.5)
s3(A(10, "quarter", -4), Ob("showman", [-0.2, -2.1, 1.1], [-0.4, 0.0, 1.3], ["quarter"], lens=35), word="quarter", hold=0.7, travel=2.5)
s3(A(11, "laughing", -4), R("neighbour", NT, "M"), shows=[], word="laughing", hold=0.8, travel=2.5)
# ---------------- take 4: the mind (lines 12-14, interior) ----------------
LP = (0.0, 0.0)
s4(A(12, "you"), Pl("mind", "lady"), hold=1.3)
s4(A(13, "heartbeat", -4), R("lady", LP, "W", dx=0.5), shows=["lady"], word="heartbeat", hold=0.5, travel=3.0)
s4(A(14, "legs", -4), R("lady", (0.4, 0.0), "W", dx=-0.5), shows=["lady"], word="legs", hold=0.5, travel=0.8)
s4(A(14, "thinking", -4), R("lady", (0.4, 0.0), "M"), shows=["lady"], word="thinking", hold=0.6, travel=0.8)
# ---------------- take 5: the party (lines 15-17, day), loops to frame 0 ----------------
s5(A(15, "so"), R("mike", M0, "W"), shows=["mike"], word="so", hold=0.6)
s5(A(16, "farmer", -4), R("farmer", F0, "W"), shows=["eyedropper"], word="farmer", hold=0.5, travel=1.0)
s5(A(17, "town", -4), Pl("party", "mike"), word="town", hold=0.5, travel=2.2)
last = dict(s0); last["at"] = A(17, "year", 0); last["loop"] = True; last["travel"] = 1.8; last.pop("hold", None); last["shows"] = ["eyedropper", "mike"]; t5.append(last)

takes = [dict(id="t1", place="yard", stations=t1), dict(id="t2", place="lab", stations=t2), dict(id="t3", place="tent", stations=t3),
         dict(id="t4", place="mind", stations=t4), dict(id="t5", place="party", stations=t5)]

# ---------------- acts (who, at, pose, face, pos) ----------------
acts = []
def act(who, at, **kw): acts.append(dict(who=who, at=at, **kw))
# yard
act("farmer", 0, pos=[0, 0, 0], view="front", dir=1, pose="hold_watch", face="strain", prop="eyedropper", hand="R")
act("mike", 0, pos=[1.2, -0.2, 0.85], view="34", dir=-1, pose="stand", face="standard")
act("neighbour", 0, pos=[2.1, 1.7, 0], view="front", dir=-1, pose="stand", face="smug")
act("farmer", A(2, "yard"), face="standard", pose="stand")
act("farmer", A(3, "swings"), pose="point_up", face="evil", prop="axe", hand="R")
act("mike", A(3, "stands"), face="starstruck", pose="clap")
act("farmer", A(4, "next"), face="confused", pose="stand")
act("farmer", A(5, "sighs"), face="deadInside", pose="shrug")
act("farmer", A(5, "eyedropper"), face="cool", pose="hold_watch", prop="eyedropper", hand="R")
act("neighbour", A(6, "leans"), face="smug", pose="point_out")
act("neighbour", A(6, "face"), face="hysterical", pose="hand_mouth", punch=True, punch_s=0.5)
act("farmer", A(7, "says"), face="cool", pose="hold_watch", prop="eyedropper", hand="R")
act("farmer", A(7, "squeezes"), face="proud", pose="press_watch", prop="eyedropper", hand="R")
act("neighbour", A(8, "week"), face="sus", pose="stand")
act("mike", A(8, "strutting"), face="standard", pose="stand")
# lab
act("sci1", A(9, "then", -5), pos=[-0.55, 0, 0], view="front", dir=1, pose="hold_watch", face="judging", prop="clipboard", hand="R")
act("sci2", A(9, "then", -5), pos=[1.3, 0.2, 0], view="34", dir=-1, pose="hand_mouth", face="confused")
act("mike", A(9, "then", -5), pos=[0.45, 0.05, 0.9], view="front", dir=-1, pose="stand", face="standard")
act("sci1", A(9, "poke"), face="sus", pose="point_out")
act("sci1", A(9, "find"), face="deadInside", pose="shrug")
# tent
act("showman", A(10, "then", -5), pos=[-0.4, 0, 0], view="front", dir=1, pose="point_out", face="delight", prop="quarter", hand="R")
act("mike", A(10, "then", -5), pos=[0.8, 0.1, 1.0], view="34", dir=-1, pose="stand", face="standard")
act("neighbour", A(10, "then", -5), pos=[-2.1, -0.2, 0], view="front", dir=-1, pose="stand", face="smug")
act("showman", A(10, "quarter"), pose="hold_up", face="evil", prop="quarter", hand="R")
act("neighbour", A(11, "keeps"), face="deadInside", pose="stand")
act("neighbour", A(11, "laughing"), face="terrified", pose="stand", punch=True, punch_s=0.5)
# mind
act("lady", A(12, "you", -5), pos=[0, 0, 0], view="front", dir=1, pose="stand", face="confused")
act("lady", A(12, "missed"), face="sus", pose="finger_up")
act("lady", A(13, "heartbeat"), face="judging", pose="stand")
act("lady", A(14, "legs"), pos=[0.4, 0, 0], pose="stand", face="cool")
act("lady", A(14, "thinking"), pos=[0.4, 0, 0], face="starstruck", pose="finger_up")
# party
act("mike", A(15, "so", -5), pos=[1.2, -0.2, 0.85], view="34", dir=-1, pose="stand", face="standard")
act("farmer", A(15, "so", -5), pos=[0, 0, 0], view="front", dir=1, pose="stand", face="proud")
act("neighbour", A(15, "so", -5), pos=[2.1, 1.7, 0], view="front", dir=-1, pose="clap", face="happyCry")
act("farmer", A(16, "feeds"), face="delight", pose="hold_watch", prop="eyedropper", hand="R")
act("neighbour", A(17, "town"), face="happyCry", pose="clap")
act("farmer", A(17, "year"), face="strain", pose="hold_watch", prop="eyedropper", hand="R")

# ---------------- who is in which take (hide the rest: the plan counts every visible head) ----------------
PRESENT = [("t1", None, {"farmer", "mike", "neighbour"}), ("t2", A(9, "then", -5), {"sci1", "sci2", "mike"}),
           ("t3", A(10, "then", -5), {"showman", "mike", "neighbour"}), ("t4", A(12, "you", -5), {"lady"}),
           ("t5", A(15, "so", -5), {"mike", "farmer", "neighbour"})]
firstpos = {}
for a_ in acts:
    if "pos" in a_ and a_["who"] not in firstpos: firstpos[a_["who"]] = a_["pos"]
prev = set()
for tid, anchor, here in PRESENT:
    if anchor is None:
        for who in cast:
            if who not in here: acts.append(dict(who=who, at=0, pos=firstpos.get(who, [0, 0, 0]), visible=False))
    else:
        for who in cast:
            if who in here and who not in prev: acts.append(dict(who=who, at=anchor, visible=True))
            if who not in here and who in prev: acts.append(dict(who=who, at=anchor, visible=False))
    prev = here

# ---------------- sentences ----------------
subj = {1: "farmer", 2: "farmer", 3: "farmer", 4: "mike", 5: "farmer", 6: "neighbour", 7: "farmer", 8: "mike", 9: "sci1", 10: "showman",
        11: "neighbour", 12: "lady", 13: "lady", 14: "lady", 15: "mike", 16: "farmer", 17: "mike"}
nouns = {3: [("axe", 1, "axe")], 5: [("eyedropper", 1, "eyedropper")], 10: [("quarter", 1, "quarter")]}
sentences = []
for i, l in enumerate(LINES, 1):
    d = dict(text=l, words=[START[i - 1], START[i - 1] + len(l.split()) - 1], subject=subj[i])
    if i in nouns: d["nouns"] = [dict(word=w, n=n_, show=s_) for w, n_, s_ in nouns[i]]
    sentences.append(d)

fx = [dict(at=A(3, "axe", -4), kind="dust_hit", on="axe"), dict(at=A(10, "quarter", -4), kind="glow", on="quarter"),
      dict(at=A(7, "drop", -4), kind="glow", on="eyedropper"), dict(at=A(17, "party", -4), kind="glow", on="bunting"),
      dict(at=A(5, "eyedropper", -4), kind="glow", on="eyedropper"), dict(at=A(16, "eyedropper", -4), kind="glow", on="eyedropper")]
look = lambda a_, l_: dict(at=a_, look=l_)
moods = [look(A(1, "head"), "spot_hero"), look(A(3, "axe"), "flash_red"), look(A(4, "next"), "warm_up"), look(A(6, "face"), "spot_hero"),
         look(A(7, "says"), "warm_up"), look(A(9, "then"), "flash_red"), look(A(10, "then"), "warm_up"), look(A(11, "laughing"), "spot_hero"),
         look(A(12, "you"), "spot_hero"), look(A(14, "legs"), "warm_up"), look(A(15, "so"), "warm_up"), look(A(17, "town"), "spot_hero")]
snd = lambda a_, n_: dict(at=a_, name=n_)
sound = [snd(A(1, "milk"), "drip_small"), snd(A(3, "axe"), "axe_chop"), snd(A(3, "stands"), "chicken_squawk"), snd(A(6, "face"), "laugh_short"),
         snd(A(7, "drop"), "drip_small"), snd(A(9, "then"), "lab_hum"), snd(A(10, "then"), "carnival_sting"), snd(A(10, "quarter"), "coin_ding"),
         snd(A(12, "you"), "whoosh_soft"), snd(A(17, "party"), "crowd_cheer"), snd(A(17, "year"), "drip_small")]

film = {
 "title": "The Chicken That Skipped Dinner", "fps": 30, "size": [1080, 1920], "words": "voice/words.json",
 "tween": {"frames": 7, "ease": "out", "walk_frames": 8, "face_frames": 8}, "caption_scale": 0.5, "auto_view": True,
 "puppet_pkg": ["cast", "../../templates/vector2d_characters/code"],
 "camera_idea": {
  "name": "Dinner or not",
  "why": "The farmer, the neighbour and the whole town keep treating Mike as dinner, so the camera sits at Mike's eye level and keeps drifting up toward the people who look down at him, then finds him the same size as them at the party.",
  "signature": "On the last line the camera drops from the bunting back to the farmer's eyedropper on frame 0, so the film loops on the same drip."},
 "cast": cast, "places": places, "props": props, "takes": takes, "kicks": [dict(at=A(3, "axe"), amp=2.0)],
 "acts": acts, "sentences": sentences, "fx": fx, "moods": moods, "sound": sound,
}
json.dump(film, open(os.path.join(EP, "film.json"), "w"), indent=1)
print("film.json written:", len(t1) + len(t2) + len(t3) + len(t4) + len(t5), "stations")
