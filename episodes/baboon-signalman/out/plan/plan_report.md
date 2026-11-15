# Plan check: The Signalman Who Was a Baboon

Camera idea: **He never looks up**. Jack runs the junction by ear and never lifts his eyes, so the camera does the looking for him: it lives at the baboon's eye height at his levers, and every time something arrives above him (the cab, the lady's window, the tall inspector) it looks up and comes back down to the same calm face.

42 gates: 31 pass, 11 warn, 0 fail. 2329 frames, 77.6 s, 4 takes.

| | Gate | Value | Target | Fix |
|-|-|-|-|-|
| PASS | camera: at rest (< 2 px/f), % of frames | 50.1 | >= 30 (Rick median 32, range 6-58) |  |
| WARN | camera: rests per 10 s | 5.15 | 2.2-4.5, aim 3 (Rick 3.1, range 0.9-4.7; the plan reads about 1 higher than the picture). CB 2026-11-10: the scene decides, but the camera must flow like his | station hopping: merge neighbouring stations and let ONE move flow through them (follow the thing that moves, cross the set, rise over it) |
| PASS | camera: rest length median, s | 0.88 | >= 0.6 (Rick 0.62); one in ten >= 1.8 |  |
| WARN | camera: longest travel, s | 2.33 | 3-7 in a film of 30 s or more: at least one long flowing move (Rick's long travels: median 3.0, upper quarter 4.8-9.5; Railroads and Roller Coasters 4.7) | every move is a short hop: where the scene has something to follow (a train, a walk, a falling thing, a line of rails) let one move run 4-5 s (station key travel) |
| WARN | camera: speed median px/f | 1.97 | about 4 (Rick 4.1, middle half 2.5-6.1) | too calm: raise the creep on the rests, add a drift, or lengthen the travels |
| PASS | camera: speed p90 px/f | 18.6 | about 23 (Rick 23, range 9.8-33.8) |  |
| PASS | camera: dead still (reads under 0.3 px/f when measured), % of frames | 16.0 | <= 21, aim 9 (Rick 9.3, range 1-29) |  |
| WARN | camera: speed peak px/f | 60.1 | <= 60 outside planned whips | only passes and whips may exceed 40, for <= 10 f with motion blur |
| PASS | camera: cuts per 10 s | 0.39 | <= 0.9, aim 0.4 (Rick 0.4; CB: fewer cuts) |  |
| PASS | camera: tilt while resting, deg | 0.0 | level (<= 0.5); tilt only inside a move (Rick: 0 % of holds) |  |
| PASS | camera: roll rate peak deg/f | 0.52 | <= 1.1 (Rick p99 1.08) |  |
| PASS | camera: lens outside 16-55 mm on non-insert frames, % | 0.0 | wide and close: about 24 mm = 73 deg tall (Rick, measured); long lenses only for object inserts |  |
| PASS | camera: travels that swing the view over 120 deg | 0 | 0: lay the places along the travel direction so the camera never turns back |  |
| PASS | camera: word stations not at rest on their word | 0 | 0: key nouns land with the camera at rest, 0-6 f before the word (CB's rule) |  |
| PASS | framing: first face, s | 0.0 | <= 1.5 (Rick median 0.0) |  |
| PASS | framing: face on screen, first 5 s, % | 82.0 | >= 50 (Rick 55-63) |  |
| PASS | framing: face on screen, first 15 s, % | 92.0 | >= 50 (Rick 55-63) |  |
| PASS | framing: longest stretch without a face, s | 1.7 | <= 6 |  |
| WARN | framing: frames with a face, % | 89.0 | 45-68 (Rick 55, range 23-66): about a third of the film belongs to the world and the story object | a face is on screen almost all the time: give beats to the world (a towering wall, the machine, the vehicle, a view from the air) with the character tiny or absent |
| PASS | framing: head width / frame width, median | 0.31 | about 0.25 (Rick 0.25, range 0.16-0.52) |  |
| PASS | framing: head width / frame width, p90 | 0.47 | <= 0.55 |  |
| PASS | framing: whole-body rests: figure height / frame height, median | 0.37 | about 0.45 (his head width of 0.25 at puppet proportions) |  |
| WARN | framing: whole-body rests: feet height (0 = top), median | 0.75 | 0.80-0.95: feet near the bottom, at most a fifth of the frame is empty floor | raise the aim point or come closer so the floor does not fill the lower third |
| PASS | framing: head centre height, median (0 = top) | 0.46 | 0.45 (Rick 0.39-0.51), above the caption band |  |
| PASS | framing: head centres inside the caption band, % of all heads on screen | 2.7 | <= 3 (Rick 2.7) |  |
| PASS | framing: face frames with the head cut by the edge, % | 11.0 | <= 13 (Rick 13) |  |
| PASS | framing: face frames where the whole body fits, % | 76.0 | >= 65 (Rick 68) |  |
| PASS | camera: at rest while a face is on screen, % | 53.0 | >= 40 (Rick 41): rest on faces, move on places and objects |  |
| PASS | framing: shot mix W/M/C/P/O, % of time | 48/33/5/12/3 | whole body 45, medium 20, close <= 7, place 15, object insert <= 15 (Rick) |  |
| WARN | framing: world-led frames (place + object framing), % of time | 15 | 25-40 (Rick: place 15 + object up to 15; his 3D films are about half world-led by eye) | let the world or the story object fill the frame and make the character tiny or leave them out for that beat; then go very close |
| WARN | framing: medium shots, % of time | 33 | about 20 (Rick): the middle size is the dull one | go wide with the whole body small in a big world, or go close; put something big and close behind the character |
| WARN | world: places in the film | 2 | >= 4, aim 5-8 at 55 s or more (Rick's 3D films: 5-8 places) | a story in one place still gets more views of it as places of their own (from the air, inside the vehicle, under the machine, the same set at night); an analogy or cutaway is a small 3D place, never a flat card |
| WARN | world: share of the film in its most used light, % | 94 | <= 75: 2-3 kinds of light per film (day, golden, morning, night, interior); the light changes at the turn of the story | give the turn or the ending its own light: a second place entry on the same set with another light (golden, night), or move that beat indoors |
| PASS | framing: same framing on the same subject in a row (stations) | 2 | <= 3 |  |
| PASS | story: sentences whose subject or action is on screen, % | 100.0 | >= 90 (Rick 91) |  |
| PASS | story: named nouns not on screen within 0.5 s of their word | 0 | 0 |  |
| PASS | acting: pose or face changes per 10 s on screen | 23.5 | >= 4 (Rick 4.5 on one figure, range 3-7; this counts every figure on screen) |  |
| PASS | acting: longest fully frozen figure with a resting camera, s | 1.2 | <= 3 unless something else moves |  |
| PASS | acting: held props without a hand | 0 | 0: every held prop is attached to a hand on every frame |  |
| PASS | acting: frames where a solid thing passes THROUGH a character | 0 | 0: a body cannot be inside a lever, a post or a rail (CB 2026-11-10) |  |
| WARN | acting: effects per 10 s | 2.7 | 1-2, on the action noun or verb (Rick) | too many effects: keep the ones on action words |
| PASS | acting: mood (light / colour) changes per minute | 15.5 | >= 12, in-shot on the word (Rick 13.7, range 3.9-15.5) |  |
