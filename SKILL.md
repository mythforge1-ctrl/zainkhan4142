---
name: cartoon-3d-short
description: Makes a 30-80 s vertical cartoon story Short in the narrated "odd true story" style. Flat 2D vector puppet characters (drawn in code) act in a 3D world. The film is planned in one film.json, checked by about 42 plan gates, staged in three.js as storyboard and animatic, then finished in Blender with materials, light and effects, with voice narration, sound and one-word captions, rendered with EEVEE on the local GPU. Use when the user asks for a cartoon story short, an animated Short, "a video like the baboon signalman", or names this skill.
---

# Cartoon 3D Short: the skill (free edition, Viral Shorts by CB)

This skill turns a topic into a finished vertical Short. It is the working pipeline of CB (Viral Shorts by CB), shared with the community. The rules below were written while making real films, and each one records what went wrong before it existed.

**Read this section and THE PIPELINE first. THE PIPELINE wins over everything below it.** Plain-language steps: [WORKFLOW.md](WORKFLOW.md). Density rules: [DENSITY_RULES.md](DENSITY_RULES.md). Camera and action shots: [CINEMATOGRAPHY.md](CINEMATOGRAPHY.md). Agents: `agents/camera-director.md`, `agents/storyboard-judge.md`. Setup on a new PC: [SETUP.md](SETUP.md).

## HOW TO READ THIS FILE

- **"CB" means the person you work for.** The rules were written for CB, the author. Wherever a rule says "CB approves", "CB sees" or "CB's OK", read it as the user of this skill. Quoted remarks from CB are kept because they give the reason for a rule.
- **"Rick" is the reference channel** (Rick's Clips) whose Shorts were measured to set the gate numbers. Take the craft (staging, camera, timing, colour). Never copy a story, a character, a shot or a frame of his or of any other creator.
- **Paths are relative to the skill folder** (the folder this file is in). Run commands from there. New films go in `episodes/<name>/`.
- **A working sample is included:** `episodes/baboon-signalman/` ("The Signalman Who Was a Baboon", 77 s). It passes the plan check and renders a storyboard and an animatic. Read its `film.json`, `SCRIPT.md`, `CAMERA_NOTE.md`, `SET_MAP.md` and `sets/` before writing a new one. A shorter example is `templates/film_example/`.

## WHAT THIS EDITION CONTAINS, AND WHAT IT DOES NOT

Included: the pipeline tools (`tools/`), the three.js film kit (`templates/threejs_film/`), the Blender look package (`templates/blender_look/`, `templates/blender_cine/`), the character rig with a starter cast (below), the movement library (`templates/motion_styles/`), the synthesized sound kit (`templates/audio/`), the measured gate numbers (`references/measure/`), the style reports (`references/reports/`), the lessons library (`library/`) and the baboon sample.

Not included, so plan around it:
- **Reference frames and videos.** The reference channel's pictures are its own and are not shipped. Stage 4 (reference board) is done with frames the user collects for private study, or from the written reports in `references/reports/` when the user has none. Say which one you used.
- **Music and sound-effect libraries.** Build sound with `templates/audio/` (synthesized) or with files the user has a licence for. The sample's `sound/cues.md` shows a finished cue list as an example.
- **BlenderKit models.** `tools/blenderkit_tool.py` works with the user's own BlenderKit account inside Blender. Without one, build props in code.
- **The full cast.** This edition has the rig, all body forms, all face sets and a starter cast of 20 named characters. More characters are made with the same rig (see Characters below).
- **A voice.** The user needs a text-to-speech account (CB uses Fish Audio) or records the narration. The voice id is the user's choice; ask once and write it in the episode notes.

## WORKING RULES

### Finish the whole job
An error, a failed check or a timeout is not a reason to stop. Find the cause, fix it, retry or go another way, and carry on to the next stage. Stop only at the user's gates below, or when something needs the user's money, account or decision.

### Steps that need NO OK (do them, then say what you did)
Retry a render or a check. Regenerate one failing voice line. Re-make a storyboard panel or a still. Fix a set until its check passes. Add a pose, a prop or a set file inside the episode folder. Save backups.

### Steps that ALWAYS need the user's OK first
The gates in THE PIPELINE: the story pick, the script, every storyboard scene, the full preview, the look, the final. Also: deleting or moving the user's files, spending money or credits beyond what the user already agreed (voice, online render), publishing or uploading anything, and changing a rule file or the character rig.

### When to split work across agents
Only where THE PIPELINE names agents: the `camera-director` for stage 5, the `storyboard-judge` for stage 6, and after stage 5 one agent per place for the sets and the look pass. Small jobs stay in one session. Only one job renders on the GPU at a time.

### Reports to the user
Result first, in plain words, short. Show pictures (storyboard page, stills, the preview file) instead of describing them. Say plainly what was checked and what was not.

### Honest claims
Do not promise views or income. Render time depends on the PC: CB's 77 s sample took about 4 hours for the final Blender render on an RTX 2070 Super. The three.js storyboard and animatic take minutes on any machine.

## CHARACTERS IN THIS EDITION

`film.json` `cast` names a puppet in one of three ways:
- `"stationmaster"`: the demo character.
- `"form:<name>"`: a plain body form from `templates/vector2d_characters/code/bodies.mjs`: `standard`, `chad`, `bigboi`, `noodle`, `kid`, `dad`, `lady`, `elder`, `baby`, `toddler`, `teen`, `teengirl`, `brute`, `ghost`.
- `"cast:<name>"`: a named character from the cast sheets. The starter cast is on two sheets, pictures in `templates/vector2d_characters/sheets_png/`:
  - Sheet 06, jobs: `doctor`, `nurse`, `chef`, `firefighter`, `police`, `construction`, `scientist`, `teacher`, `mail`, `farmer`.
  - Sheet 13, family: `gamer`, `skater`, `goth`, `cheer`, `band`, `bbqdad`, `soccermom`, `newdad`, `knitgran`, `fishgramps`.

**A new character** is a new spec on the same rig, in the episode's own folder: `episodes/<name>/cast/sheets/<who>.mjs` exporting `CAST = [{ name, label, form, coat, face, hat, details, ... }]`, with `"puppet_pkg": ["cast", "../../templates/vector2d_characters/code"]` in film.json. Two worked examples are in the sample: `episodes/baboon-signalman/cast/sheets/jack.mjs` (an animal with its own head parts and four views) and `inspector.mjs` (a villain with hat, cape and prop). Keep the style: big meme-level face, white head, limbs in one colour, the rig's own ink line. Show the user the new character before it is used in a film.

Where a section below speaks of "150 characters on 15 sheets", that is CB's full cast; this edition ships sheets 06 and 13.

## THE PIPELINE (audit 2026-11-09, CB: "check everything and optimize ... make it one of the best animation production pipeline"). This section is the single source of truth; it wins over every section below.
**Why it exists.** The Card Maker film passed every look gate and still failed as a film: first face at 14.5 s, the camera at rest 9 % of the time, only 6 of 19 sentences shown, props floating beside hands. Nothing checked the film as a film, and the camera, the acting and the sound each kept their own timing. Now one file describes the film, one tool bakes it, and a gate runs before every expensive step.

### One file: `episodes/<name>/film.json`
Everything timed lives here, anchored to words (`["deck", 2, -4]` = 4 frames before the second "deck"): `cast`, `places`, `props`, `takes` with camera `stations`, `acts` (pose, face, view, prop in hand, quoted lines), `sentences` (subject and nouns per line), `fx`, `moods`, `sound`, and the `camera_idea`. A new voice means: new words.json, re-bake, re-render, nothing typed again. Working example that passes every gate: `templates/film_example/film.json`.
- `python tools/film_plan.py check episodes/<name>/film.json` bakes it to `out/plan/` (`camera_baked.json`, `performance_baked.json`, `sound_events.json`) and runs about 42 gates on the PLAN (since 2026-11-10 with the cinematic gates: places, light share, world-led frames, medium share, and two-sided bands for rests, longest travel and face share): camera rest, speed and dead-still share, travel length, cuts, roll, nouns landing at rest, first face, face share, head size and height, figure size and empty floor on whole-body rests, every head against the caption band, shot mix, sentences shown, pose changes, frozen figures, props in hands, effects and mood changes. Every gate prints its fix. Plan speeds are in the unit the film check measures on the picture (fitted on four renders of the example film and checked on a fifth with a new camera: the rest share stays within 10 points; on the fifth the plan read the moving speeds low, median 2.6 against 4.6 measured and p90 18 against 24), so the plan is a first filter and the rendered check at stage 7 is the judge. **0 FAIL before anything is rendered.**
- The three.js film and Blender both read the same baked files, so camera, positions and timing cannot drift between them.
- `python tools/check_film.py <video.mp4> --film episodes/<name>/film.json` measures a RENDERED preview or final with the instrument used on Rick's 24 Shorts (it reproduces his stored numbers exactly) against `references/measure/gates_film.json`, compares picture to plan, and scans for freezes, long travels, flickers and picture jumps the plan does not explain (planned mood changes, effects and kicks are recognised and are not counted as cuts).

### The stages (each gate must pass before the next stage starts)
| # | Stage | Made by | Gate |
|---|---|---|---|
| 1 | Topic and facts: pitch 3 stories (UPGRADES 1); each pitch names its 5-8 places and 2-3 kinds of light (CINEMATIC RULES 1) | lead | CB picks |
| 2 | Script with seconds per line and a beat list (UPGRADES 2-3) | lead | `tools/measure/script_stats.py`; CB approves, then "just do it" |
| 3 | Voice, `words.json` (UPGRADES 4-5; about 1.2x pace, a little less dramatic) | lead | voice gates; pace 3.5-4.5 words/s |
| 4 | Rick reference board: 2-4 of his frames per beat, one line on what to take | 1 agent | hard gate: no storyboard without it |
| 5 | Shot blueprint and camera: `film.json` | `camera-director` agent | `film_plan.py check`: 0 FAIL, at most 2 WARN; a cinematic gate (places, light, world-led, medium, rests, long travel) may stay on WARN only with the scene's reason in CAMERA_NOTE.md |
| 6 | three.js sets (simple toon, real sizes) and storyboard: START and END frame of every camera move, captions on, one page | 1 agent per place, lead keeps the look | `storyboard-judge` agent 8.5+ per panel, then CB sees EVERY scene |
| 7 | Look on 3 sample shots, then the whole three.js film with voice, captions, rough sound | lead | `check_film.py` 0 FAIL; sound-off test; three-point shot check; CB watches a full preview |
| 8 | LOCK: `render.mjs --export-lock` freezes sets (.glb), card drawings, camera, performance into `out/lock/` | lead | no layout, camera or timing change after this; `from_lock.py` refuses a changed plan |
| 9 | Blender look pass per place: `from_lock.build()` then ONLY materials, light, air, dressing, effects (MAIN LOOK; BlenderKit first for hero props; dressing stays out of `keep_clear`) | 1 agent per place; the GPU renders one job at a time | `tools/check_episode.py` (density + 3D look); `tools/measure/cine_look.py` on the look frames: 0 FAIL; one still per place + one short clip; CB approves the look |
| 10 | Final render: slowest frame per place first, then frames | lead | `check_film.py` on the final: plan vs picture, scan; `cine_look.py` on the final mp4: 0 FAIL |
| 11 | Sound from `sound_events.json` (runs beside stages 9-10) | 1 agent | mix gates (FULL WORKFLOW step 10) |
| 12 | Captions, QA, delivery | lead | `short_qa`, hold contact sheet, a backup copy, lessons into `library/` |
Kit commands (`templates/threejs_film/`): `node render.mjs film.json --storyboard | --animatic | --frames 0,45 | --visibility | --export-lock`. Renders in minutes on any machine; no Remotion, no GPU.
Parallel work (CB: split big work across agents; scope in WORKING RULES): after stage 5 the sets (one agent per place), the sound, the BlenderKit search and the reference board run side by side; the lead owns `film.json` and the look. Only one job renders on the GPU at a time.
Blender order: the default is this three.js-first order. FULL WORKFLOW steps 5-7 (Stage A toon build, Stage B materials, both in Blender) are the named option "full Blender world", and their density, material and light rules are the rules of stage 9.

### Characters: the 2D vector puppets (CB locked 2026-11-09), drawn in code
The toon.ts characters and the old character template are removed from the skill (CB 2026-11-09: "remove. i want only the new"). Every character is a vector puppet, and since CB's lock of 2026-11-09 night ("this will be our new style") it is the project's ONLY character style: `char2d.mjs` (`drawCharacter(S)`), heads and faces v7, the meme face sets (base 28, female, baby, elder, teen, villain, monster), 10 lip-sync mouths, blinks, 13 body forms, and a cast of 150 named characters on 15 sheets (`castkit.mjs`). The locked package is `templates/vector2d_characters/` (`code/` = rig, forms, faces, castkit, `sheets/sheet01-15.mjs`; `sheets_png/` = the pictures to choose from). It is built in the thread "characters"; this skill uses it and does not edit it.
- **How they plug in.** `film.json` `cast` names a puppet: `"stationmaster"`, `"form:<body form>"` or `"cast:<name>"` (any of the 150; pick from the sheets before inventing a new one); `performance_baked.json` says, per frame, view, direction, pose, face, mouth, blink, prop and position. `templates/threejs_film/puppets.mjs` turns one state into one drawing, cached by state (a held figure is one drawing). `poses.mjs` supplies the arms from hand targets, so a prop in a hand is attached by construction. In Blender the same drawings arrive as numbered PNGs per character (`out/lock/cards/<who>/`) and `from_lock.card()` swaps them per frame on a camera-facing plane, half self-lit.
- **Baked acting rules** (measured on Rick, or CB's): the face changes 0-3 f before its word, the body one frame after the face; a blink covers every face swap; blinks every 0.5-2.3 s for 4 frames, never while that character talks, never in a punch hold; mouths change every 2 frames across quoted words; position changes are fast in and slow to settle with no overshoot; a landed pose is dead still.
- Expressions are always the big meme-level faces. Legs and limbs are one colour. Characters are never BlenderKit people and never drawn by hand for one shot.
- Ink: the puppets draw their own line; no other ink exists in the frame. Target ON SCREEN is Rick's #231218 (measure the render, a code colour is not a screen colour).
- In the kit since 2026-11-10 (CB OK'd coding them on the locked cast, look unchanged): leg poses for walk cycles, blinks and calm kit faces on any puppet, an arm layer in front of the head, the four views for forms and cast, and held items that follow the hand. Still weak: a cast character with its own meme face has no true side view (its face slides on a front body).

### Character views: front, 3/4, side, back (CB locked 2026-11-10 03:32 on view sheet v5: "now is fully correct. you should make a rule. so it not get mess up")
Full rules, the approved sheet and the mistakes already made: `templates/vector2d_characters/VIEW_RULES.md`. They apply to every character in every film; changing a rule or an approved picture needs CB's OK.
- A character is always a full, unsquashed card in one of four drawn views, picked from the camera angle (act key `look` in film.json: a point, a cast name or `"cam"`; `film_plan.py` turns it into the view). Never squash, stretch or foreshorten a card to fake a turn.
- **3/4 = the front view with only the face parts moved.** Head, hair, hat, ears and body are exactly as in the front view; only eyes, brows and mouth (with moustache, muzzle, nose) shift to the side. This holds for women too: their 3/4 keeps the front hair.
- **Side = a real profile with the hair still there.** The hair covers the back of the head along the head's own edge (no gap, nobody goes bald who has hair in front) and reaches only as far down as the front and back views show it. Women's bob hair wraps round the back and leaves the face open.
- **Back** = the hair covers the head; face parts go under the head.
- The hair agrees in all four views: same colour, same length, same amount.
- **Guard:** `node tools/check_views.mjs` compares the reference characters in all four views with the approved pictures (`templates/vector2d_characters/views_golden/`). It must say PASS after any change to `char2d.mjs`, `castkit.mjs`, `cast.mjs`, `memes*.mjs`, `bodies.mjs`, `puppets.mjs` or `poses.mjs`, and before an animatic or film is rendered. `--update` re-makes the approved pictures and is run only after CB approved the new sheet. A new character gets its four views drawn with `--add cast:<name>`, is checked against the rules, shown to CB, then added to `views_golden/rows.json`.

### Character movement: always funny, matched to the scene (CB 2026-11-10: "make as rule and update in skill ... always decide what would match scene emotion feeling action to the scene and character. Always funny comedy meme")
Reason: CB found the characters' walk, run and sit weak ("we need to train how they move"), and a plain move wastes a beat that could be a joke. The move library, the picker and a test stage are in `templates/motion_styles/` (README there). It holds 69 styles for 19 actions, three per action, each tagged with the feelings it fits, an energy of 1-3 and the views it exists in.
- **Every movement of a character is chosen, never default.** For each act key, decide four things from the script line and the scene: the ACTION (walk, run, sit, wait, kneel, crawl, jump, fall, turn, idle, react, bike, ladder, hammer, push, carry, dig, sweep, sleep), the FEELING of that character at that moment (proud, scared, tired, angry, smug, sad, happy ...), the ENERGY of the beat (1 quiet, 3 the peak), and WHO the character is. Then take the style that fits: `pick({ action, feeling, energy, view, persona, avoid })` in `library.mjs`; `actionFromText(line)` reads the action out of a script line. Write the pick and its one-line reason next to the act key in film.json.
- **Always comedy.** The same action is played differently by feeling: a proud walk struts chest out, a sad walk drags its feet, a scared climb hugs the ladder. If the plain version would do, the move is not finished. Exaggerate timing, lean, step size and the face; never the drawing.
- **A move the library does not have is designed the same way, then added.** Ask: what is the funniest way THIS character does THIS thing while feeling THIS, in THIS place? Write three styles (calm, loud, odd), each in side AND front view (CB 2026-11-10: "i need also front view"), render them side by side with `node render.mjs moves/<move>.mjs out/<move>.mp4`, add them to `LIB` with their tags, and show CB when the move carries a scene.
- **Character.** A cast member may carry a default style per action (`persona`, e.g. `{ walk: 'B' }`); it is used when the scene gives no feeling, so the same person moves the same way across a film. Do not repeat one gag twice close together (`avoid`).
- **Body rules that every move keeps** (each was a mistake CB caught): feet are planted and the floor does not slide under them (no gliding); knees bend, and a sitting body has thighs on the seat with shins hanging; hands END ON the thing they push, hold or grip, with no gap (CB on the push: "the hand need to at the box no gap") - the arm has a fixed length, so place the object where the hand really ends (`grip()` in `moves/act_push.mjs`) or make the object big enough to reach; a body, head or limb never passes through the floor, a seat or a prop; a lying body rests on the surface; holds stay still.
- **Locked things stay locked.** The drawings, faces and four views do not change; a card is never squashed, stretched or foreshortened for a move; the view is swapped, never faked. No drawn stars, speed lines, comic bursts or ink puffs as movement effects; meme faces that carry such marks are swapped for a clean one. Faces stay white.
- **State of the code (2026-11-10).** `templates/motion_styles/` is a stand-alone library and test stage on the locked puppets (it draws the legs itself, in the locked ink). The film kit (`templates/threejs_film/`) does not call it yet; wiring it in changes `puppets.mjs` and `poses.mjs` under running episodes, so it is done between episodes, with a backup and `node tools/check_views.mjs` after. Until then, use the library to choose and design the move, and stage it with the kit's own leg poses.

### Camera: one idea per film, proven before it renders
- The `camera-director` agent (`agents/camera-director.md`) invents ONE camera idea from the story's own mechanism (five candidates from different families, scored), three hero moments on the punch words, then writes the stations and proves them with `film_plan.py`. Its first run made the example film's camera ("The mainspring", a wind-up and unwind that loops): `templates/film_example/CAMERA_NOTE.md`. The `storyboard-judge` agent (`agents/storyboard-judge.md`) has never seen the build and scores every panel.
- A station is where the camera RESTS on a word. The tool arrives 5 f before the word, rests with a small push and a slow sideways slide round the subject, sized so the picture drifts 0.6-1.8 px/f by framing (alive, never frozen, always level: Rick is dead still on only 9 % of frames; our first demo measured 37 % before this was tuned, the example film now measures 7 %), and travels to the next station with zero speed at both ends. Without a `travel` key a move takes at most 3 s; since 2026-11-10 the scene decides the length: short hops between faces, and at least one flowing move of 3-7 s per film that follows something through the set (CINEMATIC RULES 3). `via` bends a travel, `travel_roll` tilts only inside the move, `follow` trucks with a walker, `drift` and `creep` replace the automatic rest motion, `kicks` are 7-frame impacts, `hold: 0` passes a pose without stopping, and `loop: true` on the last station ends the film exactly on its first frame.
- Lens: wide and close. `lens` in film.json is for a 36 mm tall frame: 24 mm = 73 degrees tall (Rick, measured). The transfer to Blender uses the angle, so sensor sizes cannot disagree (the same view is 16 mm on the look package's 24 mm sensor).
- Action beats (anything that flies, falls, races or crashes) keep the `blender_cine` rigs and CINEMATOGRAPHY.md; they are measured after render by `check_film.py`.

### Effects that are always on (stage 9-10)
Motion blur on travels and passes only; f/5.6 with the focus on the subject's card every frame, so characters are never the blurred thing; shafts and haze from the place's air volume; bloom on practicals (threshold 0.8); contact shadows under every card; a rim tint on cards from the place's light; wet or polished reflections where the story touches them; 1-2 effects per 10 s on the action noun or verb (glint, glow, stamp, dust, coins); at least 12 mood changes (light or colour) per minute, in-shot, on the word; an analogy gets its own place and light. No grain, no world ink.

### Cinematic rules (CB 2026-11-10 on the finished baboon film: "our is less cinematic", then "apply all to knowledge. but the camera movements really depends on the scene and situation but we should make it more cinematic like his")
**Why.** The baboon film passed every gate and still read less cinematic than Rick's. Measured against five of his films (data and script: `references/remeasure/compare_2026-11-10/`), brightness, saturation and the camera gates matched, but the world never changed: two places and one noon light for 77 s, a face on 89 % of the frames, a middle-sized character in front of the same backdrop, a camera that hopped between 39 stations, no haze, a weak vignette, neutral shadows and plain ground. Several of these were already rules (moods, an analogy gets its own place, MAIN LOOK vignette 0.67 and blue shadows) that nothing enforced. The seven rules below are ranked by effect. Rules 1-3 are decided before anything is built; rules 4-7 are the look pass.
1. **Places and light.** A film of 55 s or more uses 5-8 places and 2-3 kinds of light (his Railroads about 8 places, Roller Coasters 7, Drivers and Pink Prison 5; noon, low sun, dusk, night). A story that happens in one place still gets more views of it as places of their own: from the air, inside the vehicle, under the machine, the same set at dusk or at night. The light changes at the turn of the story. An analogy, a cutaway or a time jump is a small 3D place with its own light, never a flat drawn card. Decided at the pitch and in the script: the beat list names place and light for every beat. Plan gates: places >= 4, most used light <= 75 % of the film.
2. **Scale.** A third to a half of the film is led by the world or the story object: a wall that towers, the machine, the vehicle, rails to the horizon, a view from the air, with the character tiny or absent. Then go very close. The middle size is the dull one (medium about 20 % of the time; the baboon film had 33). Behind a character stands something big and close, not open sky. At least three towering shots per film. Plan gates: frames with a face 45-68 %, world-led frames 25-40 %, medium <= 28 %.
3. **Camera flow, led by the scene.** CB: the camera depends on the scene and the situation, so these are bands, not laws, and their gates warn before they fail. The camera still rests on faces and on the named nouns, but it must not hop from station to station. Aim for 3 rests per 10 s, not 4-5. Wherever the scene has something to follow (a train, a walker, a thrown or falling thing, a line of rails, a rising structure), ONE move flows with it for 3-7 s: an explicit `travel` of 4-6 s on the landing station, or a chain of `hold: 0` stations. Push in slowly on about 45 % of the frames. A calm talk scene may stay on short moves (his Pink Prison: 4.1 rests per 10 s, long travels 2.2 s); a travel or action scene must flow (his Railroads and Roller Coasters: 2.5-2.7 rests, long travels 4.7 s). Gates: plan rests 2.2-4.5 per 10 s and a longest travel of 3-7 s; picture rests 2.2-3.8 and travel p90 2.1-6.3 s. A cinematic gate may stay on WARN only with the scene's reason written in CAMERA_NOTE.md. Scene by scene: CINEMATOGRAPHY.md section 6.
4. **Low sun, real shadows, a light that changes.** Outdoors the sun stands low (25-40 degrees), from the side or three-quarter back, so characters and structures throw long hard shadows on the ground and on walls; the sun disc and its glare are in frame in two or three shots; shadows are blue (b* -4 to -12). Every `moods` entry of film.json is rendered in Blender as a real light or grade key (in three.js it is only a placeholder wash): a mood that is not in the final picture does not count. One stretch of the film goes dark (night, deep shade, an interior with one window).
5. **Air and sky.** The sky is pale at the horizon and deeper above, with soft painted clouds (not small popcorn puffs); everything far is lifted by haze (haze lift 6-14); outdoors the sky is brighter than the ground.
6. **Grade.** Vignette 0.65-0.75 measured on the picture (the baboon film's 0.87 was too weak), big surfaces calm (lit C* 20-30) with one loud accent, deep blacks.
7. **Detail where the lens is.** Dense ground cover near the camera (ballast, pebbles, grass blades), grain on the big planes, gloss and a bright edge on rails, metal and glass (glints 1-3 % of the frame), and a sharp picture outdoors: depth comes from haze and light, blur only behind close-ups.

**Checks.** Plan (stage 5): the cinematic gates inside `film_plan.py check`. Look frames (stage 9) and final (stage 10): `python tools/measure/cine_look.py <folder of frames | final.mp4> [--interior]`, bands in `references/measure/gates_cine.json`, 0 FAIL. A FAIL there is a value outside all five of his films. First run (2026-11-10): the baboon final v1 gives 4 FAIL (vignette 0.87, haze -0.6, glints 0.4 %, spread of light 8.6), 6 WARN, 2 PASS of 12; Railroads on the same check gives 0 FAIL, 1 WARN.
The characters stay as locked. Stronger cast shadows and the scene's light tint on the cards belong to rule 4 and do not change the puppets.

### Rulings on the old contradictions
| Was written | Ruling |
|---|---|
| "every hold creeps, no static hold" vs "dead still" | Both: the CHARACTER is dead still once it lands; the CAMERA creeps slowly while it rests (under 2 px/f). |
| "moving about 68 %" vs "at rest at least 30 %" | The same thing: Rick moves on 67.5 % of frames and is under 2 px/f on 32 %. Dead-frozen camera (under 0.3 px/f) is only about 9 %. |
| "every shot rolls 3 degrees or more" | Retracted (that reading included parallax). Level while resting; 4-6 degrees only inside a travel, back to zero on landing. |
| "every move peaks on a word" | Not used. Rick's moves land at chance. CB's rule stays: named nouns land with the camera at rest. |
| Blender Stage A before the storyboard | Replaced by three.js-first; kept as the "full Blender world" option. |
| toon.ts cards, bean heads, 3.5 heads tall, eye spacing, ink fixes | Removed with the old characters; the vector puppets carry their own proportions. |
| lens 26 degrees (another studio) | Wrong for this style: Rick measures about 73 degrees tall. |
| Remotion renders, `rick-shorts` | Legacy. Its compositions all needed toon.ts, so it renders nothing now (not part of this edition). New films use `templates/threejs_film/` and Blender. |
| typed frame numbers, separate camera / acting / sound tables | One `film.json`, word anchors only. |
Older detail that no longer steers production (the bridge pipeline, its look values and targets, the look-match loop, Remotion gotchas) moved to an older rule file that is not part of this edition.

### Open, known, not yet proven
- Fine surface detail on the look stills is about half of Rick's (edge 0.069-0.128 against 0.141). Next gain at stage 9.
- The golden and interior light presets are written but have not been rendered on a real set.
- The plan's speed model and the rest motion were fitted on one 15 s example film, and with close cameras the plan reads moving speeds low. Re-fit `SEEN` and `REST_PX` in `tools/film_plan.py` after the first real episode (compare `plan_report.json` with `film_check.json`).
- The plan tool trusts the `shows` and `subject` labels: it does not test whether a caption, hat or figure covers a noun. The storyboard judge and CB's look at every scene are the check.
- `rigs` in `film.json` is free text for the Blender stage; no tool builds a rig from it yet.
- Moods do not reach Blender yet: `lock2.py` and the look scripts have no mood keys, so the baboon film's planned mood changes (15.5 per minute in the plan) never reached the final picture. Build it at the next look pass (light strength and colour keys per mood, or a per-frame grade), and prove it with `cine_look.py` (spread of L >= 10).
- The day grade used on the baboon film (`karoo_day`, pc_post vignette 0.3) measured vignette 0.87, shadow b* -0.8 and haze -0.6 against MAIN LOOK's 0.67 and -8. Tune the day preset and the grade against `cine_look.py` on a few frames before the next look gate.
- The cinematic bands come from five of his films and one of ours. Re-cut them in `gates_cine.json` when more films are measured.
- Dissolves: another studio counted about 12 per minute in Rick's clips; our cut detector cannot see them. Re-measure before changing the transition rule.


## THREE.JS-FIRST WORKFLOW (CB 2026-11-09 evening, after the Card Maker film; wins over FULL WORKFLOW wherever they differ; the tools for each step are in THE PIPELINE)
**Rule: no Blender until the whole film works in three.js.** Blender adds textures, materials, lighting and effects last. A fully built Blender world is a separate named option for future projects, not the default.
1. **Shot blueprint (was: beat sheet).** One row per sentence: who is on screen, what they do, the word it lands on, plus framing (whole / medium / close / place / object), lens, the foreground object, camera START -> PATH -> END, who or what must be framed on which word, and the sound. One table (`film.json`, word anchors) that camera, acting, props and sound all read. Details: STORYBOARD AND CAMERA LANDING below.
2. **Rick reference board, then storyboard.** First 2-4 of Rick's frames per beat that solve the same story problem, one line each on what to TAKE (staging, framing, timing), never the shot. Then the storyboard: rendered from the real three.js scene with the template characters, captions ON, a START and an END frame for every camera move, all scenes on ONE page grouped by scene. An independent judge agent scores each panel against Rick's frames first; only panels scoring 8.5/10 or more go to CB. CB approves.
3. **Look on 3 sample shots, then the three.js film.** First one wide with 2+ characters, one close face and one object insert, so the look is right before everything is built; then the whole film in batches of 8-12 shots, each batch checked on a contact sheet. Whole film: simple toon sets, characters, acting, props in hands, camera, captions, voice, rough sound. Renders in minutes.
4. **Show every scene.** CB sees every scene's setup (all of them, e.g. all 6) as frames before any Blender work. Check twice: the automatic checks below plus the three-point shot check, then CB watches.
5. **Lock** camera, positions and timing as data.
6. **Blender look pass.** Same layout and camera. Only textures, materials, lighting, effects. No layout changes. The transfer is `render.mjs --export-lock` then `from_lock.build()` (THE PIPELINE stages 8-9): test it on one place first.
7. **One still per place plus one short clip.** CB approves the look.
8. **Final render**, captions, sound, delivery.
**Voice:** same voice as chosen for the episode; quicker pace about 1.2x, slightly less dramatic direction tags, and a gentle trim that cuts only true silence (CB's taste overrides the gap and words-per-second gates).
**Checks before anything renders** (from 24 reference videos; `episodes/card-maker-ban/analysis/`):
- Story: first face within 1.5 s; frame by 1 s shows the first sentence's subject or action; character on screen at least half of the first 15 s; no faceless gap over 6 s; each named noun visible within 0.5 s of its word; at least 90 % of sentences clearly shown; "No X" shows X, then removes it on the word.
- Camera: at rest (< 2 px/f) at least 30 % overall and 40 % while a face is on screen; rest at least 0.6 s after each move; travel at most 3 s; head about 0.25 of frame width (p90 <= 0.55); head cut on at most 13 % of face frames; whole body on at least 65 %; object inserts at most 15 %; key nouns land with the camera at rest (CB's rule, not measured in the reference); level by default, tilt only during a move; card pushes peak <= 3 %/f, no spinning top-down.
- Acting and props: held props attached to the hand on every frame; passes and throws have reach, contact, release, catch; lists are a locked shot, one item per word, in a hand, one highlight each; a held figure is dead still (Rick: no breathing, no idle loop), and if it holds over 3 s the camera or something else in frame moves; 4-5 pose changes per 10 s; overlays at least 12 % of frame height with a plate; analogies get their own place and light.
- Density scores judge richness only, never story. Never start a long render from a contact sheet: a full preview is watched first.
**Characters:** the 2D vector puppets (THE PIPELINE, Characters). A new character is a body form, a head, hair or hat, a costume and colours on the same rig, each element taken from Rick's references first. Show labelled option sheets and let CB point; do not guess from short notes.

## STORYBOARD AND CAMERA LANDING (CB 2026-11-09: "apply all. but check if it match with rick clips")
Taken from CB's older studios on this PC (`Documents\claude-animated-shorts`, `Documents\purrhaps-shorts`, the GrowKaz plugin; comparison doc https://claude.ai/artifact/15YYNpivD54NXEgUxtVFfQ). Every number was checked against our own measurement of Rick's 24 videos (`episodes/card-maker-ban/analysis/`); where theirs disagreed with Rick, Rick's number is used and the change is noted.
1. **Storyboard panel.** Each panel shows one camera rest (START or END of a move), captions on, and a strip under it: `CAM` (framing + move, 2-6 words), `MOVE` (what the character does), `WORD` (the word it lands on). One page per film, grouped by scene, so CB sees every setup at once and can comment per panel.
2. **Rick reference board is a hard gate.** No storyboard before 2-4 Rick frames per beat with what to take. Same rule as hair, bodies and props: take it from Rick first.
3. **Judge before CB.** A fresh agent that never saw the build scores each panel 0-10 against the matching Rick frames (story clear, framing, staging, look) and returns a fix list; only 8.5+ goes to CB.
4. **The camera shows the noun.** Where is it -> show it; what is it -> move closer; how does it work -> look at it working; what next -> travel on. Rick shows the sentence's subject or action in 91 % of sentences and every named role is on screen when named. Changed for Rick: show the noun WITH the character where possible (in hand, beside them), because his object inserts are only about 15 % of frames; never hold on an empty character while the voice names another thing.
5. **Landing on characters and words.** The named character is in frame by their word (a few frames before is fine), never after it. Faces change on the word; poses land 3-5 f before their word. Key nouns land with the camera at rest (< 2 px/f, 0-6 f before the word). Changed for Rick: their rule "every move peaks 0-3 f before a word" is NOT used, because Rick's landings hit long words only at chance (25 % within 3 f vs 26 % chance); his camera rests on the subject, it does not hit beats.
6. **Few long camera journeys.** About 3-6 journeys per film (Rick cuts 0.4 times per 10 s, median shot 17.5 s), about 3 rests per place inside one move (Rick: about 3 holds per 10 s, hold p50 0.6 s, travel <= 3 s). Lay the places along the travel direction so the camera never turns back (a 180 degree turn reads as a jump cut). Median speed 4-5 px/f per journey (Rick 4.1). Their "camera never rests" is NOT used: Rick is settled about 32 % of the time.
7. **Framing characters.** Head centre median about 45 % of frame height (Rick: p50 45 %, middle half 39-51 %, above 63 % on only 5 % of face frames), so faces stay above the caption band. Whole body fits on at least 65 % of face frames (Rick 68 %), head cut on at most 13 %. Stand people BESIDE desks and tables, not behind them. Face reactions in front view: the character turns to the lens first. Shot mix from Rick, not from their studio: whole body about 45 %, medium 20 %, close up to 7 %, places 15 %, object inserts at most 15 %.
8. **Three-point shot check, every shot, every draft.** (1) Does the face change on its word? (2) Do the key event and its sound land on their word? (3) Is anything (lamp, prop, hand, another character, an effect) blocking the face the shot is about? Any fail is fixed before CB sees it. Then the sound-off test.
9. **Contact sheet QC per batch:** every picture matches its line; the key action lands on the key word; characters readable and not cut off; never more than 3 shots in a row with the same framing; nothing important under the captions.
10. **Open question, not a rule yet:** their studio counted about 12 moving dissolves per minute in Rick's clips; our cut detector cannot see dissolves. Re-measure before changing the transition rules.

## FULL WORKFLOW (2026-11-09) — the rules of each craft step; the ORDER is THE PIPELINE's. Steps 5-7 here (Stage A and B in Blender) are the "full Blender world" option and the rule book for the Blender look pass
1. (Step 0) **Topic and facts** with sources. Pitch 3 stories first (UPGRADES 1).
2. (Step 1) **Script, 55-75 s (CB 2026-11-09):** 200-280 words at about 3.6-3.7 w/s (Rick's 24 scripts: median 220 words, 114-292). This is a soft target: the story always comes first, and story lines are never cut to hit the time (CB 2026-11-09: "the time is secondary. important always the story"). Action hook first, "You see" pivot at ~70 %, twist last line, loop ending. Mocker formula and writing rules: UPGRADES 2-3.
3. (Step 2) **Voice:** the user's chosen narrator voice (CB: a storyteller voice on Fish Audio); raw take through `tools/voice_prep.py`, silence trimmed, voice gates on every take, words.json from faster-whisper with `T()` anchors (UPGRADES 4-5).
4. (Step 3) **Shot plan:** 3-4 shots per 30 s (about 6-9 for a 55-75 s Short), camera travelling inside shots, cuts only on place/time jumps, a colour family per place, a signature sound, an expression track per word. **Camera plan per shot:** the subject's path plus the rigs and hand-offs from [CINEMATOGRAPHY.md](CINEMATOGRAPHY.md) (chase, mount, orbit, catch, fly-by, follow-away), the big moment on the punch word.
   - **Hero object first:** Build the story's hero object alone, as a detailed model, before the scene exists. Example: the airfield Po-2, about 38,000 triangles.
   - **BlenderKit first (when the user has a BlenderKit account):** search with `tools/blenderkit_tool.py` for the hero and props; use a model when it is better or faster than building one, build in Python only when nothing fits. Only assets the account already has, only Royalty Free or CC0. Prefer stylised or low-poly assets with cartoon proportions; if only a realistic model fits, simplify its proportions or keep it for small background props. Log every asset in the episode's `assets_log.md` and `library/blenderkit_assets.md`; cached files stay in `library/blenderkit/`. Stage 1: toon shading and ink like everything else. Stage 2: library or the asset's own PBR, whichever matches the look. Characters are always our vector puppets, never BlenderKit people.
5. (Step 4) **Stage 1 (Stage A): build and finish the whole scene in Python, in the toon look.** Worked example: `episodes/night-witches/density/`: `build_density_v1.py`, then `build_density.py` (rounds 1-2).
   - Complete scene: >= 30 prop types and >= 600 instances in clusters, real prop geometry at model detail (crate planks and nails, barrel staves and hoops, bucket rim and wire handle, fruit with stems, boats with planking), place/time details plus humour, secondary motion, practical lights.
   - Finished toon look: toon shading with a soft terminator, ink, painted textures at 2x resolution, grass blade tufts with painted tips from about 1.2 m out, warm lamp pools, contact and soft shadows, haze volume from about 9 m, mist cards, characters placed correctly.
   - **Pass 1, density and composition:** one hero object plus 1-2 characters as the clear focal point; 3-5 big readable props in the foreground; breathing room in the midground so the hero reads; density comes from the background, the ground detail and the sky, not from clutter edge to edge; lamps lead the eye to the character. Camera staged for 9:16, props along the view.
   - Target for every Stage 1 and Stage 2, compared side by side, not only by the gates: `references/look_locked/stage1_airfield_approved.png`, `stage1_camp_approved.png` (Stage 1), `night_airfield_approved.png`, `night_camp_approved.png` (Stage 2).
   - **Pass 2, fine pass, in the finished toon-and-ink look of airfield round 2:** softness, surfaces, light and atmosphere against the quality gates, until all 7 gates in `tools/measure/density_check.py` pass or the gap is clear.
   - Every pass is render, look, fix, and ends when the picture is right, not only when the numbers pass. Guide from the airfield: about 8 rounds for pass 1, about 10 for pass 2, about 4 for Stage B. Keep a render log per pass: what changed, what the picture showed, the gate numbers. Night: edge >= 0.141, shapes >= 783, empty cells <= 18.8 %, lit C* p90 26.3-61.7, 3 layers, noise <= 0.569 with variation >= 1.508, haze >= 6.22. Other light: 0.14, 702, 14.6 %, 24.7-72.1, 3, 0.614 with 1.364, 12.08.
   - Modules: `templates/blender_look/toon_stage.py` (toon look and ink), `detail.py` (model-detail props), `paint_stage.py` (painted textures), `post_toon.py` (grade).
   - Make a page for CB: rounds, gate scores, empty-cell grids.
6. (Step 5) **Storyboard stills from the finished Stage A scene** (the only CB gate unless CB waives it). Each action shot also gets a low-res animatic from its `blender_cine` camera (25 % size, 8 samples, ~1 s per frame) next to its stills.
7. (Step 6) **Stage 2 (Stage B): convert the same finished scene to the main look.** Worked example: `build_density_v3.py` + `post_v3.py` in the same folder. The scene is not rebuilt:
   - `look.apply_look(scene, preset)`: night, morning, day (midday), golden or interior.
   - **Create every surface as a Blender material from the library** with `materials.get(name)`: procedural shader nodes for colour, roughness, bump, wear and wetness. No ink on the world.
   - **If the story needs a surface the library doesn't have** (ice, leather, tile, chrome, marble), add a new named recipe to `templates/blender_look/materials.py`, then use it. It then stays available for every later episode.
   - Clouds and smoke stay soft and stylised (`materials.cloud_soft`). Engine lighting, shafts and haze from `lights.*`, the grade from `grade.py`.
   - Render, look, fix as in Stage A, about 4 rounds, with a render log.
   - **Gate:** one final still per location through `tools/check_episode.py` and `density_check.py` before animation.
8. (Step 7) **Characters:** the vector puppets as half self-lit cards (`from_lock.card`), ink only on characters, faces changing on the word, mouths on quoted lines (all baked from `film.json`).
9. (Step 8) **Animation and camera** (plan and gates: THE PIPELINE, Camera): moving ~68 %, glides and push-ins, f/5.6, motion blur on travels and fast passes only, never on holds (`render.setup_eevee(motion_blur=True)`); hold-and-travel grammar, card acting and change controls in UPGRADES 6-8. Action shots are baked with `templates/blender_cine/cine.py` (rules in CINEMATOGRAPHY.md): ~30 % of frames tracking a moving subject, rig hand-offs instead of cuts, the catch with lead room and a little aim lag, fly-bys above or below the lens with a 7 f kick. Measure the render with `references/remeasure/cine_2026-11-09/scripts/cine_stats.py`.
10. (Step 9) **Sound:** library first, cues on their words. Mix (CB 2026-11-09): sidechain-duck music and SFX about 13 dB under the voice, music bed about 20 dB under the narrator; measure voice-only vs background-only K-weighted in 0.4 s windows: median gap >= 15 dB, background louder than voice in < 1 % of talking; two-pass loudnorm -14 LUFS, true peak -1.5.
11. (Step 10) **Render:** EEVEE on the local GPU, 64 samples, 1440x2560, slowest frame per shot tested first (`render.slowest_frame_test`), local only. Grade the frames with `grade.py --preset <preset>`, using one `--fit-vig` value per shot.
12. (Step 11) **Captions:** one white bold word, black outline, ~70 % height, popping 108 % to 100 % in 0.09 s, shown 0.1 s before the word.
13. (Step 12) **QA:** `python tools/check_episode.py <folder> --preset <preset>` (density, 3D look, scorecard colour, short_qa) + references/SCORECARD.md + the sound-off test + verifier rounds + the hold contact sheet and glitch scan (UPGRADES 9).
14. (Step 13) **Deliver:** final mp4 + 1080p preview + thumbnail (clean payoff frame) + metadata (title formula, UPGRADES 11) + NOTES.md, with a backup copy.

## STORY, VOICE, TIMING AND CAMERA UPGRADES (CB 2026-11-09: "i think all ok. but color stick to ricks style")
Taken from another creator's Shorts prompt (compared in the doc https://claude.ai/artifact/1nSTU1i1jGPihvrREGC8ka). They apply to every episode. **Colour is NOT taken from it:** palette, grade, black point and accent stay exactly as in MAIN LOOK (Rick's newest 3D style). No world ink, no lifted blacks, no grain, no 2-word captions.
1. **Pitch first.** Pitch 3 stories, each with its first line, the mocker, the twist and a title that hides the ending. Then show the script with its word count and seconds per line, plus a beat list with seconds, before any voice or build.
2. **Mocker formula** (Rick uses a quoted mocker line in 9 of his 24 scripts). Line 1 is the strange act with the reason hidden (9-14 words). Then the setup in present tense with one exact number. The mocker's quoted joke goes to the hero's face (4-12 words, a big close-up). The hero stays calm and cryptic, and never explains. Escalation in threes: each step weirder, the mocker getting cockier, one comic aside. "You see," once at 60-85 %, told through an everyday thing the viewer has done (3-5 short lines). The payoff is shown, not explained, and lands on the mocker. The biggest reveal is the last line, with no moral and no trivia after it, and it loops to the first frame. 16-20 lines in all.
3. **Writing rules.** Told the way a 10-year-old tells a friend: plain spoken words, flowing sentences joined with "and" and "so". "A captain", "the boss", never titles or dates. 0-1 names the viewer has to remember (this is separate from the 4-character limit). No context lines, no jargon, one funny comparison. Join related sentences with commas, because every full stop makes the voice reset with a gap. Check the script line by line against the numbers in `references/reports/script_stats.md` and the sample `episodes/baboon-signalman/SCRIPT.md` (words per line, where the mocker speaks, where "You see," lands).
4. **Voice gates on every take**, before anything is built on it. Words a second while talking 3.5-4.5. Gaps between sentences: median 0.12-0.25 s, longest 0.35 s, none over 0.5 s, and pauses under 13 % of runtime. Dead air: 1-4 s a minute of breaths is natural, 9+ s a minute sounds robotic. Whispered word: a word with pitch found in under 20 % of its frames. Regenerate only the failing line and drop it into the pause before the next sentence, never mid-line. Never time-stretch, and keep the breaths. Pitch range is measured and reported, but CB's "one steady tone" rule stays.
5. **Word anchors.** Word times come from faster-whisper on the finished track (no script as a prompt), aligned to the clean script, then saved as words.json. A helper `T('word', n)` returns the start of the nth time that word is said. Every beat, camera hold, expression swap, pose, effect and sound event is placed at a `T()` plus an offset, never at a typed time. The build writes a sound-event list `{t, name}` for the mix from the same anchors. A new voice then means: re-run whisper, re-render, re-mix, nothing else.
6. **Camera grammar** (adds to CINEMATOGRAPHY.md). Each beat holds with a slow eased push (never parked), then travels to the next beat with smootherstep easing on a slight arc. **Motion blur only on travels and fast passes, never on holds**, because blur on holds ghosts the captions. Lens low, at knee to chest height, wide and close. Leading lines (roads, rails, decks) aim at the subject. The mocker gets a big close-up leaning in. The proof gets a macro insert held 3-5 s while the change happens in frame. The payoff is a wide, centred event coming at the lens. Safety: no Bezier key overshoot (use eased travels or centripetal Catmull-Rom), and no camera key inside geometry. A move that must pass through a wall or pole becomes a hidden cut.
7. **Change controls.** Every transformation in the story (paint spreading, water rising, a pile growing) gets one 0-to-1 custom property that builds it in visible steps, keyed to a `T()` anchor. Use a clipping or mask sweep for paint and water.
8. **Acting on cards.** Each pose lands with no overshoot and no wobble (Rick measured). Once it lands the card is dead still: no breathing bob, no idle loop (Rick: 0.01-0.8 px over 32 f). Blinks every 0.5-2.3 s, 4 frames (half, shut, shut, half), one covering every expression swap, never while that character is talking and never in a punchline hold. (Corrected 2026-11-09 after the another studio's breakdown video; the earlier overshoot, breathing and 2-4 s blink rule went against Rick's measurements.) The card texture resolution is picked by the card's size on screen, so close-ups stay sharp. A rim tint per place comes from that place's MAIN LOOK light.
9. **Frame QA.** A contact sheet of the first and last frame of every hold. Check for cut-off faces, characters inside geometry, empty corners, captions over faces, and a camera inside a wall. Then a glitch scan of the silent render: whole-frame jumps that are not planned cuts, one-frame A-B-A flickers, and single blocks that change while their neighbours stay calm (pop-ins). A first cut usually has 10-20 flags, and each gets fixed at its cause.
10. **Captions timing.** The one-word caption pops from 108 % to 100 % in 0.09 s and shows 0.1 s before its word. No full stops on screen.
11. **Title and cover.** The title is "The [thing] That [strange act]" or "Why [something odd]", hiding the ending, with no emoji. The cover is a clean frame of the payoff with no text.

### How to start a new episode
1. Make `episodes/<name>/`. Use `episodes/_test_three_scenes/` as the working example: `build.py` and `hero_scene.py` (scene), `hero_boat.py` (hero object), `r.py` (render, grade, gates, log), `render_log.md`.
2. Set the light per location: `night`, `morning`, `day` (midday), `golden` or `interior`.
3. List the locations. Default: the Blender look pass comes after the lock (THE PIPELINE stage 9). Only in the "full Blender world" option: do Stage A first (the full Python build finished in the toon look, polished until the gates pass), then Stage B (main look on the same scene). Character cards come from the lock (`out/lock/cards/`).
4. Blender: `blender -b --factory-startup --python build.py`. Grade: `python templates/blender_look/grade.py out/x_raw.png out/x.png --preset day --fit-vig`.
5. Run `python tools/check_episode.py episodes/<name> --preset day`. Fix, then show the storyboard.

## MAIN LOOK (locked: CB-approved 2026-11-08, "i think is correct now. please do it everytime like this. lock in skill.") — applies to ALL Ricks Clips animation; overrides every older look rule for environments
These are the values for every episode; the example stills happen to be night scenes. Reference images (our own approved stills): `references/look_locked/night_airfield_approved.png`, `night_camp_approved.png`. Package: `templates/blender_look/` (`look, materials, lights, cards, scatter, render, grade`). The first approved builder, kept as a worked example, is in the same folder as `build_density_v3.py` + `post_v3.py`.
- **Ink:** none on the world. Only the character cards carry ink (on-screen target #231218).
- **Cards:** lit Principled and Emission mixed 0.5, alpha through Transparent, camera-facing Locked Track. Approved emission gain is **1.0** (1.25 blew faces out at night). Card size comes from the lock (`index.json`: metres per pixel from the character's height).
- **Materials** (`materials.LIB`: rough, metal, coat, sheen, bump kind/scale/strength; all procedural): fabric_doped .46/0/.22/.45 grain 9/.28; canvas .86 sheen .35 weave 150/.3; tarp .74 sheen .4 weave 150/.3 (never coarser: scale 38 read as a wireframe); burlap .95 sheen .5 noise 90/.5 (weave aliases to a checker at distance); wood_grain .62 grain 34/.1 (bands along the plank; low strength, or it turns tiger-striped); plywood .55 coat .15 grain 60/.08; painted_metal_chipped .4 coat .45 noise 240/.05 chip threshold .6 (noise plus AO-inside edge term; bare steel and a raised coat edge); metal .34/1 noise 90/.15; brass .24/1; turf .62 noise 26/1.4 wet .08; wet_mud_puddle .55 noise 18/1.8 wet .4 (wet = roughness .035, albedo x.22, flat normal); cobble voronoi; glass alpha .22 rough .04; `emissive_lamp` strength 2.6 clamped so the hue stays warm; soft cel `cloud_soft` for clouds. All fade to the preset haze colour with distance. Smooth by angle 50 deg, bevel 0.01 near the lens.
- **Light:** hard sun key, angle 0.006. Night: moon 1.5 from behind plus a front fill 0.85 (hard too) so shapes read; day: sun 4.2 + fill 0.5. Practicals x0.5 of the older energies, radius ~0.1. Air volume density 0.02 (night), starting ~9 m from the lens, gives shafts and halos; mist cards in the horizon colour; EEVEE raytracing SCREEN, resolution 1/2, max roughness 0.45.
- **Grade (`grade.py`):** gain 1.22 / sat 1.12 (night), always under 1.3; black point (7,4,15); shadows a* +6, b* -8 (night runs about -20); vignette 0.67, fit per shot; amber <= 0.14, one loud accent; bloom threshold 0.8; no grain.
- **Render:** EEVEE GPU, 64 samples, f/5.6, about 12-15 s per still (limit 30 s). Night measured: approved airfield 11.9 s, camp 14.8 s; day test 10.4 s.
- **Grass:** blade tufts from 1.2 m out; large smooth lit shapes fill the near band.
- **Standing checks:** automatic in check_episode.py: small glints >= 0.007, clipped highlights <= 2.5 %. By eye at every location: puddles reflect lamps and sky; lamps stay warm, not white; tarps read as cloth; paint chips sit on edges.
- **Known status:** the approved stills fail G1 edge detail on the 3D gates (0.069 and 0.084 against 0.141, his median). His 3D frames carry about twice our edge detail; this is the next place to gain.
- **Day and exterior, added 2026-11-10 (CB: "apply all to knowledge"; CINEMATIC RULES 4-7 in THE PIPELINE):** sun low (25-40 degrees), sky stops pale at the horizon, a haze range short enough that far things lift (measured haze 6-14), blue fill, the vignette fitted until the picture measures 0.65-0.75, lit C* 20-30 on the big planes. The first day presets (`karoo_day`, baboon film) measured vignette 0.87, shadow b* -0.8 and haze -0.6 and are not the model for exteriors; the office interior of that film is a good model for interiors. Judge: `tools/measure/cine_look.py`.

## CINEMATOGRAPHY (CB 2026-11-09: "cinematic shots like air plane make looping and camera catch it. like a cinematographer")
**Universal:** applies to every moving thing in every episode (vehicles, animals, people, thrown or falling objects, crowds), not only planes. At the shot plan, every beat where something moves fast, falls, flies, collides, races, jumps or explodes gets a recipe from CINEMATOGRAPHY.md section 4; any animated object becomes a subject with `cine.object_path(obj, f0, f1)` (also `ballistic_path` for jumps/falls/throws, `mix_path` for two subjects). Full rules, measurements and examples: [CINEMATOGRAPHY.md](CINEMATOGRAPHY.md). Rigs: `templates/blender_cine/cine.py`. Proof: `episodes/_test_cine_loop/` (one 7.3 s take, no cut).
- **Measured (24 videos, same instrument):** Rick cuts 0.4 times per 10 s (median shot 17.5 s), moves 67.5 % of frames, tracks a moving subject in 28 % of frames in short bursts (median 0.3 s), and rescales every shot (the earlier "rolls >= 3 deg in 86 % of shots" included parallax and is retracted: his line-rich frames tilt 0.2 deg). CB's action example cuts every 1.4 s. We take the example's action ideas and stage them inside Rick-length moving takes (CB: fewer cuts).
- **Rigs:** `chase` (tracking, level horizon), `mount` (vehicle POV, the world rolls), `orbit` (circle a moving subject), `catch` (operator: momentum, lead room sideways only, aim lag 0.08-0.15 s), `static`/`push`; `Shot.add(f, rig, blend)` hands one rig to the next without a cut; `shake` = the 7 f kick; `roll` = eased dutch.
- **Must:** long takes with 2-4 rig hand-offs; cuts hidden behind a foreground wipe, a blurred whip or a flash; 9:16 staging toward/away and up/down; fly-bys pass above or below the lens; ordinary moves p90 <= 25 px/f, only passes and whips faster (<= 10 f, motion blur); roll only inside a travel (4-6 deg, back to level on landing; level while resting), every shot rescales >= 10 %; smoke trails draw manoeuvres; cards parented to vehicles; the apex/pass/impact lands on the punch word.

## CB WORKFLOW (2026-11-04): NOTHING GENERIC, AUTONOMOUS BETWEEN GATES
> Older process notes. FULL WORKFLOW above wins wherever this differs.
1. **Autonomous pre-production:** topic (checked against all reference titles + fact-checked with sources)
   → script (scripts_v2 positions below) → cast (view grammar, shared builds, mute-readable costumes)
   → look plan (colour script per set: field colour / accent / light source — committed, sat 0.45-0.55)
   → hero prop (+3 states) → **STORYBOARD**: one rendered still per beat + the narration line + camera
   arrows + the transition into the next beat, on one board.
2. **CB's gates are the ones in THE PIPELINE** (story, script, every storyboard scene, full preview, look). The older "one gate only" rule is replaced.
3. **Between gates, work on your own to the finish:** problems are fixed, not asked about (WORKING RULES lists the steps that need no OK and the ones that do).
4. **The anti-generic law (every beat, every set, every frame):** the GENERIC TEST — "could this frame be
   ANY town / ANY office / ANY prison?" If yes, it fails and is redone. Every set carries 3 details only
   this place+time would have, 1-2 in-world humour signs, and era-true props. Every adoption from the
   reference carries a CREATIVITY GAP (study law below). Every episode has one signature moment the
   reference has no equivalent of.
5. **The learning loop (library/):** read library/INDEX.md before every episode and before any risky
   step; write every pitfall THE MOMENT it is fixed; harvest solutions/modules/recipes after delivery.
   A fix seen twice becomes code or a QA check. This is how each episode beats the last.
6. **THE PERFORMANCE LAWS (studied 2026-11-05, references/reports/gravebell_lessons.md — verified
   frame-by-frame on our own copy of that episode):**
   a. **Faces change ON THE WORD.** Every episode ships an EXPRESSION TRACK: a word→(character,
      expression) map built from words.json, swaps landing 0-3 f before onset. Beat-level acting is
      not enough — the face is the second narrator.
   b. **Mouths move with the voice** wherever the narration quotes a character, across the whole
      quoted span (syllable timing from words.json).
   c. **Sound lands on its word and carries a pattern** the audience can learn (his bell: three
      short, one long). The signature sound is information, not texture.
   d. **Shots, not panels:** the camera travels between framings inside one shot; CUT only when the
      story jumps location (his 11 shots = 33 framings; our measured bar: 11.4 dissolves/min vs 0.6
      cuts/min). Group the board's beats into shots before animating.
   e. **Colour tells you where you are:** every location owns a colour family; consecutive cuts never
      land in the same one. (Time-of-day/heat states ride on top of place identity.)
   f. **Four named characters is the ceiling;** each gets one detail readable from across the room.
   g. **THE SOUND-OFF TEST** (gate, before any CB review): watch the cut muted — if a face does not
      tell the story, that shot is the first fix. Plus: nothing may block the face a shot is about.
   h. **EVERY ADOPTED DEVICE CARRIES A TRIGGER CONDITION** (CB, 2026-11-05): write beside it the
      story situation that earns it, and use it only when an episode has that beat. A device used
      because the reference used it is decoration — the same generic failure the anti-generic law
      exists to stop. "No beat meets the trigger, so we did not use it" is a pass, not a gap.
      (First application: the cutaway composition — rejected for EP01, kept for an episode whose
      mechanism is genuinely hidden behind a surface.)
7. **THE REFERENCE-FIRST LAW (CB, 2026-11-04 — earned the hard way on EP01's cast):** every EP01 cast
   mistake (invented nape strip, invented shoulder stubs, stylized kneel, bleached heat palette, beige
   heads) was something the reference never shows, added without checking. Therefore, structural rule:
   **NOTHING NEW RENDERS WITHOUT A REFERENCE CHECK.** Before any new visual element (piece, pose,
   palette state, framing habit) goes into code: (a) find 2+ reference frames showing how HE handles it
   and copy the grammar, or (b) if the reference has no equivalent, it is a CREATIVITY-GAP experiment —
   labelled as such on the board for CB, never silently shipped as style. And before ANY board/still
   reaches CB: measure it — sat_mean ≥0.30 / sat_p75 ≥0.45 on day exteriors, key head ≥22 % of frame
   width on character beats, every character consistent across all four views. Taste is not a check;
   numbers and frames are.

The style reference is a channel studied privately (`references/`: STYLE_BIBLE.md, reports/*.md, frames/).
- Those videos are study material. Copying frames or clips to the cloud for analysis is allowed (CB removed the no-upload rule, 2026-11-09). Don't put them in published pages or in our videos.
- Never copy their scripts, characters or shots; story, characters and voice are always our own. Reason: we learn his craft (staging, framing, timing, look), we do not reuse his work.
- Never say the channel's name in a voice-over or a video description (project notes and messages to CB may name it).

User rules that apply:
- Character views (CB, 2026-11-04): exactly four, all with the SAME silhouette — front; 3/4 = the front drawing with
  only the face features shifted to the facing side (ref: eyes +0.08 W); side = same head silhouette, side body; and
  the standard back view (no face, hair/hat from behind). The view picker switches per key end, never mid-glide.
- **Captions ON (CB, 2026-11-05, after ONODA: "you forgot to put captions on it").** Replaces "no captions or labels".
  One white bold word at a time with a black outline, centred at about 60-74 % of frame height (the measured reference
  style, references/reports/CONTEXT.md), timed to words.json (on the word onset). Keep faces clear of the band.
  Still no scene labels or other on-screen text. Mask the caption band before running any measurement tool.
- **Fewer cuts (CB, 2026-11-05, after ONODA: "i wish it had less cuts").** CB counts every dissolve as a cut. ONODA had
  8 shots / 18 framings / 7 dissolves in 32.8 s - too many. Travel the camera between framings INSIDE a shot (glides,
  `film.json` stations); hard-cut or dissolve only on a real location/time jump. Target fewer shots
  with more travel: about 3-4 shots per 30 s.
- English only.
- Voice: one steady tone.
- Jokes are researched real facts.
- Mix (CB 2026-11-09, replaces "music +3 dB, SFX -6 dB"): measured ducking, see FULL WORKFLOW step 10.
- Final export 2K vertical: 1440x2560.
- A fresh agent that did not do the build verifies the gates where THE PIPELINE names one (the storyboard judge); the tools verify the rest.
- Save after every step (keep a backup copy of finished episodes).
- "Just do it" once the script is approved: work on between CB's gates without asking (WORKING RULES).

## WHY THE MAIN LOOK IS THIS WAY: 3D WORLD STYLE (CB 2026-11-08, from his 3 newest videos: Roller Coasters, Drivers Filming, Pink Prison) — binding, newest wins
Measured in references/reports/TEXTURE_3D_2026-11-08.md (scripts+data: references/remeasure/3d_2026-11-08/).
He changed the WORLD, not the characters. Where this section conflicts with older look rules below
(painted flat fields, black world ink, textures.md, outlines.md), THIS section wins for environments.
**Characters: ALWAYS from our own character system** (the 2D vector puppets, the 4 views, ink on screen #231218). Never hand-draw a new one-off figure for a test (CB 2026-11-08: "why did the character change?").
HOW he integrates them (report §8): 2D vector cards placed INSIDE the 3D scene at real depth: camera-facing (heads stay
round from any angle), overlapped by 3D props (benches, tables, car seats), parented to vehicles, posed per shot (seated,
seat-belted, hand on wheel). Card shading ~half emission + half lit: faces stay white at night (251,245,233) but tint in
coloured light (pink cell (232,191,214)) and dim in shade ((151,152,168)). Add costume detail (stitched seams on
caps/pockets); cards cast shadows on the floor.
**World: stylised-PBR, game-engine lit.**
- **No ink on the world.** No Freestyle, no inverted hull on sets/props/vehicles. The only ink is on characters, so
  inked figures pop off an un-inked 3D set. (Pink Prison: 38 % of strong edges near a dark stroke vs 59 % in his older style.)
- **Real materials on what the story touches:** clear-coat car paint with reflections, chrome/alloy, galvanised steel,
  glazed tile/block with mortar, polished floor reflections, wet asphalt in rain, gravel/aggregate albedo, grass with
  blades + dirt decals. Texture comes from albedo/normal detail and speculars, ~25 % more textured frame area than the
  old look (fine-detail block share 0.39 vs 0.31; small specular glints 3x).
- **Keep stylised:** trees as painted foliage cards, soft cel-like white clouds with grey underside, smooth painted sky
  gradient (day blue, dusk violet-pink). This keeps it "toon-adjacent", never photoreal.
- **Light like a real-time engine:** one strong sun/area key with HARD cast shadows (window bars, railings, figures),
  soft ambient + AO, volumetric god rays through windows / sun shafts in haze, bloom on practicals/headlights/string
  lights (clipped pixels ~0.9 % of frame, 3x the old look), aerial haze on distant hills, rain + wet reflections.
- **No film grain** (measured 0.14 grey levels, same as before). Keep grain OFF.
- **Avoid his one flaw:** fine high-frequency textures (his gravel roof) alias and shimmer in moves. Mipmaps / enough
  samples, or a coarser texture.
**Grade (new targets, replace the "no crushed blacks" rule for this style):**
- Y′ mean ~0.46 (old 0.54). Black point ~(7,4,15), a cool near-black (old lifted plum (28,13,20)); Y′ p1 ~0.05.
- Shadows blue: a* ~+6, b* ~-8 (old +15 / -4 magenta). Vignette corner/centre ~0.67.
- Palette: one cool dominant base (blue/cyan ~58 % of saturated pixels) + ONE loud story accent per episode (coaster
  red, car red/teal, Baker-Miller pink 34 %). Warm amber only ~7 % (old 27 %). Lit C* median ~21; the saturation lives in
  the accent object and the sky, not on every surface.
**Camera: unchanged** (motion.md §2.1: hold ~9 %, move ~2/3 of frames, p90 ~24 px/f). New angles he now uses, each
needs a story trigger: POV / vehicle-mounted (driver seat, ride car), dash-cam with a screen overlay, top-down aerials,
dissolve / double exposure between places.
**RENDER: GPU FIRST, LOCAL (CB 2026-11-08: "render on gpu first ... online render takes too long").**
- Default engine: **Blender EEVEE on the local GPU (CB: RTX 2070 Super).** With no world ink there is no Freestyle and no CPU line
  pass, so the whole frame renders on the GPU. EEVEE gives raytraced reflections, volumetrics, bloom, soft/hard shadows.
- Cycles GPU (OptiX) only for a hero still or a single shot that needs real GI; never for the whole film by default.
- Online render only if the user asks for it and agrees to the cost; uploading scenes on a slow line costs hours.
- Order: GPU test frame of the slowest shot at full size first; optimise anything over ~15 s/frame; then render
  shots in sequence (one Blender instance on the GPU; extra CPU instances only for comp/encode).

## DENSITY
The binding rules and gate numbers are in [DENSITY_RULES.md](DENSITY_RULES.md), for every episode. Check with `tools/measure/density_check.py` (`--style 3d` is the default) and `tools/check_episode.py`.

## CB EPISODE RULES (2026-11-04, binding; they override older defaults below)
1. Topics: true stories AND tales / lore / fiction / moral stories — creative. Tales name their tradition,
   never sold as documented fact; the moral lands as the button.
2. The hook is ACTION: someone DOING something unexpected/weird in the very first line — never a location
   or date first; the opening scene IS the hook. Prefer a LOOP ENDING (last beat echoes the opening image).
3. Voice: the user's chosen narrator voice, ALWAYS trim silence (`tools/voice_prep.py`).
4. Characters: unique, MEMORABLE, era/culture-matched, mute-test costumes, one wearable prop each.
5. Density: story-matched assets everywhere, NEVER empty space, **> 10 distinct compositions per episode**,
   cinematic detail.
6. Hero prop only when it earns it (story-central, or material/effect value: metal, shine, glass, fog);
   supporting props ALWAYS for 3D depth. Textures and effects outrank prop count.

## Study law (CB): for every reference finding ask HOW he did it, WHY he did it (the story function), and
## HOW we do it in our stack — then leave a CREATIVITY GAP: each adoption carries one improvement or
## invention of our own. Parity is the floor; every episode must contain something the reference has no
## equivalent of.

## Readability traps the verifier caught (check every new prop/shot for these)
- **A swing drawn as one rope that disappears behind the kid reads as a HANGING.** Always two ropes to a wide plank
  with the kid between them, and a frame whose legs clear the arc (A-frame at each end).
- Props or flotsam closer than ~2 m to a lens become huge cut-off blobs at the frame edge. When a camera moves, re-check
  every prop near its new position (the river cameras moved into the floating hats).
- A foreground bush cut by the frame edge reads as a "green ball"; a foreground prop must be recognisable or gone.
- Flags: red + yellow star/diamond reads as Vietnam's. Use a period-correct flag (St George's cross for England 1831).
- Painted signs lit by a side sun go grey-blue and unreadable: give the sign face an unlit material.
- Golden rim light done as an offset outer copy turns every hat into a picture frame: inner rim only, head/torso only.
- Balcony/railing rails at chest height through characters: put the lens ~2.5 m up so rails cross legs, not torsos.
- Flat holds read as freezes in QA (frozen span ≥12 f): every hold needs a creeping push-in.
