# Camera note: The Signalman Who Was a Baboon (camera director, 2026-11-10)

Built from `voice/words.json` as replaced at 00:41 (281 words, last word ends 77.02 s). `film.json` is written by `out/gen_film.py`; typed frames are listed in `events_anchors.md`.

## Five candidates (fits the mechanism / never seen / tells the twist / loops / buildable, each 1-5)
| Idea | Scores | Total |
|---|---|---|
| **He never looks up** (the watcher): the camera lives at the baboon's eye height at his levers and does the looking up for him (cab, lady's window, tall inspector), always back down to the same calm face; on "he doesn't even look up" it does not look up either, then leaves its post once, with the last train, and rises on "You see" | 5, 4, 4, 5, 4 | 22, winner |
| Who runs the railway (hand-off): the camera belongs to whoever is in charge: signalman, Jack, inspector, Jack again; one move at each change of hands | 4, 2, 4, 4, 5 | 19, runner-up (same stations, other masters) |
| Line clear (mechanism is the path): the camera is one more train; it only leaves a station when Jack throws a lever, one way down the line | 5, 4, 3, 4, 2 | 18: Jack has to be back at his levers late in the story, so the one-way line breaks |
| Out and home (mirror loop): out along the line in the first half, back the same way in the second | 3, 2, 4, 5, 4 | 18 |
| Whistle steam (through the thing): every change of beat goes through a white whistle puff | 4, 3, 4, 3, 3 | 17: needs many cuts, the client wants two |
| The key's journey (object): ride with the brass key | 2, 3, 2, 3, 3 | 13 |

## Director's note
He never looks up: the camera sits at Jack's eye height and looks up for him, until the proof, when neither of them does.
- Hook, "never ... word": three-second arc and push from whole body to his calm face; the lever goes on "junction", the signal arm rises behind him.
- The dare, "monkey": the inspector bends down into the low lens, the signalman calm over his shoulder; then "Send one."
- Proof, "look up": a slow creep on Jack and the key while the train shakes the frame; the camera stays down. Then it leaves with the last train, 14 m to the boardwalk, and rises on "see".
- Payoff, "never ... mistake": Jack reaches for the lever on "single"; the last frame is frame 0.
Runner-up: the hand-off. No WARN kept.

## Numbers
`out/plan/plan_report.md`: 0 FAIL, 0 WARN of 37 gates. 2329 frames, 77.6 s, 3 takes, 2 cuts (into the office through whistle steam, out through the letter). 36 stations. Long journeys: the whip up the line to the trolley, the trolley ride (follow), the ride with the last train, the glide from the boardwalk back over the junction.

## Deviations from the brief, on purpose
- Trolley home is [2.3, 0.2, 0] (set builder's note 5), set by the first trolley event.
- The cab stops at x = 0.0 for the key, not 6.0: there the cab window sits between the lever frame and the hut, clear of both and of the lamp post (checked in the storyboard), and Jack does not have to leave his post. The same train then pulls forward to x = 6.8 so carriage 1's middle window stops behind Jack for the lady.
- People in the train do not ride while it moves: the driver and the lady appear in their window once the train has stopped, and are hidden before it leaves. Only the trolley ride moves cards with a mover (steady pace, the trolley event is cut into short pieces to match).
- The trolley and its two riders jump twice while out of frame (to the start of the ride, and home again).
- "Leans into the lens" is a stand-in: the inspector's card sinks 0.95 m so his head comes down to the low lens.
- Lines 9-14: the inspector comes to the lever frame; after "sends" he walks off east and is found on the boardwalk at his mark on "inspector" (line 14).

## Wanted from the lead
- Poses: reach up to a lever (now `point_up`), pull lever with both hands (now `stand` after `point_up`), hold key up to a window (now `hold_watch`), push trolley (now walk cycle), write (now `point_out`), hold letter, hold bottle, hold coin out (all `hold_watch`), lean forward (now the sunk card), knock (now `point_out`), blow a whistle / count on fingers (now `finger_up`).
- Props drawn in the hand (now lettered discs): key, coin, bottle, letter (cream sheet: the cut out of the office depends on it), notebook.
- Faces: none missing. Jack is `standard` all film, `proud` (closed eyes, sparkle) only from "listening" to the office cut.
- Set: nothing blocking. The signalman still reads as standing in the trolley (card z is the lead's to tune).

## What the storyboard still shows that no gate sees
- Trolley ride: Jack is small at the left edge beside the cart, the caption sits on the cart.
- "driver": Jack is small at the bottom (head at 78 % of the height, just under the caption), the key is a dot.
- "lady" / "baboon": the lady is small in the window (head 11 % of the width) and lever handles stand close to her face; Jack drifts toward the right edge by the end of "baboon".
- "inspector shows up": Jack's left side is cut by the frame edge; the inspector's body is partly behind Jack's mane.
- "monkey": the signalman's face is half behind the top hat; the caption sits on the inspector's collar.
- "reach": the lever he cannot reach is small at the left edge; the trolley's green front fills the bottom third.
- Boardwalk and office wides: the lower third is floor with only the caption on it.
- "see": the junction is far and small; the inspector is small in the bottom right corner.
- "track": the train comes head-on with the signal post at the left edge; the branch line is behind and beside the engine and reads weakly.
- Cut out of the office: the letter in the signalman's hand is a small disc until the prop is drawn.
- Whole-body frames of Jack keep about a fifth of empty ground under his feet.
