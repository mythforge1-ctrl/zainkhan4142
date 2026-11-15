# CHARACTER VIEW RULES (locked)

CB approved view sheet v5 on 2026-11-10 03:32: "now is fully correct. you should make a rule. so it not get mess up".
The approved sheet is `views_golden/APPROVED_character_views_v5.png`. These rules apply to every character of the vector2d cast, in every film.
Changing a rule or an approved picture needs CB's OK.

## The four views

A character is always shown as a full, unsquashed card in one of four drawn views. The view is picked from the camera angle (act key `look` in film.json, `tools/film_plan.py apply_looks`). A card is never squashed, stretched or foreshortened to fake a turn.

1. **Front** = the locked look of the cast. Nothing changes here.

2. **3/4 = the front view, with only the face parts moved to the side.**
   Head shape, hair, hat, ears, body, arms and legs are EXACTLY as in the front view. Only the eyes, the brows and the mouth (with what sits on the face around them: moustache, muzzle, nose) shift toward the side the character looks at.
   This holds for everyone, women too: a woman's 3/4 keeps her front hair.
   CB: "the 3/4 view is face body front same as front view. just the eye mouth eyebrow point to the side" and "women head is front so dont make the hair side".

3. **Side = a real profile, and the hair is still there.**
   - The hair covers the back of the head and follows the head's own edge. No gap between hair and head, and nobody who has hair in the front view is bald from the side.
   - The hair reaches only as far down as the front and back views show it. Example: the signalman's grey hair stops half way down his head in all views.
   - Women with bob hair: the hair wraps round the back of the head and leaves the face open, with the bun on top (this is the shape first drawn for 3/4; CB: "side view you should make the hair like is 3/4 now").
   - Hat brims and muzzles point the way the character looks. Raised hands go forward.

4. **Back** = the hair covers the head. Face parts (moustache, beard) go under the head so only ends that stick out past it show. Hats and coats are drawn from behind.

5. **The hair must agree in all four views**: same colour, same length, same amount. Check a new character's four views side by side for this before it is used.

## Mistakes already made (do not repeat)

- Turned the whole head and hair in 3/4. Wrong: only the face parts move.
- Gave women the turned hair in 3/4. Wrong: their head is front, so the hair is front.
- Signalman side view: a gap between hair and the back of the head, then hair down to the neck while front and back show it half way. Wrong both times.
- A `//` comment in the middle of a patched .mjs line swallowed the rest of the line and removed every face.

## The guard

`node tools/check_views.mjs` draws the reference characters (stationmaster, inspector, lady, dad, Jack) in all four views and compares each tile with the approved pictures in `views_golden/`. It must say PASS:
- after any change to `char2d.mjs`, `castkit.mjs`, `cast.mjs`, `memes*.mjs`, `bodies.mjs`, `templates/threejs_film/puppets.mjs` or `poses.mjs`;
- before an animatic or a film is rendered.

If it fails, undo the change that altered the view. If the change is wanted, show CB the new sheet (`views_golden/_last_sheet.png`) and run `node tools/check_views.mjs --update` only after his OK.

## A new character

1. Draw its four views: `node tools/check_views.mjs --add cast:<name> [--sheet episodes/<ep>/cast/sheets/<file>.mjs]`.
2. Check `views_golden/_added_sheet.png` by eye against rules 2 to 5.
3. Show CB the sheet. After his OK add the character to `views_golden/rows.json` and run `--update`.

## Where the code is

- `templates/threejs_film/puppets.mjs`: `turnedHair` (side hair, side view only), `backHair`, `unslide` (keeps hair still in 3/4).
- `templates/vector2d_characters/code/cast.mjs`: the signalman's side and back hair.
- `char2d.mjs` and `castkit.mjs`: flag `slideExtras` (which face extras slide with the face).
- A cast sheet that draws its own views sets `views: true` (example: `episodes/baboon-signalman/cast/sheets/jack.mjs`).
