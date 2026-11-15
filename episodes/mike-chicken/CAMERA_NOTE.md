# Camera note: The Chicken That Skipped Dinner (camera pass, 2026-11-15)

Built from `voice/words.json` (254 words, 59.2 s). `film.json` is written by `out/gen_film.py` (all anchors are words, nothing is typed as a time). Re-run it after any change: `python3 episodes/mike-chicken/out/gen_film.py`, then `python3 tools/film_plan.py check episodes/mike-chicken/film.json`.

## Five candidates (fits the mechanism / never seen / tells the twist / loops / buildable, each 1-5)
| Idea | Scores | Total |
|---|---|---|
| **Dinner or not** (the watcher): the camera lives at Mike's eye level on his feed barrel and keeps being pulled up toward the people who look down at him, until the party where the whole yard is at his level | 5, 4, 5, 5, 4 | 23, winner |
| The eyedropper's path (object journey): ride the drop of milk from dropper to beak and out again | 4, 3, 3, 5, 3 | 18 |
| Scale ladder: from the dropper up to the whole town, one step wider per beat | 3, 3, 4, 4, 4 | 18 |
| Shadow first: every character arrives as a shadow on the barn wall | 2, 3, 3, 3, 3 | 14 |
| Through the neck (through the thing): every place change goes through the cut neck | 3, 4, 3, 2, 2 | 14: needs gore-adjacent frames, dropped |

## Director's note
Dinner or not: the camera works at Mike's height on a feed barrel (so his head clears the caption), and the plan's world views look away from the people at the place itself.
- Hook, "head": a W of farmer and Mike, then a medium on Mike on "no head".
- Turn, "see" (the mind take): the world view of the brain model, then the lady walking through the analogy.
- Payoff, "party": the camera looks up at the bunting, then runs back to frame 0 (the dropper, the farmer, Mike): `loop: true`.
Runner-up: the eyedropper's path.

## Numbers
`out/plan/plan_report.md`: 0 FAIL, 3 WARN of 41 gates. 1795 frames, 59.8 s, 5 takes, 4 cuts (0.67 per 10 s), 24 stations. Rest 57 %, dead still 9.6 %, first face 0.0 s. The long journey is the farmer to Mike move on "peck" (5 s, on an arc).

## WARNs kept, with the reason
- **Speed median 1.75 and p90 11.4 px/f (target 4 and 23).** The plan reads moving speeds low (SKILL.md, THE PIPELINE: on the fifth test film the plan read median 2.6 against 4.6 measured and p90 18 against 24). The rendered check at stage 7 is the judge. Every hop longer than the story allows breaks the peak-speed gate, so the fix is not to shorten travels.
- **Frames with a face 83 % (target 45-68).** World-led frames (world views plus object inserts) are about 40 % of the time, but the plan counts a head in the frame during the travels into and out of them. The world views themselves look away from every character.

## Deviations and things to know
- Characters: Mike (`cast:mike`, 0.55 m, a rooster with no head) does not exist yet. It is a new puppet on the shared rig (like `jack.mjs` in the baboon sample), and it must be shown to the user before use. `neighbour` = `cast:fishgramps`, `sci1` = `cast:scientist`, `sci2` = `cast:doctor`, `farmer` = `form:dad`, `showman` = `form:chad`, `lady` (the analogy) = `form:lady`.
- Sets are not written yet: `farmyard` (two lights: golden, day), `lab`, `tent`, `mind` (the brain analogy as a small 3D place). Props to build: barrel, fence, barn, bench, sign, brain model, bunting, block.
- Mike stands on a feed barrel (z 0.85) in the yard and at the party. Short characters otherwise end up under the caption.
- Characters not in a take are hidden at the cut (`visible: false` acts), because the plan counts every visible head.
- The neighbour stands left in the tent (x = -2.1) so the sign view and the camera moves stay one-directional.
- The kid and a lady in the crowd were dropped from the cast (heads under the caption).
- Sound names (`drip_small`, `axe_chop`, ...) are cue labels for the sound stage, not files.
- The axe, eyedropper and quarter are letter discs until the props are drawn.

## What the storyboard has to show that no gate sees
- Mike's head: he has no head. The puppet needs a neck stump and a way to show "face" on a headless body (the plan uses `face: standard` as a placeholder). Decide with the user.
- The O inserts (dropper, quarter) are medium-wide by design (head must not be cut): check the hand is readable.
- Place views aim away from the people: check each shows a real object (barn, bench, sign, brain, bunting).
