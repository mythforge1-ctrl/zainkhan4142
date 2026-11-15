#!/usr/bin/env python3
"""Writes ../film.json for baboon-signalman from voice/words.json (camera director's generator).
Word anchors stay as word anchors; only set events, teleports and trolley moves are typed frames, and
they are all computed here from words.json, so after a new voice: python3 out/gen_film.py, then film_plan.py check."""
import json, os, math
EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = json.load(open(os.path.join(EP, "voice/words.json")))
K = [w["w"].strip(" .,?!\"';:-").lower() for w in W]
def F(word, n=1, off=0):
    hits = [i for i, k in enumerate(K) if k == word]
    return int(round(W[hits[n - 1]]["s"] * 30)) + off
NOTES = []           # events_anchors.md rows
def note(what, frames, src): NOTES.append((what, frames, src))

MARK = [-0.6, 0.35, 0]          # Jack at the lever frame
HOME = [2.3, 0.2, 0]            # trolley home (moved from 1.3,0.45 so the key board is clear: set builder's note 5)
KEYS = [0.8, 0.7, 0]            # Jack at the key board
CAB1 = 0.0                      # cab stop for the key hand-over: between the lever frame and the hut, window clear of the hut
CAB2 = 6.8                      # carriage 1 middle window behind Jack (x = -0.6)
UNDERCAB = [0.15, 2.55, 0]
BUY = [1.5, -0.7, 0]           # Jack beside the trolley (lines 3 and 19)
I0 = [0.4, 0.35, 0]             # inspector between Jack and the signalman
I1 = [1.3, 0.1, 0]              # inspector in the signalman's face
LEAN = [0.95, -0.55, -0.95]     # "leans into the lens": the card sinks so the head comes down to baboon height (stand-in for a lean pose)
BOARD = [13.2, 0.3, 0]          # inspector on the boardwalk
OFFICE = [-0.75, 0.55, 0]

# ---------------------------------------------------------------- events (typed frames, from words)
EV = []
def ev(obj, f0, f1, a, b, src): EV.append(dict(f0=f0, f1=f1, obj=obj, **{"from": a, "to": b})); note(obj + " %s -> %s" % (a, b), "%d-%d" % (f0, f1), src)
def linear(obj, f0, f1, a, b, src, step=6):
    n = max(1, (f1 - f0) // step); note(obj + " %s -> %s (%d short pieces = steady speed)" % (a, b, n), "%d-%d" % (f0, f1), src)
    for k in range(n):
        u0, u1 = k / n, (k + 1) / n; g0 = f0 + (f1 - f0) * k // n; g1 = f0 + (f1 - f0) * (k + 1) // n
        EV.append(dict(f0=g0, f1=g1, obj=obj, **{"from": [round(a[i] + (b[i] - a[i]) * u0, 3) for i in range(3)], "to": [round(a[i] + (b[i] - a[i]) * u1, 3) for i in range(3)]}))
CUT_IN = F("inspector", 4, -5); CUT_OUT = F("jack", 7, -5)
TP = F("every", 1, 4)                         # home -> start of the ride, while the camera whips up the line
RIDE0, RIDE1 = F("pushes", 1, 3), F("pushes", 1, 3) + 68
CUT_M = F("end", 1)                          # v3: "by the END of the month" = time passes: a calendar drops over the frame, its days flip, and under it the film jumps to the lever frame
PARK = CUT_M                                  # trolley back home, hidden under the calendar
T0, T1 = [-9, 4.4, 0.12], [-3, 4.4, 0.12]
ev("trolley", 0, 1, HOME, HOME, "home mark from frame 0")
ev("trolley", TP, TP + 1, HOME, T0, "'Every' +4 f (hidden: camera in the whip up the line)")
linear("trolley", RIDE0, RIDE1, T0, T1, "'pushes' +3 f, 68 f ride")
ev("trolley", PARK, PARK + 1, T1, HOME, "ride end +14 f (hidden: out of frame)")
# levers and signal arm
ev("lever5", 22, 36, 0, 1, "opening: Jack's weight tips lever 5")
ev("signal_arm", 36, 56, 0, 1, "opening +18 f")
ev("lever5", TP, TP + 1, 1, 0, "reset, hidden at 'Every'"); ev("signal_arm", TP, TP + 1, 1, 0, "reset, hidden at 'Every'")
# (v2: thrown by pull() in the acts) ev("lever3", F("pulling", 1, -2), F("pulling", 1, 6), 0, 1, "'pulling'")
# (v2: thrown by pull() in the acts) ev("lever4", F("levers", 2, -2), F("levers", 2, 6), 0, 1, "'levers' (2nd)")
ev("signal_arm", F("levers", 2, 4), F("levers", 2, 20), 0, 1, "'levers' (2nd) +4 f")
# (v2: thrown by pull() in the acts) ev("lever1", F("baboon", 2, -3), F("baboon", 2, 5), 0, 1, "'baboon' (2nd)")
# (v2: thrown by pull() in the acts) ev("lever2", F("lever", 1, -7), F("lever", 1, 1), 0, 1, "'lever'")
ev("signal_arm", F("lever", 1, 0), F("lever", 1, 14), 1, 0, "'lever'")
for o in ("lever1",): ev(o, CUT_IN, CUT_IN + 1, 1, 0, "reset at the cut into the office (loop: frame 0 state)")
# trains
ev("train", F("train", 2, -34), F("toots", 1, 4), -70, CAB1, "'train' (2nd) -34 f .. 'toots' +4 f: arrives, cab stops at x=%.1f" % CAB1)
ev("train", F("driver", 1, 16), F("lady", 1, -8), CAB1, CAB2, "'driver' +16 f .. 'lady' -8 f: pulls forward, carriage window stops behind Jack")
ev("train", F("inspector", 1, 6), F("inspector", 1, 60), CAB2, 95, "'inspector' +6 f: leaves east")
ev("train", F("train", 4, -12), F("train", 4, 40), -60, 95, "'train' (4th) -12 f: pass 1 of 'train after train'")
ev("train", F("mixes", 1, -6), F("mixes", 1, 40), -60, 95, "'mixes' -6 f: pass 1b, 'train after train'")
ev("train", F("two", 1, -14), F("two", 1, 46), -60, 95, "'Two' -14 f: pass 2")
ev("train", F("four", 1, -14), F("four", 1, 46), -60, 95, "'four' -14 f: pass 3")
ev("train", F("look", 1, -4), F("checking", 1, -6), -45, 95, "'look' -4 f .. 'checking' -6 f: the last train, the camera leaves with it")
ev("train", F("see", 1, 8), F("whistled", 1, 22), -70, -16, "'see' +8 f .. 'whistled' +22 f: a train comes up the main line and stops before the points")
ev("train", CUT_IN, CUT_IN + 1, -16, -70, "reset at the cut into the office")
ev("stamp_dummy", 0, 0, 0, 0, "") if False else None
OFFICE_EV = [dict(f0=F("letter", 1, -8), f1=F("letter", 1, 4), obj="stamp", **{"from": 0, "to": 1})]
note("stamp 0 -> 1 (office)", "%d-%d" % (F("letter", 1, -8), F("letter", 1, 4)), "'letter' -8 f, hits on the word")

# ---------------------------------------------------------------- acts
A = []
SEAT = 0.42                                                    # the signalman SITS in his trolley: seated body, raised to the trolley floor
def act(who, at, **k):
    if who == "wide":
        if "pose" in k: k["pose"] = "sit" if k["pose"] == "stand" else "sit+" + k["pose"]
        if "pos" in k: k["pos"] = [k["pos"][0], k["pos"][1], k["pos"][2] + SEAT]
    A.append(dict(who=who, at=at, **k))
def hop(who, at, pos, s=0.4, **k): act(who, at, pos=pos, move_s=s, **k)
def go(who, at, pos, frames, **k):
    if who == "wide": RIDES.append((at, pos, frames)); return                       # he rides seated: no walk cycle (see ride() below)
    act(who, at, pos=pos, walk=True, move_s=frames / 30.0, **k)
RIDES = []
def _go_orig(who, at, pos, frames, **k): act(who, at, pos=pos, walk=True, move_s=frames / 30.0, **k)      # steady pace over exactly `frames` (cast walk_speed is set very high)
def jump(who, at, pos, **k): act(who, at, pos=pos, move_s=1 / 30.0, **k)                               # one-frame move, only used out of frame

# ================= ACTING v2 (CB 2026-11-10, motion sample B) =================
# Rules: frame 0 = the hero mid-action; per narration beat ONE action or ONE feeling; a standard face that changes rarely and eases
# (kit faces "k:..."), a drawn meme face only at the peak of a scene; nobody slides (every move on screen is a walk or a run with
# a step cycle); characters turn to what they look at ("look": the plan picks front / 3/4 / side / back from the camera angle).
def FR(at): return at if isinstance(at, int) else F(at[0], at[1], at[2] if len(at) > 2 else 0)
def run(who, arrive, pos, frames, **k):                                  # walks or scampers with a step cycle and ARRIVES on the anchor
    act(who, FR(arrive) - frames, pos=pos, walk=True, move_s=frames / 30.0, **k)
LX = [-1.4, -1.0, -0.6, -0.2, 0.2]                                       # the five levers (sets/junction.js)
def knob(i, v=0.0): a = math.radians(-8 + 28 * v); return [LX[i], 0.9 - math.sin(a) * 1.15, 0.1 + math.cos(a) * 1.15]      # knob of lever i, v = 0 rest .. 1 pulled
HR_J = 0.85 / 1.8 / 2
def spot(i, cam, d, v=0.0):
    """Ground point under Jack when he hangs on lever i for a lens at `cam` (v3, CB: a body cannot be inside a lever): he hangs BESIDE the rod,
    on screen side d (+1 = he is left of the knob, hands on his right), a little on the lens side. The plan's "cling" puts his hands on the knob."""
    K = knob(i, v); wx, wy = cam[0] - K[0], cam[1] - K[1]; L = math.hypot(wx, wy); wx /= L; wy /= L; rx, ry = -wy, wx
    return [round(K[0] + wx * 0.15 - rx * 1.7 * HR_J * d, 3), round(K[1] + wy * 0.15 - ry * 1.7 * HR_J * d, 3), 0]
def pull(i, on, cam, d, hold=26, face=None, stand=True):
    """Jack's one way to throw a lever: too small to pull it, he jumps up, grabs the knob beside his head and his weight tips it toward him."""
    on = FR(on); S0, S1 = spot(i, cam, d, 0), spot(i, cam, d, 1); L = "lever%d" % (i + 1)
    act("jack", on - 8, pos=[S0[0], S0[1], 0.35], move_s=5 / 30.0, pose="hang_s0", view="front", dir=d, look=None, cling=L, **({"face": face} if face else {}))
    act("jack", on, pos=[S1[0], S1[1], 0.3], move_s=12 / 30.0)
    act("jack", on + 5, pose="hang_s1"); act("jack", on + 15, pose="hang_s0")                 # his legs swing once as the lever goes over
    ev(L, on, on + 12, 0, 1, "Jack hangs on lever %d" % (i + 1))
    act("jack", on + hold, pos=S1, move_s=5 / 30.0, pose="crouch", cling=None, **({"face": "standard"} if face else {}))
    if stand: act("jack", on + hold + 12, pose="stand")
    return S1
CAM_E = [1.5, -1.0, 0.3]        # low hero lens for lever 5 (east end of the frame): Jack hangs on the picture's left of the knob
CAM_W = [-3.0, -0.5, 0.3]       # low hero lens for lever 1 (west end): Jack hangs on the picture's right of the knob
CAM_L = [1.85, -1.0, 0.35]        # lever 5 with the lady's carriage window behind
S5, S5b = spot(4, CAM_E, 1), spot(4, CAM_E, 1, 1)
S1w = spot(0, CAM_W, -1)
S5l = spot(4, CAM_L, 1)

# ---- JACK
act("jack", 0, pos=[S5[0], S5[1], 0.35], view="front", dir=1, pose="hang_s0", face="k:angry", cling="lever5")       # L1a ONE action: frame 0 = he hangs on lever 5 (beside it, hands on the knob), his weight tips it, he lands
act("jack", 10, pose="hang_s1"); act("jack", 20, pose="hang_s0")
act("jack", 22, pos=[S5b[0], S5b[1], 0.3], move_s=14 / 30.0)
act("jack", 40, pos=S5b, move_s=5 / 30.0, pose="crouch", cling=None)
act("jack", 52, pose="stand", face="standard")
go("jack", 70, MARK, 22)
act("jack", ["never", 1, -4], pose="shrug", face="k:smirk")                        # L1b ONE feeling: a slow shrug, held
act("jack", ["his", 1, -6], pose="stand", face="standard")
run("jack", ["baboon", 1], BUY, 28, look="wide")                                    # L3a he walks up to the trolley and looks up at the man
act("jack", ["calls", 1], pose="hands_hips", face="k:happy")                       # L3b ONE feeling: proud of his new name
jump("jack", TP - 1, [-9.75, 3.5, 0.12], pose="stand", face="standard", look=None)
act("jack", RIDE0 - 1, pos=[-3.75, 3.5, 0.12], walk=True, move_s=(RIDE1 - RIDE0) / 30.0, walk_pose="push")   # L4 ONE action: he pushes the trolley
jump("jack", CUT_M - 1, [-2.5, 0.75, 0], walk_pose=None)                             # hidden under the calendar
run("jack", ["jack", 3, 2], S1w, 24)                                                # L5 ONE action: he throws lever 1 the only way he can
pull(0, ["pulling", 1, 2], CAM_W, -1)
run("jack", ["grabs", 1], KEYS, 20, look=[1.25, 1.0, 0])                            # L6b he runs to the key board,
act("jack", ["grabs", 1], pose="reach_up")
act("jack", ["key", 1], pose="hold_up", prop="key", hand="L")                      # takes the right key,
run("jack", ["to", 2], UNDERCAB, 20, look=[CAB1, 4.0, 1.0])                         # and carries it to the engine: seen from behind, key held up
act("jack", ["driver", 1, 10], pose="stand", prop=None, hand=None)
jump("jack", F("then", 1, -4), [0.95, 0.2, 0], look=None)                               # hidden under the steam: he is back in front of the frame (never through the lever row)
run("jack", ["window", 1, -2], S5l, 26, look=None)                                  # L7 back to work while the lady watches: lever 5
pull(4, ["baboon", 2], CAM_L, 1)
ev("lever1", F("then", 1, -4), F("then", 1, -3), 1, 0, "reset, hidden under the steam transition"); ev("lever5", F("loud", 1), F("loud", 1) + 1, 1, 0, "reset, hidden: the camera is up at the carriage window")
run("jack", F("loud", 1, 16), [-0.25, 0.15, 0], 14, look=None)                         # hidden (camera on the lady): back to the middle of his frame
act("jack", ["shows", 1, 6], look="inspector")                                      # L9 he looks up at the stranger,
act("jack", ["looks", 2], pose="cool")                                              # weight on one leg: not impressed
act("jack", ["you've", 1, -4], look=None)
run("jack", ["sends", 1, 6], S1w, 20)                                                # L12 he goes back to his lever while the trains start
act("jack", ["sends", 1, 8], pose="stand"); act("jack", ["whistles", 1], pose="tiltR")      # he cocks his head to the whistles: he works by ear
pull(0, ["throws", 1, 4], CAM_W, -1, hold=20, stand=False)                                     # L13a "throws the lever"
run("jack", F("right", 2, -2), KEYS, 22, look=[1.25, 1.0, 0], pose="reach_up")      # L13b "the right key"
act("jack", ["key", 2], pose="hold_up", prop="key", hand="L", look=None)
act("jack", ["doesn't", 1], face="k:smug")                                          # L13c ONE feeling: he does not even look up
run("jack", ["train", 6, 6], MARK, 16, pose="stand", prop=None, hand=None, face="standard", look=None)   # L14 back to his mark as the last train goes
act("jack", ["driver", 2], pose="tiltL"); act("jack", ["track", 1], pose="stand"); act("jack", ["knock", 1], pose="tiltL"); act("jack", ["jack", 6, -6], pose="stand")   # he listens while the film explains (small moves, he is mostly off screen)
act("jack", ["learned", 1], pose="tiltR")                                           # L17 ONE feeling: he listens, head cocked
act("jack", ["listening", 1], face="k:happy")                                         # the one drawn meme face of his film, at its peak
act("jack", CUT_IN, visible=False); jump("jack", CUT_IN + 2, BUY, face="standard", pose="stand", look="wide")
act("jack", CUT_OUT, visible=True)
act("jack", ["hired", 1], face="k:happy")                                           # L19 hired
act("jack", ["cents", 1], pose="hold_out", prop="coin", hand="R")
act("jack", ["bottle", 1], pose="hold_up", prop="bottle", hand="L")
run("jack", ["job", 1, 8], [S5[0], S5[1] - 0.4, 0], 22, pose="stand", prop=None, hand=None, face="standard", look=None)    # L20 back to lever 5: the loop
act("jack", ["single", 3, -8], pose="crouch")                                       # winds up,
act("jack", ["single", 3, 2], pos=[S5[0], S5[1], 0.35], move_s=5 / 30.0, pose="hang_s0", view="front", dir=1, face="k:angry", cling="lever5")   # and jumps onto the knob = frame 0

# ---- THE SIGNALMAN ("wide"): calm; he sits in his trolley all film
act("wide", 0, pos=HOME, view="front", dir=1, pose="stand", face="standard")
act("wide", ["lost", 1, -2], pose="tiltL", face="k:sad")                            # L2a ONE feeling: he looks down
act("wide", ["can't", 1], pose="reach_up", look=[0.6, -1.4, 1.0])                   # L2b ONE action: he reaches for his levers and cannot
act("wide", ["so", 2], pose="stand", face="standard", look=None)
act("wide", ["buys", 1], pose="hold_out", prop="coin", hand="R", look="jack")       # L3a ONE action: the coin
act("wide", ["calls", 1], pose="stand", prop=None, hand=None, face="k:happy")       # L3b ONE feeling
jump("wide", TP - 1, [-9, 4.4, 0.29], pose="point_out", dir=1, look=[30, 4.4, 0], look_full=True)      # L4 he rides and points the way to work
act("wide", RIDE0 - 1, pos=[-3, 4.4, 0.29], move_s=(RIDE1 - RIDE0) / 30.0, linear=True)   # one steady seated ride, frame for frame with the trolley (film_plan "linear")
jump("wide", PARK - 1, HOME, pose="stand", face="standard", look=None, look_full=False)
act("wide", ["shows", 1], look="inspector")                                         # L9 he watches the stranger
act("wide", ["signalman", 2], pose="hands_hips")
act("wide", ["smiles", 1], face="k:smirk", pose="stand")                            # L11a ONE feeling: he just smiles
act("wide", ["send", 1], pose="finger_up", say=[153, 154])                          # L11b "Send one."
act("wide", ["so", 5], pose="stand", face="standard", look=None)
act("wide", ["knock", 1, -3], pose="knock", dir=-1, face="k:smirk")                 # L16 ONE action: mom's knock
act("wide", ["jack", 6], pose="stand", face="standard")
act("wide", CUT_IN, visible=False); act("wide", CUT_IN + 2, pose="hold_up", prop="letter", hand="R", face="k:happy")   # L19 the letter
act("wide", CUT_OUT, visible=True)
act("wide", ["job", 1], pose="stand", prop=None, hand=None, face="standard")

# ---- THE INSPECTOR (cast:railway): the mocker. Calm kit faces; his one drawn meme face is the laugh on "trains?"
E0 = F("inspector", 1, -52)
act("inspector", E0, enter=True, pos=[4.8, -0.6, 0], view="front", dir=1, pose="stand", face="k:annoyed")
go("inspector", E0 + 1, I0, 46)                                                     # L9a he walks in
act("inspector", ["shows", 1, 4], pose="hands_hips")
act("inspector", ["looks", 2], pose="bend_down", look="jack", face="k:skeptical")     # L9b he bends down to the baboon
run("inspector", ["signalman", 2, -3], I1, 12, pose="hands_hips", look="wide")      # L9c turns to the signalman
act("inspector", ["you've", 1, -5], pose="lean_in", say=[140, 146])                 # L10 leans into his face with the question
act("inspector", ["trains", 1, 10], face="laugh", punch=True, punch_s=0.5)
RET = int(round(W[147]["s"] * 30)) + 2                                              # "The" (signalman just smiles)
act("inspector", RET, pose="stand", face="k:smug")
act("inspector", ["inspector", 2], pose="finger_up", look=None)                     # L12a he orders train after train
act("inspector", ["mixes", 1], pose="hands_hips", face="k:evil")                    # L12b ONE feeling: scheming
X0 = F("him", 3, 0) if K.count("him") >= 3 else F("trick", 1, 6)
go("inspector", X0, [6.5, -0.9, 0], 50, pose="stand")
act("inspector", X0 + 54, visible=False)
jump("inspector", F("look", 1, 0), BOARD, pose="hold_watch", prop="notebook", hand="L", face="standard")
act("inspector", F("look", 1, 6), visible=True)
act("inspector", ["checking", 1], pose="press_watch", face="k:nervous")             # L14 ONE action: he is the one checking his notes
act("inspector", F("track", 1, 0), visible=False)
jump("inspector", CUT_IN - 3, OFFICE, pose="stand", prop=None, hand=None, face="k:sad")
act("inspector", CUT_IN, visible=True)
act("inspector", ["writes", 2, -4], pose="write", dir=1)                            # L18 ONE action: he writes the letter
act("inspector", CUT_OUT, visible=False)

# ---- THE LADY (carriage 1, middle window)
L0 = F("lady", 1, -7)
act("lady", L0, enter=True, pos=[CAB2 - 7.4, 4.0, 1.15], view="front", dir=1, pose="stand", face="standard")
act("lady", ["sees", 1], face="omg", pose="hand_mouth")                             # L7 ONE feeling: she sees him
act("lady", ["screams", 1], face="scream", pose="flinch", punch=True, punch_s=0.6)  # L8a the peak: the scream
act("lady", ["writes", 1], face="offended", pose="write")                           # L8b ONE action: she writes
act("lady", F("inspector", 1, -4), visible=False)

# ---- THE DRIVER (cab window)
D0 = F("toots", 1, 5)
act("driver", D0, enter=True, pos=[CAB1, 4.0, 1.0], view="front", dir=1, pose="reach_up", face="standard")   # L6a he pulls the whistle cord
act("driver", ["jack", 4], pose="stand")
act("driver", ["driver", 1, 10], pose="hold_up", prop="key", hand="R", face="k:surprised")                  # he has the key: from a baboon
act("driver", F("driver", 1, 15), visible=False)
jump("driver", F("see", 1, 0), [-16, 4.0, 1.0], face="standard", pose="reach_up", prop=None, hand=None)
act("driver", F("whistled", 1, 22), visible=True)
act("driver", ["times", 1], face="k:happy")
act("driver", CUT_IN, visible=False)
A = [a for a in A if a]

# ---------------------------------------------------------------- camera
def st(at, pos, aim, subject, framing, shows=(), word=None, **k):
    d = dict(at=at, pos=pos, aim=aim, lens=k.pop("lens", 24), subject=subject, framing=framing, shows=list(shows)); k.setdefault("hold", 0.5)
    if word: d["word"] = word
    d.update(k); return d
J = [
 st(0, [2.2, -2.6, 2.4], [0.05, 0.7, 0.75], "jack", "W", ["levers", "signal"], hold=0.1),      # crane: starts high but far back (about 30 degrees), so the card is never seen steeply from above
 st(34, CAM_E, [0.02, 0.6, 0.85], "jack", "W", ["levers", "signal"], hold=1.2, creep=0.003),       # low hero angle: Jack hangs beside lever 5, the signal mast stands over him
 st(["never", 1], [-0.25, -0.78, 0.55], [-0.6, 0.35, 0.56], "jack", "M", ["levers"], word="never"),
 st(["owner", 1], [2.7, -2.1, 0.6], [2.3, 0.2, 1.05], "wide", "W", ["trolley"], word="owner", hold=0.6),
 st(["reach", 1], [3.0, -1.0, 1.05], [1.9, 0.35, 1.3], "wide", "M", ["levers"], word="reach"),
 st(["baboon", 1], [2.0, -2.2, 0.5], [1.62, -0.1, 0.72], "jack", "W", ["wide", "coin", "trolley"], word="baboon"),
 st(["jack", 1], [2.3, -1.55, 0.6], [1.5, -0.7, 0.54], "jack", "M", [], word="Jack", hold=0.6),
 st(["pushes", 1], [-7.0, 3.5, 0.45], [-9.35, 4.1, 0.9], "wide", "W", ["jack", "trolley", "rails"], word="pushes", follow="wide", hold=0.5),
 st(["pulling", 1], CAM_W, [-1.2, 0.42, 0.85], "jack", "W", ["levers", "signal"], word="pulling", creep=0.003),       # from the west end of the lever row: the tilt of lever 1 reads in profile, the other four stand in a row behind
 st(["toots", 1], [0.45, -0.9, 1.4], [0.0, 3.3, 2.3], "driver", "P", ["train"], word="toots"),
 st(["key", 1], [0.05, -0.45, 0.6], [0.8, 0.7, 0.58], "jack", "M", ["key", "keys"], word="key", hold=0.5),
 st(["driver", 1], [0.55, -0.7, 1.1], [0.35, 3.0, 1.75], "driver", "W", ["jack", "key", "train"], word="driver", lens=32),
 st(["lady", 1], [1.2, -1.5, 0.5], [-0.05, 1.6, 0.95], "jack", "W", ["lady", "window", "levers"], word="lady", creep=0.003),
 st(["baboon", 2], CAM_L, [-0.3, 0.8, 1.0], "jack", "W", ["lady", "window", "levers"], word="baboon", creep=0.003),
 st(["screams", 1], [-0.8, 1.5, 2.0], [-0.6, 4.0, 2.6], "lady", "M", ["window"], word="screams", lead=3, hold=0.6, travel=0.6),
 st(["carriage", 1], [-2.3, -0.5, 1.7], [-0.9, 3.3, 2.35], "lady", "P", ["window", "carriage", "letters"], word="carriage"),
 st(["inspector", 1], [-1.75, -0.5, 0.3], [0.27, 0.36, 0.87], "inspector", "W", ["jack", "wide"], word="inspector"),
 st(["baboon", 3], [-0.75, -1.25, 0.6], [0.12, 0.38, 0.8], "inspector", "M", ["jack"], word="baboon", travel=0.9),      # v2: he bends down to the baboon, the camera drops with him
 st(["signalman", 2], [0.3, -1.6, 0.9], [1.8, 0.15, 1.5], "inspector", "M", ["wide"], word="signalman", travel=0.6),
 st(["monkey", 1], [0.6, -1.5, 0.55], [1.15, -0.55, 0.64], "inspector", "C", ["wide"], word="monkey"),
 st(["smiles", 1], [3.35, -1.2, 1.0], [2.25, 0.2, 1.5], "wide", "M", ["inspector"], word="smiles"),
 st(["inspector", 2], [2.7, -2.1, 1.4], [0.0, 1.3, 0.9], "inspector", "W", ["jack", "train"], word="inspector", travel=0.95, creep=0.003),      # v3: from the south-east, so the trains are SEEN streaking past behind the inspector and the lever row
 st(["trick", 1], [-3.5, -0.85, 0.4], [-1.2, 0.6, 0.72], "jack", "W", ["levers", "train"], word="trick", creep=0.003),       # from the west: the trains thunder past close on the left, going away
 st(["lever", 1], CAM_W, [-1.2, 0.42, 0.85], "jack", "M", ["lever", "levers", "train"], word="lever", creep=0.003),
 st(["key", 2], [0.05, -0.45, 0.6], [0.8, 0.7, 0.58], "jack", "M", ["key", "keys", "train"], word="key"),
 st(["inspector", 3], [14.45, -1.6, 0.4], [13.2, 0.3, 1.2], "inspector", "W", ["notebook", "train"], word="inspector", via=[[7.0, -1.3, 0.9]], travel=1.7),
 st(["see", 1], [15.3, -2.3, 3.6], [5.5, 5.2, 1.6], "inspector", "P", ["train", "junction"], word="see", lead=2, travel=1.0, drift=[0.3, 0.5, 0.25], drift_aim=1),
 st(["track", 1], [0.8, 3.6, 3.2], [-6.0, 4.6, 0.4], "train", "P", ["points", "tracks"], word="track", via=[[6.5, 1.2, 3.8]], drift=[-0.1, -0.7, 0.0], drift_aim=1),
 st(["knock", 1], [3.5, -1.3, 0.9], [2.2, 0.3, 1.3], "wide", "M", ["hut"], word="knock"),
 st(["jack", 6], [0.5, -0.65, 0.45], [-0.6, 0.35, 0.54], "jack", "W", ["levers"], word="Jack"),
 st(["listening", 1], [-0.3, -0.6, 0.6], [-0.6, 0.35, 0.56], "jack", "C", [], word="listening"),
]
O = [
 st(["inspector", 4], [-0.35, -1.45, 0.85], [-0.7, 0.55, 1.4], "inspector", "W", ["desk"], word="inspector"),
 st(["writes", 2], [-1.5, -0.8, 1.3], [-0.3, 0.7, 1.2], "inspector", "M", ["letter", "stamp"], word="writes"),
 st(["sent", 1], [0.02, 0.35, 1.12], [0.15, 0.75, 0.77], "letter", "O", ["letter"], word="sent", lens=35, creep=0.008),
]
Z = [
 st(CUT_OUT, [1.96, -0.3, 1.27], [1.93, 0.2, 1.3], "letter", "O", ["letter", "wide"], hold=0.0),   # on the letter in his raised hand (he sits now, so it is higher and further left than in v1)
 st(["cents", 1], [2.0, -2.2, 0.5], [1.62, -0.1, 0.72], "jack", "W", ["wide", "letter", "coin"], word="cents", travel=0.8),
 st(["beer", 1], [2.3, -1.55, 0.6], [1.5, -0.7, 0.54], "jack", "M", ["bottle"], word="beer"),
 st(["never", 2], [0, 0, 0], [0, 0, 0], "jack", "W", ["levers", "signal"], word="never", loop=True, travel=1.3, travel_roll=4),
]

# ---- storyboard-judge pass 1 (2026-11-10): station overrides by index
def fx(L, i, pos=None, aim=None, **k):
    if pos: L[i]["pos"] = pos
    if aim: L[i]["aim"] = aim
    L[i].update(k)
fx(J, 19, [0.45, -1.55, 0.5], [1.2, -0.5, 0.95])
fx(J, 20, [3.0, -1.1, 1.4], [2.45, 0.2, 1.5])
fx(J, 25, [14.1, -0.9, 0.5], [13.2, 0.3, 1.3])
fx(J, 28, [3.4, -1.2, 1.35], [2.25, 0.3, 1.5])
fx(J, 20, aim=[2.3, 0.2, 1.45]); fx(J, 4, aim=[2.12, 0.3, 1.3])      # v2: Jack hangs on lever 3, a little left of his old mark
fx(O, 0, [-0.2, -1.0, 1.0], [-0.7, 0.55, 1.35])
fx(O, 2, creep=0.008, travel=1.5)      # v3: a slow push in to the contract (CB)
# (v3: station 8 now comes in from the west) fx(J, 8, via=[[-3.3, 0.9, 0.8], [-2.7, -0.4, 0.6]])      # round the west end of the lever frame, not through it (film_check picture jumps at 16 s)
fx(J, 28, via=[[0.5, 0.7, 2.3]])                          # west of the hut, not through its roof (jump at 60 s)
# ---- HIGHLIGHTS (v3, CB 2026-11-10: "what about highlight vfx, I didn't see anything"). Like Rick: the thing the line talks about lights up
# in a saturated glowing colour for about a second (his rail runs purple, magenta, pink, yellow, white). The object itself is tinted and glows.
RICK = ["#8e3bff", "#ff3bd4", "#ff7ab8", "#ffe14a", "#ffffff"]; GOLD = ["#ffb300", "#ffe14a", "#fff6c2"]; COLD = ["#3b82f6", "#9ad0ff"]
RAILS = "/^rail(_head)?(_\\d+)?$/"; KEYSET = "/^key_(ring|shaft|bit)/"
HL = []
def hl(at, on, color, s=1.2, **k): HL.append(dict(at=at, on=on, color=color, s=s, **k))
hl(2, "lever5", RICK, 1.4)                                                             # frame 0: the lever he hangs on
hl(36, "signal_arm", ["#ff3b30", "#ffe14a"], 1.0)                                      # and the signal it throws
hl(["rails", 1, -8], RAILS, RICK, 1.7, glow=False)                                     # "along the rails": the rails run through Rick's colours
hl(["pulling", 1, 2], "lever1", RICK, 1.4)
hl(["right", 1], KEYSET, GOLD, 1.4, glow_on="keys", size=0.8, bloom=0.4)                 # "the right key"
hl(["window", 1, -4], "/^carriage_window_trim/", COLD, 1.3, glow=False)
hl(["baboon", 2], "lever5", RICK, 1.4)
hl(["send", 1], "signal_arm", ["#3bff7a", "#ffffff"], 1.2)                             # "Send one."
hl(["train", 4, -4], RAILS, RICK, 1.9, glow=False)                                     # "train after train"
hl(["throws", 1, 4], "lever1", RICK, 1.3)
hl(["right", 2], KEYSET, GOLD, 1.4, glow_on="keys", size=0.8, bloom=0.4)
hl(["checking", 1], "inspector", ["#9a4bff", "#b04bff", "#e0405a"], 2.0, card=0.8)             # like Rick's purple face: only his face goes purple, then red, with steam from the ears
hl(["whistled", 1], RAILS, ["#8e3bff", "#ff3bd4"], 1.6, glow=False)                    # one whistle = the main line,
hl(["every", 3], "/^branch_rail/", ["#ffe14a", "#ffffff"], 1.6, glow=False)                 # another = the branch
hl(["letter", 1, 2], "letter", GOLD, 1.6, size=0.4, bloom=0.35)                         # the strangest letter
hl(["hired", 1], [], GOLD, 1.2, pos=[1.93, 0.2, 1.3], flare=True, size=1.2)            # the same letter in the signalman's hand: a glint of light
hl(["cents", 1], [], GOLD, 1.0, glow_on="coin", flare=True)
hl(["beer", 1, -6], [], ["#ffb300", "#fff6c2"], 1.1, pos=[1.7, -0.51, 0.72], flare=True)
hl(["single", 3, 4], "lever5", RICK, 1.0)                                              # the loop: back onto lever 5
RIGS = [
 dict(beat=["toots", 1], action="train arrives and stops (seen)", subject_path="object_path of the train mover, cab -70 -> %.1f on the main line" % CAB1,
      recipe="catch from the lever frame: the camera rises from Jack's eye height and tilts up as the engine slides in behind the levers; whistle steam on the word; no kick (it stops, it does not hit)"),
 dict(beat=["train", 4], action="pass 1 of 'train after train' (seen, going away east)", subject_path="object_path of the train, -60 -> 95",
      recipe="the camera holds the three-shot low beside Jack; the train enters over the left shoulder 5 m away and recedes up the frame (follow-away, no pan); kick 7 f amp 1.2 on 'train'; motion blur on the train only"),
 dict(beat=["two", 1], action="pass 2 behind Jack (seen)", subject_path="object_path of the train, -60 -> 95",
      recipe="static medium on Jack and his lever; the train fills the top of the frame behind him for about 12 f; kick amp 1.5 on 'toots'; flash of whistle steam; Jack does not react"),
 dict(beat=["four", 1], action="pass 3 behind Jack (seen)", subject_path="object_path of the train, -60 -> 95",
      recipe="static medium on Jack and the key; same as pass 2, kick on 'toots'; the slow creep toward Jack's face keeps going through the pass: the camera does not look up"),
 dict(beat=["last", 1], action="the last train; the camera leaves its post", subject_path="object_path of the train, -45 -> 95",
      recipe="chase: the camera lets the engine overtake at Jack's shoulder, then runs east beside the wheels 1 m up for 14 m (the travel into 'checking', 2.3 s), carriages streaming past on the left; catch: it slows to a stop on the boardwalk and turns back to find the inspector; kick amp 2.5 on 'up' as the engine passes the lens"),
 dict(beat=["driver", 2], action="a train comes up the main line and stops before the points (seen from above)", subject_path="object_path of the train, -70 -> -16",
      recipe="crane: the camera is already high over the boardwalk (rise on 'see'); it holds while the train comes toward it, 2 whistle puffs on 'whistled' and on 'times'; then a forward glide to the high view of both tracks on 'track'"),
 dict(beat=["train", 1], action="'lost both his legs under a train' (heard, not seen)", subject_path="point: the signalman in his trolley",
      recipe="kick 7 f amp 1.5 and a red flash <= 2 f on 'train'; no train moves"),
]
film = {
 "title": "The Signalman Who Was a Baboon",
 "fps": 30, "size": [1080, 1920], "words": "voice/words.json",
 "tween": {"frames": 7, "ease": "out", "walk_frames": 8, "face_frames": 8},      # pose changes are in-betweened (CB 2026-11-10: no robotic snaps)
 "caption_scale": 0.5,
 "auto_view": True,                # walkers face where they walk; "look" picks the drawn view from the camera angle              # CB 2026-11-10: captions 50 % smaller
 "puppet_pkg": ["cast", "../../templates/vector2d_characters/code"],
 "camera_idea": {
  "name": "He never looks up",
  "why": "Jack runs the junction by ear and never lifts his eyes, so the camera does the looking for him: it lives at the baboon's eye height at his levers, and every time something arrives above him (the cab, the lady's window, the tall inspector) it looks up and comes back down to the same calm face.",
  "signature": "On 'he doesn't even look up' the camera, for once, does not look up either: it stays on Jack while the train shakes the frame; then it leaves its post for the only time, runs down the line with the last train to the inspector and his notes, and on 'You see' rises over the whole junction before it sinks back to Jack's ear."
 },
 "cast": {
  "jack": {"puppet": "cast:jack", "height": 0.85, "heads_tall": 1.8, "walk_speed": 99},
  "wide": {"puppet": "stationmaster", "height": 1.75, "heads_tall": 2.9, "walk_speed": 99},
  "inspector": {"puppet": "cast:railway", "height": 1.95, "heads_tall": 4.0, "walk_speed": 99},
  "lady": {"puppet": "form:lady", "height": 1.6, "heads_tall": 2.8},
  "driver": {"puppet": "form:dad", "height": 1.7, "heads_tall": 3.0}
 },
 "places": {
  "junction": {"set": "junction", "light": "day", "backdrop": 12, "events": sorted(EV, key=lambda e: e["f0"])},
  "office": {"set": "office", "light": "interior", "backdrop": 5, "events": OFFICE_EV}
 },
 "props": {
  "key": {"held_by": "jack"}, "coin": {"held_by": "jack"}, "bottle": {"held_by": "jack"},
  "letter_held": {"held_by": "wide"}, "notebook": {"held_by": "inspector"},
  "letters": {"pos": [-1.4, 3.2, 1.2], "h": 1.3, "kind": "paper letters fluttering out of the carriage windows (fx)"},
  "carriage": {"pos": [-0.6, 3.3, 0], "h": 2.0, "kind": "carriage 1 of the train mover (set)"},
  "tracks": {"pos": [-5, 4.4, 0], "h": 0.3, "kind": "main line and branch at the points (set)"}
 },
 "takes": [
  {"id": "t1", "place": "junction", "stations": J[:8], "rigs": RIGS},
  {"id": "t1b", "place": "junction", "stations": [st(CUT_M, [-4.0, -0.95, 0.6], [-1.3, 0.5, 0.75], "jack", "W", ["levers", "signal"], hold=0.3)] + J[8:],
   "cut_in": "hidden: time passes. A wall calendar drops over the frame on 'by the end of the month', its days flip to 30, the last page tears away on the lever frame"},
  {"id": "t2", "place": "office", "stations": O, "cut_in": "hidden: whistle steam whites out the frame for 4 f on each side of the cut (the inspector leaves by train)"},
  {"id": "t3", "place": "junction", "stations": Z, "cut_in": "hidden: through the story object. The office take ends pushed into the cream letter on the desk; this take starts on the same letter in the signalman's hand and pulls back"}
 ],
 "kicks": [
  {"at": ["train", 1], "amp": 1.5}, {"at": ["screams", 1], "amp": 2.0}, {"at": ["train", 4, 8], "amp": 1.2},
  {"at": ["toots", 2], "amp": 1.5}, {"at": ["toots", 3], "amp": 1.5}, {"at": ["up", 4], "amp": 2.5}, {"at": ["letter", 1], "amp": 1.5}
 ],
 "solids": [dict(name="lever%d" % (i + 1), place="junction", pivot=[LX[i], 0.9, 0.1], len=1.15, lean_deg=[-8, 20], obj="lever%d" % (i + 1), r=0.04) for i in range(5)]
           + [dict(name="lamp_post", place="junction", seg=[[0.78, 1.75, 0], [0.78, 1.75, 2.4]], r=0.05), dict(name="key_board_post", place="junction", seg=[[1.25, 1.1, 0], [1.25, 1.1, 1.0]], r=0.05)],
 "transitions": [                  # CB 2026-11-10: transitions through a form or an object, like Rick's (drawn in the animatic; the look pass keeps timing and place)
  {"at": TP, "kind": "wheel", "from": "trolley", "to": "trolley", "frames": 18},      # "Every morning": into the trolley wheel at the hut, out of it on the line
  {"at": CUT_M, "kind": "calendar", "frames": 30, "days": 30},                         # "by the end of the month": a calendar page drops, the days flip, the page tears away
  {"at": F("then", 1, -4), "kind": "steam", "frames": 16},                             # "Then one day": the engine's steam wipes the day away as it pulls forward
  {"at": CUT_IN, "kind": "steam", "frames": 14},
  {"at": CUT_OUT, "kind": "match", "from": "letter", "from_size": [0.3, 0.21], "to": [1.93, 0.2, 1.3], "to_size": [0.29, 0.37], "to_rot": -8, "frames": 24},   # CB 2026-11-10: push in to the contract, then it becomes the one in his hand                                       # the cut to the office: whistle steam (the inspector leaves by train)
 ],
 "highlights": HL,
 "acts": A,
 "sentences": [],
 "fx": [
  {"at": 36, "kind": "lever_clank", "on": "lever5"},
  {"at": ["baboon", 1], "kind": "coin_glint", "pos": [1.81, 0.2, 0.91]},
  {"at": ["trolley", 1], "kind": "wheel_sparks", "on": "trolley"},
  {"at": ["pulling", 1, 10], "kind": "lever_clank", "on": "lever3"}, {"at": ["baboon", 2, 12], "kind": "lever_clank", "on": "lever4"},
  {"at": ["toots", 1], "kind": "whistle_steam", "on": "chimney", "s": 1.0},
  {"at": ["key", 1], "kind": "glint", "on": "keys"},
  {"at": ["screams", 1], "kind": "sound", "on": "window", "s": 0.9},
  {"at": ["writes", 1], "kind": "paper_letters", "on": "window"},
  {"at": ["toots", 2], "kind": "whistle_steam_x2", "on": "chimney", "s": 1.3},
  {"at": ["throws", 1, 20], "kind": "lever_clank", "on": "lever3"},
  {"at": ["toots", 3], "kind": "whistle_steam_x4", "on": "chimney", "s": 1.0},
  {"at": ["checking", 1, 8], "kind": "ear_steam_x2", "pos": [13.2, 0.3, 1.78], "s": 1.25},
  {"at": ["rails", 1], "kind": "wheel_sparks", "on": "trolley"},
  {"at": ["whistled", 1], "kind": "whistle_puffs_counted", "on": "chimney", "s": 1.6},
  {"at": ["knock", 1, -2], "kind": "sound", "on": "hut", "s": 0.5}, {"at": ["knock", 1, 5], "kind": "sound", "on": "hut", "s": 0.5}, {"at": ["knock", 1, 12], "kind": "sound", "on": "hut", "s": 0.5},
  {"at": ["listening", 1, -6], "kind": "sound", "on": "jack", "s": 1.0}, {"at": ["listening", 1, 8], "kind": "sound", "on": "jack", "s": 1.0},
  {"at": ["letter", 1], "kind": "stamp_dust_hit", "on": "letter", "size": 0.8}
 ],
 "moods": [
  {"at": ["junction", 1], "look": "warm_up"}, {"at": ["train", 1], "look": "flash_red"}, {"at": ["jack", 1], "look": "gold_spot_hero"},
  {"at": ["morning", 1], "look": "warm_morning"}, {"at": ["toots", 1], "look": "steam_white"}, {"at": ["sees", 1], "look": "cold_blue_window"},
  {"at": ["screams", 1], "look": "flash_red"}, {"at": ["inspector", 1], "look": "dark_shadow_falls"}, {"at": ["monkey", 1], "look": "dark_spot_mocker"},
  {"at": ["send", 1], "look": "warm_gold"}, {"at": ["toots", 2], "look": "steam_white"}, {"at": ["toots", 3], "look": "steam_white"},
  {"at": ["up", 4], "look": "dark_train_shadow"}, {"at": ["see", 1], "look": "gold_warm_high_sun"}, {"at": ["knock", 1], "look": "warm_home"},
  {"at": ["listening", 1], "look": "spot_hero"}, {"at": CUT_IN, "look": "steam_white"}, {"at": ["letter", 1], "look": "warm_lamp_up"},
  {"at": ["hired", 1], "look": "gold_warm"}, {"at": ["mistake", 1], "look": "warm_up"}
 ],
 "sound": [
  {"at": 36, "name": "lever_clank"}, {"at": 40, "name": "signal_arm_up"}, {"at": ["train", 1], "name": "train_pass_far"},
  {"at": ["baboon", 1], "name": "coin_ping"}, {"at": ["pushes", 1], "name": "trolley_wheels_loop"}, {"at": ["pulling", 1], "name": "lever_clank"},
  {"at": ["levers", 2], "name": "lever_clank"}, {"at": ["toots", 1], "name": "whistle_1"}, {"at": ["train", 2], "name": "train_arrive_brakes"},
  {"at": ["key", 1], "name": "key_jingle"}, {"at": ["lady", 1, -10], "name": "train_roll_stop"}, {"at": ["screams", 1], "name": "lady_scream"},
  {"at": ["writes", 1], "name": "paper_flutter"}, {"at": ["inspector", 1], "name": "boots_on_gravel"}, {"at": ["train", 4], "name": "train_pass_fast"},
  {"at": ["toots", 2], "name": "whistle_2"}, {"at": ["lever", 1], "name": "lever_clank"}, {"at": ["toots", 3], "name": "whistle_4"},
  {"at": ["key", 2], "name": "key_jingle"}, {"at": ["up", 4], "name": "train_pass_fast_close"}, {"at": ["notes", 1], "name": "pages_flip"},
  {"at": ["whistled", 1], "name": "whistle_2"}, {"at": ["times", 1], "name": "whistle_3"}, {"at": ["knock", 1], "name": "knock_3"},
  {"at": ["mailman's", 1], "name": "knock_2"}, {"at": ["listening", 1], "name": "whistle_far_soft"}, {"at": CUT_IN, "name": "whistle_steam_whoosh"},
  {"at": ["letter", 1], "name": "stamp_thump"}, {"at": ["cents", 1], "name": "coins_drop"}, {"at": ["beer", 1], "name": "bottle_clink"},
  {"at": ["single", 3], "name": "lever_creak_ready"}
 ]
}
def sen(i0, i1, subject, nouns=(), show=()):
    d = dict(text=" ".join(w["w"] for w in W[i0:i1 + 1]), words=[i0, i1], subject=subject)
    if show: d["show"] = list(show)
    if nouns: d["nouns"] = [dict(word=n[0], show=n[1], **({"n": n[2]} if len(n) > 2 else {})) for n in nouns]
    film["sentences"].append(d)
sen(0, 16, "jack", [("junction", "levers")])
sen(17, 33, "wide", [("owner", "wide"), ("levers", "levers")])
sen(34, 46, "jack", [("baboon", "jack"), ("jack", "jack")])
sen(47, 60, "wide", [("trolley", "trolley"), ("rails", "rails")], ["jack"])
sen(61, 74, "jack", [("levers", "levers", 2)])
sen(75, 92, "jack", [("train", "train", 2), ("key", "key"), ("driver", "driver")])
sen(93, 110, "lady", [("lady", "lady"), ("window", "window"), ("baboon", "jack", 2)])
sen(111, 124, "lady", [("carriage", "carriage")])
sen(125, 139, "inspector", [("inspector", "inspector"), ("baboon", "jack", 3), ("signalman", "wide", 2)])
sen(140, 146, "inspector")
sen(147, 154, "wide", [("signalman", "wide", 3)])
sen(155, 171, "inspector", [("inspector", "inspector", 2), ("train", "train", 4)])
sen(172, 187, "jack", [("lever", "lever"), ("key", "key", 2)])
sen(188, 200, "inspector", [("notes", "notebook")])
sen(201, 213, "train", [("driver", "train", 2), ("track", "tracks")])
sen(214, 225, "wide", [("knock", "hut")])
sen(226, 235, "jack", [("jack", "jack", 6)])
sen(236, 252, "inspector", [("inspector", "inspector", 4), ("letter", "letter")])
sen(253, 267, "jack", [("cents", "coin"), ("beer", "bottle")])
sen(268, 280, "jack")
json.dump(film, open(os.path.join(EP, "film.json"), "w"), indent=1)
with open(os.path.join(EP, "events_anchors.md"), "w") as f:
    f.write("# Typed frames in film.json and the word each one comes from\n\nAll frames at 30 fps, computed by `out/gen_film.py` from `voice/words.json` as it is now (last word ends at %.2f s). Stations, acts, fx, moods, sound and kicks use word anchors and need nothing here. After a new voice: `python3 out/gen_film.py`, then `python3 tools/film_plan.py check`.\n\n| What | Frames | Word it comes from |\n|---|---|---|\n" % W[-1]["e"])
    for a, b, c in NOTES: f.write("| %s | %s | %s |\n" % (a, b, c))
    f.write("| cut into the office (take t2 starts; everyone at the junction hidden, resets) | %d | 'inspector' (4th) -5 f |\n| cut back to the junction (take t3 starts) | %d | 'Jack' (7th) -5 f |\n" % (CUT_IN, CUT_OUT))
    f.write("| Jack and the signalman jump to the start of the trolley ride | %d | 'Every' +3 f |\n| Jack walks behind the trolley, signalman rides (steady pace) | %d-%d | 'pushes' +3 f |\n| signalman jumps home with the trolley | %d | ride end +13 f |\n" % (TP - 1, RIDE0, RIDE1, PARK - 1))
    f.write("| inspector enters, walks in from the east | %d-%d | 'inspector' -34 f |\n| inspector walks off east, hidden | %d-%d | 'sends' |\n| inspector placed on the boardwalk, shown | %d, %d | 'look' |\n| lady appears in the window | %d | 'lady' -7 f |\n| driver appears in the cab window, hidden again | %d, %d | 'toots' +5 f, 'driver' +15 f |\n" % (E0, E0 + 38, X0, X0 + 56, F("look"), F("look", 1, 6), L0, D0, F("driver", 1, 15)))
print("film.json written:", len(J) + len(O) + len(Z), "stations,", len(A), "acts,", len(EV), "events")
